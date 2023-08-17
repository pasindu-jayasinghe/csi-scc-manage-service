import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { BaseDataDto } from 'src/emission/calculation/dto/emission-base-data.dto';
import { ElectricityActivityData } from 'src/emission/electricity/entities/electricity.entity';
import { ProjectEmissionSourceService } from 'src/emission/emission-source/service/project-emission-source.service';
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

import { CalculationService } from '../../calculation/calculation.service';
import { GeneratorDto } from '../../calculation/dto/generator.dto';
import { sourceName } from '../../enum/sourcename.enum';
import { GeneratorActivityData } from '../entities/generator.entity';
import { EmissionSourceRecalService } from 'src/emission/emission-source/service/emission-source-recal.service';
import { EmissionSourceBulkService } from 'src/emission/emission-source/service/emission-source-bulk.service';
import { VariableValidationType } from 'src/emission/enum/variable-validation-type.enum';
import { ProgressRetriever } from 'src/emission/progress-retriever';
import { ProgressDataResponseDto } from 'src/emission/dto/progress-data.dto';
import { ProgresReportService } from 'src/emission/emission-source/service/progres-report.service';
import { ProgressStatus } from 'src/emission/enum/progress-status.enum';
import { ExcelDownloader } from 'src/emission/excel-downloader';

@Injectable()
export class GeneratorService extends TypeOrmCrudService<GeneratorActivityData> implements ExcellUploadable, ProgressRetriever, ExcelDownloader {

  getDto() {
    return new GeneratorActivityData();
  }

  private excelBulkVariableMapping: {code: string, name: string, isRequired: boolean,type: VariableValidationType}[] = [    
    {code: "month", name: 'Month',isRequired: true,type:VariableValidationType.list},
    {code: "fc", name: 'Consumption',isRequired: true,type:VariableValidationType.number},
    {code: "fuelType", name: 'Fuel Types',isRequired: true,type:VariableValidationType.list},
    {code: "fc_unit", name: 'Fuel Consumption Unit',isRequired: true,type:VariableValidationType.list},
  ]

  constructor(
    @InjectRepository(GeneratorActivityData) repo,
    @InjectRepository(GeneratorActivityData)
    private readonly generatorRepository: Repository<GeneratorActivityData>,
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
    return this.excelBulkVariableMapping
  }
  async generateTableData(projectId: number, unitIds: number , paras: any[], ownership?: string) {
    let filter = 'project.id = :projectId AND unit.id IN (:unitIds)'
    let filterValues = {projectId: projectId, unitIds: unitIds}
    let acData = await this.getActivityData(filter, filterValues)

    let row1 = [
      { name: '', code: '' },
      { name: "Fuel consumption", colspan: true }
    ]
    let additionalCols = [{ name: 'Generator no', code: 'generatorNumber' }]

    let res = this.progresReportService.createTableData(
      acData,
      row1,
      additionalCols,
      'generatorNumber',
      'fc'
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
    let emissionSource = sourceName.Generator
    let parameters = [{name: 'Generator Number', code: 'generatorNumber'}]

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
          esName: 'Generator',
          completeness: ProgressStatus.COMPLETED,
          parameters: parameters
        })
      } else {
        allMonthFilled = this.progresReportService.checkCompleteness(activityData[key], true, true, {para: ['generatorNumber']})
        response.push({
          unit: key,
          unitName: activityData[key][0]['unitName'],
          es: emissionSource,
          esName: 'Generator',
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
        esName: 'Generator',
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
        esName: 'Generator',
        completeness: ProgressStatus.NOT_ASSIGNED,
        parameters: parameters
      })
    }

    return response
  }

  async bulkDelete(ids: number[], isPermant: boolean) {
    return await this.emissionSourceRecalService.bulkDelete(ids,isPermant, this);
  }

   async bulkCalculate(unitIds: number[], projectId: number) {
    return await this.emissionSourceRecalService.bulkCalculate(this, unitIds, projectId, this.repo, sourceName.Generator);
  }

  excellBulkUpload(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number, ownership: string, isMobile: boolean) {

    let dto = new GeneratorActivityData();
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

  async create(createGeneratorDto: GeneratorActivityData) {
    const calculationData: GeneratorDto = {
        year: createGeneratorDto.year,
        month: createGeneratorDto.month,
        fc: createGeneratorDto.fc,
        unit: createGeneratorDto.fc_unit,
        fuelType: createGeneratorDto.fuelType,
        baseData: await this.getBaseData(createGeneratorDto)
    };


    createGeneratorDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    createGeneratorDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    createGeneratorDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.Generator,
      data: calculationData,
    });

    if (emission && (emission.e_sc || emission.e_sc_co2 || emission.e_sc_ch4 || emission.e_sc_n2o)) {
      this.updateTotalEmission(createGeneratorDto, calculationData, emission)
    }

    createGeneratorDto.emission = emission.e_sc ? emission.e_sc : 0;

    createGeneratorDto.e_sc = emission.e_sc ? emission.e_sc : 0;
    createGeneratorDto.e_sc_co2 = emission.e_sc_co2 ? emission.e_sc_co2 : 0;
    createGeneratorDto.e_sc_ch4 = emission.e_sc_ch4 ? emission.e_sc_ch4 : 0;
    createGeneratorDto.e_sc_n2o = emission.e_sc_n2o ? emission.e_sc_n2o : 0;

    return await this.generatorRepository.save(createGeneratorDto);
  }

  async update(id: number, updateGeneratorDto: GeneratorActivityData) {

    const calculationData: GeneratorDto = {
      year: updateGeneratorDto.year,
      fc: updateGeneratorDto.fc,
      month: updateGeneratorDto.month,
      unit: updateGeneratorDto.fc_unit,
      fuelType: updateGeneratorDto.fuelType,
      baseData: await this.getBaseData(updateGeneratorDto)
    };

    updateGeneratorDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    updateGeneratorDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    updateGeneratorDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.Generator,
      data: calculationData,
    });

    if (updateGeneratorDto.e_sc !== emission.e_sc){
      let current = await this.repo.findOne(id);
      let updatedEmission = this.calculationService.getDiff(current, emission);
      this.calculationService.updateTotalEmission(
        updatedEmission,
        updateGeneratorDto.project,
        calculationData.baseData.clasification, 
        sourceName.Generator,
        updateGeneratorDto.unit.id
      );
    }
    updateGeneratorDto.emission = emission.e_sc?emission.e_sc :0;

    updateGeneratorDto.e_sc = emission.e_sc ? emission.e_sc : 0;
    updateGeneratorDto.e_sc_co2 = emission.e_sc_co2 ? emission.e_sc_co2 : 0;
    updateGeneratorDto.e_sc_ch4 = emission.e_sc_ch4 ? emission.e_sc_ch4 : 0;
    updateGeneratorDto.e_sc_n2o = emission.e_sc_n2o ? emission.e_sc_n2o : 0;

    const updated = await this.repo.update( {
      id: id
    }, updateGeneratorDto);
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
      sourceName.Generator,
      deleteDto.unit.id
    );
    return await this.repo.delete({id: deleteDto.id});
  }

  async getBaseData(dto: GeneratorActivityData): Promise<BaseDataDto> {
    let activityInfo =  new PuesDataReqActivityData()
    activityInfo.owenerShip = Ownership.getkey(dto.ownership)
    activityInfo.stationary = dto.stationary
    activityInfo.mobile = dto.mobile
    let req = new PuesDataReqDto()
    req.project = dto.project
    req.sourceName = sourceName.Generator
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

  async updateTotalEmission(dto: GeneratorActivityData, calData: GeneratorDto, emission: any){
    let reqPues: PuesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Generator,
      unitId: dto.unit.id,
      emission: emission,
      classification: calData.baseData.clasification
    }

    await this.puesService.addEmission(reqPues)

    let reqPes : PesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Generator,
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
    let units = this.parameterUnit.generator_units;
     console.log("uuuu--",units);


    // common --------------
    let dto = new GeneratorActivityData();
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
    switch(data.FUEL_TYPE) { 
    case 1: { 
      dto.fuelType = "PETROL_95";     
     break; 
    } 
    case 2: { 
      dto.fuelType = "DIESEL";    
       break; 
    } 
    case 3: { 
      dto.fuelType = "PETROL";     
      break;
    }
    case 4: { 
      dto.fuelType = "S_DIESEL";     
        break;
    }
    default: { 
       //statements; 
       break; 
    } 
    }

    switch(data.UNITS) { 
      case 1: { 
        dto.fc_unit = units.consumption[1].code;   
      break; 
      } 
      case 4: { 
        dto.fc_unit = units.consumption[0].code;     
        break; 
      } 
      case 6: { 
        dto.fc_unit = units.consumption[2].code;  
        break;
      }
      default: { 
        //statements; 
        break; 
      } 
    }
  

    // dto.fc_unit = units.consumption[0].code;

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
