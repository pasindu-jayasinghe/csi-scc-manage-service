import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CalculationService } from 'src/emission/calculation/calculation.service';
import { BaseDataDto } from 'src/emission/calculation/dto/emission-base-data.dto';
import { DBusinessTravelDto, DEmpCommutingDto, DistanceBaseDto, FBusinessTravelDto, FEmpCommutingDto, FuelBaseDto , BusinessTravelDto} from 'src/emission/calculation/dto/business-travel.dto';
import { ProjectEmissionSourceService } from 'src/emission/emission-source/service/project-emission-source.service';
import { sourceName } from 'src/emission/enum/sourcename.enum';
import { TransportMode, TransportOption } from 'src/emission/enum/transport.enum';
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
import { BusinessTravelActivityData } from '../entities/business-travel.entity';
import { EmissionSourceRecalService } from 'src/emission/emission-source/service/emission-source-recal.service';
import { EmissionSourceBulkService } from 'src/emission/emission-source/service/emission-source-bulk.service';
import { VariableValidationType } from 'src/emission/enum/variable-validation-type.enum';
import { ProgressRetriever } from 'src/emission/progress-retriever';
import { ProgressDataResponseDto } from 'src/emission/dto/progress-data.dto';
import { ProgresReportService } from 'src/emission/emission-source/service/progres-report.service';
import { ProgressStatus } from 'src/emission/enum/progress-status.enum';
import { isNumber } from '@nestjsx/util';
import { ExcelDownloader } from 'src/emission/excel-downloader';

@Injectable()
export class BusinessTravelService extends TypeOrmCrudService<BusinessTravelActivityData> implements ExcellUploadable , BulckUpdatable, ProgressRetriever, ExcelDownloader{

  getDto() {
    return new BusinessTravelActivityData();
  }

  private excelBulkVariableMapping: {code: string, name: string,isRequired: boolean,type: VariableValidationType}[] = [
    {code: "month", name: 'Month',isRequired: true,type:VariableValidationType.list},
    {code: "domOrInt", name: 'Domestic/International',isRequired: true,type:VariableValidationType.list},
    {code: "vehicleNo", name: 'Vehicle Number',isRequired: true,type:VariableValidationType.textOrNumber},
    {code: "method", name: 'Method',isRequired: true,type:VariableValidationType.list},
    {code: "ownership", name: 'Ownership',isRequired: true,type:VariableValidationType.list},
    {code: "noOfTrips", name: 'Number of Trips ',isRequired: true,type:VariableValidationType.number},
    {code: "option", name: 'One Way/ Round Trip',isRequired: true,type:VariableValidationType.list},
    {code: "fuelType", name: 'Fuel Type',isRequired: false,type:VariableValidationType.list},
    {code: "totalDistanceTravelled", name: 'Total Distance Travelled',isRequired: false,type:VariableValidationType.number},
    {code: "totalDistanceTravelled_unit", name: 'Total Distance Travelled Unit',isRequired: false,type:VariableValidationType.list},
    {code: "btFuelConsumption", name: 'Fuel Consumption',isRequired: false,type:VariableValidationType.number},
    {code: "btFuelConsumption_unit", name: 'Fuel Consumption Unit',isRequired: false,type:VariableValidationType.list},
    {code: "fuelEconomy", name: 'Fuel Economy',isRequired: false,type:VariableValidationType.number},
    {code: "fuelEconomy_unit", name: 'Fuel Economy Unit',isRequired: false,type:VariableValidationType.list},
    {code: "cost", name: 'Cost per km',isRequired: false,type:VariableValidationType.number},
    {code: "paidByCompany", name: 'Paid by the company',isRequired: false,type:VariableValidationType.bool},
  ]
  constructor(
    @InjectRepository(BusinessTravelActivityData) repo,
    @InjectRepository(BusinessTravelActivityData)
    private readonly passengerRoadRepository: Repository<BusinessTravelActivityData>,
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
              obj[data.month] = data.totalDistanceTravelled + this.progresReportService.getParameterUnit(data, 'totalDistanceTravelled')
            } else if (data.method === TransportMode.fuel_base) {
              obj[data.month] = data.btFuelConsumption + this.progresReportService.getParameterUnit(data, 'btFuelConsumption')
            }
            dataObjs.push(obj)
          } else {
            dataObjs[existVeh]['method'] = data.method
            let value = 0
            if (!isNumber(dataObjs[existVeh][data.month])){
              value = parseFloat((dataObjs[existVeh][data.month]).split(" ")[0])
            }
            if (data.method === TransportMode.distance_base) {
              dataObjs[existVeh][data.month] = value + data.totalDistanceTravelled + this.progresReportService.getParameterUnit(data, 'totalDistanceTravelled')
            } else if (data.method === TransportMode.fuel_base) {
              dataObjs[existVeh][data.month] = value + data.btFuelConsumption + this.progresReportService.getParameterUnit(data, 'btFuelConsumption')
            }
          }
        } else {
          let value = 0
          if (!isNumber(dataObjs[existsAll][data.month])) {
            value = parseFloat((dataObjs[existsAll][data.month]).split(" ")[0])
          }

          if (data.method === TransportMode.distance_base){
            dataObjs[existsAll][data.month] = value + data.totalDistanceTravelled + this.progresReportService.getParameterUnit(data, 'totalDistanceTravelled')
          } else if (data.method === TransportMode.fuel_base){
            dataObjs[existsAll][data.month] = value + data.btFuelConsumption + this.progresReportService.getParameterUnit(data, 'btFuelConsumption')
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
    let emissionSource = sourceName.business_travel
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
            esName: 'Business Travel - '+ ownership,
            completeness: ProgressStatus.COMPLETED,
            parameters: parameters
          })
        } else {
          allMonthFilled = this.progresReportService.checkCompleteness(activityDataUnit[key], true, true, { para: ['vehicleNo'] })
          response.push({
            unit: key,
            unitName: activityDataUnit[key][0]['unitName'],
            es: emissionSource + '_' + ownership,
            esName: 'Business Travel - ' + ownership,
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
          esName: 'Business Travel - ' + key,
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
          esName: 'Business Travel - ' + key,
          completeness: ProgressStatus.NOT_ASSIGNED,
          parameters: parameters
        })
      }
    }



    console.log(response)
    return response
  }
  async bulkDelete(ids: number[], isPermant: boolean) {
    return await this.emissionSourceRecalService.bulkDelete(ids,isPermant, this);
  }

   async bulkCalculate(unitIds: number[], projectId: number) {
    return await this.emissionSourceRecalService.bulkCalculate(this, unitIds, projectId, this.repo, sourceName.business_travel);
  }

  excellBulkUpload(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number, ownership: string, isMobile: boolean) {
    let dto = new BusinessTravelActivityData();
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

  
  async create(createDto: BusinessTravelActivityData) {
    createDto.transportMethod = "BT";
    
    let {fuel, distance} = this.getData(createDto)

    const calculationData: BusinessTravelDto = {
      mode: createDto.method,
      method: createDto.transportMethod,
      year: createDto.year,
      month: createDto.month,
      fuel: fuel,
      distance: distance,
      baseData: await this.getBaseData(createDto)
    };

    createDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    createDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    createDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false
    
    const emission = await this.calculationService.calculate({
      sourceName: sourceName.business_travel,
      data: calculationData,
    });

    console.log(emission);

    if(emission && ( emission.e_sc || emission.e_sc_co2  || emission.e_sc_ch4 || emission.e_sc_n2o)){
      this.updateTotalEmission(createDto, calculationData, emission)
    }
    createDto.e_sc = emission  && emission.e_sc  ? emission.e_sc : 0;
    createDto.e_sc_co2 = emission && emission.e_sc_co2  ? emission.e_sc_co2 : 0 ;
    createDto.e_sc_ch4 = emission  && emission.e_sc_ch4  ? emission.e_sc_ch4 : 0;
    createDto.e_sc_n2o = emission  && emission.e_sc_n2o  ? emission.e_sc_n2o : 0;
    return await this.passengerRoadRepository.save(createDto);
  }

  findAll() {
    return this.passengerRoadRepository.find();
  }

  async update(id: number, updateDto: BusinessTravelActivityData) {
    updateDto.transportMethod = "BT";
    let {fuel, distance} = this.getData(updateDto)

    const calculationData: BusinessTravelDto = {
      mode: updateDto.method,
      method: updateDto.transportMethod,
      year: updateDto.year,
      month: updateDto.month,
      fuel: fuel,
      distance: distance,
      baseData: await this.getBaseData(updateDto)
    };

    updateDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    updateDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    updateDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.business_travel,
      data: calculationData,
    });

    if (updateDto.e_sc !== emission.e_sc){
      let current = await this.repo.findOne(id);
      let updatedEmission = this.calculationService.getDiff(current, emission);
      this.calculationService.updateTotalEmission(
        updatedEmission,
        updateDto.project,
        calculationData.baseData.clasification, 
        sourceName.business_travel,
        updateDto.unit.id
      );
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

  async getBaseData(dto: BusinessTravelActivityData): Promise<BaseDataDto> {
    let ownership: Ownership = Ownership.getkey(dto.ownership)
    let activityInfo =  new PuesDataReqActivityData()
    activityInfo.owenerShip = ownership
    activityInfo.stationary = dto.stationary
    activityInfo.mobile = dto.mobile
    let req = new PuesDataReqDto()
    req.project = dto.project
    req.sourceName = sourceName.business_travel
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

  getData(dto: BusinessTravelActivityData) {
    const distanceBaseData: DistanceBaseDto = new DistanceBaseDto()
    const fuelBaseData: FuelBaseDto = new FuelBaseDto()
    const fBusinessTravelData: FBusinessTravelDto = new FBusinessTravelDto()
    const fEmpCommutingData: FEmpCommutingDto = new FEmpCommutingDto()
    const dBusinessTravelData: DBusinessTravelDto = new DBusinessTravelDto()
    const dEmpCommutingData: DEmpCommutingDto = new DEmpCommutingDto()

    console.log(dto)


    if (dto.method === TransportMode.fuel_base) {
      if (dto.transportMethod === 'BT') {
        fBusinessTravelData.fc = dto.btFuelConsumption
        fBusinessTravelData.fc_unit = dto.btFuelConsumption_unit
        fBusinessTravelData.fuelType = dto.fuelType
        fBusinessTravelData.trips = dto.noOfTrips
      }
      fuelBaseData.businessTravel = fBusinessTravelData
      fuelBaseData.empCommuting = fEmpCommutingData
    } else if (dto.method === TransportMode.distance_base) {
      if (dto.transportMethod === 'BT') {
        dBusinessTravelData.distance = dto.totalDistanceTravelled
        dBusinessTravelData.distance_unit = dto.totalDistanceTravelled_unit
        dBusinessTravelData.fuelType = dto.fuelType
        dBusinessTravelData.trips = dto.noOfTrips
        dBusinessTravelData.cost = dto.cost
        dBusinessTravelData.twoWay = dto.option === TransportOption.two_way ? true : false
      } 
      distanceBaseData.businessTravel = dBusinessTravelData
      distanceBaseData.empCommuting = dEmpCommutingData
      distanceBaseData.fe = dto.fuelEconomy
      distanceBaseData.fe_unit = dto.fuelEconomy_unit

    }

    return {
      fuel: fuelBaseData,
      distance: distanceBaseData
    }
  }

  async updateTotalEmission(dto: BusinessTravelActivityData, calData: BusinessTravelDto, emission: any){
    let reqPues: PuesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.business_travel,
      unitId: dto.unit.id,
      emission: emission,
      classification: calData.baseData.clasification
    }

    await this.puesService.addEmission(reqPues)

    let reqPes : PesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.business_travel,
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
      sourceName.business_travel,
      deleteDto.unit.id
    );
    return await this.repo.delete({id: deleteDto.id});
  }

  // TODO: impl hired category
  addFromExcell(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number) {
    let fuelTypes = this.parameterUnit.fuelType;
    let units = this.parameterUnit.busines_travel_units;

    let dto = new BusinessTravelActivityData();
    dto['unit'] = unit;
    dto['project'] = project;
    dto['user'] = user;

    let transportMethod: string = "";
    variable_mapping.forEach(vm=>{
      if(vm['V2']){
        if(vm['default-v2']){
          dto[vm['V2']] = vm['default-v2'];
          if(vm['V2'] === "transportMethod"){
            transportMethod = vm['default-v2'];
          }
        }else if(vm['V1']){
          let val = data[vm['V1']];
          dto[vm['V2']] = val;
        }
      }
    })
    dto.year = year;
    dto.noOfTrips = 1;

    if(transportMethod === "EC"){
    }else if(transportMethod === "BT"){
      dto.option = TransportOption.one_way;
      if(data["VEHICLE_CATEGORY"]){
        switch(data["VEHICLE_CATEGORY"]){
          case 3:
            dto.ownership = Ownership.HIRED;
            break;
          case 2:
            dto.ownership = Ownership.RENTED;
            break;
          case 1:
            dto.ownership = Ownership.OWN;
            break;
          case "3":
            dto.ownership = Ownership.HIRED;
            break;
          case "2":
            dto.ownership = Ownership.RENTED;
            break;
          case "1":
            dto.ownership = Ownership.OWN;
            break;
        }
      }

      if(data["distance"]){
        dto.totalDistanceTravelled = data["distance"];
      }

      if(data["fuelEconomy"]){
        dto.fuelEconomy = data["fuelEconomy"];
        dto.fuelEconomy_unit = units.fuelEconomy[0].code;
      }

      if(data["FUEL_CONSUMPTION"]){
        dto.btFuelConsumption = data["FUEL_CONSUMPTION"];
      }

      if(data["FUEL_TYPE"]){
        switch (data["FUEL_TYPE"]){
          case 1:
            dto.fuelType = "PETROL_95";
            break;
          case 2:
            dto.fuelType = "DIESEL";
            break;
          case 3:
            dto.fuelType = "PETROL";
            break;
          case 4:
            dto.fuelType = "S_DIESEL";
            break;
        }
      }


      if(data["FUEL_CONSUMPTION"] &&  data["FUEL_CONSUMPTION"] != 0){
        dto.method = TransportMode.fuel_base;

        if(!dto.btFuelConsumption){
          dto.btFuelConsumption = 0;
        }

        // { id: 1, name: 'm3'},{id: 4, name: 'liters'},{id: 6, name: 'LKR'},])
        if(data["UNITS"]){
          switch (data["UNITS"]){
            case 1:
              let u = units.fuel.find((a: { code: string; }) => a.code === "M3");
              if(u)dto.btFuelConsumption_unit =u.code;
              break;
            case 4:
              let v = units.fuel.find((a: { code: string; }) => a.code === "L");
              if(v)dto.btFuelConsumption_unit =v.code;
              break;
            case 6:
              let x = units.fuel.find((a: { code: string; }) => a.code === "LKR");
              if(x)dto.btFuelConsumption_unit =x.code;
              break;
            default:
              dto.btFuelConsumption_unit = units.fuel[0].code     
          }
        }

      }else{
        dto.method = TransportMode.distance_base;
        if(!dto.fuelEconomy){
          dto.fuelEconomy = 0;
        }
        if(!dto.totalDistanceTravelled){
          dto.totalDistanceTravelled = 0;
        }
      }
    }

    try {
      return this.create(dto);
    } catch (err) {
      console.log(err);
      return null;
    }
  }
}
