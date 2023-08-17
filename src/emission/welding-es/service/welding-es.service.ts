import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { WeldingEsDto } from '../../calculation/dto/welding-es.dto';
import { In, Repository } from 'typeorm';

import { WeldingEsActivityData } from '../entities/welding-es.entity';
import { CalculationService } from '../../calculation/calculation.service';
import { sourceName } from 'src/emission/enum/sourcename.enum';
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
import { Unit } from 'src/unit/entities/unit.entity';
import { Project } from 'src/project/entities/project.entity';
import { User } from 'src/users/user.entity';
import { ParameterUnit } from 'src/utills/parameter-units';
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
export class WeldingEsService extends TypeOrmCrudService<WeldingEsActivityData> implements ExcellUploadable , BulckUpdatable, ProgressRetriever, ExcelDownloader{

  getDto() {
    return new WeldingEsActivityData();
  }

  private excelBulkVariableMapping: {code: string, name: string,isRequired: boolean,type: VariableValidationType}[] = [    
    {code: "month", name: 'Month',isRequired: true,type:VariableValidationType.list},
    {code: "ac", name: "Acetylene Consumption",isRequired: false,type:VariableValidationType.number},
    {code: "ac_unit", name: "Acetylene Consumption Unit",isRequired: false,type:VariableValidationType.list},
    {code: "lc", name: "Liquid CO2 Consumption",isRequired: false,type:VariableValidationType.number},
    {code: "lc_unit", name: "Liquid CO2 Consumption Unit",isRequired: false,type:VariableValidationType.list}
  ]


  constructor(
    @InjectRepository(WeldingEsActivityData) repo,
    @InjectRepository(WeldingEsActivityData)
    private readonly weldingEsRepository: Repository<WeldingEsActivityData>,
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
    let filter = 'project.id = :projectId AND unit.id IN (:unitIds) '
    let filterValues = {projectId: projectId, unitIds: unitIds}
    let acData = await this.getActivityData(filter, filterValues)
    
    let months = this.parameterUnit.months
    let columns = []
    let rows = []
    columns.push({name: "Parameter", code: "para"})
    months.forEach(m => {
      columns.push({name: m.name, code: m.value.toString()})
    })
    rows.push(columns)
    let dataObjs = []
    columns.sort((a, b) => a.code - b.code)

    let parameters = [
      { name: "Acetylene Consumption", code: "ac" },
      { name: "Liquid CO₂ Consumption", code: "lc" }
    ]

    parameters.forEach(para => {
      acData.forEach(data => {
        let exists = dataObjs.findIndex(o => o['para'] === para.name)
        if (exists === -1) {
          let obj = {}
          obj = { ...obj, ...{ para: '' } }
          months.forEach(m => {
            obj = { ...obj, ...{ [m.value]: 0 } }
          })
          obj['para'] = para.name
          obj[data.month] = data[para.code] + this.progresReportService.getParameterUnit(data, para.code)
          dataObjs.push(obj)
        } else {
          let value = 0
          if (!isNumber(dataObjs[exists][data.month])){
            value = parseFloat((dataObjs[exists][data.month]).split(" ")[0])
          } 
          dataObjs[exists][data.month] = value + data[para.code] + this.progresReportService.getParameterUnit(data, para.code)
        }
      })
    })

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
    let emissionSource = sourceName.WeldingEs

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
          esName: 'Welding',
          completeness: ProgressStatus.COMPLETED,
          isComplete: pues.isComplete,
        })
      } else {
        allMonthFilled = this.progresReportService.checkCompleteness(activityData[key], true, false, {para: ['ac', 'lc']})
        response.push({
          unit: key,
          unitName: activityData[key][0]['unitName'],
          es: emissionSource,
          esName: 'Welding',
          completeness: allMonthFilled.isCompleted,
          unFilled: allMonthFilled.unFilled,
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
        esName: 'Welding',
        completeness: ProgressStatus.NOT_ENTERED,
      })
    }

    for await (const e of notAssignedIds) {
      let unit = await this.unitRepo.findOne({id: e})
      response.push({
        unit: e.toString(),
        unitName: unit.name,
        es: emissionSource,
        esName: 'Welding',
        completeness: ProgressStatus.NOT_ASSIGNED,
      })
    }

    return response
  }

  async bulkDelete(ids: number[], isPermant: boolean) {
    return await this.emissionSourceRecalService.bulkDelete(ids,isPermant, this);
  }

   async bulkCalculate(unitIds: number[], projectId: number) {
    return await this.emissionSourceRecalService.bulkCalculate(this, unitIds, projectId, this.repo, sourceName.WeldingEs);
  }

  excellBulkUpload(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number, ownership: string, isMobile: boolean) {
    let dto = new WeldingEsActivityData();
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
  

  async create(createWeldingEsDto: WeldingEsActivityData) {
    const calculationData: WeldingEsDto = {
      year: createWeldingEsDto.year,
      ac: createWeldingEsDto.ac,
      lc: createWeldingEsDto.lc,
      ac_unit: createWeldingEsDto.ac_unit,
      lc_unit: createWeldingEsDto.lc_unit,
      baseData: await this.getBaseData(createWeldingEsDto)
    };

    createWeldingEsDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    createWeldingEsDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    createWeldingEsDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false
    
    const emission = await this.calculationService.calculate({
      sourceName: sourceName.WeldingEs,
      data: calculationData,
    });
    createWeldingEsDto.emission = emission.data;
    var json =emission.data;
    var obj = JSON.parse(json);

    this.updateTotalEmission(createWeldingEsDto, calculationData, emission)
    createWeldingEsDto.acetylene = obj.Acetylene ? obj.Acetylene : 0;
    createWeldingEsDto.liquidCo2 = obj.liquidCo2 ? obj.liquidCo2: 0;

    createWeldingEsDto.e_sc = emission.e_sc  ? emission.e_sc : 0;
    createWeldingEsDto.e_sc_co2 = emission.e_sc_co2  ? emission.e_sc_co2 : 0;
    createWeldingEsDto.e_sc_ch4 = emission.e_sc_ch4  ? emission.e_sc_ch4 : 0;
    createWeldingEsDto.e_sc_n2o = emission.e_sc_n2o  ? emission.e_sc_n2o : 0;

    return await this.weldingEsRepository.save(createWeldingEsDto);
  }


  findAll() {
    return this.weldingEsRepository.find();
  }


  async update(id: number, updateWeldingEsDto: WeldingEsActivityData) {

    const calculationData: WeldingEsDto = {
      year: updateWeldingEsDto.year,
      ac: updateWeldingEsDto.ac,
      lc: updateWeldingEsDto.lc,
      ac_unit: updateWeldingEsDto.ac_unit,
      lc_unit: updateWeldingEsDto.lc_unit,
      baseData: await this.getBaseData(updateWeldingEsDto)
    };

    updateWeldingEsDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    updateWeldingEsDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    updateWeldingEsDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.WeldingEs,
      data: calculationData,
    });
    if (updateWeldingEsDto.e_sc !== emission.e_sc){

      let current = await this.repo.findOne(id);
      let updatedEmission = this.calculationService.getDiff(current, emission);
      this.calculationService.updateTotalEmission(
        updatedEmission,
        updateWeldingEsDto.project,
        calculationData.baseData.clasification, 
        sourceName.WeldingEs,
        updateWeldingEsDto.unit.id
      );
    }
    updateWeldingEsDto.emission = emission.data;
    var json =emission.data;
    var obj = JSON.parse(json);

    updateWeldingEsDto.acetylene = obj.Acetylene ? obj.Acetylene: 0;
    updateWeldingEsDto.liquidCo2 = obj.liquidCo2 ? obj.liquidCo2: 0;

    updateWeldingEsDto.e_sc = emission.e_sc  ? emission.e_sc : 0;
    updateWeldingEsDto.e_sc_co2 = emission.e_sc_co2  ? emission.e_sc_co2 : 0;
    updateWeldingEsDto.e_sc_ch4 = emission.e_sc_ch4  ? emission.e_sc_ch4 : 0;
    updateWeldingEsDto.e_sc_n2o = emission.e_sc_n2o  ? emission.e_sc_n2o : 0;

    const updated = await this.repo.update( {
      id: id
    }, updateWeldingEsDto);
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
      sourceName.WeldingEs,
      deleteDto.unit.id
    );
    return await this.repo.delete({id: deleteDto.id});
  }

  async getBaseData(dto: WeldingEsActivityData): Promise<BaseDataDto> {
    let activityInfo =  new PuesDataReqActivityData()
    activityInfo.owenerShip = Ownership.getkey(dto.ownership)
    activityInfo.stationary = dto.stationary
    activityInfo.mobile = dto.mobile
    let req = new PuesDataReqDto()
    req.project = dto.project
    req.sourceName = sourceName.WeldingEs
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

  async updateTotalEmission(dto: WeldingEsActivityData, calData: WeldingEsDto, emission: any){
    let reqPues: PuesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.WeldingEs,
      unitId: dto.unit.id,
      emission: emission,
      classification: calData.baseData.clasification
    }

    await this.puesService.addEmission(reqPues)

    let reqPes : PesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.WeldingEs,
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



  async addFromExcell(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number){
    // this.sleep(100000);
    let units = this.parameterUnit.welding_units;


    // common --------------
    let dto = new WeldingEsActivityData();
    dto['unit'] = unit;
    dto['project'] = project;
    dto['user'] = user;

     console.log("data---",data);

    variable_mapping.forEach(vm=>{
      if(vm['V2']){
        if(vm['V1']){
          let val = data[vm['V1']];
          dto[vm['V2']] = val;
        }
      }
    })
    dto.year = year;
    // End of common --------------


   // fc_unit

   dto.ac_unit = units.ac[0].code; 
   dto.lc_unit = units.lc[0].code; 
   


    console.log("dto--",dto);

    try{
      return this.create(dto);
    }catch(err){
      console.log(err);
      return null;
    }
    // return null;
  }



}

