import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CalculationService } from 'src/emission/calculation/calculation.service';
import { BaseDataDto } from 'src/emission/calculation/dto/emission-base-data.dto';
import { DBusinessTravelDto, DEmpCommutingDto, DistanceBaseDto, FBusinessTravelDto, FEmpCommutingDto, FuelBaseDto, PassengerRoadDto } from 'src/emission/calculation/dto/passenger-road.dto';
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
import { PassengerRoadActivityData } from '../entities/passenger-road.entity';
import { EmissionSourceRecalService } from 'src/emission/emission-source/service/emission-source-recal.service';
import { EmissionSourceBulkService } from 'src/emission/emission-source/service/emission-source-bulk.service';
import { UnitDetailsService } from 'src/unit/unit-details.service';
import { NumEmployeesService } from 'src/unit/num-employees.service';
import { VariableValidationType } from 'src/emission/enum/variable-validation-type.enum';
import { ProgressRetriever } from 'src/emission/progress-retriever';
import { ProgressDataResponseDto } from 'src/emission/dto/progress-data.dto';
import { ProgresReportService } from 'src/emission/emission-source/service/progres-report.service';
import { ProgressStatus } from 'src/emission/enum/progress-status.enum';
import { UnitDetails } from 'src/unit/entities/unit-details.entity';
import { NumEmployee } from 'src/unit/entities/num-employee.entity';
import { ExcelDownloader } from 'src/emission/excel-downloader';
import { EmployeeNameService } from './employee-names.service';
import { EmployeeName } from '../entities/employee-names.entity';
import { CrudRequest } from '@nestjsx/crud';

@Injectable()
export class PassengerRoadService extends TypeOrmCrudService<PassengerRoadActivityData> implements ExcellUploadable, BulckUpdatable, ProgressRetriever , ExcelDownloader{

  getDto() {
    return new PassengerRoadActivityData();
  }

  private excelBulkVariableMapping: { code: string, name: string, isRequired: boolean,type: VariableValidationType }[] = [
    { code: "month", name: 'Month' ,isRequired: true,type:VariableValidationType.list},
    { code: "employeeName", name: 'Employee Name' ,isRequired: true,type:VariableValidationType.text},
    { code: "employeeId", name: 'Employee Id' ,isRequired: false,type:VariableValidationType.text},
    { code: "domOrInt", name: 'Domestic/International',isRequired: true,type:VariableValidationType.list },
    { code: "vehicleNo", name: 'Vehicle Number' ,isRequired: true,type:VariableValidationType.textOrNumber},
    { code: "method", name: 'Method' ,isRequired: true,type:VariableValidationType.list},
    { code: "ownership", name: 'Ownership' ,isRequired: true,type:VariableValidationType.list},
    { code: "noOfTrips", name: 'Number of Trips ' ,isRequired: true,type:VariableValidationType.number},
    { code: "option", name: 'One Way/ Round Trip' ,isRequired: true,type:VariableValidationType.list},
    { code: "workingDays", name: 'Working Days' ,isRequired: true,type:VariableValidationType.number},

    { code: "directTransportMode", name: 'Direct Transport Mode',isRequired: false,type:VariableValidationType.list },
    { code: "petrolConsumption", name: 'Direct Petrol Consumption Per Day' ,isRequired: false,type:VariableValidationType.number},
    { code: "petrolConsumption_unit", name: 'Direct Petrol Consumption Unit',isRequired: false,type:VariableValidationType.list },
    { code: "dieselConsumption", name: 'Direct Diesel Consumption Per Day',isRequired: false,type:VariableValidationType.number },
    { code: "dieselConsumption_unit", name: 'Direct Diesel Consumption Unit' ,isRequired: false,type:VariableValidationType.list},


    { code: "noEmissionMode", name: 'No Emission Transport Mode',isRequired: false,type:VariableValidationType.list },
    { code: "noEmissionDistance", name: 'No Emission Distance Travelled Per Day',isRequired: false,type:VariableValidationType.number },
    { code: "noEmissionDistance_unit", name: 'No Emission Distance Travelled Unit',isRequired: false,type:VariableValidationType.list },

    { code: "publicMode", name: 'Public Transport Mode' ,isRequired: false,type:VariableValidationType.list},
    { code: "publicDistance", name: 'Public Distance Travelled Per Day' ,isRequired: false,type:VariableValidationType.number},
    { code: "publicDistance_unit", name: 'Public Distance Travelled Unit',isRequired: false,type:VariableValidationType.list },

    { code: "privateMode", name: 'Private Transport Mode' ,isRequired: false,type:VariableValidationType.list},
    { code: "privateDistance", name: 'Private Distance Travelled Per Day' ,isRequired: false,type:VariableValidationType.number},
    { code: "privateDistance_unit", name: 'Private Distance Travelled Unit',isRequired: false,type:VariableValidationType.list },
    { code: "fuelEconomy", name: 'Private Fuel Economy',isRequired: false,type:VariableValidationType.number },
    { code: "fuelEconomy_unit", name: 'Private Fuel Economy Unit' ,isRequired: false,type:VariableValidationType.list},
    { code: "fuelType", name: 'Private Fuel Type',isRequired: false,type:VariableValidationType.list },

    { code: "hiredMode", name: 'Hired Transport Mode' ,isRequired: false,type:VariableValidationType.list},
    { code: "hiredDistance", name: 'Hired Distance Travelled Per Day' ,isRequired: false,type:VariableValidationType.number},
    { code: "hiredDistance_unit", name: 'Hired Distance Travelled Unit' ,isRequired: false,type:VariableValidationType.list},
    { code: "hiredFuelEconomy", name: 'Hired Fuel Economy' ,isRequired: false,type:VariableValidationType.number},
    { code: "hiredFuelEconomy_unit", name: 'Hired Fuel Economy Unit' ,isRequired: false,type:VariableValidationType.list},
    { code: "hiredFuelType", name: 'Hired Fuel Type' ,isRequired: false,type:VariableValidationType.list},

    { code: "paidByCompany", name: 'Paid by the company' ,isRequired: false,type:VariableValidationType.number},
  ]


  constructor(
    @InjectRepository(PassengerRoadActivityData) repo,
    @InjectRepository(PassengerRoadActivityData)
    private readonly passengerRoadRepository: Repository<PassengerRoadActivityData>,
    @InjectRepository(Unit) private unitRepo: Repository<Unit>,
    @InjectRepository(UnitDetails) private unitDetailRepo: Repository<UnitDetails>,
    @InjectRepository(NumEmployee) private numEmployeeRepo: Repository<NumEmployee>,
    private readonly calculationService: CalculationService,
    private readonly puesService: ProjectUnitEmissionSourceService,
    private pesService: ProjectEmissionSourceService,
    private projectService: ProjectService,
    private parameterUnit: ParameterUnit,
    private emissionSourceRecalService: EmissionSourceRecalService,
    private emissionSourceBulkService: EmissionSourceBulkService,
    private numEmployeesService: NumEmployeesService,
    private progresReportService: ProgresReportService,
    private employeeNameService: EmployeeNameService
  ) {
    super(repo);
  }
  getVariableMapping() {
    throw new Error('Method not implemented.');
  }
  generateTableData(projectId: number, unitIds: number , paras: any[], ownership?: string) {
    throw new Error('Method not implemented.');
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
    let emissionSource = sourceName.passenger_road
    let parameters = [{name: "Employee name", code: "employeeName"}]

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
          isEC: true
        })
      } else {
        let unitDetail = await this.unitDetailRepo.find({ unit: { id: parseInt(key) } })
        let countPaid = 0
        let countNotPaid = 0
        let samplePaid = 0
        let sampleNotPaid = 0
        let empYear: any
        let paidData: any = []
        let notPaidData: any = []
        if (unitDetail && unitDetail.length > 0) {
          let numEmployee = await this.numEmployeeRepo.find({ unitDetail: { id: unitDetail[0].id } })
          empYear = numEmployee.find(o => o.year === activityData[key][0].project.year)
          if (empYear) {
            countPaid = empYear.totalEmployeesPaid
            countNotPaid = empYear.totalEmployees - empYear.totalEmployeesPaid
            activityData[key].map((o: { paidByCompany: any; }) => {
              if (o.paidByCompany){
                paidData.push(o)
              } else {
                paidData.push(o)
              }
            })
            console.log("paidData", paidData.length, activityData[key].length, key)
            let uniqueEmpRecordsPaid = 0
            let uniqueEmpRecordsNotPaid = 0
            if (paidData && paidData.length !== 0){
              uniqueEmpRecordsPaid = (Object.keys(this.progresReportService.group(paidData, 'employeeName'))).length
            }
            if (notPaidData && notPaidData.length !== 0){
              uniqueEmpRecordsNotPaid = (Object.keys(this.progresReportService.group(notPaidData, 'employeeName'))).length
            }
            
            if ((uniqueEmpRecordsPaid === countPaid) &&
              (uniqueEmpRecordsNotPaid === countNotPaid)) {
              allMonthFilled['isCompleted'] = ProgressStatus.COMPLETED
            } else {
              samplePaid = this.progresReportService.calculateSampleSize(countPaid, 0.05, 0.5, 1.96)
              sampleNotPaid = this.progresReportService.calculateSampleSize(countNotPaid, 0.05, 0.5, 1.96)
              if ((Math.round(samplePaid) === uniqueEmpRecordsPaid) &&
                (Math.round(sampleNotPaid) === uniqueEmpRecordsNotPaid)) {
                allMonthFilled['isCompleted'] = ProgressStatus.COMPLETED
              } else {
                allMonthFilled['isCompleted'] = ProgressStatus.PARTIAL
              }
            }
          } else {
            allMonthFilled['isCompleted'] = ProgressStatus.NOT_ENTERED
          }
        } else {
          allMonthFilled['isCompleted'] = ProgressStatus.NOT_ENTERED
        }
        // allMonthFilled = this.progresReportService.checkCompleteness(activityData[key], true, true, {para: ['meterNo']})
        let obj = {
          unit: key,
          unitName: activityData[key][0]['unitName'],
          es: emissionSource,
          esName: 'Employee Commuting',
          completeness: allMonthFilled.isCompleted,
          unFilled: allMonthFilled.unFilled,
          paidTotal: countPaid,
          notPaidTotal: countNotPaid,
          paidSample: Math.round(samplePaid),
          notPaidSample: Math.round(sampleNotPaid),
          uploadedPaid: paidData.length,
          uploadedNotPaid: notPaidData.length,
          parameters: parameters,
          isEC: true
        }
        if (!empYear){
          obj['noEmpCount'] = true
        }
        if (!unitDetail || unitDetail.length === 0){
          obj['noUnitDetail'] = true
        }
        response.push(obj)
      }
    }

    let assignedUnits = await this.puesService.getAllowedUnitsforProjectAndEs(projectId, emissionSource)

    let assignedUIds = assignedUnits.map((u: { code: any; }) => u.code)
    let uNoData = assignedUIds.filter((ele: { toString: () => string; }) => !Object.keys(activityData).includes(ele.toString()))
    let notAssignedIds = unitIds.filter(u => (!assignedUIds.includes(parseInt(u.toString()))))

    for await (const e of uNoData) {
      let unit = await this.unitRepo.findOne({id: e})
      response.push({
        unit: e.toString(),
        unitName: unit.name,
        es: emissionSource,
        esName: 'Employee Commuting',
        completeness: ProgressStatus.NOT_ENTERED,
        parameters: parameters,
        isEC: true
      })
    }

    for await (const e of notAssignedIds) {
      let unit = await this.unitRepo.findOne({id: e})
      response.push({
        unit: e.toString(),
        unitName: unit.name,
        es: emissionSource,
        esName: 'Employee Commuting',
        completeness: ProgressStatus.NOT_ASSIGNED,
        parameters: parameters,
        isEC: true
      })
    }

    return response
  }

  async bulkDelete(ids: number[], isPermant: boolean) {
    return await this.emissionSourceRecalService.bulkDelete(ids, isPermant, this);
  }

  async bulkCalculate(unitIds: number[], projectId: number) {
    return await this.emissionSourceRecalService.bulkCalculate(this, unitIds, projectId, this.repo, sourceName.passenger_road);
  }

  excellBulkUpload(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number, ownership: string, isMobile: boolean) {

    setTimeout(async () => {
      let dto = new PassengerRoadActivityData();
      dto = this.emissionSourceBulkService.excellBulkUpload(unit, project, user, data, year, ownership, isMobile, dto, this.excelBulkVariableMapping);
      try {
        let en = new EmployeeName();
        
        let name: string = data["Employee Name"] ? data["Employee Name"]: "";
        let id: string = data["Employee Id"] ? data["Employee Id"]+"": "";


        let empName = name.replace(/\s+/g, '_').toUpperCase();
        let unitName = unit.name.replace(/\s+/g, '_').toUpperCase();
        let empId = id.replace(/\s+/g, '_').toUpperCase();

        en.unit = unit;
        en.empId = empId;
        en.name = empName;
        en.code = empName + "_" + unitName+"_"+empId
        try{
          let em = await this.employeeNameService.create(en);
          dto.employeeName = en.code;
        }catch(err){
          dto.employeeName = en.code;
        }

        this.employeeNameService.create(en);
        return this.create(dto);
      } catch (err) {
        console.log(err);
        return null;
      }
    }, 3000)
  }

  downlodExcellBulkUploadVariableMapping() {
    return this.excelBulkVariableMapping;
  }


  async create(createDto: PassengerRoadActivityData) {
    createDto.transportMethod = "EC";
    let { fuel, distance } = this.getData(createDto)

    const calculationData: PassengerRoadDto = {
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
      sourceName: sourceName.passenger_road,
      data: calculationData,
    });

    createDto.e_sc = emission && emission.e_sc ? emission.e_sc : 0;
    createDto.e_sc_co2 = emission && emission.e_sc_co2 ? emission.e_sc_co2 : 0;
    createDto.e_sc_ch4 = emission && emission.e_sc_ch4 ? emission.e_sc_ch4 : 0;
    createDto.e_sc_n2o = emission && emission.e_sc_n2o ? emission.e_sc_n2o : 0;

    try {
      let saved = await this.passengerRoadRepository.save(createDto);

      if (emission && (emission.e_sc || emission.e_sc_co2 || emission.e_sc_ch4 || emission.e_sc_n2o)) {
        let empData = await this.getEmployeeEmissionData(createDto.project.id, createDto.unit.id, createDto.year);

        let req = {
          totalDirectRecords: empData.totalDirectRecords,
          totalInDirectRecords: empData.totalInDirectRecords,
          totalOtherRecords: empData.totalOtherRecords,
          totalEmployees: empData.totalEmpoyes?.totalEmployees,
          totalEmployeesPaid: empData.totalEmpoyes?.totalEmployeesPaid,
          directSum: empData.directSum,
          indirectSum: empData.indirectSum,
          otherSum: empData.otherSum,
        }

        let updatedEmission = this.calculationService.getDiff(null, emission);
        this.calculationService.updateTotalEmission(
          updatedEmission,
          createDto.project,
          calculationData.baseData.clasification,
          sourceName.passenger_road,
          createDto.unit.id,
          req
        );
      }
      return saved;
      // return null;
    } catch (err) {
      return null;
    }

  }

  findAll() {
    return this.passengerRoadRepository.find();
  }

  async update(id: number, updateDto: PassengerRoadActivityData) {
    let current = await this.repo.findOne(id);
    updateDto.transportMethod = "EC";
    let { fuel, distance } = this.getData(updateDto)

    const calculationData: PassengerRoadDto = {
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
      sourceName: sourceName.passenger_road,
      data: calculationData,
    });

    updateDto.e_sc = emission.e_sc ? emission.e_sc : 0;
    updateDto.e_sc_co2 = emission.e_sc_co2 ? emission.e_sc_co2 : 0;
    updateDto.e_sc_ch4 = emission.e_sc_ch4 ? emission.e_sc_ch4 : 0;
    updateDto.e_sc_n2o = emission.e_sc_n2o ? emission.e_sc_n2o : 0;

    const updated = await this.repo.update({
      id: id
    }, updateDto);
    if (updated.affected === 1) {
      console.log("kkkkkkkkk")

      if (current.e_sc !== emission.e_sc) {

        setTimeout(async () => {
          let empData = await this.getEmployeeEmissionData(updateDto.project.id, updateDto.unit.id, updateDto.year);

          let req = {
            totalDirectRecords: empData.totalDirectRecords,
            totalInDirectRecords: empData.totalInDirectRecords,
            totalOtherRecords: empData.totalOtherRecords,
            totalEmployees: empData.totalEmpoyes?.totalEmployees,
            totalEmployeesPaid: empData.totalEmpoyes?.totalEmployeesPaid,
            directSum: empData.directSum,
            indirectSum: empData.indirectSum,
            otherSum: empData.otherSum,
          }
          let updatedEmission = this.calculationService.getDiff(current, emission);
          this.calculationService.updateTotalEmission(
            updatedEmission,
            updateDto.project,
            calculationData.baseData.clasification,
            sourceName.passenger_road,
            updateDto.unit.id,
            req
          );
        }, 2000)
      }

      return current;
    } else {
      throw new InternalServerErrorException("Updating is failed");
    }

  }

  async getBaseData(dto: PassengerRoadActivityData): Promise<BaseDataDto> {
    let ownership: Ownership = Ownership.getkey(dto.ownership)
    let activityInfo = new PuesDataReqActivityData()
    activityInfo.owenerShip = ownership
    activityInfo.stationary = dto.stationary
    activityInfo.mobile = dto.mobile
    activityInfo.paidByCompany = dto.paidByCompany;
    let req = new PuesDataReqDto()
    req.project = dto.project
    req.sourceName = sourceName.passenger_road
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

  getData(dto: PassengerRoadActivityData) {
    const distanceBaseData: DistanceBaseDto = new DistanceBaseDto()
    const fuelBaseData: FuelBaseDto = new FuelBaseDto()
    const fBusinessTravelData: FBusinessTravelDto = new FBusinessTravelDto()
    const fEmpCommutingData: FEmpCommutingDto = new FEmpCommutingDto()
    const dBusinessTravelData: DBusinessTravelDto = new DBusinessTravelDto()
    const dEmpCommutingData: DEmpCommutingDto = new DEmpCommutingDto()


    if (dto.method === TransportMode.fuel_base) {
      if (dto.transportMethod === 'EC') {
        fEmpCommutingData.dieselConsumption = dto.dieselConsumption
        fEmpCommutingData.dieselConsumption_unit = dto.dieselConsumption_unit
        fEmpCommutingData.petrolConsumption = dto.petrolConsumption
        fEmpCommutingData.petrolConsumption_unit = dto.petrolConsumption_unit
        fEmpCommutingData.workingDays = dto.workingDays
      }
      fuelBaseData.businessTravel = fBusinessTravelData
      fuelBaseData.empCommuting = fEmpCommutingData
    }
    else if (dto.method === TransportMode.distance_base) {
      if (dto.transportMethod === 'EC') {
        dEmpCommutingData.fuelType = dto.fuelType
        dEmpCommutingData.privateDistance = dto.privateDistance
        dEmpCommutingData.privateDistance_unit = dto.privateDistance_unit
        dEmpCommutingData.hiredfuelType = dto.hiredFuelType
        dEmpCommutingData.hiredDistance = dto.hiredDistance
        dEmpCommutingData.hiredDistance_unit = dto.hiredDistance_unit
        dEmpCommutingData.hiredfe = dto.hiredFuelEconomy
        dEmpCommutingData.hiredfe_unit = dto.hiredFuelEconomy_unit
        dEmpCommutingData.publicDistance = dto.publicDistance
        dEmpCommutingData.publicDistance_unit = dto.publicDistance_unit
        dEmpCommutingData.publicMode = dto.publicMode
        dEmpCommutingData.workingDays = dto.workingDays
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

  async updateTotalEmission(dto: PassengerRoadActivityData, calData: PassengerRoadDto, emission: any) {
    let reqPues: PuesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.passenger_road,
      unitId: dto.unit.id,
      emission: emission,
      classification: calData.baseData.clasification
    }

    await this.puesService.addEmission(reqPues)

    let reqPes: PesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.passenger_road,
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

  async remove(req: CrudRequest) {

    let o = req.parsed.paramsFilter.find((o: { field: string; }) => o.field === 'id')
    let deleteDto = await this.repo.findOne({ id: o.value })
    let updatedEmission = this.calculationService.getDiff(deleteDto, null)

    let deleted = await this.deleteOne(req)

    let empData = await this.getEmployeeEmissionData(deleteDto.project.id, deleteDto.unit.id, deleteDto.year);

    let reqq = {
      totalDirectRecords: empData.totalDirectRecords,
      totalInDirectRecords: empData.totalInDirectRecords,
      totalOtherRecords: empData.totalOtherRecords,
      totalEmployees: empData.totalEmpoyes?.totalEmployees,
      totalEmployeesPaid: empData.totalEmpoyes?.totalEmployeesPaid,
      directSum: empData.directSum,
      indirectSum: empData.indirectSum,
      otherSum: empData.otherSum,
    }
    this.calculationService.updateTotalEmission(
      updatedEmission,
      deleteDto.project,
      (deleteDto.direct ? Clasification.DIRECT : ((deleteDto.indirect ? Clasification.INDIRECT : Clasification.OTHER))),
      sourceName.passenger_road,
      deleteDto.unit.id,
      reqq
    );

    return deleted;
  }

  // TODO: impl hired category
  addFromExcell(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number) {
    let fuelTypes = this.parameterUnit.fuelType;
    let units = this.parameterUnit.passenger_road_units;

    let dto = new PassengerRoadActivityData();
    dto['unit'] = unit;
    dto['project'] = project;
    dto['user'] = user;


    console.log("data--", data)
    let transportMethod: string = "";
    variable_mapping.forEach(vm => {
      if (vm['V2']) {
        if (vm['default-v2']) {
          dto[vm['V2']] = vm['default-v2'];
          if (vm['V2'] === "transportMethod") {
            transportMethod = vm['default-v2'];
          }
        } else if (vm['V1']) {
          let val = data[vm['V1']];
          dto[vm['V2']] = val;
        }
      }
    })
    dto.year = year;
    dto.noOfTrips = 1;

    if (transportMethod === "EC") {
      if (data["IS_TWO_WAY"] !== undefined) {
        switch (data["IS_TWO_WAY"]) {
          case 0:
            dto.option = TransportOption.one_way;
            break
          case 1:
            dto.option = TransportOption.two_way;
            break;
          default:
            dto.option = TransportOption.one_way;
            break
        }
      } else {
        dto.option = TransportOption.one_way;
      }

      let companyPetrolLiters = data['COMPANY_PETROL_LITERS'];
      let companyDieselLiters = data['COMPANY_DIESEL_LITERS'];
      let ownDieselLiters = data['OWN_DIESEL_LITERS'];
      let ownPetrolLiters = data['OWN_PETROL_LITERS'];

      if (companyPetrolLiters || companyDieselLiters || ownDieselLiters || ownPetrolLiters) { // fuel base
        dto.method = TransportMode.fuel_base;
        dto.directTransportMode = "NONE";
        dto.petrolConsumption = companyPetrolLiters ? companyPetrolLiters : ownPetrolLiters;
        dto.petrolConsumption_unit = units.ecFuel[0].code;
        dto.dieselConsumption = companyDieselLiters ? companyDieselLiters : ownDieselLiters;
        dto.dieselConsumption_unit = units.ecFuel[0].code;
      } else {
        dto.method = TransportMode.distance_base;

        // NO Emission
        let ned_down = data["NO_EMISSION_DISTANCE_DOWN"];
        let ned_up = data["NO_EMISSION_DISTANCE_UP"];
        let n_em = data["NO_EMISSION_MODE_UP"];
        if (n_em) {
          switch (n_em) {
            case 11:
              dto.noEmissionMode = "WALKING"
              break;
            case 12:
              dto.noEmissionMode = "CYCLING"
              break;
            case 13:
              dto.noEmissionMode = "FREE_RIDE"
              break;
            default:
              dto.noEmissionMode = "NONE"
              break;
          }
        }
        if (dto.option === TransportOption.one_way) {
          dto.noEmissionDistance = ned_up;
        } else {
          dto.noEmissionDistance = ned_down + ned_up;
        }
        dto.noEmissionDistance_unit = units.distance[0].code;

        // Public
        let p_down = data["PUBLIC_TRANS_DISTANCE_DOWN"];
        let p_up = data["PUBLIC_TRANS_DISTANCE_UP"];
        let p_em = data["PUBLIC_TRANS_MODE_UP"];
        if (p_em) {
          switch (p_em) {
            case 1:
              dto.publicMode = "VAN_DIESEL"
              break;
            case 2:
              dto.publicMode = "MEDIUM_BUS_DIESEL"
              break;
            case 3:
              dto.publicMode = "BUS_DIESEL"
              break;
            case 4:
              dto.publicMode = "RAILWAY"
              break;
            default:
              dto.publicMode = "NONE"
              break;
          }
        }
        if (dto.option === TransportOption.one_way) {
          dto.publicDistance = p_up;
        } else {
          dto.publicDistance = p_down + p_up;
        }
        dto.publicDistance_unit = units.publicDistance[0].code;

        // Own Transport ( Private )
        let o_down = data["OWN_TRANS_DISTANCE_DOWN"];
        let o_up = data["OWN_TRANS_DISTANCE_UP"];
        let o_em = data["OWN_TRANS_MODE_UP"];
        let o_fe = data["OWN_TRANS_FUEL_ECONOMY_UP"];
        let o_ft = data["OWN_TRANS_FUEL_TYPE_UP"];

        if (o_fe) {
          dto.fuelEconomy = o_fe;
          dto.fuelEconomy_unit = units.fuelEconomy[0].code;
        }

        if (o_ft) {
          switch (o_ft) {
            case 1:
              dto.fuelType = "PETROL"
              break;
            case 2:
              dto.fuelType = "DIESEL"
              break;
            default:
              dto.fuelType = "PETROL"
              break;
          }
        }

        if (o_em) {
          switch (o_em) {
            case 3:
              dto.privateMode = "VAN";
              break;
            case 4:
              dto.privateMode = "JEEP";
              break;
            case 5:
              dto.privateMode = "CAR";
              break;
            case 6:
              dto.privateMode = "PRIME_MOVE";
              break;
            case 7:
              dto.privateMode = "BIKE";
              break;
            case 8:
              dto.privateMode = "THREEWHEEL";
              break;
            default:
              dto.privateMode = "NONE";
              break;
          }
        }
        if (dto.option === TransportOption.one_way) {
          dto.privateDistance = o_up;
        } else {
          dto.privateDistance = o_down + o_up;
        }
        dto.privateDistance_unit = units.distance[0].code;
      }


    }

    //@ts-ignore
    if (dto.paidByCompany == 1) {

      dto.paidByCompany = true;

      dto.ownership = Ownership.RENTED;
    } else {
      dto.paidByCompany = true;
      dto.ownership = Ownership.HIRED


    }



    setTimeout(() => {
      try {
        return this.create(dto);
      } catch (err) {
        console.log(err);
        return null;
      }
    }, 3000)
  }

  async getEmployeeEmissionData(projectId: number, unitId: any, year: number) {
    let noe = await this.numEmployeesService.getTotalEmployeesByUnit([unitId], year)

    const directSum = await this.repo
      .createQueryBuilder('entry')
      .innerJoin(
        'entry.unit',
        'unit',
        'unit.id = entry.unitId'
      )
      .innerJoin(
        'entry.project',
        'project',
        'project.id = entry.projectId'
      )
      .select('SUM(entry.e_sc) as e_sc, SUM(entry.e_sc_co2) as e_sc_co2, SUM(entry.e_sc_ch4) as e_sc_ch4, SUM(entry.e_sc_n2o) as e_sc_n2o')
      .where('entry.direct = :d AND project.id = :projectId AND unit.id = :unitId', { d: 1, projectId: projectId, unitId: unitId })
      .execute();

    console.log(directSum);

    const indirectSum = await this.repo
      .createQueryBuilder('entry')
      .innerJoin(
        'entry.unit',
        'unit',
        'unit.id = entry.unitId'
      )
      .innerJoin(
        'entry.project',
        'project',
        'project.id = entry.projectId'
      )
      .select('SUM(entry.e_sc) as e_sc, SUM(entry.e_sc_co2) as e_sc_co2, SUM(entry.e_sc_ch4) as e_sc_ch4, SUM(entry.e_sc_n2o) as e_sc_n2o')
      .where('entry.indirect = :d AND project.id = :projectId AND unit.id = :unitId', { d: 1, projectId: projectId, unitId: unitId })
      .execute()
      ;

    const otherSum = await this.repo
      .createQueryBuilder('entry')
      .innerJoin(
        'entry.unit',
        'unit',
        'unit.id = entry.unitId'
      )
      .innerJoin(
        'entry.project',
        'project',
        'project.id = entry.projectId'
      )
      .select('SUM(entry.e_sc) as e_sc, SUM(entry.e_sc_co2) as e_sc_co2, SUM(entry.e_sc_ch4) as e_sc_ch4, SUM(entry.e_sc_n2o) as e_sc_n2o')
      .where('entry.other = :d AND project.id = :projectId AND unit.id = :unitId', { d: 1, projectId: projectId, unitId: unitId })
      .execute()
      ;



    const totalDirectRecords = await this.repo
      .createQueryBuilder('entry')
      .select('entry.employeeName')
      .distinct(true)
      .innerJoin(
        'entry.unit',
        'unit',
        'unit.id = entry.unitId'
      )
      .innerJoin(
        'entry.project',
        'project',
        'project.id = entry.projectId'
      )
      .where('entry.direct = :d AND project.id = :projectId AND unit.id = :unitId', { d: 1, projectId: projectId, unitId: unitId })
      .getRawMany()

    const totalInDirectRecords = await this.repo
      .createQueryBuilder('entry')
      .select('entry.employeeName')
      .distinct(true)
      .innerJoin(
        'entry.unit',
        'unit',
        'unit.id = entry.unitId'
      )
      .innerJoin(
        'entry.project',
        'project',
        'project.id = entry.projectId'
      )
      .where('entry.indirect = :d AND project.id = :projectId AND unit.id = :unitId', { d: 1, projectId: projectId, unitId: unitId })
      .getRawMany();
    
    const totalOtherRecords = await this.repo
      .createQueryBuilder('entry')
      .select('entry.employeeName')
      .distinct(true)
      .innerJoin(
        'entry.unit',
        'unit',
        'unit.id = entry.unitId'
      )
      .innerJoin(
        'entry.project',
        'project',
        'project.id = entry.projectId'
      )
      .where('entry.indirect = :d AND project.id = :projectId AND unit.id = :unitId', { d: 1, projectId: projectId, unitId: unitId })
      .getRawMany();


    return {
      totalEmpoyes: noe,
      totalDirectRecords: totalDirectRecords.length,
      totalInDirectRecords: totalInDirectRecords.length,
      totalOtherRecords: totalOtherRecords.length,
      directSum: directSum[0],
      otherSum: otherSum[0],
      indirectSum: indirectSum[0],
    }
  }


  async updateTotal(projectId: number | null, unitId: number | null) {

    let q =  this.repo
      .createQueryBuilder('entry')
      .select('projectId as projectId, unitId as unitId')
      .groupBy('projectId,unitId')
      .where('projectId =:projectId',{projectId})
    // console.log(q.getQuery());

    let res = await q.execute();

    // if(projectId){
    //   res = res.filter((r: { pId: number; }) => r.pId === projectId);
    // }
    // console.log(res);
    res.forEach(async (data: { unitId: any; projectId: number; }) => {
      let dto = await this.repo.findOne({ unit: { id: data.unitId }, project: { id: data.projectId } });
      // console.log(dto);
      let empData = await this.getEmployeeEmissionData(data.projectId, data.unitId, dto.year);
      let reqq = {
        totalDirectRecords: empData.totalDirectRecords,
        totalInDirectRecords: empData.totalInDirectRecords,
        totalOtherRecords: empData.totalOtherRecords,
        totalEmployees: empData.totalEmpoyes?.totalEmployees,
        totalEmployeesPaid: empData.totalEmpoyes?.totalEmployeesPaid,
        directSum: empData.directSum,
        indirectSum: empData.indirectSum,
        otherSum: empData.otherSum,
      }
      this.calculationService.updateTotalEmission(
        null,
        dto.project,
        null,
        sourceName.passenger_road,
        dto.unit.id,
        reqq
      );
    })
  }
}
