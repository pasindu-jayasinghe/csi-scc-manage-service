import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { BaseDataDto } from 'src/emission/calculation/dto/emission-base-data.dto';
import { ProjectEmissionSourceService } from 'src/emission/emission-source/service/project-emission-source.service';
import { sourceName } from 'src/emission/enum/sourcename.enum';
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
import { IcaoDto } from '../dto/icao.dto';
import { PassengerAirActivityData } from '../entities/passenger-air.entity';
import * as fs from 'fs'
import { CalculationService } from 'src/emission/calculation/calculation.service';
import { EmissionCalResDto } from 'src/emission/calculation/dto/emission-res.dto';
import { EmissionSourceRecalService } from 'src/emission/emission-source/service/emission-source-recal.service';
import { EmissionSourceBulkService } from 'src/emission/emission-source/service/emission-source-bulk.service';
import { ProgressRetriever } from 'src/emission/progress-retriever';
import { ProgressDataResponseDto } from 'src/emission/dto/progress-data.dto';
import { ProgresReportService } from 'src/emission/emission-source/service/progres-report.service';
import { ProgressStatus } from 'src/emission/enum/progress-status.enum';
import { isNumber } from '@nestjsx/util';
import { ExcelDownloader } from 'src/emission/excel-downloader';

@Injectable()
export class PassengerAirService extends TypeOrmCrudService<PassengerAirActivityData> implements ExcellUploadable , BulckUpdatable,ProgressRetriever, ExcelDownloader{
  getDto() {
    return new PassengerAirActivityData();
  }
  
  constructor(
    @InjectRepository(PassengerAirActivityData) repo,
    @InjectRepository(PassengerAirActivityData)
    private readonly passengerRoadRepository: Repository<PassengerAirActivityData>,
    @InjectRepository(Unit) private unitRepo: Repository<Unit>,
    private httpService: HttpService,
    private puesService: ProjectUnitEmissionSourceService,
    private pesService: ProjectEmissionSourceService,
    private projectService: ProjectService,
    private parameterUnit: ParameterUnit,
    private calculationService: CalculationService,
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
    let filter = 'project.id = :projectId AND unit.id IN (:unitIds)'
    let filterValues = {projectId: projectId, unitIds: unitIds}
    let acData = await this.getActivityData(filter, filterValues)
    let months = this.parameterUnit.months
        let columns = []
        let rows = []
        rows.push([
          { name: '', code: '' },
          { name: "Number of employees", colspan: true }
        ])
        columns.push({ name: 'Route', code: 'route' })
        months.forEach(m => {
          columns.push({name: m.name, code: m.value.toString()})
        })
        rows.push(columns)
        let dataObjs = []
        columns.sort((a,b)=> a.code-b.code)
        if (acData.length > 0){
          acData.forEach(data => {
            let departurePort = data.departurePort.includes("(") ? data.departurePort.match(/\(([^)]+)\)/)[1] + '-' : data.departurePort + '-'
            let transist1 = (data.transist1 && data.transist1 !== null) ? (data.transist1.includes("(") ? data.transist1.match(/\(([^)]+)\)/)[1] + '-' : data.transist1 + '-') : ''
            let transist2 = (data.transist2 && data.transist2 !== null) ? (data.transist2.includes("(") ? data.transist2.match(/\(([^)]+)\)/)[1] + '-' : data.transist2 + '-') : ''
            let destinationPort = data.destinationPort.includes("(") ? data.destinationPort.match(/\(([^)]+)\)/)[1] : data.destinationPort

            let route = departurePort + transist1 + transist2 + destinationPort

            let exists = dataObjs.findIndex(o => o['route'] === route)
            if (exists === -1){
              let obj = {}
              months.forEach(m => {
                obj = {...obj, ...{[m.value]:0}}
              })
              obj = {...obj, ...{['route']: ''}}
              obj['route'] = route
              obj[data.month] = data.noOfEmployees
              dataObjs.push(obj)
            } else {
              dataObjs[exists][data.month] = data.noOfEmployees + dataObjs[exists][data.month]
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
    let emissionSource = sourceName.passenger_air

    activityData = activityData.map(ele => {
      ele['unitId'] = ele.unit.id
      ele['unitName'] = ele.unit.name
      return ele
    })

    activityData = this.progresReportService.group(activityData, 'unitId')

    for await (let key of Object.keys(activityData)) {
      let pues = await this.puesService.getByUnitAndProjectAndES(parseInt(key), projectId, emissionSource)
      if (pues && pues.isComplete){
        console.log("complete",  activityData[key][0]['unitName'])
        response.push({
          unit: key,
          unitName: activityData[key][0]['unitName'],
          es: emissionSource,
          esName: 'Passenger Air',
          completeness: ProgressStatus.COMPLETED
        })
      } else {
        console.log( activityData[key][0]['unitName'])
        allMonthFilled = this.progresReportService.checkCompleteness(activityData[key], true, false)
        response.push({
          unit: key,
          unitName: activityData[key][0]['unitName'],
          es: emissionSource,
          esName: 'Passenger Air',
          completeness: allMonthFilled.isCompleted,
          unFilled: allMonthFilled.unFilled
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
        esName: 'Passenger Air',
        completeness: ProgressStatus.NOT_ENTERED
      })
    }

    for await (const e of notAssignedIds) {
      let unit = await this.unitRepo.findOne({id: e})
      response.push({
        unit: e.toString(),
        unitName: unit.name,
        es: emissionSource,
        esName: 'Passenger Air',
        completeness: ProgressStatus.NOT_ASSIGNED
      })
    }

    return response
  }

  async bulkDelete(ids: number[], isPermant: boolean) {
    return await this.emissionSourceRecalService.bulkDelete(ids,isPermant, this);
  }

   async bulkCalculate(unitIds: number[], projectId: number) {
    return await this.emissionSourceRecalService.bulkCalculate(this, unitIds, projectId, this.repo, sourceName.passenger_air);
  }

  excellBulkUpload(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number, ownership: string, isMobile: boolean) {
    throw new Error('Method not implemented.');
  }

  downlodExcellBulkUploadVariableMapping() {
    throw new Error('Method not implemented.');
  }
  
  async create(createDto: PassengerAirActivityData) {
    createDto.e_sc_co2 = 0
    createDto.e_sc_ch4 = 0
    createDto.e_sc_n2o = 0

    createDto.e_sc = (createDto.e_sc / 1000)  * (createDto.noOfTrips !== 0 ? createDto.noOfTrips : 1)

    let baseData = await this.getBaseData(createDto)
    let emission = {
      e_sc: createDto.e_sc/1000,
      e_sc_co2: createDto.e_sc_co2,
      e_sc_ch4: createDto.e_sc_ch4,
      e_sc_n2o: createDto.e_sc_n2o
    }

    createDto.direct = baseData.clasification === Clasification.DIRECT ? true : false
    createDto.indirect = baseData.clasification === Clasification.INDIRECT ? true : false
    createDto.other = baseData.clasification === Clasification.OTHER ? true : false

    this.updateTotalEmission(createDto, baseData.clasification, emission)
     
    return await this.passengerRoadRepository.save(createDto);
  }

  findAll() {
    return this.passengerRoadRepository.find();
  }

  async update(id: number, updateDto: PassengerAirActivityData) {

    let baseData = await this.getBaseData(updateDto)
    updateDto.e_sc = (updateDto.e_sc / 1000) * (updateDto.noOfTrips !== 0 ? updateDto.noOfTrips : 1)
    let emission: EmissionCalResDto = {
      e_sc: updateDto.e_sc,
      e_sc_co2: updateDto.e_sc_co2,
      e_sc_ch4: updateDto.e_sc_ch4,
      e_sc_n2o: updateDto.e_sc_n2o,
      result: '',
      data: ''
    }
    let current = await this.repo.findOne(id);
    let updatedEmission = this.calculationService.getDiff(current, emission);
    this.calculationService.updateTotalEmission(
      updatedEmission,
      updateDto.project,
      baseData.clasification, 
      sourceName.passenger_air,
      updateDto.unit.id
    );
    if (updateDto.e_sc !== emission.e_sc){
    }
    updateDto.direct = baseData.clasification === Clasification.DIRECT ? true : false
    updateDto.indirect = baseData.clasification === Clasification.INDIRECT ? true : false
    updateDto.other = baseData.clasification === Clasification.OTHER ? true : false

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
      sourceName.passenger_air,
      deleteDto.unit.id
    );
    return await this.repo.delete({id: deleteDto.id});
  }
  async getBaseData(dto: PassengerAirActivityData): Promise<BaseDataDto> {
    let activityInfo =  new PuesDataReqActivityData()
    activityInfo.owenerShip = Ownership.getkey(dto.ownership)
    activityInfo.stationary = dto.stationary
    activityInfo.mobile = dto.mobile
    let req = new PuesDataReqDto()
    req.project = dto.project
    req.sourceName = sourceName.passenger_air
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

  async updateTotalEmission(dto: PassengerAirActivityData, classification: Clasification, emission: any){
    let reqPues: PuesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.passenger_air,
      unitId: dto.unit.id,
      emission: emission,
      classification: classification
    }

    await this.puesService.addEmission(reqPues)

    let reqPes : PesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.passenger_air,
      emission: emission,
      classification: classification
    }
    this.pesService.addEmission(reqPes)

    let reqProject: ProjectSumDataReqDto = {
      project: dto.project,
      classification: classification,
      emission: emission
    }
    this.projectService.addEmission(reqProject)
  }

  async icaoApi(req: IcaoDto){
    try{
      let a = await this.httpService.post(req.url, req.body? req.body:undefined).toPromise();
      // console.log(a.headers['set-cookie']);
      if(req.url.includes("Compute")){
        let b = await this.httpService.post("https://applications.icao.int/icec/Home/ChildResultTotalView", {type: 'Metric'},{
          headers: {
            'Accept': '*/*',
            'Cookie': a.headers['set-cookie'][0]
          }
        }).toPromise();
        // console.log(b.data);
        return JSON.stringify(b.data);
      }else{
        return a.data;
      }
    }catch(err){
      console.log("err =====> ",err);
      throw new InternalServerErrorException(err);
    }
  }


  async addFromExcell(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number) {

    let tripType;
    let cabin;
    let noofArrAirport = 1;
    let arrCode1;
    let arrCode2;
    let arrCode3;

    await fs.readFile('public/tmp/airports.json', "utf8", async (error, codes) => {
      if (error) {
        console.log("File read failed:", error);
        return;
      } 

      // console.log("read file")
      let airports = JSON.parse(codes.toString())
      let dto = new PassengerAirActivityData();
      dto['unit'] = unit;
      dto['project'] = project;
      dto['user'] = user;

      if (data['SEAT_CLASS'] !== 0) {
        variable_mapping.forEach(vm => {
          if (vm['V2']) {
            if (vm['default-v2']) {
              dto[vm['V2']] = vm['default-v2'];
            } else if (vm['V1']) {
              let val = data[vm['V1']];
              dto[vm['V2']] = val;
            }
          }
        })

        // console.log("mapping passed")

        // if (data["TRANSIST_1"] !== 0 && data["TRANSIST_2"] !== 0) {
        //   let option = this.parameterUnit.options_passenger_air.find(o => o.id == 2)
        //   dto.option = option.code
        //   tripType = option.name
        // } else {
        //   let option = this.parameterUnit.options_passenger_air.find(o => o.id == 1)
        //   dto.option = option.code
        //   tripType = option.name
        // }

        if (data["travelWay"] === 'Yes'){
          let option = this.parameterUnit.options_passenger_air.find(o => o.id == 2)
            dto.option = option.code
            tripType = option.name
        } else {
          let option = this.parameterUnit.options_passenger_air.find(o => o.id == 1)
            dto.option = option.code
            tripType = option.name
        }

        // console.log(data['depPort'])
        if (data['depPort'] !== 'NULL') dto.departurePort = (airports.find(o => o.Airpotrs === data['depPort'])).Code
        if (data['desPort'] !== 'NULL') dto.destinationPort = (airports.find(o => o.Airpotrs === data['desPort'])).Code
        if (data['trans1'] !== 'NULL') dto.transist1 = (airports.find(o => o.Airpotrs === data['trans1'])).Code
        if (data['trans2'] !== 'NULL') dto.transist2 = (airports.find(o => o.Airpotrs === data['trans2'])).Code

        if (dto.transist1 && dto.transist2) {
          arrCode1 = dto.transist1
          arrCode2 = dto.transist2
          arrCode3 = dto.destinationPort
          noofArrAirport += 2
        } else if (dto.transist1 && !dto.transist2) {
          arrCode1 = dto.transist1
          arrCode2 = dto.destinationPort
          arrCode3 = "#"
          noofArrAirport += 1
        } else {
          arrCode1 = dto.destinationPort
          arrCode2 = "#"
          arrCode3 = "#"
        }


        if (data['SEAT_CLASS'] === 1 || data['SEAT_CLASS'] === 2) {
          cabin = this.parameterUnit.class_passenger_air.find(o => o.id === 2)
        } else {
          cabin = this.parameterUnit.class_passenger_air.find(o => o.id === 1)
        }
        dto.cabinClass = cabin.code

        dto.year = year;
        dto.noOfTrips = 1;

        let body = new IcaoDto()
        body.url = "https://applications.icao.int/icec/Home/getCompute";
        body.body = {
          userID: "Lu",
          unitofMeasureTag: 1,
          triptype: tripType,
          cabinclass: cabin.name,
          noofpassenger: dto.noOfEmployees,
          noofArrAirport: noofArrAirport,
          depCode: dto.departurePort,
          arrCode1: arrCode1,
          arrCode2: arrCode2,
          arrCode3: arrCode3
        }

        let result = await this.icaoApi(body)
        result = JSON.parse(result)
        result = result.substring(result.indexOf('<tbody>') + 6, result.indexOf('</tbody>'))
        result = result.substring(result.indexOf('<tr class="active">') + 19, result.indexOf('</tr>'))
        for (let i = 0; i < 6; i++) {
          result = result.substring(result.indexOf('</th>') + 5)
        }
        result = result.substring(result.indexOf('<th>') + 4, result.indexOf('</th>'))
        result = parseFloat(result.trim())
        dto.e_sc = result

        // console.log(dto);
        this.sleep(10000)

        try {
          fs.unlink('public/tmp/airports.json', ()=>{
            console.log("File removed")
            console.log("File removed", data['AIR_TRAVEL_ENTRY_ID'],)
          })
          return this.create(dto);
        } catch (err) {
          console.log(err);
          console.log("in catch")
          console.log("in catch", data['AIR_TRAVEL_ENTRY_ID'])
          return null;
        }
      } else {
        console.log("in else")
        return null;
      }

    })
    console.log("returned")
  }
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  

}
