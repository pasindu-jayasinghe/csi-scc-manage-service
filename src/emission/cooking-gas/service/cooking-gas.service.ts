import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CalculationService } from '../../calculation/calculation.service';
import { In, Repository } from 'typeorm';
import { sourceName } from 'src/emission/enum/sourcename.enum';
import { CookingGasActivityData } from '../entities/cooking-gas.entity';
import { CookingGasDto } from 'src/emission/calculation/dto/cooking-gas.dto';
import { BaseDataDto } from 'src/emission/calculation/dto/emission-base-data.dto';
import { PuesDataReqActivityData, PuesDataReqDto } from 'src/project/dto/pues-data-req.dto';
import { ProjectUnitEmissionSourceService } from 'src/project/service/project-unit-emission-source.service';
import { ElectricityActivityData } from 'src/emission/electricity/entities/electricity.entity';
import { PuesSumDataReqDto, PesSumDataReqDto, ProjectSumDataReqDto } from 'src/project/dto/update-total-emission-req.dto';
import { Ownership } from 'src/project/enum/ownership.enum';
import { ProjectEmissionSourceService } from 'src/emission/emission-source/service/project-emission-source.service';
import { ProjectService } from 'src/project/service/project.service';
import { Clasification } from 'src/project/enum/clasification.enum';
import { ExcellUploadable } from 'src/emission/excell-uploadable';
import { BulckUpdatable } from 'src/emission/bulck-updatable';
import { Project } from 'src/project/entities/project.entity';
import { Unit } from 'src/unit/entities/unit.entity';
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
export class CookingGasService extends TypeOrmCrudService<CookingGasActivityData> implements ExcellUploadable , BulckUpdatable, ProgressRetriever, ExcelDownloader{

  getDto() {
    return new CookingGasActivityData();
  }

  private excelBulkVariableMapping: {code: string, name: string,isRequired: boolean,type: VariableValidationType}[] = [    
    {code: "month", name: 'Month',isRequired: true,type:VariableValidationType.list},
    {code: "emissionSource", name: "Emission Source",isRequired: true,type:VariableValidationType.list},
    {code: "gasType", name: "Gas Type",isRequired: true,type:VariableValidationType.list},
    {code: "fcn", name: "Consumption",isRequired: true,type:VariableValidationType.list},
    {code: "fcn_unit", name: "Consumption Unit",isRequired: true,type:VariableValidationType.list}
  ]
  constructor(
    @InjectRepository(CookingGasActivityData) repo,
    @InjectRepository(CookingGasActivityData)
    private readonly cookingGasRepository: Repository<CookingGasActivityData>,
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
    let filter = 'project.id = :projectId AND unit.id IN (:unitIds) AND emissionSource = :ownership'
    let filterValues = {projectId: projectId, unitIds: unitIds, ownership: ownership}
    let acData = await this.getActivityData(filter, filterValues)

    let row1 = [
      { name: '', code: '' },
      { name: "Consumption", colspan: true }
    ]
    let additionalCols = [{ name: 'Gas type', code: 'gasType' }]

    let res = this.progresReportService.createTableData(
      acData,
      row1,
      additionalCols,
      'gasType',
      'fcn'
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
    let emissionSource = sourceName.cooking_gas
    let gasTypes = ['LP Gas', 'Biogas']

    activityData = this.progresReportService.group(activityData, 'emissionSource')

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
            esName: 'Cooking Gas - '+ ownership,
            completeness: ProgressStatus.COMPLETED
          })
        } else {
          if (ownership === 'LP Gas') {
            allMonthFilled = this.progresReportService.checkCompleteness(activityDataUnit[key], true, false)
          } else if (ownership === 'Biogas'){
            allMonthFilled = this.progresReportService.checkCompleteness(activityDataUnit[key], true, true)
          }
          response.push({
            unit: key,
            unitName: activityDataUnit[key][0]['unitName'],
            es: emissionSource + '_' + ownership,
            esName: 'Cooking Gas - ' + ownership,
            completeness: allMonthFilled.isCompleted,
            unFilled: allMonthFilled.unFilled
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
          esName: 'Cooking Gas - ' + key,
          completeness: ProgressStatus.NOT_ENTERED
        })
      }
      for await (const e of notAssignedIds) {
        let unit = await this.unitRepo.findOne({ id: e })
        response.push({
          unit: e.toString(),
          unitName: unit.name,
          es: emissionSource + '_' + key,
          esName: 'Cooking Gas - ' + key,
          completeness: ProgressStatus.NOT_ASSIGNED
        })
      }
    }

    return response
  }

  async bulkDelete(ids: number[], isPermant: boolean) {
    return await this.emissionSourceRecalService.bulkDelete(ids,isPermant, this);
  }

   async bulkCalculate(unitIds: number[], projectId: number) {
    return await this.emissionSourceRecalService.bulkCalculate(this, unitIds, projectId, this.repo, sourceName.cooking_gas);
  }

  excellBulkUpload(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number, ownership: string, isMobile: boolean) {
    let dto = new CookingGasActivityData();
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

  
  
  async create(createCookingGasDto: CookingGasActivityData) {
    const calculationData: CookingGasDto = {
      year: createCookingGasDto.year,
      fcn: createCookingGasDto.fcn,
      emissionSource: createCookingGasDto.emissionSource,
      gasType: createCookingGasDto.gasType,
      fcnUnit: createCookingGasDto.fcn_unit,
      baseData: await this.getBaseData(createCookingGasDto)
    };

    createCookingGasDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    createCookingGasDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    createCookingGasDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false
    
    const emission = await this.calculationService.calculate({
      sourceName: sourceName.cooking_gas,
      data: calculationData,
    });

    // this.updateTotalEmission(createCookingGasDto, calculationData, emission)

    let updatedEmission = this.calculationService.getDiff(null, emission);
    this.calculationService.updateTotalEmission(
      updatedEmission,
      createCookingGasDto.project,
      calculationData.baseData.clasification,
      sourceName.cooking_gas,
      createCookingGasDto.unit.id
    );

    createCookingGasDto.emission = emission.data;
    createCookingGasDto.e_sc = emission.e_sc  ? emission.e_sc : 0;
    createCookingGasDto.e_sc_co2 = emission.e_sc_co2  ? emission.e_sc_co2 : 0;
    createCookingGasDto.e_sc_ch4 = emission.e_sc_ch4  ? emission.e_sc_ch4 : 0;
    createCookingGasDto.e_sc_n2o = emission.e_sc_n2o  ? emission.e_sc_n2o : 0;

    // var json =emission.data;
    // var obj = JSON.parse(json);

    // createCookingGasDto.e_sc_co2 = obj.e_sc_co2;
    // createCookingGasDto.e_sc_ch4 = obj.e_sc_ch4;
    // createCookingGasDto.e_sc_n2o = obj.e_sc_n2o;
    // createCookingGasDto.e_sc = obj.e_sc;


    return await this.cookingGasRepository.save(createCookingGasDto);
  }

  findAll() {
    return `This action returns all cookingGas`;
  }


  async update(id: number, updateCookingGasDto: CookingGasActivityData) {
    const calculationData: CookingGasDto = {
      year: updateCookingGasDto.year,
      fcn: updateCookingGasDto.fcn,
      emissionSource: updateCookingGasDto.emissionSource,
      gasType: updateCookingGasDto.gasType,
      fcnUnit: updateCookingGasDto.fcn_unit,
      baseData: await this.getBaseData(updateCookingGasDto)
    };

    updateCookingGasDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    updateCookingGasDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    updateCookingGasDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.cooking_gas,
      data: calculationData,
    });

    if (updateCookingGasDto.e_sc !== emission.e_sc){
      let current = await this.repo.findOne(id);
      let updatedEmission = this.calculationService.getDiff(current, emission);
      this.calculationService.updateTotalEmission(
        updatedEmission,
        updateCookingGasDto.project,
        calculationData.baseData.clasification, 
        sourceName.cooking_gas,
        updateCookingGasDto.unit.id
      );
    }
    updateCookingGasDto.emission = emission.data;
    
    updateCookingGasDto.e_sc = emission.e_sc  ? emission.e_sc : 0;
    updateCookingGasDto.e_sc_co2 = emission.e_sc_co2  ? emission.e_sc_co2 : 0;
    updateCookingGasDto.e_sc_ch4 = emission.e_sc_ch4  ? emission.e_sc_ch4 : 0;
    updateCookingGasDto.e_sc_n2o = emission.e_sc_n2o  ? emission.e_sc_n2o : 0;
    // var json =emission.data;
    // var obj = JSON.parse(json);

    // updateCookingGasDto.e_sc_co2 = obj.e_sc_co2;
    // updateCookingGasDto.e_sc_ch4 = obj.e_sc_ch4;
    // updateCookingGasDto.e_sc_n2o = obj.e_sc_n2o;
    // updateCookingGasDto.e_sc = obj.e_sc;
    
    const updated = await this.repo.update( {
      id: id
    }, updateCookingGasDto);
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
    sourceName.cooking_gas,
    deleteDto.unit.id
  );
  return await this.repo.delete({id: deleteDto.id});
}

  async getBaseData(dto: CookingGasActivityData): Promise<BaseDataDto> {
    let activityInfo =  new PuesDataReqActivityData()
    activityInfo.owenerShip = Ownership.getkey(dto.ownership)
    activityInfo.stationary = dto.stationary
    activityInfo.mobile = dto.mobile
    let req = new PuesDataReqDto()
    req.project = dto.project
    req.sourceName = sourceName.cooking_gas
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


  async updateTotalEmission(dto: CookingGasActivityData, calData: CookingGasDto, emission: any){
    let reqPues: PuesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.cooking_gas,
      unitId: dto.unit.id,
      classification: calData.baseData.clasification,
      emission: emission
    }

    await this.puesService.addEmission(reqPues)

    let reqPes : PesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.cooking_gas,
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

  addFromExcell(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number) {
        let units = this.parameterUnit.cooking_gas_units;


        // common --------------
        let dto = new CookingGasActivityData();
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

        // End of common --------------

        dto.year = year;
        dto.fcn_unit = units.consumption[0].code;

        console.log("--------------------------")
        console.log(dto.emissionSource);
        console.log(data.gasType)
        try{
          return this.create(dto);
        }catch(err){
          console.log(err);
          return null;
        }
  }
}
