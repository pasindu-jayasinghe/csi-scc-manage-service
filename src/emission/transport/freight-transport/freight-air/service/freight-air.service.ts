import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CalculationService } from 'src/emission/calculation/calculation.service';
import { getRepository, In, Repository } from 'typeorm';
import { sourceName } from 'src/emission/enum/sourcename.enum';
import { FreightAirActivityData } from '../entities/freight-air.entity';
import { DistanceBaseDto, FreightAirDto } from 'src/emission/calculation/dto/freight-air.dto';
import { TransportMode, TransportOption } from 'src/emission/enum/transport.enum';
import { BaseDataDto } from 'src/emission/calculation/dto/emission-base-data.dto';
import { PuesDataReqActivityData, PuesDataReqDto } from 'src/project/dto/pues-data-req.dto';
import { PuesSumDataReqDto, PesSumDataReqDto, ProjectSumDataReqDto } from 'src/project/dto/update-total-emission-req.dto';
import { Ownership } from 'src/project/enum/ownership.enum';
import { ProjectEmissionSourceService } from 'src/emission/emission-source/service/project-emission-source.service';
import { ProjectUnitEmissionSourceService } from 'src/project/service/project-unit-emission-source.service';
import { ProjectService } from 'src/project/service/project.service';
import { Clasification } from 'src/project/enum/clasification.enum';
import { ExcellUploadable } from 'src/emission/excell-uploadable';
import { BulckUpdatable } from 'src/emission/bulck-updatable';
import { ParameterUnit } from 'src/utills/parameter-units';
import { Unit } from 'src/unit/entities/unit.entity';
import { Project } from 'src/project/entities/project.entity';
import { User } from 'src/users/user.entity';
import { CountryService } from 'src/country/country.service';
import { Country } from 'src/country/entities/country.entity';
import { AirPortService } from 'src/ports/air-port-list.service';
import { AirPort } from 'src/ports/air-port-list.entity';
import { EmissionSourceBulkService } from 'src/emission/emission-source/service/emission-source-bulk.service';
import { EmissionSourceRecalService } from 'src/emission/emission-source/service/emission-source-recal.service';
import { ProgressRetriever } from 'src/emission/progress-retriever';
import { ProgressDataResponseDto } from 'src/emission/dto/progress-data.dto';
import { ProgresReportService } from 'src/emission/emission-source/service/progres-report.service';
import { ProgressStatus } from 'src/emission/enum/progress-status.enum';
import { isNumber } from '@nestjsx/util';
import { ExcelDownloader } from 'src/emission/excel-downloader';


@Injectable()
export class FreightAirService extends TypeOrmCrudService<FreightAirActivityData> implements ExcellUploadable, BulckUpdatable, ProgressRetriever, ExcelDownloader {

  getDto() {
    return new FreightAirActivityData();
  }

  bulkCalculate(unitIds: number[], projectId: number) {
    throw new Error('Method not implemented.');
  }

  constructor(
    @InjectRepository(FreightAirActivityData) repo,
    @InjectRepository(FreightAirActivityData)
    private readonly freightAirRepository: Repository<FreightAirActivityData>,
    @InjectRepository(Unit) private unitRepo: Repository<Unit>,
    private readonly calculationService: CalculationService,
    private puesService: ProjectUnitEmissionSourceService,
    private pesService: ProjectEmissionSourceService,
    private projectService: ProjectService,
    private parameterUnit: ParameterUnit,
    private countryService: CountryService,
    private airportService: AirPortService,
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
    
    let months = this.parameterUnit.months
    let columns = []
    let rows = []
    columns.push(...[
      {name: "Vehicle No", code: "vehicleNo"},
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
        let existsAll = dataObjs.findIndex(o => (o['vehicleNo'] === data['vehicleNo'] && o['method'] === data['method']))
        if (existsAll === -1){
          let existVeh = dataObjs.findIndex(o => (o['vehicleNo'] === data['vehicleNo'] ))
          if (existVeh === -1){
            let obj = {}
            months.forEach(m => {
              obj = {...obj, ...{[m.value]:0}}
            })
            obj = {...obj, ...{vehicleNo: '', method: ''}}
            obj['vehicleNo'] =  data.vehicleNo
            obj['method'] =  data.method
            if (data.method === TransportMode.distance_base){
              obj[data.month] = data.upDistance + data.downDistance + this.progresReportService.getParameterUnit(data, 'upDistance')
            }
            dataObjs.push(obj)
          } else {
            dataObjs[existVeh]['method'] = data.method
            let value = 0
            if (!isNumber(dataObjs[existVeh][data.month])){
              value = parseFloat((dataObjs[existVeh][data.month]).split(" ")[0])
            }
            if (data.method === TransportMode.distance_base) {
              dataObjs[existVeh][data.month] = value + data.upDistance + data.downDistance + this.progresReportService.getParameterUnit(data, 'upDistance')
            }
          }
        } else {
          let value = 0
            if (!isNumber(dataObjs[existsAll][data.month])){
              value = parseFloat((dataObjs[existsAll][data.month]).split(" ")[0])
            }
          dataObjs[existsAll][data.month] = value + data.upDistance + data.downDistance + this.progresReportService.getParameterUnit(data, 'upDistance')
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
    let emissionSource = sourceName.freight_air
    let parameters = [
      {name: 'Vehicle No', code: 'vehicleNo'},
      {name: 'Cargo Type', code: 'cargoType'}
    ]

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
          esName: 'Freight Air',
          completeness: ProgressStatus.COMPLETED,
          parameters: parameters
        })
      } else {
        allMonthFilled = this.progresReportService.checkCompleteness(activityData[key], true, true, {para: ['vehicleNo', 'cargoType']})
        response.push({
          unit: key,
          unitName: activityData[key][0]['unitName'],
          es: emissionSource,
          esName: 'Freight Air',
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
        esName: 'Freight Air',
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
        esName: 'Freight Air',
        completeness: ProgressStatus.NOT_ASSIGNED,
        parameters: parameters
      })
    }

    return response
  }
  async bulkDelete(ids: number[], isPermant: boolean) {
    return await this.emissionSourceRecalService.bulkDelete(ids,isPermant, this);
  }
  excellBulkUpload(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number, ownership: string, isMobile: boolean) {
    throw new Error('Method not implemented.');
  }

  downlodExcellBulkUploadVariableMapping() {
    throw new Error('Method not implemented.');
  }


  async create(createFreightAirDto: FreightAirActivityData) {

    const distanceBaseData: DistanceBaseDto = {

      year: createFreightAirDto.year,
      distanceUp: createFreightAirDto.upDistance, //one way and two way up, handle distance from port in userservice
      distanceUp_unit: createFreightAirDto.upDistance_unit,
      weightUp: createFreightAirDto.upWeight, // one way and two way up
      weightUp_unit: createFreightAirDto.upWeight_unit,
      distanceDown: createFreightAirDto.downDistance,
      distanceDown_unit: createFreightAirDto.downDistance_unit,
      weightDown: createFreightAirDto.downWeight,
      weightDown_unit: createFreightAirDto.downWeight_unit,
      costUp: createFreightAirDto.upCost, // one way and two way up
      costDown: createFreightAirDto.downCost,
      twoWay: createFreightAirDto.option === TransportOption.two_way ? true : false,
      trips: createFreightAirDto.noOfTrips,

    };

    const calculationData: FreightAirDto = {
      year: createFreightAirDto.year,
      mode: createFreightAirDto.method,
      distance: distanceBaseData,
      baseData: await this.getBaseData(createFreightAirDto)
    };

    createFreightAirDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    createFreightAirDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    createFreightAirDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.freight_air,
      data: calculationData,
    });

    this.updateTotalEmission(createFreightAirDto, calculationData, emission)
    //createFreightAirDto.emission = emission.data;
    createFreightAirDto.e_sc = emission.e_sc ? emission.e_sc : 0;
    createFreightAirDto.e_sc_co2 = emission.e_sc_co2 ? emission.e_sc_co2 : 0;
    createFreightAirDto.e_sc_ch4 = emission.e_sc_ch4 ? emission.e_sc_ch4 : 0;
    createFreightAirDto.e_sc_n2o = emission.e_sc_n2o ? emission.e_sc_n2o : 0;

    return await this.freightAirRepository.save(createFreightAirDto);
  }

  findAll() {
    return `This action returns all freightAir`;
  }


  async update(id: number, updateFreightAirDto: FreightAirActivityData) {

    const distanceBaseData: DistanceBaseDto = {

      year: updateFreightAirDto.year,
      distanceUp: updateFreightAirDto.upDistance, //one way and two way up, handle distance from port in userservice
      distanceUp_unit: updateFreightAirDto.upDistance_unit,
      weightUp: updateFreightAirDto.upWeight, // one way and two way up
      weightUp_unit: updateFreightAirDto.upWeight_unit,
      distanceDown: updateFreightAirDto.downDistance,
      distanceDown_unit: updateFreightAirDto.downDistance_unit,
      weightDown: updateFreightAirDto.downWeight,
      weightDown_unit: updateFreightAirDto.downWeight_unit,
      costUp: updateFreightAirDto.upCost, // one way and two way up
      costDown: updateFreightAirDto.downCost,
      twoWay: updateFreightAirDto.option === TransportOption.two_way ? true : false,
      trips: updateFreightAirDto.noOfTrips,

    };

    const calculationData: FreightAirDto = {
      year: updateFreightAirDto.year,
      mode: updateFreightAirDto.method,
      distance: distanceBaseData,
      baseData: await this.getBaseData(updateFreightAirDto)
    };

    updateFreightAirDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    updateFreightAirDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    updateFreightAirDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.freight_air,
      data: calculationData,
    });

    if (updateFreightAirDto.e_sc !== emission.e_sc) {
      let current = await this.repo.findOne(id);
      let updatedEmission = this.calculationService.getDiff(current, emission);
      this.calculationService.updateTotalEmission(
        updatedEmission,
        updateFreightAirDto.project,
        calculationData.baseData.clasification, 
        sourceName.freight_air,
        updateFreightAirDto.unit.id
      );
      // this.updateTotalEmission(updateFreightAirDto, calculationData, emission)
    }
    //updateFreightAirDto.emission = emission.data;
    updateFreightAirDto.e_sc = emission.e_sc ? emission.e_sc : 0;
    updateFreightAirDto.e_sc_co2 = emission.e_sc_co2 ? emission.e_sc_co2 : 0;
    updateFreightAirDto.e_sc_ch4 = emission.e_sc_ch4 ? emission.e_sc_ch4 : 0;
    updateFreightAirDto.e_sc_n2o = emission.e_sc_n2o ? emission.e_sc_n2o : 0;

    const updated = await this.repo.update({
      id: id
    }, updateFreightAirDto);
    if (updated.affected === 1) {
      return await this.repo.findOne(id);
    } else {
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
      sourceName.freight_air,
      deleteDto.unit.id
    );
    return await this.repo.delete({id: deleteDto.id});
  }
  async getBaseData(dto: FreightAirActivityData): Promise<BaseDataDto> {
    let activityInfo = new PuesDataReqActivityData()
    activityInfo.owenerShip = Ownership.getkey(dto.ownership)
    activityInfo.stationary = dto.stationary
    activityInfo.mobile = dto.mobile
    let req = new PuesDataReqDto()
    req.project = dto.project
    req.sourceName = sourceName.freight_air
    req.unitId = dto.unit.id
    req.user = dto.user
    req.activityInfo = activityInfo
    console.log('rwwwww---', req)

    let puesData = await this.puesService.getPuesData(req)
    console.log('puesdaya---', puesData)
    return {
      clasification: puesData.clasification,
      tier: puesData.tier,
      sourceType: puesData.sourceType,
      industry: puesData.industry.code,
      countryCode: puesData.countryCode,
      projectId: dto.project.id
    }
  }

  async updateTotalEmission(dto: FreightAirActivityData, calData: FreightAirDto, emission: any) {
    let reqPues: PuesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.freight_air,
      unitId: dto.unit.id,
      emission: emission,
      classification: calData.baseData.clasification
    }

    await this.puesService.addEmission(reqPues)

    let reqPes: PesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.freight_air,
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

    console.log('data---',data)
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



    let departureAirportOneWay = await getRepository(AirPort)
      .createQueryBuilder("port")
      .where("port.code like :code", { code: `%${data['deptPort']}%` })
      .getOne();
      console.log('departureAirportOneWay---',departureAirportOneWay)


    let desartureAirportOneWay = await getRepository(AirPort)
      .createQueryBuilder("port")
      .where("port.code like :code", { code: `%${data['destPort']}%` })
      .getOne();


    let transist_oneWay_1 = await getRepository(AirPort)
      .createQueryBuilder("port")
      .where("port.code like :code", { code: `%${data['t1Port']}%` })
      .getOne();


    let transist_oneWay_2 = await getRepository(AirPort)
      .createQueryBuilder("port")
      .where("port.code like :code", { code: `%${data['t2Port']}%` })
      .getOne();


    let transist_oneWay_3 = await getRepository(AirPort)
      .createQueryBuilder("port")
      .where("port.code like :code", { code: `%${data['t3Port']}%` })
      .getOne();



    // common --------------
    let dto = new FreightAirActivityData();
    dto['unit'] = unit;
    dto['project'] = project;
    dto['user'] = user;

    dto.departureCountryOneWay = deptCountry[0];
    console.log("ccccc",deptCountry[0])
    dto.destinationCountryOneWay = destCountry[0];
    dto.departureAirportOneWay = departureAirportOneWay;
    dto.destinationAirportOneWay = desartureAirportOneWay;
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



    dto.upDistance_unit = "KM"
    dto.upWeight_unit = "T"
    dto.noOfTrips = 1
    dto.option = "One way"


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
function departureCountryOneWay(arg0: string, departureCountryOneWay: any) {
  throw new Error('Function not implemented.');
}

