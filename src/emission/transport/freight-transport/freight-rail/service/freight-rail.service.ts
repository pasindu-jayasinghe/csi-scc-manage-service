import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CalculationService } from 'src/emission/calculation/calculation.service';
import { In, Repository } from 'typeorm';
import { sourceName } from 'src/emission/enum/sourcename.enum';
import { FreightRailActivityData } from '../entities/freight-rail.entity';
import { DistanceBasedDto, FreightRailDto, FuelBaseDto } from 'src/emission/calculation/dto/freight-rail.dto';
import { BaseDataDto } from 'src/emission/calculation/dto/emission-base-data.dto';
import { PuesDataReqActivityData, PuesDataReqDto } from 'src/project/dto/pues-data-req.dto';
import { SourceType } from 'src/project/dto/sourceType.enum';
import { Ownership } from 'src/project/enum/ownership.enum';
import { ProjectUnitEmissionSourceService } from 'src/project/service/project-unit-emission-source.service';
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
import { TransportMode, TransportOption } from 'src/emission/enum/transport.enum';
import { EmissionSourceRecalService } from 'src/emission/emission-source/service/emission-source-recal.service';
import { EmissionSourceBulkService } from 'src/emission/emission-source/service/emission-source-bulk.service';
import { ProgressRetriever } from 'src/emission/progress-retriever';
import { ProgressDataResponseDto } from 'src/emission/dto/progress-data.dto';
import { ProgresReportService } from 'src/emission/emission-source/service/progres-report.service';
import { ProgressStatus } from 'src/emission/enum/progress-status.enum';
import { isNumber } from '@nestjsx/util';
import { ExcelDownloader } from 'src/emission/excel-downloader';

@Injectable()
export class FreightRailService extends TypeOrmCrudService<FreightRailActivityData> implements ExcellUploadable, BulckUpdatable, ProgressRetriever, ExcelDownloader {

  getDto() {
    return new FreightRailActivityData();
  }

  constructor(
    @InjectRepository(FreightRailActivityData) repo,
    @InjectRepository(FreightRailActivityData)
    private readonly freightRailRepository: Repository<FreightRailActivityData>,
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
                if (data.distanceUp !== 0 ){
                  obj[data.month] = data.distanceUp + data.distanceDown + this.progresReportService.getParameterUnit(data, 'distanceUp')
                } else if (data.upCost !== 0){
                  obj[data.month] = data.upCost + data.downCost + this.progresReportService.getParameterUnit(data, 'distanceUp')
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
                if (data.distanceUp !== 0 ){
                  dataObjs[existVeh][data.month] = value + data.distanceUp + data.distanceDown + this.progresReportService.getParameterUnit(data, 'distanceUp')
                } else if (data.upCost !== 0){
                  dataObjs[existVeh][data.month] = value + data.upCost + data.downCost + this.progresReportService.getParameterUnit(data, 'distanceUp')
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
              if (data.distanceUp !== 0){
                dataObjs[existVehAndCargo][data.month] = value + data.distanceUp + data.distanceDown + this.progresReportService.getParameterUnit(data, 'distanceUp')
              } else if (data.upCost !== 0){
                dataObjs[existVehAndCargo][data.month] = value + data.upCost + data.downCost + this.progresReportService.getParameterUnit(data, 'distanceUp')
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
            if (data.distanceUp !== 0){
              dataObjs[existsAll][data.month] = value + data.distanceUp + data.distanceDown + this.progresReportService.getParameterUnit(data, 'distanceUp')
            } else if (data.upCost !== 0){
              dataObjs[existsAll][data.month] = value + data.upCost + data.downCost + this.progresReportService.getParameterUnit(data, 'distanceUp')
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
    let emissionSource = sourceName.freight_rail
    let parameters = [
      { name: 'Vehicle No', code: 'vehicleNo' }
    ]
    let ownerships = [Ownership.OWN, Ownership.HIRED, Ownership.RENTED]

    activityData = this.progresReportService.group(activityData, 'ownership')

    for await (let ownership of Object.keys(activityData)) {
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
            esName: 'Freight Rail - ' + ownership,
            completeness: ProgressStatus.COMPLETED,
            parameters: parameters
          })
        } else {
          allMonthFilled = this.progresReportService.checkCompleteness(activityDataUnit[key], true, true, { para: ['vehicleNo'] })
          response.push({
            unit: key,
            unitName: activityDataUnit[key][0]['unitName'],
            es: emissionSource + '_' + ownership,
            esName: 'Freight Rail - ' + ownership,
            completeness: allMonthFilled.isCompleted,
            unFilled: allMonthFilled.unFilled,
            parameters: parameters
          })
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
          esName: 'Freight Rail - ' + key,
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
          esName: 'Freight Rail - ' + key,
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
    return await this.emissionSourceRecalService.bulkCalculate(this, unitIds, projectId, this.repo, sourceName.freight_rail);
  }

  excellBulkUpload(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number, ownership: string, isMobile: boolean) {
    throw new Error('Method not implemented.');
  }

  downlodExcellBulkUploadVariableMapping() {
    throw new Error('Method not implemented.');
  }

  async create(createFreightRailDto: FreightRailActivityData) {
    const fuelBaseData: FuelBaseDto = {
      fuelType: createFreightRailDto.fuelType,
      fc: createFreightRailDto.fuelConsumption,
      fc_unit: createFreightRailDto.fuelConsumption_unit,
    };

    const distanceBaseData: DistanceBasedDto = {
      activity: createFreightRailDto.activity,
      type: createFreightRailDto.type,
      distanceUp: createFreightRailDto.distanceUp,
      distanceUp_unit: createFreightRailDto.distanceUp_unit,
      weightUp: createFreightRailDto.weightUp,
      weightUp_unit: createFreightRailDto.weightUp_unit,
      distanceDown: createFreightRailDto.distanceDown,
      distanceDown_unit: createFreightRailDto.distanceDown_unit,
      weightDown: createFreightRailDto.weightDown,
      weightDown_unit: createFreightRailDto.weightDown_unit,
      twoWay: createFreightRailDto.option === TransportOption.two_way ? true : false,
      trips: createFreightRailDto.noOfTrips
    };

    const calculationData: FreightRailDto = {
      year: createFreightRailDto.year,
      month: createFreightRailDto.month,
      fuelType: createFreightRailDto.fuelType,
      mode: createFreightRailDto.method,
      fuel: fuelBaseData,
      distance: distanceBaseData,
      baseData: await this.getBaseData(createFreightRailDto)
    };

    createFreightRailDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    createFreightRailDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    createFreightRailDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.freight_rail,
      data: calculationData,
    });

    this.updateTotalEmission(createFreightRailDto, calculationData, emission)
    //createFreightRailDto.emission = emission.data;
    createFreightRailDto.e_sc = emission.e_sc ? emission.e_sc : 0;
    createFreightRailDto.e_sc_co2 = emission.e_sc_co2 ? emission.e_sc_co2 : 0;
    createFreightRailDto.e_sc_ch4 = emission.e_sc_ch4 ? emission.e_sc_ch4 : 0;
    createFreightRailDto.e_sc_n2o = emission.e_sc_n2o ? emission.e_sc_n2o : 0;

    return await this.freightRailRepository.save(createFreightRailDto);
  }

  findAll() {
    return `This action returns all freightRail`;
  }


  async update(id: number, updateFreightRailDto: FreightRailActivityData) {

    const fuelBaseData: FuelBaseDto = {
      fuelType: updateFreightRailDto.fuelType,
      fc: updateFreightRailDto.fuelConsumption,
      fc_unit: updateFreightRailDto.fuelConsumption_unit,
    };

    const distanceBaseData: DistanceBasedDto = {
      activity: updateFreightRailDto.activity,
      type: updateFreightRailDto.type,
      distanceUp: updateFreightRailDto.distanceUp,
      distanceUp_unit: updateFreightRailDto.distanceUp_unit,
      weightUp: updateFreightRailDto.weightUp,
      weightUp_unit: updateFreightRailDto.weightUp_unit,
      distanceDown: updateFreightRailDto.distanceDown,
      distanceDown_unit: updateFreightRailDto.distanceDown_unit,
      weightDown: updateFreightRailDto.weightDown,
      weightDown_unit: updateFreightRailDto.weightDown_unit,
      twoWay: updateFreightRailDto.option === TransportOption.two_way ? true : false,
      trips: updateFreightRailDto.noOfTrips
    };

    const calculationData: FreightRailDto = {
      year: updateFreightRailDto.year,
      month: updateFreightRailDto.month,
      fuelType: updateFreightRailDto.fuelType,
      mode: updateFreightRailDto.method,
      fuel: fuelBaseData,
      distance: distanceBaseData,
      baseData: await this.getBaseData(updateFreightRailDto)
    };

    updateFreightRailDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    updateFreightRailDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    updateFreightRailDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.freight_rail,
      data: calculationData,
    });

    if (updateFreightRailDto.e_sc !== emission.e_sc) {
      // this.updateTotalEmission(updateFreightRailDto, calculationData, emission)

      let current = await this.repo.findOne(id);
      let updatedEmission = this.calculationService.getDiff(current, emission);
      this.calculationService.updateTotalEmission(
        updatedEmission,
        updateFreightRailDto.project,
        calculationData.baseData.clasification, 
        sourceName.freight_rail,
        updateFreightRailDto.unit.id
      );
    }
    //updateFreightRailDto.emission = emission.data;
    updateFreightRailDto.e_sc = emission.e_sc ? emission.e_sc : 0;
    updateFreightRailDto.e_sc_co2 = emission.e_sc_co2 ? emission.e_sc_co2 : 0;
    updateFreightRailDto.e_sc_ch4 = emission.e_sc_ch4 ? emission.e_sc_ch4 : 0;
    updateFreightRailDto.e_sc_n2o = emission.e_sc_n2o ? emission.e_sc_n2o : 0;

    const updated = await this.repo.update({
      id: id
    }, updateFreightRailDto);
    if (updated.affected === 1) {
      return await this.repo.findOne(id);
    } else {
      throw new InternalServerErrorException("Updating is failed");
    }
  }

  async getBaseData(dto: FreightRailActivityData): Promise<BaseDataDto> {
    let ownership: Ownership = Ownership.getkey(dto.ownership)
    let activityInfo = new PuesDataReqActivityData()
    activityInfo.owenerShip = ownership
    activityInfo.stationary = dto.stationary
    activityInfo.mobile = dto.mobile
    let req = new PuesDataReqDto()
    req.project = dto.project
    req.sourceName = sourceName.freight_rail
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

  async remove(req) {
    let o = req.parsed.paramsFilter.find(o => o.field === 'id')
    let deleteDto = await this.repo.findOne({id: o.value})
    let updatedEmission = this.calculationService.getDiff(deleteDto, null)
    this.calculationService.updateTotalEmission(
      updatedEmission,
      deleteDto.project,
      (deleteDto.direct ? Clasification.DIRECT : ((deleteDto.indirect ? Clasification.INDIRECT : Clasification.OTHER))), 
      sourceName.freight_rail,
      deleteDto.unit.id
    );
    return await this.repo.delete({id: deleteDto.id});
  }


  async updateTotalEmission(dto: FreightRailActivityData, calData: FreightRailDto, emission: any) {
    let reqPues: PuesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.freight_rail,
      unitId: dto.unit.id,
      emission: emission,
      classification: calData.baseData.clasification
    }

    await this.puesService.addEmission(reqPues)

    let reqPes: PesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.freight_rail,
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

  async addFromExcell(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number) {
    // this.sleep(100000);
    let units = this.parameterUnit.generator_units;
    console.log("uuuu--", units);


    // common --------------
    let dto = new FreightRailActivityData();
    dto['unit'] = unit;
    dto['project'] = project;
    dto['user'] = user;

    console.log("data---", data);

    variable_mapping.forEach(vm => {
      if (vm['V2']) {
        if (vm['V1']) {
          let val = data[vm['V1']];
          dto[vm['V2']] = val;
        }
      }
    })
    dto.year = year;
    // End of common --------------
    dto.method = TransportMode.fuel_base;
    dto.fuelConsumption_unit = 'L'
    switch (data.fuelType) {
      case 'Petrol': {
        dto.fuelType = "PETROL"
        break;
      }
      case "Diesel": {
        dto.fuelType = "DIESEL"
        break;
      }
      case 'Marine gas oil': {
        dto.fuelType = "PETROL"
        break;
      }
      case 'Marine fuel oil': {
        dto.fuelType = "PETROL"
        break;
      }
      default: {
        //statements; 
        break;
      }
    }

    dto.domOrInt = "INTERNATIONAL"
    dto.cargoType = "OTHER"


    //  dto.upDistance_unit = "KM"
    //  dto.upWeight_unit = "T"
    dto.noOfTrips = 1
    //  dto.option = "One way"


    console.log("dto--", dto);

    try {
      return this.create(dto);
    } catch (err) {
      console.log(err);
      return null;
    }
    // return null;

  }
}
