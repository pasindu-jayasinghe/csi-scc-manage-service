import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { In, Repository } from 'typeorm';
import { sourceName } from '../../enum/sourcename.enum';
import { CalculationService } from '../../calculation/calculation.service';
import { WasteDisposalActivityData } from '../entities/waste-disposal.entity';
import { wasteDisposalDto } from 'src/emission/calculation/dto/waste-disposal.dto';
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
import { ExcelDownloader } from 'src/emission/excel-downloader';

@Injectable()
export class WasteDisposalService extends TypeOrmCrudService<WasteDisposalActivityData> implements ExcellUploadable , BulckUpdatable, ProgressRetriever, ExcelDownloader{

  getDto() {
    return new WasteDisposalActivityData();
  }

  private excelBulkVariableMapping: {code: string, name: string,isRequired: boolean,type: VariableValidationType}[] = [    
    {code: "month", name: 'Month',isRequired: true,type:VariableValidationType.list},
    {code: "disposalMethod", name: "Disposal Method",isRequired: true,type:VariableValidationType.list},
    {code: "wasteType", name: "Waste Type",isRequired: true,type:VariableValidationType.list},
    {code: "amountDisposed", name: "Amount Disposed",isRequired: true,type:VariableValidationType.list},
    {code: "amountDisposed_unit", name: "Amount Disposed Unit",isRequired: true,type:VariableValidationType.list}
  ]

  constructor(
    @InjectRepository(WasteDisposalActivityData) repo,
    @InjectRepository(WasteDisposalActivityData)
    private readonly wasteDisposalRepository: Repository<WasteDisposalActivityData>,
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

    let row1 = [
      { name: '', code: '' },
      { name: "Amount Disposed", colspan: true }
    ]
    let additionalCols = [{ name: 'Waste type', code: 'wasteType' }]

    let res = this.progresReportService.createTableData(
      acData,
      row1,
      additionalCols,
      'wasteType',
      'amountDisposed'
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
    let emissionSource = sourceName.waste_disposal

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
          esName: 'Waste Disposal',
          completeness: ProgressStatus.COMPLETED
        })
      } else {
        console.log( activityData[key][0]['unitName'])
        allMonthFilled = this.progresReportService.checkCompleteness(activityData[key], true, true)
        response.push({
          unit: key,
          unitName: activityData[key][0]['unitName'],
          es: emissionSource,
          esName: 'Waste Disposal',
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
        esName: 'Waste Disposal',
        completeness: ProgressStatus.NOT_ENTERED
      })
    }

    for await (const e of notAssignedIds) {
      let unit = await this.unitRepo.findOne({id: e})
      response.push({
        unit: e.toString(),
        unitName: unit.name,
        es: emissionSource,
        esName: 'Waste Disposal',
        completeness: ProgressStatus.NOT_ASSIGNED
      })
    }

    return response
  }

  async bulkDelete(ids: number[], isPermant: boolean) {
    return await this.emissionSourceRecalService.bulkDelete(ids,isPermant, this);
  }

   async bulkCalculate(unitIds: number[], projectId: number) {
    return await this.emissionSourceRecalService.bulkCalculate(this, unitIds, projectId, this.repo, sourceName.waste_disposal);
  }

  excellBulkUpload(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number, ownership: string, isMobile: boolean) {
    let dto = new WasteDisposalActivityData();
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
  
  async create(createWasteDisposalDto: WasteDisposalActivityData) {
    const calculationData: wasteDisposalDto = {
      year: createWasteDisposalDto.year,
      disposalMethod: createWasteDisposalDto.disposalMethod,
      amountDisposed: createWasteDisposalDto.amountDisposed,
      wasteType: createWasteDisposalDto.wasteType,
      amountDisposedUnit: createWasteDisposalDto.amountDisposed_unit,
      baseData: await this.getBaseData(createWasteDisposalDto),
      month: createWasteDisposalDto.month,
    };

    createWasteDisposalDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    createWasteDisposalDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    createWasteDisposalDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false
    
    const emission = await this.calculationService.calculate({
      sourceName: sourceName.waste_disposal,
      data: calculationData,
    });
    this.updateTotalEmission(createWasteDisposalDto, calculationData, emission)
    createWasteDisposalDto.emission = emission.e_sc  ? emission.e_sc : 0;

    createWasteDisposalDto.e_sc = emission.e_sc  ? emission.e_sc : 0;
    createWasteDisposalDto.e_sc_co2 = emission.e_sc_co2  ? emission.e_sc_co2 : 0;
    createWasteDisposalDto.e_sc_ch4 = emission.e_sc_ch4  ? emission.e_sc_ch4 : 0;
    createWasteDisposalDto.e_sc_n2o = emission.e_sc_n2o  ? emission.e_sc_n2o : 0;

    return await this.wasteDisposalRepository.save(createWasteDisposalDto);
  }

  findAll() {
    return this.wasteDisposalRepository.find();
  }


  async update(id: number, updateWasteDisposalDto: WasteDisposalActivityData) {
    const calculationData: wasteDisposalDto = {
      year: updateWasteDisposalDto.year,
      disposalMethod: updateWasteDisposalDto.disposalMethod,
      amountDisposed: updateWasteDisposalDto.amountDisposed,
      wasteType: updateWasteDisposalDto.wasteType,
      amountDisposedUnit: updateWasteDisposalDto.amountDisposed_unit,
      baseData: await this.getBaseData(updateWasteDisposalDto),
      month: updateWasteDisposalDto.month,
    };

    updateWasteDisposalDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    updateWasteDisposalDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    updateWasteDisposalDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.waste_disposal,
      data: calculationData,
    });

    if (updateWasteDisposalDto.e_sc !== emission.e_sc){
      let current = await this.repo.findOne(id);
      let updatedEmission = this.calculationService.getDiff(current, emission);
      this.calculationService.updateTotalEmission(
        updatedEmission,
        updateWasteDisposalDto.project,
        calculationData.baseData.clasification, 
        sourceName.waste_disposal,
        updateWasteDisposalDto.unit.id
      );
    }
    updateWasteDisposalDto.emission = emission.e_sc  ? emission.e_sc : 0;

    updateWasteDisposalDto.e_sc = emission.e_sc  ? emission.e_sc : 0;
    updateWasteDisposalDto.e_sc_co2 = emission.e_sc_co2  ? emission.e_sc_co2 : 0;
    updateWasteDisposalDto.e_sc_ch4 = emission.e_sc_ch4  ? emission.e_sc_ch4 : 0;
    updateWasteDisposalDto.e_sc_n2o = emission.e_sc_n2o  ? emission.e_sc_n2o : 0;

    const updated = await this.repo.update( {
      id: id
    }, updateWasteDisposalDto);
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
      sourceName.waste_disposal,
      deleteDto.unit.id
    );
    return await this.repo.delete({id: deleteDto.id});
  }

  async getBaseData(dto: WasteDisposalActivityData): Promise<BaseDataDto> {
    let activityInfo =  new PuesDataReqActivityData()
    activityInfo.owenerShip = Ownership.getkey(dto.ownership)
    activityInfo.stationary = dto.stationary
    activityInfo.mobile = dto.mobile
    let req = new PuesDataReqDto()
    req.project = dto.project
    req.sourceName = sourceName.waste_disposal
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

  async updateTotalEmission(dto: WasteDisposalActivityData, calData: wasteDisposalDto, emission: any){
    let reqPues: PuesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.waste_disposal,
      unitId: dto.unit.id,
      emission: emission,
      classification: calData.baseData.clasification
    }

    await this.puesService.addEmission(reqPues)

    let reqPes : PesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.waste_disposal,
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
    console.log("datas",data);
    let units = this.parameterUnit.waste_disposal_units;
    // console.log(units);
    
    // common --------------
    let dto = new WasteDisposalActivityData();
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

    dto.amountDisposed_unit = units.disposed[0].code;

    if(data.DISPOSAL_METHOD === 1){   
      dto.disposalMethod = "Re-use"; 
      
    }else if(data.DISPOSAL_METHOD === 2){
      dto.disposalMethod = "Open loop"; 

    }else if(data.DISPOSAL_METHOD === 3){
      dto.disposalMethod = "Closed-loop"; 

    }else if(data.DISPOSAL_METHOD === 4){
      dto.disposalMethod = "Combusion"; 
      
    }else if(data.DISPOSAL_METHOD === 5){
      dto.disposalMethod = "Composting"; 

    }else if(data.DISPOSAL_METHOD === 6){
      dto.disposalMethod = "Landfill"; 

    }else if(data.DISPOSAL_METHOD === 7){
      dto.disposalMethod = "Anaerobic digestion"; 

    }else if(data.DISPOSAL_METHOD === 8){
      dto.disposalMethod = "Piggery Feeding"; 
      
    }else if(data.DISPOSAL_METHOD === 9){
      dto.disposalMethod = "Incineration"; 

    }


    switch(data.WASTE_TYPE) { 
      case 1: { 
        dto.wasteType = "AVERAGE_CONSTRUCTION";     
       break; 
      } 
      case 2: { 
        dto.wasteType = "SOILS";    
         break; 
      } 
      case 3: { 
        dto.wasteType = "TYRES";     
        break;
      }
      case 4: { 
        dto.wasteType = "WOOD";     
        break;
      }
      case 5: { 
        dto.wasteType = "BOOKS";     
        break;
      }
      case 6: { 
        dto.wasteType = "GLASS";     
        break;
      }

      case 7: { 
        dto.wasteType = "CLOTHING";     
       break; 
      } 
      case 8: { 
        dto.wasteType = "MUNICIPAL_WASTE";    
         break; 
      } 
      case 9: { 
        dto.wasteType = "ORGANIC_FOOD_AND_DRINK_WASTE";     
        break;
      }
      case 10: { 
        dto.wasteType = "ORGANIC_GARDEN_WASTE";     
        break;
      }
      case 11: { 
        dto.wasteType = "ORGANIC_MIXED_FOOD_AND_GARDEN_WASTE";     
        break;
      }
      case 12: { 
        dto.wasteType = "COMMERCIAL_AND_INDUSTRIAL_WASTE";     
        break;
      }

      case 13: { 
        dto.wasteType = "WEEE";     
       break; 
      } 
      case 14: { 
        dto.wasteType = "WEEE_FRIDGES_AND_FREEZERS";    
         break; 
      } 
      case 15: { 
        dto.wasteType = "BATTERIES";     
        break;
      }
      case 16: { 
        dto.wasteType = "METAL";     
        break;
      }
      case 17: { 
        dto.wasteType = "PLASTICS";     
        break;
      }
      case 18: { 
        dto.wasteType = "PAPER_AND_BOARD";     
        break;
      }

      case 19: { 
        dto.wasteType = "PAPER_CARDBOARD";     
       break; 
      } 
      case 20: { 
        dto.wasteType = "TEXTILE";    
         break; 
      } 
      case 21: { 
        dto.wasteType = "FOOD_WASTE";     
        break;
      }
      case 22: { 
        dto.wasteType = "WOOD";     
        break;
      }
      case 23: { 
        dto.wasteType = "GARDEN_AND_PARK_WASTE";     
        break;
      }
      case 24: { 
        dto.wasteType = "NAPPIES";     
        break;
      }
      case 25: { 
        dto.wasteType = "RUBBER_AND_LEATHER";    
         break; 
      } 
      case 26: { 
        dto.wasteType = "PLASTICS";     
        break;
      }
      case 27: { 
        dto.wasteType = "OTHER_WASTES";     
        break;
      }
      case 28: { 
        dto.wasteType = "DOMESTIC";     
        break;
      }
      case 29: { 
        dto.wasteType = "INDUSTRIAL";     
        break;
      }
      case 30: { 
        dto.wasteType = "WASTE";     
        break;
      }

      default: { 
         //statements; 
         break; 
      } 

   }


  try{
    return this.create(dto);
  }catch(err){
    //console.log("err",err)
    return null;
  }
}
    


  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


}
