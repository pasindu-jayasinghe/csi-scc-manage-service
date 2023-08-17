import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { In, Repository } from 'typeorm';
import { sourceName } from '../../enum/sourcename.enum';
import { CalculationService } from '../../calculation/calculation.service';
import { RefrigerantActivityData } from '../entities/refrigerant.entity';
import { RefrigerantDto } from '../../calculation/dto/refrigerant.dto';
import { BaseDataDto } from 'src/emission/calculation/dto/emission-base-data.dto'; 
import { PuesDataReqActivityData, PuesDataReqDto } from 'src/project/dto/pues-data-req.dto';
import { PuesSumDataReqDto, PesSumDataReqDto, ProjectSumDataReqDto } from 'src/project/dto/update-total-emission-req.dto';
import { Ownership } from 'src/project/enum/ownership.enum';
import { ProjectEmissionSourceService } from 'src/emission/emission-source/service/project-emission-source.service';
import { ProjectUnitEmissionSourceService } from 'src/project/service/project-unit-emission-source.service';
import { ProjectService } from 'src/project/service/project.service';
import { Clasification } from 'src/project/enum/clasification.enum';
import { Unit } from 'src/unit/entities/unit.entity';
import { Project } from 'src/project/entities/project.entity';
import { User } from 'src/users/user.entity';
import { ParameterUnit } from 'src/utills/parameter-units';
import { ExcellUploadable } from 'src/emission/excell-uploadable';
import { BulckUpdatable } from 'src/emission/bulck-updatable';
import { EmissionSourceRecalService } from 'src/emission/emission-source/service/emission-source-recal.service';
import { EmissionSourceBulkService } from 'src/emission/emission-source/service/emission-source-bulk.service';
import { VariableValidationType } from 'src/emission/enum/variable-validation-type.enum';
import { ProgressRetriever } from 'src/emission/progress-retriever';
import { ProgressDataResponseDto } from 'src/emission/dto/progress-data.dto';
import { ProgresReportService } from 'src/emission/emission-source/service/progres-report.service';
import { ProgressStatus } from 'src/emission/enum/progress-status.enum';
import { ExcelDownloader } from 'src/emission/excel-downloader';

@Injectable()
export class RefrigerantService extends TypeOrmCrudService<RefrigerantActivityData> implements ExcellUploadable , BulckUpdatable, ProgressRetriever, ExcelDownloader{

  getDto() {
    return new RefrigerantActivityData();
  }

  private excelBulkVariableMapping: {code: string, name: string,isRequired: boolean,type: VariableValidationType}[] = [    
    {code: "month", name: 'Month',isRequired: true,type:VariableValidationType.list},
    {code: "gWP_RG", name: "Refrigerant Type",isRequired: true,type:VariableValidationType.list},
    {code: "w_RG", name: "Consumption",isRequired: true,type:VariableValidationType.number},
    {code: "w_RG_unit", name: "Consumption unit",isRequired: true,type:VariableValidationType.list}
  ]

  constructor(
    @InjectRepository(RefrigerantActivityData) repo,
    @InjectRepository(RefrigerantActivityData)
    private readonly refrigerantRepository: Repository<RefrigerantActivityData>,
    @InjectRepository(Unit) private unitRepo: Repository<Unit>,
    private readonly calculationService: CalculationService,
    private puesService: ProjectUnitEmissionSourceService,
    private pesService: ProjectEmissionSourceService,
    private projectService: ProjectService,
    private parameterUnit: ParameterUnit,
    private emissionSourceRecalService: EmissionSourceRecalService,
    private emissionSourceBulkService: EmissionSourceBulkService,
    private progresReportService: ProgresReportService
  ) {
    super(repo);
  }
  getVariableMapping() {
    throw new Error('Method not implemented.');
  }
  async generateTableData(projectId: number, unitIds: number , paras: any[], ownership?: string) {
    let filter = 'project.id = :projectId AND unit.id IN (:unitIds)'
    let filterValues = {projectId: projectId, unitIds: unitIds}
    let acData = await this.getActivityData(filter, filterValues)

    let row1 = [
      { name: '', code: '' },
      { name: "Consumption", colspan: true }
    ]
    let additionalCols = [{ name: 'Refrigerant type', code: 'gWP_RG' }]

    let res = this.progresReportService.createTableData(
      acData,
      row1,
      additionalCols,
      'gWP_RG',
      'w_RG'
    )

    return res
  }
  async getActivityData(filter: any, filterValues: any) {
    let data = this.repo.createQueryBuilder('acData')
      .innerJoinAndSelect(
        'acData.project',
        'project',
        'project.id = acData.projectId'
      )
      .innerJoinAndSelect(
        'acData.unit',
        'unit',
        'unit.id = acData.unitId'
      )
      .where(filter, filterValues)
      .orderBy('id','DESC')

    return await data.getMany()
  }
  async getProgressData(projectId: number, unitIds: number[]) {
    let allMonthFilled: any = {}
    let response = []
    let activityData = await this.repo.find({ project: { id: projectId }, unit: { id: In(unitIds) } })
    let emissionSource = sourceName.Refrigerant
    let parameters = [{name: 'Refrigerant type', code: 'gWP_RG'}]

    activityData = activityData.map(ele => {
      ele['unitId'] = ele.unit.id
      ele['unitName'] = ele.unit.name
      return ele
    })

    activityData = this.progresReportService.group(activityData, 'unitId')

    for await (let key of Object.keys(activityData)) {
      let pues = await this.puesService.getByUnitAndProjectAndES(parseInt(key), projectId, emissionSource)
      if (pues && pues.isComplete){
        response.push({
          unit: key,
          unitName: activityData[key][0]['unitName'],
          es: emissionSource,
          esName: 'Refrigerant',
          completeness: ProgressStatus.COMPLETED,
          parameters: parameters
        })
      } else {
        allMonthFilled = this.progresReportService.checkCompleteness(activityData[key], false, false, {para: ['gWP_RG'], esCode: sourceName.Refrigerant})
        response.push({
          unit: key,
          unitName: activityData[key][0]['unitName'],
          es: emissionSource,
          esName: 'Refrigerant',
          completeness: allMonthFilled.isCompleted,
          unFilled: allMonthFilled.unFilled,
          parameters: parameters
        })
      }
    }

    let assignedUnits = await this.puesService.getAllowedUnitsforProjectAndEs(projectId, emissionSource)

    let assignedUIds = assignedUnits.map(u => u.code)
    let uNoData = assignedUIds.filter(ele => !Object.keys(activityData).includes(ele.toString()))
    let notAssignedIds = unitIds.filter(u => (!assignedUIds.includes(parseInt(u.toString()))))

    for await (const e of uNoData) {
      let unit = await this.unitRepo.findOne({id: e})
      response.push({
        unit: e.toString(),
        unitName: unit.name,
        es: emissionSource,
        esName: 'Refrigerant',
        completeness: ProgressStatus.NOT_ENTERED,
        parameters: parameters
      })
    }

    for await (const e of notAssignedIds) {
      let unit = await this.unitRepo.findOne({id: e})
      response.push({
        unit: e.toString(),
        unitName: unit.name,
        es: emissionSource,
        esName: 'Refrigerant',
        completeness: ProgressStatus.NOT_ASSIGNED,
        parameters: parameters
      })
    }

    return response
  }


  async bulkDelete(ids: number[], isPermant: boolean) {
    return await this.emissionSourceRecalService.bulkDelete(ids,isPermant, this);
  }

   async bulkCalculate(unitIds: number[], projectId: number) {
    return await this.emissionSourceRecalService.bulkCalculate(this, unitIds, projectId, this.repo, sourceName.Refrigerant);
  }

  excellBulkUpload(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number, ownership: string, isMobile: boolean) {
    let dto = new RefrigerantActivityData();
    dto = this.emissionSourceBulkService.excellBulkUpload(unit, project,user,data,year,ownership,isMobile,dto,this.excelBulkVariableMapping);
    try{      
      return this.create(dto);
    }catch(err){
      console.log(err);
      return null;
    }
  }

  downlodExcellBulkUploadVariableMapping() {
    return this.excelBulkVariableMapping;
  }

  async create(createRefrigerantDto: RefrigerantActivityData) {

    const calculationData: RefrigerantDto = {
      year: createRefrigerantDto.year,
      countryCode: 'LK', // TODO: impl after org structure
      W_RG: createRefrigerantDto.w_RG,
      GWP_RG: createRefrigerantDto.gWP_RG,
      W_RG_Unit: createRefrigerantDto.w_RG_unit,

      activityType :createRefrigerantDto.activityType,
      assembly_Lf: createRefrigerantDto.assembly_Lf,
      annual_lR: createRefrigerantDto.annual_lR,
      time_R: createRefrigerantDto.time_R,
      p_capacity: createRefrigerantDto.p_capacity,
      p_r_recover: createRefrigerantDto.p_r_recover,
      baseData: await this.getBaseData(createRefrigerantDto)
    };

    createRefrigerantDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    createRefrigerantDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    createRefrigerantDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.Refrigerant,
      data: calculationData,
    });

    this.updateTotalEmission(createRefrigerantDto, calculationData, emission)
    createRefrigerantDto.e_RL = emission.e_sc  ? emission.e_sc : 0;

    createRefrigerantDto.e_sc = emission.e_sc  ? emission.e_sc : 0;
    createRefrigerantDto.e_sc_co2 = emission.e_sc_co2  ? emission.e_sc_co2 : 0;
    createRefrigerantDto.e_sc_ch4 = emission.e_sc_ch4  ? emission.e_sc_ch4 : 0;
    createRefrigerantDto.e_sc_n2o = emission.e_sc_n2o  ? emission.e_sc_n2o : 0;

    console.log("aaaa",createRefrigerantDto)

    return await this.refrigerantRepository.save(createRefrigerantDto);
  }

  findAll() {
    return this.refrigerantRepository.find();
  }


  async update(id: number, updateRefrigerantDto: RefrigerantActivityData) {

    const calculationData: RefrigerantDto = {
      year: updateRefrigerantDto.year,
      countryCode: 'LK', // TODO: impl after org structure
      W_RG: updateRefrigerantDto.w_RG,
      GWP_RG: updateRefrigerantDto.gWP_RG,
      W_RG_Unit: updateRefrigerantDto.w_RG_unit,
      activityType :updateRefrigerantDto.activityType,
      assembly_Lf: updateRefrigerantDto.assembly_Lf,
      annual_lR: updateRefrigerantDto.annual_lR,
      time_R: updateRefrigerantDto.time_R,
      p_capacity: updateRefrigerantDto.p_capacity,
      p_r_recover: updateRefrigerantDto.p_r_recover,
      baseData: await this.getBaseData(updateRefrigerantDto)
    };

    updateRefrigerantDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    updateRefrigerantDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    updateRefrigerantDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.Refrigerant,
      data: calculationData,
    });

    if (updateRefrigerantDto.e_sc !== emission.e_sc){
      let current = await this.repo.findOne(id);
      let updatedEmission = this.calculationService.getDiff(current, emission);
      this.calculationService.updateTotalEmission(
        updatedEmission,
        updateRefrigerantDto.project,
        calculationData.baseData.clasification, 
        sourceName.Refrigerant,
        updateRefrigerantDto.unit.id
      );
    }
    updateRefrigerantDto.e_RL = emission.e_sc  ? emission.e_sc : 0;

    updateRefrigerantDto.e_sc = emission.e_sc  ? emission.e_sc : 0;
    updateRefrigerantDto.e_sc_co2 = emission.e_sc_co2  ? emission.e_sc_co2 : 0;
    updateRefrigerantDto.e_sc_ch4 = emission.e_sc_ch4  ? emission.e_sc_ch4 : 0;
    updateRefrigerantDto.e_sc_n2o = emission.e_sc_n2o  ? emission.e_sc_n2o : 0;

    const updated = await this.repo.update( {
      id: id
    }, updateRefrigerantDto);
    if(updated.affected === 1){
      return await this.repo.findOne(id);
    }else{
      throw new InternalServerErrorException("Updating is failed");
    }
  }

  async remove(req) {
    let o = req.parsed.paramsFilter.find(o => o.field === 'id')
    let deleteDto = await this.repo.findOne({id: o.value})
    let updatedEmission = this.calculationService.getDiff(deleteDto, null)
    this.calculationService.updateTotalEmission(
      updatedEmission,
      deleteDto.project,
      (deleteDto.direct ? Clasification.DIRECT : ((deleteDto.indirect ? Clasification.INDIRECT : Clasification.OTHER))), 
      sourceName.Refrigerant,
      deleteDto.unit.id
    );
    return await this.repo.delete({id: deleteDto.id});
  }

  async getBaseData(dto: RefrigerantActivityData): Promise<BaseDataDto> {
    let activityInfo =  new PuesDataReqActivityData()
    activityInfo.owenerShip = Ownership.getkey(dto.ownership)
    activityInfo.stationary = dto.stationary
    activityInfo.mobile = dto.mobile
    let req = new PuesDataReqDto()
    req.project = dto.project
    req.sourceName = sourceName.Refrigerant
    req.unitId = dto.unit.id
    req.user = dto.user
    req.activityInfo = activityInfo

    let puesData = await this.puesService.getPuesData(req)
    // console.log(puesData)

    return {
      clasification: puesData.clasification,
      tier: puesData.tier,
      sourceType: puesData.sourceType,
      industry: puesData.industry.code,
      countryCode: puesData.countryCode,
      projectId: dto.project.id
    }
  }

  async updateTotalEmission(dto: RefrigerantActivityData, calData: RefrigerantDto, emission: any){
    let reqPues: PuesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Refrigerant,
      unitId: dto.unit.id,
      emission: emission,
      classification: calData.baseData.clasification
    }

    await this.puesService.addEmission(reqPues)

    let reqPes : PesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Refrigerant,
      emission: emission,
      classification: calData.baseData.clasification
    }
    this.pesService.addEmission(reqPes)

    let reqProject: ProjectSumDataReqDto = {
      project: dto.project,
      classification: calData.baseData.clasification,
      emission: emission
    }
    this.projectService.addEmission(reqProject)
  }

  

  /**
   * 
   * @param unit 
   * @param project 
   * @param user 
   * @param data : { key: value } Es: {  "ADDED_BY": 0 }
   * @param variable_mapping : { V1: string, V2: string   }[]
   * @param year 
   * @returns 
   */
  async addFromExcell(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number){
    // this.sleep(100000);
    let units = this.parameterUnit.refrigerant_units;
    // console.log(units);


    // common --------------
    let dto = new RefrigerantActivityData();
    dto['unit'] = unit;
    dto['project'] = project;
    dto['user'] = user;

     console.log(data);

    variable_mapping.forEach(vm=>{
      if(vm['V2']){
        if(vm['default-v2']){
          dto[vm['V2']] = vm['default-v2'];
        }else if(vm['V1']){
          let val = data[vm['V1']];
          dto[vm['V2']] = val;
        }
      }
    })
    dto.year = year;
    // End of common --------------



    dto.w_RG_unit = units.wrg[0].code;


    try{
      return this.create(dto);
    }catch(err){
      console.log("err",err)
      return null;
    }
    // return null;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}
