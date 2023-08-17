import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { In, Repository } from 'typeorm';

import { ElectricityActivityData } from '../entities/electricity.entity';
import { CalculationService } from '../../calculation/calculation.service';
import { sourceName } from '../../enum/sourcename.enum';
import { BaseDataDto } from 'src/emission/calculation/dto/emission-base-data.dto';
import { PuesDataReqActivityData, PuesDataReqDto } from 'src/project/dto/pues-data-req.dto';
import { PuesSumDataReqDto, PesSumDataReqDto, ProjectSumDataReqDto } from 'src/project/dto/update-total-emission-req.dto';
import { Ownership } from 'src/project/enum/ownership.enum';
import { ProjectEmissionSourceService } from 'src/emission/emission-source/service/project-emission-source.service';
import { ProjectUnitEmissionSourceService } from 'src/project/service/project-unit-emission-source.service';
import { ProjectService } from 'src/project/service/project.service';
import { ElectricityDto } from 'src/emission/calculation/dto/electricity.dto';
import { Clasification } from 'src/project/enum/clasification.enum';
import { EmissionSource } from 'src/emission/emission-source/entities/emission-source.entity';
import { Project } from 'src/project/entities/project.entity';
import { Unit } from 'src/unit/entities/unit.entity';
import { User } from 'src/users/user.entity';
import { ExcellUploadable } from 'src/emission/excell-uploadable';
import { BulckUpdatable } from 'src/emission/bulck-updatable';
import { ParameterUnit } from 'src/utills/parameter-units';
import { TNDLossService } from 'src/emission/t-n-d-loss/service/t-n-d-loss.service';
import { ProjectUnitEmissionSource } from 'src/project/entities/project-unit-emission-source.entity';
import { TNDLossActivityData } from 'src/emission/t-n-d-loss/entities/t-n-d-loss.entity';
import { EmissionSourceRecalService } from 'src/emission/emission-source/service/emission-source-recal.service';
import { EmissionSourceBulkService } from 'src/emission/emission-source/service/emission-source-bulk.service';
import { VariableValidationType } from 'src/emission/enum/variable-validation-type.enum';
import { ProgressRetriever } from 'src/emission/progress-retriever';
import { ProgresReportService } from 'src/emission/emission-source/service/progres-report.service';
import { ProgressStatus } from 'src/emission/enum/progress-status.enum';
import { ExcelDownloader } from 'src/emission/excel-downloader';
@Injectable()
export class ElectricityService extends TypeOrmCrudService<ElectricityActivityData> implements ExcellUploadable, BulckUpdatable, ProgressRetriever, ExcelDownloader{


  private excelBulkVariableMapping: {code: string, name: string,isRequired: boolean,type: VariableValidationType}[] = [
    {code: "meterNo", name: 'Meter No',isRequired: true,type:VariableValidationType.textOrNumber},
    {code: "month", name: 'Month',isRequired: true,type:VariableValidationType.list},
    {code: "consumption", name: 'Consumption',isRequired: true,type:VariableValidationType.number},
    {code: "consumption_unit", name: 'Consumption Unit',isRequired: true,type:VariableValidationType.list},
  ]

  constructor(
    @InjectRepository(ElectricityActivityData) repo,
    @InjectRepository(ElectricityActivityData)
    private readonly electricityRepository: Repository<ElectricityActivityData>,
    @InjectRepository(EmissionSource) private emissionSourceRepo: Repository<EmissionSource>,
    @InjectRepository(ProjectUnitEmissionSource) private puesRepo: Repository<ProjectUnitEmissionSource>,
    @InjectRepository(Unit) private unitRepo: Repository<Unit>,
    private readonly calculationService: CalculationService,
    private puesService: ProjectUnitEmissionSourceService,
    private pesService: ProjectEmissionSourceService,
    private projectService: ProjectService,
    private parameterUnit: ParameterUnit,
    private tNDLossService: TNDLossService,
    private emissionSourceRecalService: EmissionSourceRecalService,
    private emissionSourceBulkService: EmissionSourceBulkService,
    private progresReportService: ProgresReportService
  ) {
    super(repo);

  }
  getVariableMapping() {
    return this.excelBulkVariableMapping
  }
  async generateTableData(projectId: number, unitIds: number, paras: any[], ownership?: string) {
    let filter = 'project.id = :projectId AND unit.id IN (:unitIds)'
    let filterValues = {projectId: projectId, unitIds: unitIds}
    let acData = await this.getActivityData(filter, filterValues)

    let row1 = [
      { name: '', code: '' },
      { name: "Consumption", colspan: true }
    ]
    let additionalCols = [{ name: 'Meter no', code: 'meterNo' }]

    let res = this.progresReportService.createTableData(
      acData,
      row1,
      additionalCols,
      'meterNo',
      'consumption'
    )

    return res
  }
  // return await this.repo.find({ project: { id: projectId }, unit: { id: In(unitIds) } })
  // let filter = 'project.id = :projectId AND unit.id IN (:unitIds)'
  // let filterValues = {projectId: projectId, unitIds: unitIds}
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
    return await data.getMany()
  }
  getDto() {
    return new ElectricityActivityData();
  }

  async getProgressData(projectId: number, unitIds: number[]) {
    let allMonthFilled: any = {}
    let response = []
    let activityData = await this.repo.find({ project: { id: projectId }, unit: { id: In(unitIds) } })
    let emissionSource = sourceName.Electricity
    let parameters = [{name: 'Meter No', code: 'meterNo'}, {name: 'Consumption', code: 'consumption'}]

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
          esName: 'Electricity',
          completeness: ProgressStatus.COMPLETED,
          isComplete: pues.isComplete,
          parameters: parameters
        })
      } else {
        allMonthFilled = this.progresReportService.checkCompleteness(activityData[key], true, true, {para: ['meterNo']})
        response.push({
          unit: key,
          unitName: activityData[key][0]['unitName'],
          es: emissionSource,
          esName: 'Electricity',
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
        esName: 'Electricity',
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
        esName: 'Electricity',
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
    return await this.emissionSourceRecalService.bulkCalculate(this, unitIds, projectId, this.repo, sourceName.Electricity);
  }

  downlodExcellBulkUploadVariableMapping() {
    return this.excelBulkVariableMapping;
  }


  async create(createElectricityDto: ElectricityActivityData) {
    const calculationData: ElectricityDto = {
      year: createElectricityDto.year,
      ec: createElectricityDto.consumption,
      ec_unit: createElectricityDto.consumption_unit,
      baseData: await this.getBaseData(createElectricityDto)
    };

    createElectricityDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    createElectricityDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    createElectricityDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false

    
    const emission = await this.calculationService.calculate({
      sourceName: sourceName.Electricity,
      data: calculationData,
      // methodology: createElectricityDto.project.methodology.name
    });

    let dto = new TNDLossActivityData()
    dto.unit = createElectricityDto.unit;
    dto.project = createElectricityDto.project;
    dto.user = createElectricityDto.user;
    dto.year = createElectricityDto.year;
    dto.consumption = createElectricityDto.consumption;
    dto.consumption_unit = createElectricityDto.consumption_unit;
    dto.meterNo = createElectricityDto.meterNo;
    dto.month = createElectricityDto.month
    this.calculateTnDLoss(Actions.CREATE, dto)

    this.updateTotalEmission(createElectricityDto, calculationData, emission)
    createElectricityDto.emission = emission.e_sc?emission.e_sc :0;

    createElectricityDto.e_sc = emission.e_sc ? emission.e_sc : 0;
    createElectricityDto.e_sc_co2 = emission.e_sc_co2 ? emission.e_sc_co2 : 0;
    createElectricityDto.e_sc_ch4 = emission.e_sc_ch4 ? emission.e_sc_ch4 : 0;
    createElectricityDto.e_sc_n2o = emission.e_sc_n2o ? emission.e_sc_n2o : 0;

    return await this.electricityRepository.save(createElectricityDto);
  }

  findAll() {
    return this.electricityRepository.find();
  }

  async update(id: number, updateElectricityDto: ElectricityActivityData) {

    const calculationData: ElectricityDto = {
      year: updateElectricityDto.year,
      ec: updateElectricityDto.consumption,
      ec_unit: updateElectricityDto.consumption_unit,
      baseData: await this.getBaseData(updateElectricityDto)
    };

    updateElectricityDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    updateElectricityDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    updateElectricityDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false

    console.log(updateElectricityDto.project.id)
    const emission = await this.calculationService.calculate({
      sourceName: sourceName.Electricity,
      data: calculationData,
      // methodology: updateElectricityDto.project.methodology.name
    });

    let dto = new TNDLossActivityData()
    dto.unit = updateElectricityDto.unit;
    dto.project = updateElectricityDto.project;
    dto.user = updateElectricityDto.user;
    dto.year = updateElectricityDto.year;
    dto.consumption = updateElectricityDto.consumption;
    dto.consumption_unit = updateElectricityDto.consumption_unit;
    dto.meterNo = updateElectricityDto.meterNo;
    dto.month = updateElectricityDto.month
    this.calculateTnDLoss(Actions.UPDATE, dto, id)

    if (updateElectricityDto.e_sc !== emission.e_sc){
      let current = await this.repo.findOne(id);
      let updatedEmission = this.calculationService.getDiff(current, emission);
      this.calculationService.updateTotalEmission(
        updatedEmission,
        updateElectricityDto.project,
        calculationData.baseData.clasification, 
        sourceName.Electricity,
        updateElectricityDto.unit.id
      );
    }
    updateElectricityDto.emission = emission.e_sc;
    updateElectricityDto.e_sc = emission.e_sc ? emission.e_sc : 0;
    updateElectricityDto.e_sc_co2 = emission.e_sc_co2 ? emission.e_sc_co2 : 0;
    updateElectricityDto.e_sc_ch4 = emission.e_sc_ch4 ? emission.e_sc_ch4 : 0;
    updateElectricityDto.e_sc_n2o = emission.e_sc_n2o ? emission.e_sc_n2o : 0;

    const updated = await this.repo.update( {
      id: id
    }, updateElectricityDto);
    if(updated.affected === 1){
      return await this.repo.findOne(id);
    }else{
      throw new InternalServerErrorException("Updating is failed");
    }

  }

  async calculateTnDLoss(action: Actions, dto: TNDLossActivityData, id?: number){
    let es = await this.emissionSourceRepo.find({code: sourceName.t_n_d_loss})
    if (es && es.length > 0){
      // let pues = await this.puesRepo.find({projectUnit:{project:{id:dto.project.id}, unit: {id: dto.unit.id}}, emissionSource: {id: es[0].id}})
      let pues = await this.puesRepo.find({
        relations: ['projectUnit'],
        where: {
          projectUnit:{
            project: {
              id: dto.project.id
            },
            unit:{
              id: dto.unit.id
            }
          },
          emissionSource: {id: es[0].id}
        }
      })

     
      if (pues && pues.length > 0){
        if (action === Actions.CREATE){
          this.tNDLossService.create(dto)
        } else if (action === Actions.UPDATE) {
          let data = await this.tNDLossService.find({project:{id: dto.project.id}, unit: {id: dto.unit.id}, month: dto.month})
          this.tNDLossService.update(data[0].id,dto)
        } else if (action === Actions.DELETE) {
          this.tNDLossService.delete(id)
        }
      } else {
        console.log("T&D loss is not assigned to the project")
      }
    } else {
      console.log("T&D loss not found in emission source list")
    }
  }

  async remove(req) {
    let o = req.parsed.paramsFilter.find(o => o.field === 'id')
    let deleteDto = await this.repo.findOne({ id: o.value })
    let updatedEmission = this.calculationService.getDiff(deleteDto, null)
    this.calculationService.updateTotalEmission(
      updatedEmission,
      deleteDto.project,
      (deleteDto.direct ? Clasification.DIRECT : ((deleteDto.indirect ? Clasification.INDIRECT : Clasification.OTHER))),
      sourceName.Electricity,
      deleteDto.unit.id
    );

    let dto = new TNDLossActivityData()
    dto.unit = deleteDto.unit;
    dto.project = deleteDto.project;
    dto.user = deleteDto.user;
    dto.year = deleteDto.year;
    dto.consumption = deleteDto.consumption;
    dto.consumption_unit = deleteDto.consumption_unit;
    dto.meterNo = deleteDto.meterNo;
    dto.month = deleteDto.month
    this.calculateTnDLoss(Actions.DELETE, dto, o.value)

    return await this.repo.delete({id: deleteDto.id});
  }

  async getBaseData(dto: ElectricityActivityData): Promise<BaseDataDto> {
    let activityInfo =  new PuesDataReqActivityData()
    activityInfo.owenerShip = Ownership.getkey(dto.ownership)
    activityInfo.stationary = dto.stationary
    activityInfo.mobile = dto.mobile
    let req = new PuesDataReqDto()
    req.project = dto.project
    req.sourceName = sourceName.Electricity
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

  async updateTotalEmission(dto: ElectricityActivityData, calData: ElectricityDto, emission: any){
    let reqPues: PuesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Electricity,
      unitId: dto.unit.id,
      emission: emission,
      classification: calData.baseData.clasification
    }
    this.puesService.addEmission(reqPues)


    let reqPes : PesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Electricity,
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
   * @param variable_mapping : { code : string, V2: string   }[]
   * @param year 
   * @returns 
   */
  excellBulkUpload(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number, ownership: string, isMobile: boolean) {

    let dto = new ElectricityActivityData();
    dto = this.emissionSourceBulkService.excellBulkUpload(unit, project,user,data,year,ownership,isMobile,dto,this.excelBulkVariableMapping);

    // console.log(dto.consumption);
    try{
      
      return this.create(dto);
    }catch(err){
      console.log(err);
      return null;
    }

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
    let units = this.parameterUnit.electricity_units;
    // console.log(units);


    // common --------------
    let dto = new ElectricityActivityData();
    dto['unit'] = unit;
    dto['project'] = project;
    dto['user'] = user;

    // console.log(data);

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



    dto.consumption_unit = units.consumption[0].code;

    // console.log(dto);

    try{
      return this.create(dto);
    }catch(err){
      console.log(err);
      return null;
    }
    // return null;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export enum Actions{
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}
