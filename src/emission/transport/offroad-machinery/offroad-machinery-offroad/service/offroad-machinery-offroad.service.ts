import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CalculationService } from 'src/emission/calculation/calculation.service';
import { BaseDataDto } from 'src/emission/calculation/dto/emission-base-data.dto';
import { DistanceBaseDto } from 'src/emission/calculation/dto/freight-air.dto';
import { FuelBaseDto, OffroadMachineryDto } from 'src/emission/calculation/dto/offroad-machinery.dto';
import { ProjectEmissionSourceService } from 'src/emission/emission-source/service/project-emission-source.service';
import { sourceName } from 'src/emission/enum/sourcename.enum';
import { TransportMode, TransportOption } from 'src/emission/enum/transport.enum';
import { ExcellUploadable } from 'src/emission/excell-uploadable';
import { BulckUpdatable } from 'src/emission/bulck-updatable';
import { PuesDataReqActivityData, PuesDataReqDto } from 'src/project/dto/pues-data-req.dto';
import { SourceType } from 'src/project/dto/sourceType.enum';
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
import { OffroadMachineryOffroadActivityData } from '../entities/offroad-machinery-offroad.entity';
import { EmissionSourceBulkService } from 'src/emission/emission-source/service/emission-source-bulk.service';
import { EmissionSourceRecalService } from 'src/emission/emission-source/service/emission-source-recal.service';
import { ProgressRetriever } from 'src/emission/progress-retriever';
import { ProgressDataResponseDto } from 'src/emission/dto/progress-data.dto';
import { ProgresReportService } from 'src/emission/emission-source/service/progres-report.service';
import { ProgressStatus } from 'src/emission/enum/progress-status.enum';
import { ExcelDownloader } from 'src/emission/excel-downloader';

@Injectable()
export class OffroadMachineryOffroadService extends TypeOrmCrudService<OffroadMachineryOffroadActivityData> implements ExcellUploadable , BulckUpdatable,ProgressRetriever, ExcelDownloader{
  
  getDto() {
    return new OffroadMachineryOffroadActivityData();
  }
  constructor(
    @InjectRepository(OffroadMachineryOffroadActivityData) repo,
    @InjectRepository(OffroadMachineryOffroadActivityData)
    private readonly passengerRoadRepository: Repository<OffroadMachineryOffroadActivityData>,
    @InjectRepository(Unit) private unitRepo: Repository<Unit>,
    private readonly calculationService: CalculationService,
    private puesService: ProjectUnitEmissionSourceService,
    private pesService: ProjectEmissionSourceService,
    private projectService: ProjectService,
    private parameterUnit: ParameterUnit,
    private emissionSourceBulkService: EmissionSourceBulkService,
    private emissionSourceRecalService: EmissionSourceRecalService,
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
      { name: "Fuel Consumption", colspan: true }
    ]
    let additionalCols = [{ name: 'Machine type', code: 'vehicleModel' }]

    let res = this.progresReportService.createTableData(
      acData,
      row1,
      additionalCols,
      'vehicleModel',
      'fuelConsumption'
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
      return await data.getMany()
  }
  async getProgressData(projectId: number, unitIds: number[]) {
    let allMonthFilled: any = {}
    let response = []
    let activityData = await this.repo.find({ project: { id: projectId }, unit: { id: In(unitIds) } })
    let emissionSource = sourceName.offroad_machinery

    activityData = activityData.map(ele => {
      ele['unitId'] = ele.unit.id
      ele['unitName'] = ele.unit.name
      return ele
    })

    let parameters = [
      {name: 'Vehicle No', code: 'vehicleNo'},
      {name: 'Vehicle Model', code: 'vehicleModel'}
    ]

    activityData = this.progresReportService.group(activityData, 'unitId')
    for await (let key of Object.keys(activityData)) {
      let pues = await this.puesService.getByUnitAndProjectAndES(parseInt(key), projectId, emissionSource)
      if (pues && pues.isComplete){
        response.push({
          unit: key,
          unitName: activityData[key][0]['unitName'],
          es: emissionSource,
          esName: 'Offroad Machinery',
          completeness: ProgressStatus.COMPLETED,
          parameters: parameters
        })
      } else {
        allMonthFilled = this.progresReportService.checkCompleteness(activityData[key], true, true, {para: ['vehicleNo', 'vehicleModel']})
        response.push({
          unit: key,
          unitName: activityData[key][0]['unitName'],
          es: emissionSource,
          esName: 'Offroad Machinery',
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
        esName: 'Offroad Machinery',
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
        esName: 'Offroad Machinery',
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
    return await this.emissionSourceRecalService.bulkCalculate(this, unitIds, projectId, this.repo, sourceName.offroad_machinery);
  }
  excellBulkUpload(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number, ownership: string, isMobile: boolean) {
    throw new Error('Method not implemented.');
  }

  downlodExcellBulkUploadVariableMapping() {
    throw new Error('Method not implemented.');
  }
  
  async create(createDto: OffroadMachineryOffroadActivityData) {
    let {fuel, distance} = this.getData(createDto)
    const calculationData: OffroadMachineryDto = {
      mode: createDto.method,
      year: createDto.year,
      fuelType: createDto.fuelType,
      fuel: fuel,
      industry: createDto.industry,
      baseData: await this.getBaseData(createDto)
    };

    createDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    createDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    createDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.offroad_machinery,
      data: calculationData,
    });

    this.updateTotalEmission(createDto, calculationData, emission)
    createDto.e_sc = emission.e_sc  ? emission.e_sc : 0;
    createDto.e_sc_co2 = emission.e_sc_co2  ? emission.e_sc_co2 : 0;
    createDto.e_sc_ch4 = emission.e_sc_ch4  ? emission.e_sc_ch4 : 0;
    createDto.e_sc_n2o = emission.e_sc_n2o  ? emission.e_sc_n2o : 0;
    console.log(createDto)
    return await this.passengerRoadRepository.save(createDto);
  }

  findAll() {
    return this.passengerRoadRepository.find();
  }

  async update(id: number, updateDto: OffroadMachineryOffroadActivityData) {

     let {fuel, distance} = this.getData(updateDto)
    const calculationData: OffroadMachineryDto = {
      mode: updateDto.method,
      year: updateDto.year,
      fuelType: updateDto.fuelType,
      fuel: fuel,
      industry: updateDto.industry,
      baseData: await this.getBaseData(updateDto)
    };

    updateDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    updateDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    updateDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.offroad_machinery,
      data: calculationData,
    });

    if (updateDto.e_sc !== emission.e_sc){
      let current = await this.repo.findOne(id);
      let updatedEmission = this.calculationService.getDiff(current, emission);
      this.calculationService.updateTotalEmission(
        updatedEmission,
        updateDto.project,
        calculationData.baseData.clasification, 
        sourceName.offroad_machinery,
        updateDto.unit.id
      );
      // this.updateTotalEmission(updateDto, calculationData, emission)
    }
    updateDto.e_sc = emission.e_sc  ? emission.e_sc : 0;
    updateDto.e_sc_co2 = emission.e_sc_co2  ? emission.e_sc_co2 : 0;
    updateDto.e_sc_ch4 = emission.e_sc_ch4  ? emission.e_sc_ch4 : 0;
    updateDto.e_sc_n2o = emission.e_sc_n2o  ? emission.e_sc_n2o : 0;

    const updated = await this.repo.update( {
      id: id
    }, updateDto);
    if(updated.affected === 1){
      return await this.repo.findOne(id);
    }else{
      throw new InternalServerErrorException("Updating is failed");
    }

  }

  async getBaseData(dto: OffroadMachineryOffroadActivityData): Promise<BaseDataDto> {
    let ownership: Ownership = Ownership.getkey(dto.ownership)
    let activityInfo =  new PuesDataReqActivityData()
    activityInfo.owenerShip = ownership
    activityInfo.stationary = dto.stationary
    activityInfo.mobile = dto.mobile
    let req = new PuesDataReqDto()
    req.project = dto.project
    req.sourceName = sourceName.offroad_machinery
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

  getData(dto: OffroadMachineryOffroadActivityData) {
    const distanceBaseData: DistanceBaseDto = new DistanceBaseDto()
    const fuelBaseData: FuelBaseDto = new FuelBaseDto()
    if (dto.method === TransportMode.fuel_base) {
      fuelBaseData.fc = dto.fuelConsumption
      fuelBaseData.fc_unit = dto.fuelConsumption_unit
      fuelBaseData.stroke = dto.stroke
    } else if (dto.method === TransportMode.distance_base) {
    }

    return {
      fuel: fuelBaseData,
      distance: distanceBaseData
    }
  }

  async updateTotalEmission(dto: OffroadMachineryOffroadActivityData, calData: OffroadMachineryDto, emission: any){
    let reqPues: PuesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Electricity,
      unitId: dto.unit.id,
      emission: emission,
      classification: calData.baseData.clasification
    }

    await this.puesService.addEmission(reqPues)

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

  async remove(req) {
    let o = req.parsed.paramsFilter.find(o => o.field === 'id')
    let deleteDto = await this.repo.findOne({id: o.value})
    let updatedEmission = this.calculationService.getDiff(deleteDto, null)
    this.calculationService.updateTotalEmission(
      updatedEmission,
      deleteDto.project,
      (deleteDto.direct ? Clasification.DIRECT : ((deleteDto.indirect ? Clasification.INDIRECT : Clasification.OTHER))), 
      sourceName.offroad_machinery,
      deleteDto.unit.id
    );
    return await this.repo.delete({id: deleteDto.id});
  }

  addFromExcell(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number) {
    let units = this.parameterUnit.offroad_machinery_units;
    let fuelTypes = this.parameterUnit.fuelType

    let dto = new OffroadMachineryOffroadActivityData();
    dto['unit'] = unit;
    dto['project'] = project;
    dto['user'] = user;

    variable_mapping.forEach(vm=>{
      if(vm['V2']){
        if(vm['default-v2']){
          dto[vm['V2']] = vm['default-v2'];
        }else if(vm['V1']){
          let val;
          if (vm['V1'] === 'fuleType'){
            val = fuelTypes.find(o => o.id === data[vm['V1']])
            dto[vm['V2']] = val.code;
          } else {
            val = data[vm['V1']];
            dto[vm['V2']] = val;
          }
        }
      }
    })
    dto.year = year;
    dto.method = TransportMode.fuel_base;
    dto.noOfTrips = 1;
    dto.option = TransportOption.one_way;
    dto.fuelConsumption_unit = units.fuel[0].code

    try{
      return this.create(dto);
    }catch(err){
      console.log(err);
      return null;
    }
  }
}
