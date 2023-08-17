import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { In, Repository } from 'typeorm';
import { CalculationService } from '../../calculation/calculation.service';
import { BoilerDto } from 'src/emission/calculation/dto/boiler.dto';
import { BoilerActivityData } from '../entities/boiler.entity';
import { sourceName } from 'src/emission/enum/sourcename.enum';
import { BaseDataDto } from 'src/emission/calculation/dto/emission-base-data.dto';
import { ProjectEmissionSourceService } from 'src/emission/emission-source/service/project-emission-source.service';
import { PuesDataReqActivityData, PuesDataReqDto } from 'src/project/dto/pues-data-req.dto';
import { PuesSumDataReqDto, PesSumDataReqDto, ProjectSumDataReqDto } from 'src/project/dto/update-total-emission-req.dto';
import { Ownership } from 'src/project/enum/ownership.enum';
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
import { ExcelDownloader } from 'src/emission/excel-downloader';



@Injectable()
export class BoilerService extends TypeOrmCrudService<BoilerActivityData> implements ExcellUploadable , BulckUpdatable, ProgressRetriever, ExcelDownloader{
  

  getDto() {
    return new BoilerActivityData();
  }

  private excelBulkVariableMapping: {code: string, name: string,isRequired: boolean,type: VariableValidationType}[] = [
    {code: "month", name: 'Month',isRequired: true,type:VariableValidationType.list},
    {code: "purpose", name: 'Purpose',isRequired: false,type:VariableValidationType.text},
    {code: "fuelType", name: 'Fuel Type',isRequired: true,type:VariableValidationType.list},
    {code: "fuel", name: 'Fuel',isRequired: true,type:VariableValidationType.list},
    {code: "consumption", name: 'Consumption',isRequired: true,type:VariableValidationType.number},
    {code: "consumption_unit", name: 'Consumption Unit',isRequired: true,type:VariableValidationType.list}
  ]


  constructor(
    @InjectRepository(BoilerActivityData) repo,
    @InjectRepository(BoilerActivityData)
    private readonly boilerRepository: Repository<BoilerActivityData>,
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
    let filter = 'project.id = :projectId AND unit.id IN (:unitIds)'
    let filterValues = {projectId: projectId, unitIds: unitIds}
    let acData = await this.getActivityData(filter, filterValues)

    let row1 = [
      { name: '', code: '' },
      { name: "Consumption", colspan: true }
    ]
    let additionalCols = [{ name: 'Fuel Type', code: 'fuelType' }]

    let res = this.progresReportService.createTableData(
      acData,
      row1,
      additionalCols,
      'fuelType',
      'consumption'
    )

    return res
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
    let emissionSource = sourceName.Boilers
    let parametres = [{name: 'Fuel Type', code: 'fuelType'}]

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
          esName: 'Boiler',
          completeness: ProgressStatus.COMPLETED,
          parameters: parametres
        })
      } else {
        allMonthFilled = this.progresReportService.checkCompleteness(activityData[key], true, true, {para: ['fuelType'], uniquValues: [{fuelType: "Furnace Oil"}, {fuelType: "Solid Biomass"}]})
        response.push({
          unit: key,
          unitName: activityData[key][0]['unitName'],
          es: emissionSource,
          esName: 'Boiler',
          completeness: allMonthFilled.isCompleted,
          unFilled: allMonthFilled.unFilled,
          parameters: parametres
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
        esName: 'Boiler',
        completeness: ProgressStatus.NOT_ENTERED,
        parameters: parametres
      })
    }

    for await (const e of notAssignedIds) {
      let unit = await this.unitRepo.findOne({id: e})
      response.push({
        unit: e.toString(),
        unitName: unit.name,
        es: emissionSource,
        esName: 'Boiler',
        completeness: ProgressStatus.NOT_ASSIGNED,
        parameters: parametres
      })
    }

    return response
  }

  async bulkDelete(ids: number[], isPermant: boolean) {
    return await this.emissionSourceRecalService.bulkDelete(ids,isPermant, this);
  }

   async bulkCalculate(unitIds: number[], projectId: number) {
    return await this.emissionSourceRecalService.bulkCalculate(this, unitIds, projectId, this.repo, sourceName.Boilers);
  }

  
  excellBulkUpload(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number, ownership: string, isMobile: boolean) {

    let dto = new BoilerActivityData();
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

  async create(createBoilerDto: BoilerActivityData) {
    const calculationData: BoilerDto = {
      year: createBoilerDto.year,
      purpose: createBoilerDto.purpose,
      fuelType: createBoilerDto.fuelType,
      fuel:createBoilerDto.fuel,
      consumption: createBoilerDto.consumption,
      consumption_unit: createBoilerDto.consumption_unit,
      baseData: await this.getBaseData(createBoilerDto)
    };

    createBoilerDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    createBoilerDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    createBoilerDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false
    
    const emission = await this.calculationService.calculate({
      sourceName: sourceName.Boilers,
      data: calculationData,
    });

    this.updateTotalEmission(createBoilerDto, calculationData, emission.e_sc ? emission.e_sc : 0)
    // createBoilerDto.emission = emission.data?emission.data:0;
    createBoilerDto.emission =emission&&emission.e_sc  ? emission.e_sc+'' : '0';
    createBoilerDto.e_sc = emission&&emission.e_sc  ? emission.e_sc : 0;
    createBoilerDto.e_sc_co2 = emission&&emission.e_sc_co2  ? emission.e_sc_co2 : 0;
    createBoilerDto.e_sc_ch4 = emission&&emission.e_sc_ch4  ? emission.e_sc_ch4 : 0;
    createBoilerDto.e_sc_n2o = emission&&emission.e_sc_n2o  ? emission.e_sc_n2o : 0;

    // var json =emission.result;
    // var obj = JSON.parse(json);

    // createBoilerDto.e_sc_co2 = obj.e_sc_co2;
    // createBoilerDto.e_sc_ch4 = obj.e_sc_ch4;
    // createBoilerDto.e_sc_n2o = obj.e_sc_n2o;
    // createBoilerDto.e_sc = obj.e_sc;

    return await this.boilerRepository.save(createBoilerDto);
  }

  

  findAll() {
    return this.boilerRepository.find();
  }



  async update(id: number, updateBoilerDto: BoilerActivityData) {

    const calculationData: BoilerDto = {
      year: updateBoilerDto.year,
      purpose: updateBoilerDto.purpose,
      fuelType: updateBoilerDto.fuelType,
      fuel:updateBoilerDto.fuel,
      consumption: updateBoilerDto.consumption,
      consumption_unit: updateBoilerDto.consumption_unit,
      baseData: await this.getBaseData(updateBoilerDto)
    };

    updateBoilerDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    updateBoilerDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    updateBoilerDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.Boilers,
      data: calculationData,
    });

    if (updateBoilerDto.e_sc !== emission.e_sc){
      let current = await this.repo.findOne(id);
      let updatedEmission = this.calculationService.getDiff(current, emission);
      this.calculationService.updateTotalEmission(
        updatedEmission,
        updateBoilerDto.project,
        calculationData.baseData.clasification, 
        sourceName.Boilers,
        updateBoilerDto.unit.id
      );
    }
    // updateBoilerDto.emission = emission.data?emission.data:0;
    updateBoilerDto.emission =emission&&emission.e_sc  ? emission.e_sc+'' : '0';
    updateBoilerDto.e_sc = emission&&emission.e_sc  ? emission.e_sc : 0;
    updateBoilerDto.e_sc_co2 = emission&&emission.e_sc_co2  ? emission.e_sc_co2 : 0;
    updateBoilerDto.e_sc_ch4 = emission&&emission.e_sc_ch4  ? emission.e_sc_ch4 : 0;
    updateBoilerDto.e_sc_n2o = emission&&emission.e_sc_n2o  ? emission.e_sc_n2o : 0;
    
    // var json =emission.result;
    // var obj = JSON.parse(json);

    // updateBoilerDto.e_sc_co2 = obj.e_sc_co2;
    // updateBoilerDto.e_sc_ch4 = obj.e_sc_ch4;
    // updateBoilerDto.e_sc_n2o = obj.e_sc_n2o;
    // updateBoilerDto.e_sc = obj.e_sc;
    
    const updated = await this.repo.update( {
      id: id
    }, updateBoilerDto);
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
      sourceName.Boilers,
      deleteDto.unit.id
    );
    return await this.repo.delete({id: deleteDto.id});
  }

  async getBaseData(dto: BoilerActivityData): Promise<BaseDataDto> {
    let activityInfo =  new PuesDataReqActivityData()
    activityInfo.owenerShip = Ownership.getkey(dto.ownership)
    activityInfo.stationary = dto.stationary
    activityInfo.mobile = dto.mobile
    let req = new PuesDataReqDto()
    req.project = dto.project
    req.sourceName = sourceName.Boilers
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

  async updateTotalEmission(dto: BoilerActivityData, calData: BoilerDto, emission: any){
    let reqPues: PuesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Boilers,
      unitId: dto.unit.id,
      classification: calData.baseData.clasification,
      emission: emission
    }

    await this.puesService.addEmission(reqPues)

    let reqPes : PesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Electricity,
      classification: calData.baseData.clasification,
      emission: emission
    }
    this.pesService.addEmission(reqPes)

    let reqProject: ProjectSumDataReqDto = {
      project: dto.project,
      classification: calData.baseData.clasification,
      emission: emission
    }
    this.projectService.addEmission(reqProject)
  }

    /**
   * 
   * @param unit 
   * @param project 
   * @param user 
   * @param data : { key: value } Es: {  "ADDED_BY": 0 }
   * @param variable_mapping : { V1: string, V2: string   }[]
   * @param year 
   * @returns 
   */
    async addFromExcell(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number){
      // this.sleep(100000);
      console.log("datas",data);
      let units = this.parameterUnit.boiler_units;
      // console.log(units);
      if (data.fuelType === 'NULL' || data.biomassType === 0) {
        console.log("not save");
        return null;
      }else {
        console.log("qqqqqqqqqqqq");
      // common --------------
      let dto = new BoilerActivityData();
      dto['unit'] = unit;
      dto['project'] = project;
      dto['user'] = user;
  
       
  
      variable_mapping.forEach(vm=>{
        if(vm['V2']){
          if(vm['default-v2']){
            dto[vm['V2']] = vm['default-v2'];
          }else if(vm['V1']){
            let val = data[vm['V1']];
            dto[vm['V2']] = val;
          }
        }
      })
      dto.year = year;
      // End of common --------------
  
  
      if(data.fuelType){   
        dto.consumption_unit = units.consumption[0].code;

        switch(data.fuelType) { 
          case "FurnaceOil": { 
            dto.fuel = "RESIDUAL_FUEL_OIL";     
           break; 
          } 
          case "MarineGasOil": { 
            dto.fuel = "MARINE_GAS_OIL";    
             break; 
          } 
          
          default: { 
             //statements; 
             break; 
          } 
       }


      }else if(data.biomassType){
        dto.consumption_unit = units.consumption[1].code;

        switch(data.biomassType) { 
          case 1: { 
            dto.fuel = "WOOD_CHIPS";     
           break; 
          } 
          case 2: { 
            dto.fuel = "SAW_DUST";    
             break; 
          } 
          case 3: { 
            dto.fuel = "OTHER_PRIMARY_SOLID_BIOMASS";     
            break;
          }
          default: { 
             //statements; 
             break; 
          } 
       }

      }
  

    try{
      return this.create(dto);
    }catch(err){
      //console.log("err",err)
      return null;
    }
  }
      
  }
  
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
}
