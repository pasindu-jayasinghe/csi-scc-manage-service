import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CalculationService } from '../../calculation/calculation.service';
import { In, Repository } from 'typeorm';
import { MunicipalWaterActivityData } from '../entities/municipal-water.entity';
import { municipalWaterDto } from 'src/emission/calculation/dto/municipal-water.dto';
import { sourceName } from 'src/emission/enum/sourcename.enum';
import { BaseDataDto } from 'src/emission/calculation/dto/emission-base-data.dto'; 
import { PuesDataReqActivityData, PuesDataReqDto } from 'src/project/dto/pues-data-req.dto';
import { PuesSumDataReqDto, PesSumDataReqDto, ProjectSumDataReqDto } from 'src/project/dto/update-total-emission-req.dto';
import { Ownership } from 'src/project/enum/ownership.enum';
import { ProjectEmissionSourceService } from 'src/emission/emission-source/service/project-emission-source.service';
import { ProjectUnitEmissionSourceService } from 'src/project/service/project-unit-emission-source.service';
import { ProjectService } from 'src/project/service/project.service';
import { Clasification } from 'src/project/enum/clasification.enum';
import { Unit } from 'src/unit/entities/unit.entity';
import { Project } from 'src/project/entities/project.entity';
import { User } from 'src/users/user.entity';
import { ParameterUnit } from 'src/utills/parameter-units';
import { ExcellUploadable } from 'src/emission/excell-uploadable';
import { BulckUpdatable } from 'src/emission/bulck-updatable';
import { EmissionSourceRecalService } from 'src/emission/emission-source/service/emission-source-recal.service';
import { EmissionSourceBulkService } from 'src/emission/emission-source/service/emission-source-bulk.service';
import { VariableValidationType } from 'src/emission/enum/variable-validation-type.enum';
import { ProgressRetriever } from 'src/emission/progress-retriever';
import { ProgressDataResponseDto } from 'src/emission/dto/progress-data.dto';
import { ProgresReportService } from 'src/emission/emission-source/service/progres-report.service';
import { ProgressStatus } from 'src/emission/enum/progress-status.enum';
import { ExcelDownloader } from 'src/emission/excel-downloader';

@Injectable()
export class MunicipalWaterService extends TypeOrmCrudService<MunicipalWaterActivityData> implements ExcellUploadable , BulckUpdatable, ProgressRetriever, ExcelDownloader{

  getDto() {
    return new MunicipalWaterActivityData();
  }

  private excelBulkVariableMapping: {code: string, name: string,isRequired: boolean,type: VariableValidationType}[] = [    
    {code: "month", name: 'Month',isRequired: true,type:VariableValidationType.list},
    {code: "meterNo", name: "Meter No",isRequired: true,type:VariableValidationType.textOrNumber},
    {code: "consumption", name: "Consumption",isRequired: true,type:VariableValidationType.number},
    {code: "consumption_unit", name: "Consumption Unit",isRequired: true,type:VariableValidationType.list},
    {code: "category", name: "Category",isRequired: false,type:VariableValidationType.list},
  ]

  constructor(
    @InjectRepository(MunicipalWaterActivityData) repo,
    @InjectRepository(MunicipalWaterActivityData)
    private readonly municipalWaterRepository: Repository<MunicipalWaterActivityData>,
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
    let additionalCols = [{ name: 'Meter no', code: 'meterNo' }]

    let res = this.progresReportService.createTableData(
      acData,
      row1,
      additionalCols,
      'meterNo',
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
      .where (filter, filterValues)
      return await data.getMany()
  }
  async getProgressData(projectId: number, unitIds: number[]) {
    let allMonthFilled: any = {}
    let response = []
    let activityData = await this.repo.find({ project: { id: projectId }, unit: { id: In(unitIds) } })
    let emissionSource = sourceName.Municipal_water
    let parameters = [{name: 'Meter No', code: 'meterNo'}]

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
          esName: 'Municipal Water',
          completeness: ProgressStatus.COMPLETED,
          parameters: parameters
        })
      } else {
        allMonthFilled = this.progresReportService.checkCompleteness(activityData[key], true, true, {para: ['meterNo']})
        response.push({
          unit: key,
          unitName: activityData[key][0]['unitName'],
          es: emissionSource,
          esName: 'Municipal Water',
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
        esName: 'Municipal Water',
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
        esName: 'Municipal Water',
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
    return await this.emissionSourceRecalService.bulkCalculate(this, unitIds, projectId, this.repo, sourceName.Municipal_water);
  }

  excellBulkUpload(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number, ownership: string, isMobile: boolean) {
    let dto = new MunicipalWaterActivityData();
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
  
  
  async create(createMunicipalWaterDto: MunicipalWaterActivityData) {
    const calculationData: municipalWaterDto = {
      year: createMunicipalWaterDto.year,
      unit: createMunicipalWaterDto.consumption_unit,
      consumption: createMunicipalWaterDto.consumption,
      meterNo: createMunicipalWaterDto.meterNo,
      category: createMunicipalWaterDto.category,
      baseData: await this.getBaseData(createMunicipalWaterDto)  
    };

    createMunicipalWaterDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    createMunicipalWaterDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    createMunicipalWaterDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false

    
    const emission = await this.calculationService.calculate({
      sourceName: sourceName.Municipal_water,
      data: calculationData,
    });

    this.updateTotalEmission(createMunicipalWaterDto, calculationData, emission)
    createMunicipalWaterDto.emission = emission.e_sc? emission.e_sc : 0;

    createMunicipalWaterDto.e_sc = emission.e_sc  ? emission.e_sc : 0;
    createMunicipalWaterDto.e_sc_co2 = emission.e_sc_co2  ? emission.e_sc_co2 : 0;
    createMunicipalWaterDto.e_sc_ch4 = emission.e_sc_ch4  ? emission.e_sc_ch4 : 0;
    createMunicipalWaterDto.e_sc_n2o = emission.e_sc_n2o  ? emission.e_sc_n2o : 0;

    return await this.municipalWaterRepository.save(createMunicipalWaterDto);
  }

  findAll() {
    return this.municipalWaterRepository.find();
  }


  async update(id: number, updateMunicipalWaterDto: MunicipalWaterActivityData) {
    const calculationData: municipalWaterDto = {
      year: updateMunicipalWaterDto.year,
      unit: updateMunicipalWaterDto.consumption_unit,
      consumption: updateMunicipalWaterDto.consumption,
      meterNo: updateMunicipalWaterDto.meterNo,
      category: updateMunicipalWaterDto.category,
      baseData: await this.getBaseData(updateMunicipalWaterDto)
    };

    updateMunicipalWaterDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    updateMunicipalWaterDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    updateMunicipalWaterDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false


    const emission = await this.calculationService.calculate({
      sourceName: sourceName.Municipal_water,
      data: calculationData,
    });

    if (updateMunicipalWaterDto.e_sc !== emission.e_sc){
      let current = await this.repo.findOne(id);
      let updatedEmission = this.calculationService.getDiff(current, emission);
      this.calculationService.updateTotalEmission(
        updatedEmission,
        updateMunicipalWaterDto.project,
        calculationData.baseData.clasification, 
        sourceName.Municipal_water,
        updateMunicipalWaterDto.unit.id
      );
    }
    updateMunicipalWaterDto.emission = emission.e_sc ? emission.e_sc : 0;

    updateMunicipalWaterDto.e_sc = emission.e_sc  ? emission.e_sc : 0;
    updateMunicipalWaterDto.e_sc_co2 = emission.e_sc_co2  ? emission.e_sc_co2 : 0;
    updateMunicipalWaterDto.e_sc_ch4 = emission.e_sc_ch4  ? emission.e_sc_ch4 : 0;
    updateMunicipalWaterDto.e_sc_n2o = emission.e_sc_n2o  ? emission.e_sc_n2o : 0;
    
    const updated = await this.repo.update( {
      id: id
    }, updateMunicipalWaterDto);
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
      sourceName.Municipal_water,
      deleteDto.unit.id
    );
    return await this.repo.delete({id: deleteDto.id});
  }

  async getBaseData(dto: MunicipalWaterActivityData): Promise<BaseDataDto> {
    let activityInfo =  new PuesDataReqActivityData()
    activityInfo.owenerShip = Ownership.getkey(dto.ownership)
    activityInfo.stationary = dto.stationary
    activityInfo.mobile = dto.mobile
    let req = new PuesDataReqDto()
    req.project = dto.project
    req.sourceName = sourceName.Municipal_water
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

  async updateTotalEmission(dto: MunicipalWaterActivityData, calData: municipalWaterDto, emission: any){
    let reqPues: PuesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Municipal_water,
      unitId: dto.unit.id,
      emission: emission,
      classification: calData.baseData.clasification
    }

    await this.puesService.addEmission(reqPues)

    let reqPes : PesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Municipal_water,
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
      let units = this.parameterUnit.municipal_water_units;
      // console.log(units);
  console.log("year",year)
      if (data.UNITS === 0) {
        console.log("not save");
        return null;
      }else {
  
          // common --------------
          let dto = new MunicipalWaterActivityData();
          dto['unit'] = unit;
          dto['project'] = project;
          dto['user'] = user;
      
          // console.log(data);
      
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
      
          switch(data.UNITS) { 
            case 1: { 
              dto.consumption_unit = units.consumption[0].code; 
              dto.category = null; 
             break; 
            } 
            case 6: { 
              dto.consumption_unit = units.consumption[2].code;
               break; 
            } 
            default: { 
               //statements; 
               break; 
            } 
         }
      
      
          // console.log(dto);
      
          try{
            return this.create(dto);
          }catch(err){
            console.log(err);
            return null;
          }
          // return null;
        }

      }
      
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

}
