import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CalculationService } from 'src/emission/calculation/calculation.service';
import { getRepository, In, Repository } from 'typeorm';
import { sourceName } from 'src/emission/enum/sourcename.enum';
import { FreightWaterActivityData } from '../entities/freight-water.entity';
import { DistanceBaseDto, FreightWaterDto, FuelBaseDto } from 'src/emission/calculation/dto/freight-water.dto';
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
import { ParameterUnit } from 'src/utills/parameter-units';
import { Unit } from 'src/unit/entities/unit.entity';
import { Project } from 'src/project/entities/project.entity';
import { User } from 'src/users/user.entity';
import { ExcellUploadable } from 'src/emission/excell-uploadable';
import { BulckUpdatable } from 'src/emission/bulck-updatable';
import { SeaPort } from 'src/ports/sea-port-list.entity';
import { CountryService } from 'src/country/country.service';
import { SeaPortService } from 'src/ports/sea-ports-list.service';
import { EmissionSourceRecalService } from 'src/emission/emission-source/service/emission-source-recal.service';
import { EmissionSourceBulkService } from 'src/emission/emission-source/service/emission-source-bulk.service';
import { ProgressRetriever } from 'src/emission/progress-retriever';
import { ProgressDataResponseDto } from 'src/emission/dto/progress-data.dto';
import { ProgresReportService } from 'src/emission/emission-source/service/progres-report.service';
import { ProgressStatus } from 'src/emission/enum/progress-status.enum';
import { isNumber } from '@nestjsx/util';
import { ExcelDownloader } from 'src/emission/excel-downloader';

@Injectable()
export class FreightWaterService extends TypeOrmCrudService<FreightWaterActivityData> implements ExcellUploadable, ProgressRetriever, ExcelDownloader {

  getDto() {
    return new FreightWaterActivityData();
  }

  constructor(
    @InjectRepository(FreightWaterActivityData) repo,
    @InjectRepository(FreightWaterActivityData)
    private readonly freightWaterRepository: Repository<FreightWaterActivityData>,
    @InjectRepository(Unit) private unitRepo: Repository<Unit>,
    private readonly calculationService: CalculationService,
    private readonly puesService: ProjectUnitEmissionSourceService,
    private pesService: ProjectEmissionSourceService,
    private projectService: ProjectService,
    private parameterUnit: ParameterUnit,
    private countryService: CountryService,
    private seaportService: SeaPortService,
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
      .where(filter, filterValues)
    return await data.getMany()
  }
  async getProgressData(projectId: number, unitIds: number[]) {
    let allMonthFilled: any = {}
    let response = []
    let activityData = await this.repo.find({ project: { id: projectId }, unit: { id: In(unitIds) } })
    let emissionSource = sourceName.freight_water
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
            esName: 'Freight Water - '+ ownership,
            completeness: ProgressStatus.COMPLETED,
            parameters: parameters
          })
        } else {
          allMonthFilled = this.progresReportService.checkCompleteness(activityDataUnit[key], true, true, { para: ['vehicleNo'] })
          response.push({
            unit: key,
            unitName: activityDataUnit[key][0]['unitName'],
            es: emissionSource + '_' + ownership,
            esName: 'Freight Water - '+ ownership,
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
          esName: 'Freight Water - ' + key,
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
          esName: 'Freight Water - ' + key,
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
    return await this.emissionSourceRecalService.bulkCalculate(this, unitIds, projectId, this.repo, sourceName.freight_water);
  }

  excellBulkUpload(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number, ownership: string, isMobile: boolean) {
    throw new Error('Method not implemented.');
  }

  downlodExcellBulkUploadVariableMapping() {
    throw new Error('Method not implemented.');
  }

  async create(createFreightWaterDto: FreightWaterActivityData) {

    // if (createFreightWaterDto.method === "Distance Based") {
    //   mode = TransportMode.distance_base
    // } else {
    //   mode = TransportMode.fuel_base
    // }

    const fuelBaseData: FuelBaseDto = {
      fc: createFreightWaterDto.fuelConsumption,
      fc_unit: createFreightWaterDto.fuel_unit,
      fuel_type: createFreightWaterDto.fuelType
    };

    const distanceBaseData: DistanceBaseDto = {
      distanceUp: createFreightWaterDto.upDistance, //one way and two way up, handle distance from port in userservice
      distanceUp_unit: createFreightWaterDto.upDistance_unit,
      weightUp: createFreightWaterDto.upWeight, // one way and two way up
      weightUp_unit: createFreightWaterDto.upWeight_unit,
      distanceDown: createFreightWaterDto.downDistance, //handle distance from port in userservice
      distanceDown_unit: createFreightWaterDto.downDistance_unit,
      weightDown: createFreightWaterDto.downWeight,
      weightDown_unit: createFreightWaterDto.downWeight_unit,
      costUp: createFreightWaterDto.upCost, // one way and two way up
      costDown: createFreightWaterDto.downCost,
      twoWay: createFreightWaterDto.option === TransportOption.two_way ? true : false,
      trips: createFreightWaterDto.noOfTrips,
      activity: createFreightWaterDto.activity,
      type: createFreightWaterDto.type,
      size: createFreightWaterDto.size,

    };

    const calculationData: FreightWaterDto = {
      year: createFreightWaterDto.year,
      month: createFreightWaterDto.month,
      mode: createFreightWaterDto.method,
      fuel: fuelBaseData,
      distance: distanceBaseData,
      baseData: await this.getBaseData(createFreightWaterDto)
    };

    createFreightWaterDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    createFreightWaterDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    createFreightWaterDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.freight_water,
      data: calculationData,
    });

    if (emission && (emission.e_sc || emission.e_sc_co2 || emission.e_sc_ch4 || emission.e_sc_n2o)) {
      this.updateTotalEmission(createFreightWaterDto, calculationData, emission)
    }
    //  createFreightWaterDto.emission = emission.data;
    createFreightWaterDto.e_sc = emission.e_sc ? emission.e_sc : 0;
    createFreightWaterDto.e_sc_co2 = emission.e_sc_co2 ? emission.e_sc_co2 : 0;
    createFreightWaterDto.e_sc_ch4 = emission.e_sc_ch4 ? emission.e_sc_ch4 : 0;
    createFreightWaterDto.e_sc_n2o = emission.e_sc_n2o ? emission.e_sc_n2o : 0;

    return await this.freightWaterRepository.save(createFreightWaterDto);
  }

  findAll() {
    return `This action returns all freightWater`;
  }


  async update(id: number, updateFreightWaterDto: FreightWaterActivityData) {


    // if (updateFreightWaterDto.method === "Distance Based") {
    //   mode = TransportMode.distance_base
    // } else {
    //   mode = TransportMode.fuel_base
    // }


    const fuelBaseData: FuelBaseDto = {
      fc: updateFreightWaterDto.fuelConsumption,
      fc_unit: updateFreightWaterDto.fuel_unit,
      fuel_type: updateFreightWaterDto.fuelType
    };

    const distanceBaseData: DistanceBaseDto = {
      distanceUp: updateFreightWaterDto.upDistance, //one way and two way up, handle distance from port in userservice
      distanceUp_unit: updateFreightWaterDto.upDistance_unit,
      weightUp: updateFreightWaterDto.upWeight, // one way and two way up
      weightUp_unit: updateFreightWaterDto.upWeight_unit,
      distanceDown: updateFreightWaterDto.downDistance, //handle distance from port in userservice
      distanceDown_unit: updateFreightWaterDto.downDistance_unit,
      weightDown: updateFreightWaterDto.downWeight,
      weightDown_unit: updateFreightWaterDto.downWeight_unit,
      costUp: updateFreightWaterDto.upCost, // one way and two way up
      costDown: updateFreightWaterDto.downCost,
      twoWay: updateFreightWaterDto.option === TransportOption.two_way ? true : false,
      trips: updateFreightWaterDto.noOfTrips,
      activity: updateFreightWaterDto.activity,
      type: updateFreightWaterDto.type,
      size: updateFreightWaterDto.size,

    };

    const calculationData: FreightWaterDto = {
      year: updateFreightWaterDto.year,
      month: updateFreightWaterDto.month,
      mode: updateFreightWaterDto.method,
      fuel: fuelBaseData,
      distance: distanceBaseData,
      baseData: await this.getBaseData(updateFreightWaterDto)

    };

    updateFreightWaterDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    updateFreightWaterDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    updateFreightWaterDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.freight_water,
      data: calculationData,
    });

    if (emission && (emission.e_sc || emission.e_sc_co2 || emission.e_sc_ch4 || emission.e_sc_n2o)) {
      // this.updateTotalEmission(updateFreightWaterDto, calculationData, emission)

      let current = await this.repo.findOne(id);
      let updatedEmission = this.calculationService.getDiff(current, emission);
      this.calculationService.updateTotalEmission(
        updatedEmission,
        updateFreightWaterDto.project,
        calculationData.baseData.clasification, 
        sourceName.freight_water,
        updateFreightWaterDto.unit.id
      );
    }
    // updateFreightWaterDto.emission = emission.data;
    updateFreightWaterDto.e_sc = emission.e_sc ? emission.e_sc : 0;
    updateFreightWaterDto.e_sc_co2 = emission.e_sc_co2 ? emission.e_sc_co2 : 0;
    updateFreightWaterDto.e_sc_ch4 = emission.e_sc_ch4 ? emission.e_sc_ch4 : 0;
    updateFreightWaterDto.e_sc_n2o = emission.e_sc_n2o ? emission.e_sc_n2o : 0;

    const updated = await this.repo.update({
      id: id
    }, updateFreightWaterDto);
    if (updated.affected === 1) {
      return await this.repo.findOne(id);
    } else {
      throw new InternalServerErrorException("Updating is failed");
    }
  }

  async getBaseData(dto: FreightWaterActivityData): Promise<BaseDataDto> {
    let ownership: Ownership = Ownership.getkey(dto.ownership)
    let activityInfo = new PuesDataReqActivityData()
    activityInfo.owenerShip = ownership
    activityInfo.stationary = dto.stationary
    activityInfo.mobile = dto.mobile
    let req = new PuesDataReqDto()
    req.project = dto.project
    req.sourceName = sourceName.freight_water
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

  async updateTotalEmission(dto: FreightWaterActivityData, calData: FreightWaterDto, emission: any) {
    let reqPues: PuesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.freight_water,
      unitId: dto.unit.id,
      emission: emission,
      classification: calData.baseData.clasification
    }

    await this.puesService.addEmission(reqPues)

    let reqPes: PesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.freight_water,
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
      sourceName.freight_water,
      deleteDto.unit.id
    );
    return await this.repo.delete({id: deleteDto.id});
  }

  async addFromExcell(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number) {
    // this.sleep(100000);
    let units = this.parameterUnit.generator_units;


    // common --------------
    let dto = new FreightWaterActivityData();
    dto['unit'] = unit;
    dto['project'] = project;
    dto['user'] = user;


    let deptCountry = await this.countryService.find({
      where: {
        name: data['deptCountry'],

      },
    })

    let destCountry = await this.countryService.find({
      where: {
        name: data['destCountry'],

      },
    })



    let departureSeaportOneWay = await getRepository(SeaPort)
      .createQueryBuilder("port")
      .where("port.code like :code", { code: `%${data['deptPort']}%` })
      .getOne();


    let desartureSeaportOneWay = await getRepository(SeaPort)
      .createQueryBuilder("port")
      .where("port.code like :code", { code: `%${data['destPort']}%` })
      .getOne();


    let transist_oneWay_1 = await getRepository(SeaPort)
      .createQueryBuilder("port")
      .where("port.code like :code", { code: `%${data['t1Port']}%` })
      .getOne();


    let transist_oneWay_2 = await getRepository(SeaPort)
      .createQueryBuilder("port")
      .where("port.code like :code", { code: `%${data['t2Port']}%` })
      .getOne();


    let transist_oneWay_3 = await getRepository(SeaPort)
      .createQueryBuilder("port")
      .where("port.code like :code", { code: `%${data['t3Port']}%` })
      .getOne();

    // console.log("data---", data);

    // variable_mapping.forEach(vm => {

    //   if (vm['V2']) {
    //     if (vm['V1']) {
    //       let val = data[vm['V1']];
    //       console.log('vm1',val);
    //       dto[vm['V2']] = val;
    //     }
    //   }
    // })

    dto.departureCountryOneWay = deptCountry[0];
    console.log("ccccc",deptCountry[0])
    dto.destinationCountryOneWay = destCountry[0];
    dto.departurePortOneWay = departureSeaportOneWay;
    dto.destinationPortOneWay = desartureSeaportOneWay;
    dto.transist_oneWay_1 = transist_oneWay_1;
    dto.transist_oneWay_2 = transist_oneWay_2;
    dto.transist_oneWay_3 = transist_oneWay_3;
    dto.domOrInt = "INTERNATIONAL"
    dto.cargoType = "OTHER"

    variable_mapping.forEach(vm => {
      if (vm['V1']) {
        let val = data[vm['V1']];

        if (val === null || val === "" || val === "NULL" || val === undefined) {
          console.log("nullval", val)
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
    // End of common --------------



    dto.option = TransportOption.one_way;


    dto.vezel = "Test"

    dto.noOfTrips = 1

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
        dto.fuelType = "MARINE_GAS_OIL"
        break;
      }
      case 'Marine fuel oil': {
        dto.fuelType = "MARINE_FUEL_OIL"
        break;
      }
      default: {
        //statements; 
        break;
      }
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

    switch (data.method) {
      case 'fuel_base': {
        console.log("fgggfgfg")
        dto.method = TransportMode.fuel_base;
        dto.fuel_unit = "T"

        if (data.type === 0 || data.type === null || data.type === undefined || data.type === "NULL") {
          dto.type = null
        } else {
          var type = data.type.replace(/\s/g, "");
          dto.type = type.toUpperCase();

        }

        break;
      }
      case 'distance_base': {
        dto.method = TransportMode.distance_base;
        dto.upDistance_unit = 'KM'
        dto.upWeight_unit = 'T'
        if (data.activity === 0 || data.activity === null || data.activity === undefined || data.activity === "NULL" || data.activity === "") {
          dto.activity = null;


        } else {
         
        
            var activity = data.activity.replace(/\s/g, "");
            dto.activity = activity.toUpperCase();
          

        }

        if (data.type === 0 || data.type === null || data.type === undefined || data.type === "NULL" || data.type === "") {
          dto.type = null
        } else {
          var type = data.type.replace(/\s/g, "");
          dto.type = type.toUpperCase();

        }
        if(data.size === "Average"){
          dto.size = "AVG";


        }else{
          dto.size = data.size;
        }
        
        break;
      }
      default: {
        //statements; 
        break;
      }

    }


    console.log("dto--", dto);


    try {
      if (dto.type === "0") {
        dto.type = null
      }
      return this.create(dto);
    } catch (err) {
      return null;
    }
    // return null;


  }
}
