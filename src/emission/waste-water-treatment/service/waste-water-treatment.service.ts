import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CalculationService } from '../../calculation/calculation.service';
import { In, Repository } from 'typeorm';
import { WasteWaterTreatmentDto } from 'src/emission/calculation/dto/waste-water-treatment.dto';
import { WasteWaterTreatmentActivityData } from '../entities/waste-water-treatment.entity';
import { sourceName } from 'src/emission/enum/sourcename.enum';
import { BaseDataDto } from 'src/emission/calculation/dto/emission-base-data.dto';
import { ElectricityActivityData } from 'src/emission/electricity/entities/electricity.entity';
import { PuesDataReqActivityData, PuesDataReqDto } from 'src/project/dto/pues-data-req.dto';
import { PuesSumDataReqDto, PesSumDataReqDto, ProjectSumDataReqDto } from 'src/project/dto/update-total-emission-req.dto';
import { Ownership } from 'src/project/enum/ownership.enum';
import { ProjectEmissionSourceService } from 'src/emission/emission-source/service/project-emission-source.service';
import { ProjectUnitEmissionSourceService } from 'src/project/service/project-unit-emission-source.service';
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
export class WasteWaterTreatmentService extends TypeOrmCrudService<WasteWaterTreatmentActivityData> implements ExcellUploadable , BulckUpdatable, ProgressRetriever, ExcelDownloader{

  getDto() {
    return new WasteWaterTreatmentActivityData();
  }

  private excelBulkVariableMapping: {code: string, name: string,isRequired: boolean,type: VariableValidationType}[] = [
    {code: "month", name: 'Month',isRequired: true,type:VariableValidationType.list},
    {code: "tip", name: 'Total Industry Product',isRequired: true,type:VariableValidationType.number},
    {code: "tip_unit", name: 'Total Industry Product Unit',isRequired: true,type:VariableValidationType.list},
    {code: "wasteGenerated", name: 'Waste Generated',isRequired: true,type:VariableValidationType.number},
    {code: "wasteGenerated_unit", name: 'Waste Generated Unit',isRequired: true,type:VariableValidationType.list},
    {code: "cod", name: 'Chemical Oxigen Demand ',isRequired: true,type:VariableValidationType.number},
    {code: "cod_unit", name: 'Chemical Oxigen Demand  Unit',isRequired: true,type:VariableValidationType.list},
    {code: "anaerobicDeepLagoon", name: 'Anaerobic Deep Lagoon',isRequired: true,type:VariableValidationType.list},
    {code: "sludgeRemoved", name: 'Sludge Removed',isRequired: true,type:VariableValidationType.number},
    {code: "sludgeRemoved_unit", name: 'Sludge Removed Unit',isRequired: true,type:VariableValidationType.list},
    {code: "recoveredCh4", name: 'Recovered CH4',isRequired: true,type:VariableValidationType.number},
    {code: "recoveredCh4_unit", name: 'Recovered CH4 Unit',isRequired: true,type:VariableValidationType.list}
  ]

  constructor(
    @InjectRepository(WasteWaterTreatmentActivityData) repo,
    @InjectRepository(WasteWaterTreatmentActivityData)
    private readonly wasteWaterRepository: Repository<WasteWaterTreatmentActivityData>,
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
      { name: "Waste Generated", colspan: true }
    ]
    let additionalCols = [{ name: 'Treatment Method', code: 'anaerobicDeepLagoon' }]

    let res = this.progresReportService.createTableData(
      acData,
      row1,
      additionalCols,
      'anaerobicDeepLagoon',
      'wasteGenerated'
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
    let emissionSource = sourceName.Waste_water_treatment
    let parameters = [{name: 'Treatment Method', code: 'anaerobicDeepLagoon'}]

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
          esName: 'Waste water treatment',
          completeness: ProgressStatus.COMPLETED,
          isComplete: pues.isComplete,
          parameters: parameters
        })
      } else {
        allMonthFilled = this.progresReportService.checkCompleteness(activityData[key], true, true, {para: ['anaerobicDeepLagoon']})
        response.push({
          unit: key,
          unitName: activityData[key][0]['unitName'],
          es: emissionSource,
          esName: 'Waste water treatment',
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
        esName: 'Waste water treatment',
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
        esName: 'Waste water treatment',
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
    return await this.emissionSourceRecalService.bulkCalculate(this, unitIds, projectId, this.repo, sourceName.Waste_water_treatment);
  }

  excellBulkUpload(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number, ownership: string, isMobile: boolean) {

    let dto = new WasteWaterTreatmentActivityData();
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

  
  async create(createWasteWaterTreatmentDto: WasteWaterTreatmentActivityData) {
    const calculationData: WasteWaterTreatmentDto = {
      year: createWasteWaterTreatmentDto.year,
      tip: createWasteWaterTreatmentDto.tip,
      wasteGenerated: createWasteWaterTreatmentDto.wasteGenerated,
      cod: createWasteWaterTreatmentDto.cod,
      anaerobicDeepLagoon: createWasteWaterTreatmentDto.anaerobicDeepLagoon,
      sludgeRemoved: createWasteWaterTreatmentDto.sludgeRemoved,
      recoveredCh4: createWasteWaterTreatmentDto.recoveredCh4,
      tip_unit: createWasteWaterTreatmentDto.tip_unit,
      wasteGenerated_unit: createWasteWaterTreatmentDto.wasteGenerated_unit,
      cod_unit: createWasteWaterTreatmentDto.cod_unit,
      sludgeRemoved_unit: createWasteWaterTreatmentDto.sludgeRemoved_unit,
      recoveredCh4_unit: createWasteWaterTreatmentDto.recoveredCh4_unit,
      baseData: await this.getBaseData(createWasteWaterTreatmentDto)
    };

    createWasteWaterTreatmentDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    createWasteWaterTreatmentDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    createWasteWaterTreatmentDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false
    
    const emission = await this.calculationService.calculate({
      sourceName: sourceName.Waste_water_treatment,
      data: calculationData,
    });

    let e = JSON.parse(emission.data)

    this.updateTotalEmission(createWasteWaterTreatmentDto, calculationData, emission)
    createWasteWaterTreatmentDto.emission = emission.data?emission.data:0;

    createWasteWaterTreatmentDto.e_sc = emission.e_sc ? emission.e_sc : 0;
    createWasteWaterTreatmentDto.e_sc_co2 = emission.e_sc_co2 ? emission.e_sc_co2 : 0;
    createWasteWaterTreatmentDto.e_sc_ch4 = emission.e_sc_ch4 ? emission.e_sc_ch4 : 0;
    createWasteWaterTreatmentDto.e_sc_n2o = emission.e_sc_n2o ? emission.e_sc_n2o : 0;

    // var json =emission.result;
    // var obj = JSON.parse(json);

    // createWasteWaterTreatmentDto.tco2e = obj.tco2e;
    // createWasteWaterTreatmentDto.tch4 = obj.tch4;
    // createWasteWaterTreatmentDto.ef = obj.ef;
    // createWasteWaterTreatmentDto.tcod = obj.tcod;

    return await this.wasteWaterRepository.save(createWasteWaterTreatmentDto);
  }

  findAll() {
    return this.wasteWaterRepository.find();
  }


  async update(id: number, updateWasteWaterTreatmentDto: WasteWaterTreatmentActivityData) {

    const calculationData: WasteWaterTreatmentDto = {
      year: updateWasteWaterTreatmentDto.year,
      tip: updateWasteWaterTreatmentDto.tip,
      wasteGenerated: updateWasteWaterTreatmentDto.wasteGenerated,
      cod: updateWasteWaterTreatmentDto.cod,
      anaerobicDeepLagoon: updateWasteWaterTreatmentDto.anaerobicDeepLagoon,
      sludgeRemoved: updateWasteWaterTreatmentDto.sludgeRemoved,
      recoveredCh4: updateWasteWaterTreatmentDto.recoveredCh4,
      tip_unit: updateWasteWaterTreatmentDto.tip_unit,
      wasteGenerated_unit: updateWasteWaterTreatmentDto.wasteGenerated_unit,
      cod_unit: updateWasteWaterTreatmentDto.cod_unit,
      sludgeRemoved_unit: updateWasteWaterTreatmentDto.sludgeRemoved_unit,
      recoveredCh4_unit: updateWasteWaterTreatmentDto.recoveredCh4_unit,
      baseData: await this.getBaseData(updateWasteWaterTreatmentDto)

    };

    updateWasteWaterTreatmentDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    updateWasteWaterTreatmentDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    updateWasteWaterTreatmentDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.Waste_water_treatment,
      data: calculationData,
    });

    if (updateWasteWaterTreatmentDto.e_sc !== emission.e_sc){
      let current = await this.repo.findOne(id);
      let updatedEmission = this.calculationService.getDiff(current, emission);
      this.calculationService.updateTotalEmission(
        updatedEmission,
        updateWasteWaterTreatmentDto.project,
        calculationData.baseData.clasification, 
        sourceName.Waste_water_treatment,
        updateWasteWaterTreatmentDto.unit.id
      );
    }
    updateWasteWaterTreatmentDto.emission = emission.data?emission.data:0;

    updateWasteWaterTreatmentDto.e_sc = emission.e_sc ? emission.e_sc : 0;
    updateWasteWaterTreatmentDto.e_sc_co2 = emission.e_sc_co2 ? emission.e_sc_co2 : 0;
    updateWasteWaterTreatmentDto.e_sc_ch4 = emission.e_sc_ch4 ? emission.e_sc_ch4 : 0;
    updateWasteWaterTreatmentDto.e_sc_n2o = emission.e_sc_n2o ? emission.e_sc_n2o : 0;

    // var json =emission.result;
    // var obj = JSON.parse(json);

    // updateWasteWaterTreatmentDto.tco2e = obj.tco2e;
    // updateWasteWaterTreatmentDto.tch4 = obj.tch4;
    // updateWasteWaterTreatmentDto.ef = obj.ef;
    // updateWasteWaterTreatmentDto.tcod = obj.tcod;
    
    const updated = await this.repo.update( {
      id: id
    }, updateWasteWaterTreatmentDto);
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
      sourceName.Waste_water_treatment,
      deleteDto.unit.id
    );
    return await this.repo.delete({id: deleteDto.id});
  }


  async getBaseData(dto: WasteWaterTreatmentActivityData): Promise<BaseDataDto> {
    let activityInfo =  new PuesDataReqActivityData()
    activityInfo.owenerShip = Ownership.getkey(dto.ownership)
    activityInfo.stationary = dto.stationary
    activityInfo.mobile = dto.mobile
    let req = new PuesDataReqDto()
    req.project = dto.project
    req.sourceName = sourceName.Waste_water_treatment
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

  async updateTotalEmission(dto: WasteWaterTreatmentActivityData, calData: WasteWaterTreatmentDto, emission: any){
    let reqPues: PuesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Waste_water_treatment,
      unitId: dto.unit.id,
      emission: emission,
      classification: calData.baseData.clasification
    }

    console.log("emission", emission)

    await this.puesService.addEmission(reqPues)

    let reqPes : PesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Waste_water_treatment,
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
    let units = this.parameterUnit.waste_water_units;
    let treatmentTypes = this.parameterUnit.anaerobicDeepLagoons;

    let dto = new WasteWaterTreatmentActivityData();
    dto['unit'] = unit;
    dto['project'] = project;
    dto['user'] = user;

    variable_mapping.forEach(vm => {
      if (vm['V2']) {
        if (vm['default-v2']) {
          dto[vm['V2']] = vm['default-v2'];
        } else if (vm['V1']) {
          if (vm['V1'] === 'TYPE_OF_TREATMENT'){
            if (data[vm['V1']] === 'Sea, rever and lake discharge') {
              dto[vm['V2']] = (treatmentTypes.find(o => o.id === 1)).code
            } else if (data[vm['V1']] === 'Aerobic treatment plant without well manage'){
              dto[vm['V2']] = (treatmentTypes.find(o => o.id === 3)).code
            } else {
              dto[vm['V2']] = (treatmentTypes.find(o => o.name === data[vm['V1']])).code
            }
          } else {
            let val = data[vm['V1']];
            dto[vm['V2']] = val;
          }
        }
      }
    })
    dto.year = year;
    dto.wasteGenerated_unit = units.wasteGenerated[0].code
    dto.tip_unit = units.tip[0].code
    dto.cod_unit = units.cod[0].code
    dto.sludgeRemoved_unit = units.sludgeRemoved[0].code
    dto.recoveredCh4_unit = units.recoveredCh4[0].code

    // console.log(dto)

    try {
      return this.create(dto);
    } catch (err) {
      console.log(err);
      return null;
    }

  }
}
