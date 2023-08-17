import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CalculationService } from 'src/emission/calculation/calculation.service';
import { In, Repository } from 'typeorm';
import { sourceName } from 'src/emission/enum/sourcename.enum';
import { FreightOffroadActivityData } from '../entities/freight-offroad.entity';
import { DistanceBaseDto, FreightOffRoadDto, FuelBaseDto } from 'src/emission/calculation/dto/freight-offroad.dto';
import { BaseDataDto } from 'src/emission/calculation/dto/emission-base-data.dto';
import { TransportMode, TransportOption } from 'src/emission/enum/transport.enum';
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
import { Project } from 'src/project/entities/project.entity';
import { Unit } from 'src/unit/entities/unit.entity';
import { User } from 'src/users/user.entity';
import { ParameterUnit } from 'src/utills/parameter-units';
import { EmissionSourceBulkService } from 'src/emission/emission-source/service/emission-source-bulk.service';
import { EmissionSourceRecalService } from 'src/emission/emission-source/service/emission-source-recal.service';
import { ProgressRetriever } from 'src/emission/progress-retriever';
import { ProgressDataResponseDto } from 'src/emission/dto/progress-data.dto';
import { ProgresReportService } from 'src/emission/emission-source/service/progres-report.service';
import { ProgressStatus } from 'src/emission/enum/progress-status.enum';
import { isNumber } from '@nestjsx/util';
import { ExcelDownloader } from 'src/emission/excel-downloader';

@Injectable()
export class FreightOffroadService extends TypeOrmCrudService<FreightOffroadActivityData> implements ExcellUploadable , BulckUpdatable,ProgressRetriever, ExcelDownloader{
  getDto() {
    return new FreightOffroadActivityData();
  }

  bulkCalculate(unitIds: number[], projectId: number) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(FreightOffroadActivityData) repo,
    @InjectRepository(FreightOffroadActivityData)
    private readonly freightOffRoadRepository: Repository<FreightOffroadActivityData>,
    @InjectRepository(Unit) private unitRepo: Repository<Unit>,
    private readonly calculationService: CalculationService,
    private readonly puesService: ProjectUnitEmissionSourceService,
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
            }
          }
        } else {
          let value = 0
            if (!isNumber(dataObjs[existsAll][data.month])){
              value = parseFloat((dataObjs[existsAll][data.month]).split(" ")[0])
            }
          dataObjs[existsAll][data.month] = value + data.fuelConsumption + this.progresReportService.getParameterUnit(data, 'fuelConsumption')
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
    let emissionSource = sourceName.freight_offroad

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
          esName: 'Freight Offroad',
          completeness: ProgressStatus.COMPLETED,
          parameters: parameters
        })
      } else {
        allMonthFilled = this.progresReportService.checkCompleteness(activityData[key], true, true, {para: ['vehicleNo', 'vehicleModel']})
        response.push({
          unit: key,
          unitName: activityData[key][0]['unitName'],
          es: emissionSource,
          esName: 'Freight Offroad',
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
        esName: 'Freight Offroad',
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
        esName: 'Freight Offroad',
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
  
  async create(createFreightOffroadDto: FreightOffroadActivityData) {

    const fuelBaseData: FuelBaseDto ={
      fc: createFreightOffroadDto.fuelConsumption,
      fc_unit: createFreightOffroadDto.fuelConsumption_unit,
      stroke: createFreightOffroadDto.stroke ,
      fuelType: createFreightOffroadDto.fuelType,
    };

    const distanceBaseData: DistanceBaseDto ={
      // year: createFreightOffroadDto.year,
      // countryCode:  'LK', // TODO: impl after org structure
    };
   
    const calculationData: FreightOffRoadDto = {
      year: createFreightOffroadDto.year,
      month:createFreightOffroadDto.month,
      mode:createFreightOffroadDto.method,
      fuel:fuelBaseData,
      distance:distanceBaseData,
      industry: createFreightOffroadDto.industry,
      baseData: await this.getBaseData(createFreightOffroadDto)
    };

    createFreightOffroadDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    createFreightOffroadDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    createFreightOffroadDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.freight_offroad,
      data: calculationData,
    });
    this.updateTotalEmission(createFreightOffroadDto, calculationData, emission)
    //createFreightOffroadDto.emission = emission.data?emission.data :0;
    createFreightOffroadDto.e_sc = emission.e_sc?emission.e_sc :0;
    createFreightOffroadDto.e_sc_co2 = emission.e_sc_co2?emission.e_sc_co2 :0;
    createFreightOffroadDto.e_sc_ch4 = emission.e_sc_ch4?emission.e_sc_ch4 :0;
    createFreightOffroadDto.e_sc_n2o = emission.e_sc_n2o?emission.e_sc_n2o :0;

    return await this.freightOffRoadRepository.save(createFreightOffroadDto);
  }

  findAll() {
    return `This action returns all freightOffroad`;
  }


  async update(id: number, updateFreightOffroadDto: FreightOffroadActivityData) {
    const fuelBaseData: FuelBaseDto ={
      fc: updateFreightOffroadDto.fuelConsumption,
      fc_unit: updateFreightOffroadDto.fuelConsumption_unit,
      stroke: updateFreightOffroadDto.stroke ,
      fuelType: updateFreightOffroadDto.fuelType,
    };

    const distanceBaseData: DistanceBaseDto ={
      // year: updateFreightOffroadDto.year,
      // countryCode:  'LK', // TODO: impl after org structure
    };
   
    const calculationData: FreightOffRoadDto = {
      year: updateFreightOffroadDto.year,
      month:updateFreightOffroadDto.month,
      mode:updateFreightOffroadDto.method,
      fuel:fuelBaseData,
      distance:distanceBaseData,
      industry: updateFreightOffroadDto.industry,
      baseData: await this.getBaseData(updateFreightOffroadDto)
      
    };

    updateFreightOffroadDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    updateFreightOffroadDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    updateFreightOffroadDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.freight_offroad,
      data: calculationData,
    });

    if (updateFreightOffroadDto.e_sc !== emission.e_sc){
      let current = await this.repo.findOne(id);
      let updatedEmission = this.calculationService.getDiff(current, emission);
      this.calculationService.updateTotalEmission(
        updatedEmission,
        updateFreightOffroadDto.project,
        calculationData.baseData.clasification, 
        sourceName.freight_offroad,
        updateFreightOffroadDto.unit.id
      );
      // this.updateTotalEmission(updateFreightOffroadDto, calculationData, emission)
    }
    //updateFreightOffroadDto.emission = emission.data?emission.data :0;
    updateFreightOffroadDto.e_sc = emission.e_sc?emission.e_sc :0;
    updateFreightOffroadDto.e_sc_co2 = emission.e_sc_co2?emission.e_sc_co2 :0;
    updateFreightOffroadDto.e_sc_ch4 = emission.e_sc_ch4?emission.e_sc_ch4 :0;
    updateFreightOffroadDto.e_sc_n2o = emission.e_sc_n2o?emission.e_sc_n2o :0;

    const updated = await this.repo.update({
      id: id
    }, updateFreightOffroadDto);
    if (updated.affected === 1) {
      return await this.repo.findOne(id);
    } else {
      throw new InternalServerErrorException("Updating is failed");
    }
  }

  async getBaseData(dto: FreightOffroadActivityData): Promise<BaseDataDto> {
    let ownership: Ownership = Ownership.getkey(dto.ownership)
    let activityInfo =  new PuesDataReqActivityData()
    activityInfo.owenerShip = ownership
    let req = new PuesDataReqDto()
    req.project = dto.project
    req.sourceName = sourceName.freight_offroad
    req.unitId = dto.unit.id
    req.user = dto.user
    req.activityInfo = activityInfo

    let puesData = await this.puesService.getPuesData(req)
    // console.log(puesData)

    return {
      clasification: puesData.clasification,
      tier: puesData.tier,
      sourceType: SourceType.MOBILE,
      industry: puesData.industry.code,
      countryCode: puesData.countryCode,
      projectId: dto.project.id
    }
  }

  async updateTotalEmission(dto: FreightOffroadActivityData, calData: FreightOffRoadDto, emission: any){
    let reqPues: PuesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.freight_offroad,
      unitId: dto.unit.id,
      emission: emission,
      classification: calData.baseData.clasification
    }

    await this.puesService.addEmission(reqPues)

    let reqPes : PesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.freight_offroad,
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
      sourceName.freight_offroad,
      deleteDto.unit.id
    );
    return await this.repo.delete({id: deleteDto.id});
  }


  addFromExcell(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number) {
    let units = this.parameterUnit.offroad_freight_units;
    let types = this.parameterUnit.fuelType
    let strokes = this.parameterUnit.strokes
    
    if (["Diesel", "Petrol"].includes(data['fuelType'])){
      let dto = new FreightOffroadActivityData();
      dto['unit'] = unit;
      dto['project'] = project;
      dto['user'] = user;
      
      variable_mapping.forEach(vm=>{
        if(vm['V2']){
          if(vm['default-v2']){
            dto[vm['V2']] = vm['default-v2'];
          }else if(vm['V1']){
            let  val
            if (vm['V1'] === 'ownerShip'){
              if (data[vm['V1']] === 'Company Own'){

                val = Ownership.OWN
                dto[vm['V2']] = val;
              } else {
                val = data[vm['V1']];
                dto[vm['V2']] = val;
              }
            } else if (vm['V1'] === 'stroke'){
              if (data[vm['V1']] !== '-'){
                val = (strokes.find(o => o.name === data[vm['V1']])).code
                dto[vm['V2']] = val;
              }
            } else {
              val = data[vm['V1']];
              dto[vm['V2']] = val;
            }
          }
        }
      })
      dto.year = year;
      dto.method = TransportMode.fuel_base
      dto.noOfTrips = 1;
      dto.option = TransportOption.one_way;
      dto.fuelConsumption_unit = units.fuel[0].code
      dto.distance_unit = units.distance[0].code;
  
      if (data['fuelType'] === "Petrol"){
        dto.fuelType = (types.find(o => o.id === 1)).code
      } else if(data['fuelType'] === "Diesel") {
        dto.fuelType = (types.find(o => o.id === 2)).code
      }
  
  
  
      try{
        return this.create(dto);
      }catch(err){
        console.log(err);
        return null;
      }
    } else {
      return null
    }
   
  }
}
