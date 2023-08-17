import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CalculationService } from 'src/emission/calculation/calculation.service';
import { In, Repository } from 'typeorm';
import { sourceName } from 'src/emission/enum/sourcename.enum';
import { FreightRoadActivityData } from '../entities/freight-road.entity';
import { DistanceBaseDto, FreightRoadDto, FuelBaseDto } from 'src/emission/calculation/dto/freight-road.dto';
import { BaseDataDto } from 'src/emission/calculation/dto/emission-base-data.dto';
import { PuesDataReqActivityData, PuesDataReqDto } from 'src/project/dto/pues-data-req.dto';
import { SourceType } from 'src/project/dto/sourceType.enum';
import { Ownership } from 'src/project/enum/ownership.enum';
import { ProjectUnitEmissionSourceService } from 'src/project/service/project-unit-emission-source.service';
import { TransportMode, TransportOption } from 'src/emission/enum/transport.enum';
import { PuesSumDataReqDto, PesSumDataReqDto, ProjectSumDataReqDto } from 'src/project/dto/update-total-emission-req.dto';
import { ProjectEmissionSourceService } from 'src/emission/emission-source/service/project-emission-source.service';
import { ProjectService } from 'src/project/service/project.service';
import { Clasification } from 'src/project/enum/clasification.enum';
import { ExcellUploadable } from 'src/emission/excell-uploadable';
import { BulckUpdatable } from 'src/emission/bulck-updatable';
import { ParameterUnit } from 'src/utills/parameter-units';
import { Unit } from 'src/unit/entities/unit.entity';
import { Project } from 'src/project/entities/project.entity';
import { User } from 'src/users/user.entity';
import { EmissionSourceRecalService } from 'src/emission/emission-source/service/emission-source-recal.service';
import { promises as fs } from "fs";
import { EmissionSourceBulkService } from 'src/emission/emission-source/service/emission-source-bulk.service';
import { VariableValidationType } from 'src/emission/enum/variable-validation-type.enum';
import { ProgressRetriever } from 'src/emission/progress-retriever';
import { ProgressDataResponseDto } from 'src/emission/dto/progress-data.dto';
import { ProgresReportService } from 'src/emission/emission-source/service/progres-report.service';
import { ProgressStatus } from 'src/emission/enum/progress-status.enum';
import { isNumber } from '@nestjsx/util';
import { ExcelDownloader } from 'src/emission/excel-downloader';

@Injectable()
export class FreightRoadService extends TypeOrmCrudService<FreightRoadActivityData>  implements ExcellUploadable , BulckUpdatable, ProgressRetriever, ExcelDownloader{

  getDto() {
    return new FreightRoadActivityData();
  }


  private excelBulkVariableMapping: {code: string, name: string,isRequired: boolean,type: VariableValidationType}[] = [
    {code: "month", name: 'Month',isRequired: true,type:VariableValidationType.list},
    {code: "paidByCompany", name: 'Paid by the company',isRequired: false,type:VariableValidationType.bool},
    {code: "vehicleNo", name: 'Vehicle Number',isRequired: true,type:VariableValidationType.textOrNumber},
    {code: "method", name: 'Method',isRequired: true,type:VariableValidationType.list},
    {code: "ownership", name: 'Ownership',isRequired: true,type:VariableValidationType.list},
    {code: "isShared", name: 'Is shared',isRequired: false,type:VariableValidationType.bool},
    {code: "share", name: 'Share',isRequired: false,type:VariableValidationType.number},
    {code: "cargoType", name: 'Cargo type',isRequired: false,type:VariableValidationType.list},
    {code: "option", name: 'One Way/ Round Trip',isRequired: true,type:VariableValidationType.list},
    {code: "domOrInt", name: 'Domestic/International',isRequired: true,type:VariableValidationType.list},
    {code: "noOfTrips", name: 'Number of trips',isRequired: true,type:VariableValidationType.number},
    
    {code: "upWeight", name: 'Weight transported-up',isRequired: false,type:VariableValidationType.number},
    {code: "upWeight_unit", name: 'Weight transported-up unit',isRequired: false,type:VariableValidationType.list},
    {code: "downWeight", name: 'Weight transported-down',isRequired: false,type:VariableValidationType.number},
    {code: "downWeight_unit", name: 'Weight transported-down unit',isRequired: false,type:VariableValidationType.list},
    {code: "upCost", name: 'Cost-up',isRequired: false,type:VariableValidationType.number},
    {code: "downCost", name: 'Cost-down',isRequired: false,type:VariableValidationType.number},
    {code: "upCostPerKM", name: 'Cost-up per km',isRequired: false,type:VariableValidationType.number},
    {code: "downCostPerKM", name: 'Cost-down per km',isRequired: false,type:VariableValidationType.number},
    {code: "upDistance", name: 'Distance travelled-up',isRequired: false,type:VariableValidationType.number},
    {code: "upDistance_unit", name: 'Distance travelled-up unit',isRequired: false,type:VariableValidationType.list},
    {code: "downDistance", name: 'Distance travelled-down',isRequired: false,type:VariableValidationType.number},
    {code: "downDistance_unit", name: 'Distance travelled-down unit',isRequired: false,type:VariableValidationType.list},
    {code: "fuelType", name: 'Fuel type',isRequired: false,type:VariableValidationType.list},
    {code: "fuelConsumption", name: 'Fuel consumption',isRequired: false,type:VariableValidationType.number},
    {code: "fuelConsumption_unit", name: 'Fuel consumption unit',isRequired: false,type:VariableValidationType.list},
    {code: "fuelEconomy", name: 'Fuel economy',isRequired: false,type:VariableValidationType.number},
    {code: "fuelEconomy_unit", name: 'Fuel economy unit',isRequired: false,type:VariableValidationType.list},
  ]

  constructor(
    @InjectRepository(FreightRoadActivityData) repo,
    @InjectRepository(FreightRoadActivityData)
    private readonly freightRoadRepository: Repository<FreightRoadActivityData>,
    @InjectRepository(Unit) private unitRepo: Repository<Unit>,
    private readonly calculationService: CalculationService,
    private readonly puesService: ProjectUnitEmissionSourceService,
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
    let filter = 'project.id = :projectId AND unit.id IN (:unitIds) AND ownership = :ownership'
    let filterValues = {projectId: projectId, unitIds: unitIds, ownership: ownership}
    let acData = await this.getActivityData(filter, filterValues)
    
    let months = this.parameterUnit.months
    let columns = []
    let rows = []
    columns.push(...[
      {name: "Vehicle No", code: "vehicleNo"},
      {name: "Cargo type", code: "cargoType"},
      {name: "Distance Based / Fuel Based", code: "method"}
    ])
    months.forEach(m => {
      columns.push({name: m.name, code: m.value.toString()})
    })
    rows.push(columns)
    let dataObjs = []
    columns.sort((a, b) => a.code - b.code)

    if (acData.length > 0) {
      acData.forEach(data => {
        let existsAll = dataObjs.findIndex(o => {
          return (
            o['vehicleNo'] === data['vehicleNo'] &&
            o['cargoType'] === data['cargoType'] &&
            o['method'] === data['method']
          )
        })
        if (existsAll === -1){
          let existVehAndCargo = dataObjs.findIndex(o => (o['vehicleNo'] === data['vehicleNo'] && o['cargoType'] === data['cargoType']))
          if (existVehAndCargo === -1){
            let existVeh = dataObjs.findIndex(o => (o['vehicleNo'] === data['vehicleNo']))
            if (existVeh === -1){
              let obj = {}
              months.forEach(m => {
                obj = {...obj, ...{[m.value]:0}}
              })
              obj = {...obj, ...{vehicleNo: '', method: ''}}
              obj['vehicleNo'] =  data.vehicleNo
              obj['method'] =  data.method
              obj['cargoType'] = this.progresReportService.getMainParaValue(data.cargoType, 'cargoType')
              if (data.method === TransportMode.fuel_base){
                obj[data.month] = data.fuelConsumption + this.progresReportService.getParameterUnit(data, 'fuelConsumption')
              } else if (data.method === TransportMode.distance_base){
                if (data.upDistance !== 0 ){
                  obj[data.month] = data.upDistance + data.downDistance + this.progresReportService.getParameterUnit(data, 'upDistance')
                } else if (data.upCost !== 0){
                  obj[data.month] = data.upCost + data.downCost + this.progresReportService.getParameterUnit(data, 'upDistance')
                }
              }
              dataObjs.push(obj)
            } else {
              dataObjs[existVeh]['method'] = data.method
              dataObjs[existVeh]['cargoType'] = this.progresReportService.getMainParaValue(data.cargoType, 'cargoType')
              let value = 0
              if (!isNumber(dataObjs[existVeh][data.month])){
                value = parseFloat((dataObjs[existVeh][data.month]).split(" ")[0])
              }
              if (data.method === TransportMode.fuel_base) {
                dataObjs[existVeh][data.month] = value + data.fuelConsumption + this.progresReportService.getParameterUnit(data, 'fuelConsumption')
              } else if (data.method === TransportMode.distance_base) {
                if (data.upDistance !== 0 ){
                  dataObjs[existVeh][data.month] = value + data.upDistance + data.downDistance + this.progresReportService.getParameterUnit(data, 'upDistance')
                } else if (data.upCost !== 0){
                  dataObjs[existVeh][data.month] = value + data.upCost + data.downCost + this.progresReportService.getParameterUnit(data, 'upDistance')
                }
              }
            }
          } else {
            dataObjs[existVehAndCargo]['method'] = data.method
            let value = 0
            if (!isNumber(dataObjs[existVehAndCargo][data.month])) {
              value = parseFloat((dataObjs[existVehAndCargo][data.month]).split(" ")[0])
            }
            if (data.method === TransportMode.fuel_base) {
              dataObjs[existVehAndCargo][data.month] = value + data.fuelConsumption + this.progresReportService.getParameterUnit(data, 'fuelConsumption')
            } else if (data.method === TransportMode.distance_base){
              if (data.upDistance !== 0){
                dataObjs[existVehAndCargo][data.month] = value + data.upDistance + data.downDistance + this.progresReportService.getParameterUnit(data, 'upDistance')
              } else if (data.upCost !== 0){
                dataObjs[existVehAndCargo][data.month] = value + data.upCost + data.downCost + this.progresReportService.getParameterUnit(data, 'upDistance')
              }
            }
          }
        } else {
          let value = 0
          if (!isNumber(dataObjs[existsAll][data.month])) {
            value = parseFloat((dataObjs[existsAll][data.month]).split(" ")[0])
          }
          if (data.method === TransportMode.fuel_base){
            dataObjs[existsAll][data.month] = value + data.fuelConsumption + this.progresReportService.getParameterUnit(data, 'fuelConsumption')
          } else if (data.method === TransportMode.distance_base) {
            if (data.upDistance !== 0){
              dataObjs[existsAll][data.month] = value + data.upDistance + data.downDistance + this.progresReportService.getParameterUnit(data, 'upDistance')
            } else if (data.upCost !== 0){
              dataObjs[existsAll][data.month] = value + data.upCost + data.downCost + this.progresReportService.getParameterUnit(data, 'upDistance')
            }
          }
        }
      })
    }

    return {
      data: dataObjs,
      rows: rows
    }
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
    let emissionSource = sourceName.freight_road
    let parameters = [
      { name: 'Vehicle No', code: 'vehicleNo' }
    ]
    let ownerships = [Ownership.OWN, Ownership.HIRED, Ownership.RENTED]

    activityData = this.progresReportService.group(activityData, 'ownership')

    for await (let ownership of Object.keys(activityData)) {
      if (ownerships.includes(ownership as Ownership)){
        activityData[ownership] = activityData[ownership].map(ele => {
          ele['unitId'] = ele.unit.id
          ele['unitName'] = ele.unit.name
          return ele
        })
  
        let activityDataUnit = this.progresReportService.group(activityData[ownership], 'unitId')
        for await (let key of Object.keys(activityDataUnit)) {
          let pues = await this.puesService.getByUnitAndProjectAndES(parseInt(key), projectId, emissionSource)
          if (pues && pues.isComplete) {
            response.push({
              unit: key,
              unitName: activityDataUnit[key][0]['unitName'],
              es: emissionSource + '_' + ownership,
              esName: 'Freight Road - ' + ownership,
              completeness: ProgressStatus.COMPLETED,
              parameters: parameters
            })
          } else {
            allMonthFilled = this.progresReportService.checkCompleteness(activityDataUnit[key], true, true, { para: ['vehicleNo'] })
            response.push({
              unit: key,
              unitName: activityDataUnit[key][0]['unitName'],
              es: emissionSource + '_' + ownership,
              esName: 'Freight Road - ' + ownership,
              completeness: allMonthFilled.isCompleted,
              unFilled: allMonthFilled.unFilled,
              parameters: parameters
            })
          }
        }
      }
    }
    let assignedUnits = await this.puesService.getAllowedUnitsforProjectAndEs(projectId, emissionSource)

    let assignedUIds = assignedUnits.map(u => u.code)
    let notAssignedIds = unitIds.filter(u => (!assignedUIds.includes(parseInt(u.toString()))))

    for await (let key of Object.keys(activityData)){
      let uNoData = assignedUIds.filter(ele => !Object.keys(activityData[key]).includes(ele.toString()))

      for await (const e of uNoData) {
        let unit = await this.unitRepo.findOne({ id: e })
        response.push({
          unit: e.toString(),
          unitName: unit.name,
          es: emissionSource + '_' + key,
          esName: 'Freight Road - ' + key,
          completeness: ProgressStatus.NOT_ENTERED,
          parameters: parameters
        })
      }
      for await (const e of notAssignedIds) {
        let unit = await this.unitRepo.findOne({ id: e })
        response.push({
          unit: e.toString(),
          unitName: unit.name,
          es: emissionSource + '_' + key,
          esName: 'Freight Road - ' + key,
          completeness: ProgressStatus.NOT_ASSIGNED,
          parameters: parameters
        })
      }
    }

    return response
  }


  async bulkDelete(ids: number[], isPermant: boolean) {
    return await this.emissionSourceRecalService.bulkDelete(ids,isPermant, this);
  }

   async bulkCalculate(unitIds: number[], projectId: number) {
    return await this.emissionSourceRecalService.bulkCalculate(this, unitIds, projectId, this.repo, sourceName.freight_road);
  }

  excellBulkUpload(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number, ownership: string, isMobile: boolean) {

    let dto = new FreightRoadActivityData();
    dto = this.emissionSourceBulkService.excellBulkUpload(unit, project,user,data,year,ownership,isMobile,dto,this.excelBulkVariableMapping);

    // console.log(dto.consumption);
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

  async create(createFreightRoadDto: FreightRoadActivityData) {


    // if (createFreightRoadDto.method === "Distance Based") {
    //   mode = TransportMode.distance_base
    // } else {
    //   mode = TransportMode.fuel_base
    // }

    const fuelBaseData: FuelBaseDto = {
      fc: createFreightRoadDto.fuelConsumption,
      fc_unit: createFreightRoadDto.fuelConsumption_unit
    };

    const distanceBaseData: DistanceBaseDto = {
      distanceUp: createFreightRoadDto.upDistance, //one way and two way up
      distanceUp_unit: createFreightRoadDto.upDistance_unit,
      weightUp: createFreightRoadDto.upWeight, // one way and two way up
      weightUp_unit: createFreightRoadDto.upWeight_unit,
      distanceDown: createFreightRoadDto.downDistance,
      distanceDown_unit: createFreightRoadDto.downDistance_unit,
      weightDown: createFreightRoadDto.downWeight,
      weightDown_unit: createFreightRoadDto.downWeight_unit,
      costUp: createFreightRoadDto.upCost, // one way and two way up
      costDown: createFreightRoadDto.downCost,
      cargoType: createFreightRoadDto.cargoType,
      twoWay: createFreightRoadDto.option === TransportOption.two_way ? true : false,
      trips: createFreightRoadDto.noOfTrips,
      fe: createFreightRoadDto.fuelEconomy,
      fe_unit: createFreightRoadDto.fuelEconomy_unit
    };

    const calculationData: FreightRoadDto = {
      year: createFreightRoadDto.year,
      month: createFreightRoadDto.month,
      mode: createFreightRoadDto.method,
      share: createFreightRoadDto.isShared ? createFreightRoadDto.share : 100,
      fuelType: createFreightRoadDto.fuelType,
      fuel: fuelBaseData,
      distance: distanceBaseData,
      baseData: await this.getBaseData(createFreightRoadDto)
    };

    createFreightRoadDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    createFreightRoadDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    createFreightRoadDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.freight_road,
      data: calculationData,
    });
    this.updateTotalEmission(createFreightRoadDto, calculationData, emission)
    //createFreightRoadDto.emission = emission.data;
    createFreightRoadDto.e_sc = emission.e_sc ? emission.e_sc : 0;
    createFreightRoadDto.e_sc_co2 = emission.e_sc_co2 ? emission.e_sc_co2 : 0;
    createFreightRoadDto.e_sc_ch4 = emission.e_sc_ch4 ? emission.e_sc_ch4 : 0;
    createFreightRoadDto.e_sc_n2o = emission.e_sc_n2o ? emission.e_sc_n2o : 0;

    return await this.freightRoadRepository.save(createFreightRoadDto);
  }

  findAll() {
    return `This action returns all freightRoad`;
  }

  async update(id: number, updateFreightRoadDto: FreightRoadActivityData) {


    // if (updateFreightRoadDto.method === "Distance Based") {
    //   mode = TransportMode.distance_base
    // } else {
    //   mode = TransportMode.fuel_base
    // }

    const fuelBaseData: FuelBaseDto = {
      fc: updateFreightRoadDto.fuelConsumption,
      fc_unit: updateFreightRoadDto.fuelConsumption_unit
    };

    const distanceBaseData: DistanceBaseDto = {
      distanceUp: updateFreightRoadDto.upDistance, //one way and two way up and shared types
      distanceUp_unit: updateFreightRoadDto.upDistance_unit,
      weightUp: updateFreightRoadDto.upWeight, // one way and two way up
      weightUp_unit: updateFreightRoadDto.upWeight_unit,
      distanceDown: updateFreightRoadDto.downDistance,
      distanceDown_unit: updateFreightRoadDto.downDistance_unit,
      weightDown: updateFreightRoadDto.downWeight,
      weightDown_unit: updateFreightRoadDto.downWeight_unit,
      costUp: updateFreightRoadDto.upCost, // one way and two way up
      costDown: updateFreightRoadDto.downCost,
      cargoType: updateFreightRoadDto.cargoType,
      twoWay: updateFreightRoadDto.option === TransportOption.two_way ? true : false,
      trips: updateFreightRoadDto.noOfTrips,
      fe: updateFreightRoadDto.fuelEconomy,
      fe_unit: updateFreightRoadDto.fuelEconomy_unit
    };

    const calculationData: FreightRoadDto = {
      year: updateFreightRoadDto.year,
      month: updateFreightRoadDto.month,
      mode: updateFreightRoadDto.method,
      share: updateFreightRoadDto.isShared ? updateFreightRoadDto.share : 100,
      fuelType: updateFreightRoadDto.fuelType,
      fuel: fuelBaseData,
      distance: distanceBaseData,
      baseData: await this.getBaseData(updateFreightRoadDto)
    };

    updateFreightRoadDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    updateFreightRoadDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    updateFreightRoadDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.freight_road,
      data: calculationData,
    });

    if (updateFreightRoadDto.e_sc !== emission.e_sc) {
      // this.updateTotalEmission(updateFreightRoadDto, calculationData, emission)

      let current = await this.repo.findOne(id);
      let updatedEmission = this.calculationService.getDiff(current, emission);
      this.calculationService.updateTotalEmission(
        updatedEmission,
        updateFreightRoadDto.project,
        calculationData.baseData.clasification, 
        sourceName.freight_road,
        updateFreightRoadDto.unit.id
      );
    }
    //updateFreightRoadDto.emission = emission.data;
    updateFreightRoadDto.e_sc = emission.e_sc ? emission.e_sc : 0;
    updateFreightRoadDto.e_sc_co2 = emission.e_sc_co2 ? emission.e_sc_co2 : 0;
    updateFreightRoadDto.e_sc_ch4 = emission.e_sc_ch4 ? emission.e_sc_ch4 : 0;
    updateFreightRoadDto.e_sc_n2o = emission.e_sc_n2o ? emission.e_sc_n2o : 0;

    const updated = await this.repo.update({
      id: id
    }, updateFreightRoadDto);
    if (updated.affected === 1) {
      return await this.repo.findOne(id);
    } else {
      throw new InternalServerErrorException("Updating is failed");
    }
  }

  async getBaseData(dto: FreightRoadActivityData): Promise<BaseDataDto> {
    let ownership: Ownership = Ownership.getkey(dto.ownership)
    let activityInfo = new PuesDataReqActivityData()
    activityInfo.owenerShip = ownership
    activityInfo.stationary = dto.stationary
    activityInfo.mobile = dto.mobile
    activityInfo.paidByCompany = dto.paidByCompany
    let req = new PuesDataReqDto()
    req.project = dto.project
    req.sourceName = sourceName.freight_road
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

  async updateTotalEmission(dto: FreightRoadActivityData, calData: FreightRoadDto, emission: any) {
    let reqPues: PuesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.freight_road,
      unitId: dto.unit.id,
      emission: emission,
      classification: calData.baseData.clasification
    }

    await this.puesService.addEmission(reqPues)

    let reqPes: PesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.freight_road,
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
    let deleteDto = await this.repo.findOne({ id: o.value })
    let updatedEmission = this.calculationService.getDiff(deleteDto, null)
    this.calculationService.updateTotalEmission(
      updatedEmission,
      deleteDto.project,
      (deleteDto.direct ? Clasification.DIRECT : ((deleteDto.indirect ? Clasification.INDIRECT : Clasification.OTHER))),
      sourceName.freight_road,
      deleteDto.unit.id
    );
    return await this.repo.delete({id: deleteDto.id});
  }



  async addFromExcell(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number) {
    // this.sleep(100000);
    let units = this.parameterUnit.generator_units;


    console.log('data',data)
    // common --------------
    let dto = new FreightRoadActivityData();
    dto['unit'] = unit;
    dto['project'] = project;
    dto['user'] = user;


    variable_mapping.forEach(vm => {
      if (vm['V1']) {
        let val = data[vm['V1']];

        if (val === null || val === "" || val === "NULL" || val === undefined) {
          // console.log("nullval", val)
          if (vm['default-v2']) {
            dto[vm['V2']] = vm['default-v2'];
          }
        }
        else {
          dto[vm['V2']] = val;
        }
      }

    })
    dto.year = year;
    dto.isShared = false;
    dto.share = 100;
    dto.domOrInt = "INTERNATIONAL"
    // End of common --------------

    // dto.freightType = 'road'

    dto.option = TransportOption.one_way;
    // dto.noOfTrips = 1

    if (dto.vehicleNo == undefined) {
      dto.vehicleNo = "N/A"
    }


    switch (data.owenerShip) {
      case 'Company Own': {
        dto.ownership = Ownership.OWN

        break;
      }
      case 'Hired': {
        dto.ownership = Ownership.HIRED

        break;
      }

      case 'Rented': {
        dto.ownership = Ownership.RENTED

        break;
      }
      default: {
        //statements; 
        break;
      }

    }

    switch (data.fuelType || data.fuel) {
      case 'Petrol': {
        dto.fuelType = "PETROL"
        break;
      }
      case "Diesel": {
        dto.fuelType = "DIESEL"
        break;
      }
      case "Disel": {
        dto.fuelType = "DIESEL"
        break;
      }
      case 'Coal': {
        dto.fuelType = "DIESEL"
        break;
      }

      case 'Marine gas oil': {
        dto.fuelType = "MARINE_GAS_OIL"
        break;
      }

      default: {
        //statements; 
        break;
      }
    }



    switch (data.method) {
      case 'fuel_base': {
        dto.fuelConsumption_unit = 'L'
        dto.method = TransportMode.fuel_base;

        break;
      }
      case 'distance_base': {
        dto.upDistance_unit = 'KM'
        dto.upWeight_unit = 'T'
        dto.method = TransportMode.distance_base;


        break;
      }
      default: {
        //statements; 
        break;
      }


    }
    //trans- local
    if (data.method == undefined) {
      const _data = await fs.readFile('public/tmp/airports.json', "utf8");
      let materials = JSON.parse(_data.toString())

      let mt = data['MATERIAL_TYPE'] ? data['MATERIAL_TYPE'] : data['waste']

      dto.cargoType = (materials.find((o: any) => o.TYPE_V1 === mt)).TYPE_V2

      // if (mt.includes('water')) {

      //   dto.cargoType = "WATER_BOTTLES";
      // }
      // else if (mt.includes('a4')) {
      //   dto.cargoType = "STATIONARY";

      // }
      // else {

      //   dto.cargoType = "OTHER";

      // }

      dto.isShared = true;
      if (data['LOADING_CAPACITY'] == 0) {
        dto.share = 0;

      } else {
        dto.share = (dto.upWeight / data['LOADING_CAPACITY']) * 100;

      }

      if (dto.fuelEconomy == undefined || dto.fuelEconomy == 0) {
        dto.fuelConsumption_unit = 'L'
        dto.method = TransportMode.fuel_base;
      } else {
        dto.upDistance_unit = 'KM'
        dto.upWeight_unit = 'T'
        dto.method = TransportMode.distance_base;
        dto.fuelEconomy_unit = 'KML'
      }

      dto.ownership = Ownership.HIRED
      dto.paidByCompany = true

    }

    try{
      // fs.unlink('public/tmp/airports.json')
    } catch(error){
      console.log(error)
    }

// console.log("dtooo---",dto)

    try {
      return this.create(dto);
    } catch (err) {
      console.log(err);
      return null;
    }
    // return null;
  }


}
