import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { BaseDataDto } from 'src/emission/calculation/dto/emission-base-data.dto';
import { ProjectEmissionSourceService } from 'src/emission/emission-source/service/project-emission-source.service';
import { ExcellUploadable } from 'src/emission/excell-uploadable';
import { BulckUpdatable } from 'src/emission/bulck-updatable';
import { PuesDataReqActivityData, PuesDataReqDto } from 'src/project/dto/pues-data-req.dto';
import { PuesSumDataReqDto, PesSumDataReqDto, ProjectSumDataReqDto } from 'src/project/dto/update-total-emission-req.dto';
import { Project } from 'src/project/entities/project.entity';
import { Clasification } from 'src/project/enum/clasification.enum';
import { Ownership } from 'src/project/enum/ownership.enum';
import { ProjectUnitEmissionSourceService } from 'src/project/service/project-unit-emission-source.service';
import { ProjectService } from 'src/project/service/project.service';
import { Unit } from 'src/unit/entities/unit.entity';
import { User } from 'src/users/user.entity';
import { ParameterUnit } from 'src/utills/parameter-units';
import { In, Repository } from 'typeorm';
import { CalculationService } from '../../calculation/calculation.service';
import { FireExtinguisherDto } from '../../calculation/dto/fire-extinguisher.dto';
import { sourceName } from '../../enum/sourcename.enum';
import { FireExtinguisherActivityData } from '../entities/fire-extinguisher.entity';
import { EmissionSourceRecalService } from 'src/emission/emission-source/service/emission-source-recal.service';
import { EmissionSourceBulkService } from 'src/emission/emission-source/service/emission-source-bulk.service';
import { VariableValidationType } from 'src/emission/enum/variable-validation-type.enum';
import { ProgressRetriever } from 'src/emission/progress-retriever';
import { ProgressDataResponseDto } from 'src/emission/dto/progress-data.dto';
import { ProgresReportService } from 'src/emission/emission-source/service/progres-report.service';
import { ProgressStatus } from 'src/emission/enum/progress-status.enum';
import { ExcelDownloader } from 'src/emission/excel-downloader';

@Injectable()
export class FireExtinguisherService extends TypeOrmCrudService<FireExtinguisherActivityData>  implements ExcellUploadable , BulckUpdatable, ProgressRetriever, ExcelDownloader{
  
  getDto() {
    return new FireExtinguisherActivityData();
  }

  private excelBulkVariableMapping: {code: string, name: string,isRequired: boolean,type: VariableValidationType}[] = [    
    {code: "month", name: 'Month',isRequired: true,type:VariableValidationType.list},
    {code: "fireExtinguisherType", name: "Fire Extinguisher Type",isRequired: true,type:VariableValidationType.list},
    {code: "weightPerTank", name: "Weight of a tank",isRequired: true,type:VariableValidationType.number},
    {code: "weightPerTank_unit", name: "Weight of a tank unit",isRequired: true,type:VariableValidationType.list},
    {code: "noOfTanks", name: "No of Tanks",isRequired: true,type:VariableValidationType.number}
  ]

  constructor(
    @InjectRepository(FireExtinguisherActivityData) repo,
    // private readonly electricityRepository: Repository<FireExtinguisher>,
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
      { name: "Number of tanks", colspan: true }
    ]
    let additionalCols = [{ name: 'Weight per tank', code: 'weightPerTank' }]

    let res = this.progresReportService.createTableData(
      acData,
      row1,
      additionalCols,
      'weightPerTank',
      'noOfTanks'
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
      .where (filter, filterValues)
      return await data.getMany()
  }
  async getProgressData(projectId: number, unitIds: number[]) {
    let allMonthFilled: any = {}
    let response = []
    let activityData = await this.repo.find({ project: { id: projectId }, unit: { id: In(unitIds) } })
    let emissionSource = sourceName.FireExtinguisher

    activityData = activityData.map(ele => {
      ele['unitId'] = ele.unit.id
      ele['unitName'] = ele.unit.name
      return ele
    })

    activityData = this.progresReportService.group(activityData, 'unitId')

    for await (let key of Object.keys(activityData)) {
      let pues = await this.puesService.getByUnitAndProjectAndES(parseInt(key), projectId, emissionSource)
      if (pues && pues.isComplete){
        console.log("complete",  activityData[key][0]['unitName'])
        response.push({
          unit: key,
          unitName: activityData[key][0]['unitName'],
          es: emissionSource,
          esName: 'Fire Extinguisher',
          completeness: ProgressStatus.COMPLETED
        })
      } else {
        console.log( activityData[key][0]['unitName'])
        allMonthFilled = this.progresReportService.checkCompleteness(activityData[key], true, false)
        response.push({
          unit: key,
          unitName: activityData[key][0]['unitName'],
          es: emissionSource,
          esName: 'Fire Extinguisher',
          completeness: allMonthFilled.isCompleted,
          unFilled: allMonthFilled.unFilled
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
        esName: 'Fire Extinguisher',
        completeness: ProgressStatus.NOT_ENTERED
      })
    }
    for await (const e of notAssignedIds) {
      let unit = await this.unitRepo.findOne({id: e})
      response.push({
        unit: e.toString(),
        unitName: unit.name,
        es: emissionSource,
        esName: 'Fire Extinguisher',
        completeness: ProgressStatus.NOT_ASSIGNED
      })
    }

    return response
  }
  
  async bulkDelete(ids: number[], isPermant: boolean) {
    return await this.emissionSourceRecalService.bulkDelete(ids,isPermant, this);
  }

   async bulkCalculate(unitIds: number[], projectId: number) {
    return await this.emissionSourceRecalService.bulkCalculate(this, unitIds, projectId, this.repo, sourceName.FireExtinguisher);
  }

  excellBulkUpload(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number, ownership: string, isMobile: boolean) {
    let dto = new FireExtinguisherActivityData();
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
  
  async create(createFireExtinguisherDto: FireExtinguisherActivityData):Promise<FireExtinguisherActivityData> {
    const calculationData: FireExtinguisherDto = {
      year: createFireExtinguisherDto.year,
      fet: createFireExtinguisherDto.fireExtinguisherType,
      wwpt: createFireExtinguisherDto.weightPerTank,
      not: createFireExtinguisherDto.noOfTanks ? createFireExtinguisherDto.noOfTanks : 0 ,
      wwpt_unit: createFireExtinguisherDto.weightPerTank_unit,
      stype:createFireExtinguisherDto.suppressionType,
      baseData: await this.getBaseData(createFireExtinguisherDto)
    };

    createFireExtinguisherDto.noOfTanks = createFireExtinguisherDto.noOfTanks ? createFireExtinguisherDto.noOfTanks : 1
    createFireExtinguisherDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    createFireExtinguisherDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    createFireExtinguisherDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false

    
    const emission = await this.calculationService.calculate({
      sourceName: sourceName.FireExtinguisher,
      data: calculationData,
    });
    this.updateTotalEmission(createFireExtinguisherDto, calculationData, emission)
    createFireExtinguisherDto.emission=emission.e_sc  ? emission.e_sc : 0;

    createFireExtinguisherDto.e_sc = emission.e_sc  ? emission.e_sc : 0;
    createFireExtinguisherDto.e_sc_co2 = emission.e_sc_co2  ? emission.e_sc_co2 : 0;
    createFireExtinguisherDto.e_sc_ch4 = emission.e_sc_ch4  ? emission.e_sc_ch4 : 0;
    createFireExtinguisherDto.e_sc_n2o = emission.e_sc_n2o  ? emission.e_sc_n2o : 0;

    return await this.repo.save(createFireExtinguisherDto);
  }

  async findAll(){
    let result=await this.repo.find();
    // console.log('result',result)
    return result;
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} fireExtinguisher`;
  // }

  async update(id: number, updateFireExtinguisherDto: FireExtinguisherActivityData) {

    const calculationData: FireExtinguisherDto = {
      year: updateFireExtinguisherDto.year,
      fet: updateFireExtinguisherDto.fireExtinguisherType,
      wwpt: updateFireExtinguisherDto.weightPerTank,
      not: updateFireExtinguisherDto.noOfTanks,
      wwpt_unit: updateFireExtinguisherDto.weightPerTank_unit,
      stype: updateFireExtinguisherDto.suppressionType,

      baseData: await this.getBaseData(updateFireExtinguisherDto),
    };

    updateFireExtinguisherDto.noOfTanks = updateFireExtinguisherDto.noOfTanks ? updateFireExtinguisherDto.noOfTanks  : 1
    updateFireExtinguisherDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    updateFireExtinguisherDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    updateFireExtinguisherDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.FireExtinguisher,
      data: calculationData,
    });

    if (updateFireExtinguisherDto.e_sc !== emission.e_sc){
      let current = await this.repo.findOne(id);
      let updatedEmission = this.calculationService.getDiff(current, emission);
      this.calculationService.updateTotalEmission(
        updatedEmission,
        updateFireExtinguisherDto.project,
        calculationData.baseData.clasification, 
        sourceName.FireExtinguisher,
        updateFireExtinguisherDto.unit.id
      );
    }
    updateFireExtinguisherDto.emission= emission.e_sc  ? emission.e_sc : 0;

    updateFireExtinguisherDto.e_sc =  emission.e_sc  ? emission.e_sc : 0;
    updateFireExtinguisherDto.e_sc_co2 = emission.e_sc_co2  ? emission.e_sc_co2 : 0;
    updateFireExtinguisherDto.e_sc_ch4 = emission.e_sc_ch4  ? emission.e_sc_ch4 : 0;
    updateFireExtinguisherDto.e_sc_n2o = emission.e_sc_n2o  ? emission.e_sc_n2o : 0;

    return await this.repo.update(id,updateFireExtinguisherDto);

  }


  async remove(req) {
    let o = req.parsed.paramsFilter.find(o => o.field === 'id')
    let deleteDto = await this.repo.findOne({ id: o.value })
    let updatedEmission = this.calculationService.getDiff(deleteDto, null)
    this.calculationService.updateTotalEmission(
      updatedEmission,
      deleteDto.project,
      (deleteDto.direct ? Clasification.DIRECT : ((deleteDto.indirect ? Clasification.INDIRECT : Clasification.OTHER))),
      sourceName.FireExtinguisher,
      deleteDto.unit.id
    );
    return await this.repo.delete({id: deleteDto.id});
  }
  async getBaseData(dto: FireExtinguisherActivityData): Promise<BaseDataDto> {
    let activityInfo =  new PuesDataReqActivityData()
    activityInfo.owenerShip = Ownership.getkey(dto.ownership)
    activityInfo.stationary = dto.stationary
    activityInfo.mobile = dto.mobile
    let req = new PuesDataReqDto()
    req.project = dto.project
    req.sourceName = sourceName.FireExtinguisher
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

  async updateTotalEmission(dto: FireExtinguisherActivityData, calData: FireExtinguisherDto, emission: any){
    let reqPues: PuesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.FireExtinguisher,
      unitId: dto.unit.id,
      emission: emission,
      classification: calData.baseData.clasification
    }

    await this.puesService.addEmission(reqPues)

    let reqPes : PesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.FireExtinguisher,
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

  addFromExcell(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number) {
    let units = this.parameterUnit.fire_extinguisher_units;
    let fireExtinguisherTypes = this.parameterUnit.fireExtinguisherTypes 


    if (data['fireExt'] === fireExtinguisherTypes[0].code){
      let dto = new FireExtinguisherActivityData();
      dto['unit'] = unit;
      dto['project'] = project;
      dto['user'] = user;
  
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
      dto.weightPerTank_unit = units.weightPerTank[0].code

      // console.log(dto)
  
      try{
        return this.create(dto);
      }catch(err){
        console.log(err);
        return null;
      }
    } else {
      return null;
    }

  }
}
