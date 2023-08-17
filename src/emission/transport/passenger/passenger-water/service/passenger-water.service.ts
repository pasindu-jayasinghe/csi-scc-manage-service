import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CrudRequest } from '@nestjsx/crud';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CalculationService } from 'src/emission/calculation/calculation.service';
import { BaseDataDto } from 'src/emission/calculation/dto/emission-base-data.dto';
import { FuelBaseDto, PassengerWaterDto } from 'src/emission/calculation/dto/passenger-water.dto';
import { ProjectEmissionSourceService } from 'src/emission/emission-source/service/project-emission-source.service';
import { sourceName } from 'src/emission/enum/sourcename.enum';
import { TransportMode, TransportOption } from 'src/emission/enum/transport.enum';
import { ExcellUploadable } from 'src/emission/excell-uploadable';
import { BulckUpdatable } from 'src/emission/bulck-updatable';
import { PuesDataReqActivityData, PuesDataReqDto } from 'src/project/dto/pues-data-req.dto';
import { PesSumDataReqDto, ProjectSumDataReqDto, PuesSumDataReqDto } from 'src/project/dto/update-total-emission-req.dto';
import { Project } from 'src/project/entities/project.entity';
import { Clasification } from 'src/project/enum/clasification.enum';
import { Ownership } from 'src/project/enum/ownership.enum';
import { ProjectUnitEmissionSourceService } from 'src/project/service/project-unit-emission-source.service';
import { ProjectService } from 'src/project/service/project.service';
import { Unit } from 'src/unit/entities/unit.entity';
import { User } from 'src/users/user.entity';
import { ParameterUnit } from 'src/utills/parameter-units';
import { In, Repository } from 'typeorm';
import { PassengerWaterActivityData } from '../entities/passenger-water.entity';
import { EmissionSourceRecalService } from 'src/emission/emission-source/service/emission-source-recal.service';
import { EmissionSourceBulkService } from 'src/emission/emission-source/service/emission-source-bulk.service';
import { ProgressRetriever } from 'src/emission/progress-retriever';
import { ProgressDataResponseDto } from 'src/emission/dto/progress-data.dto';
import { ProgressStatus } from 'src/emission/enum/progress-status.enum';
import { ProgresReportService } from 'src/emission/emission-source/service/progres-report.service';
import { isNumber } from '@nestjsx/util';
import { ExcelDownloader } from 'src/emission/excel-downloader';

@Injectable()
export class PassengerWaterService  extends TypeOrmCrudService<PassengerWaterActivityData> implements ExcellUploadable , BulckUpdatable, ProgressRetriever, ExcelDownloader{

  getDto() {
    return new PassengerWaterActivityData();
  }
  constructor(
        @InjectRepository(PassengerWaterActivityData) repo,
        @InjectRepository(PassengerWaterActivityData)
        private readonly passengerWaterRepository: Repository<PassengerWaterActivityData>,
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
              obj[data.month] = data.fuelConsumption + this.progresReportService.getParameterUnit(data, 'fuelConsumption')
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
              dataObjs[existVeh][data.month] = value + data.fuelConsumption + this.progresReportService.getParameterUnit(data, 'fuelConsumption')
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
            dataObjs[existsAll][data.month] = value + data.fuelConsumption + this.progresReportService.getParameterUnit(data, 'fuelConsumption')
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
    let emissionSource = sourceName.passenger_water
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
            esName: 'Passenger Water - ' + ownership,
            completeness: ProgressStatus.COMPLETED,
            parameters: parameters
          })
        } else {
          allMonthFilled = this.progresReportService.checkCompleteness(activityDataUnit[key], true, true, { para: ['vehicleNo'] })
          response.push({
            unit: key,
            unitName: activityDataUnit[key][0]['unitName'],
            es: emissionSource + '_' + ownership,
            esName: 'Passenger Water - ' + ownership,
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
          esName: 'Passenger Water - ' + key,
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
          esName: 'Passenger Water - ' + key,
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
    return await this.emissionSourceRecalService.bulkCalculate(this, unitIds, projectId, this.repo, sourceName.passenger_water);
  }

  excellBulkUpload(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number, ownership: string, isMobile: boolean) {
    throw new Error('Method not implemented.');
  }

  downlodExcellBulkUploadVariableMapping() {
    throw new Error('Method not implemented.');
  }

    async create(createDto: PassengerWaterActivityData): Promise<PassengerWaterActivityData> {
        let {fuel} = this.getData(createDto)
        const calculationData: PassengerWaterDto = {
          mode: createDto.method,
          year: createDto.year,
          month: createDto.month,
          fuelType: createDto.fuelType,
          fuel: fuel,
          baseData: await this.getBaseData(createDto)
        };
    
        createDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
        createDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
        createDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false
        
        const emission = await this.calculationService.calculate({
          sourceName: sourceName.passenger_water,
          data: calculationData,
        });
    
        this.updateTotalEmission(createDto, calculationData, emission)
        createDto.e_sc = emission.e_sc  ? emission.e_sc : 0;
        createDto.e_sc_co2 = emission.e_sc_co2  ? emission.e_sc_co2 : 0 ;
        createDto.e_sc_ch4 = emission.e_sc_ch4  ? emission.e_sc_ch4 : 0;
        createDto.e_sc_n2o = emission.e_sc_n2o  ? emission.e_sc_n2o : 0;
        return await this.passengerWaterRepository.save(createDto);
    }
    
    async update(id: number, updateDto: PassengerWaterActivityData) {
        let { fuel } = this.getData(updateDto)

        const calculationData: PassengerWaterDto = {
          mode: updateDto.method,
          year: updateDto.year,
          month: updateDto.month,
          fuelType: updateDto.fuelType,
          fuel: fuel,
          baseData: await this.getBaseData(updateDto)
        };
    
        updateDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
        updateDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
        updateDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false
    
        const emission = await this.calculationService.calculate({
          sourceName: sourceName.passenger_water,
          data: calculationData,
        });
        if (updateDto.e_sc !== emission.e_sc){
          let current = await this.repo.findOne(id);
          let updatedEmission = this.calculationService.getDiff(current, emission);
          this.calculationService.updateTotalEmission(
            updatedEmission,
            updateDto.project,
            calculationData.baseData.clasification, 
            sourceName.passenger_water,
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

    async remove(req) {
      let o = req.parsed.paramsFilter.find(o => o.field === 'id')
      let deleteDto = await this.repo.findOne({id: o.value})
      let updatedEmission = this.calculationService.getDiff(deleteDto, null)
      this.calculationService.updateTotalEmission(
        updatedEmission,
        deleteDto.project,
        (deleteDto.direct ? Clasification.DIRECT : ((deleteDto.indirect ? Clasification.INDIRECT : Clasification.OTHER))), 
        sourceName.passenger_water,
        deleteDto.unit.id
      );
      return await this.repo.delete({id: deleteDto.id});
    }

    async getBaseData(dto: PassengerWaterActivityData): Promise<BaseDataDto> {
        let ownership: Ownership = Ownership.getkey(dto.ownership)
        let activityInfo = new PuesDataReqActivityData()
        activityInfo.owenerShip = ownership
        activityInfo.stationary = dto.stationary
        activityInfo.mobile = dto.mobile
        let req = new PuesDataReqDto()
        req.project = dto.project
        req.sourceName = sourceName.passenger_water
        req.unitId = dto.unit.id
        req.user = dto.user
        req.activityInfo = activityInfo
    
        let puesData = await this.puesService.getPuesData(req)

    
        return {
          clasification: puesData.clasification,
          tier: puesData.tier,
          sourceType: puesData.sourceType,
          industry: puesData.industry.code,
          countryCode: puesData.countryCode,
          projectId: dto.project.id
        }
      }
    
      getData(dto: PassengerWaterActivityData) {
        const fuelBaseData: FuelBaseDto = new FuelBaseDto()
        if (dto.method === TransportMode.fuel_base) {
          fuelBaseData.fc = dto.fuelConsumption
          fuelBaseData.fc_unit = dto.fuelConsumption_unit
        } else if (dto.method === TransportMode.distance_base) {
        }
    
        return {
          fuel: fuelBaseData
        }
      }
    
      async updateTotalEmission(dto: PassengerWaterActivityData, calData: PassengerWaterDto, emission: any){
        let reqPues: PuesSumDataReqDto = {
          project: dto.project,
          sourceName: sourceName.passenger_water,
          unitId: dto.unit.id,
          emission: emission,
          classification: calData.baseData.clasification
        }
    
        await this.puesService.addEmission(reqPues)
    
        let reqPes : PesSumDataReqDto = {
          project: dto.project,
          sourceName: sourceName.passenger_water,
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
        let units = this.parameterUnit.offroad_machinery_units;
        let fuelTypes = this.parameterUnit.fuelType
    
        let dto = new PassengerWaterActivityData();
        dto['unit'] = unit;
        dto['project'] = project;
        dto['user'] = user;
    
        variable_mapping.forEach(vm=>{
          if(vm['V2']){
            if(vm['default-v2']){
              dto[vm['V2']] = vm['default-v2'];
            }else if(vm['V1']){
              let val;
              if (vm['V1'] === 'FUEL_TYPE'){
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
