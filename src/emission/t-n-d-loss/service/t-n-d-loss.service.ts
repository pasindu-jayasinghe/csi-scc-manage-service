import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { CalculationService } from 'src/emission/calculation/calculation.service';
import { BaseDataDto } from 'src/emission/calculation/dto/emission-base-data.dto';
import { TNDLossDto } from 'src/emission/calculation/dto/t-n-d-loss.dto';
import { ProjectEmissionSourceService } from 'src/emission/emission-source/service/project-emission-source.service';
import { sourceName } from 'src/emission/enum/sourcename.enum';
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
import { TNDLossActivityData } from '../entities/t-n-d-loss.entity';
import { EmissionSourceRecalService } from 'src/emission/emission-source/service/emission-source-recal.service';
import { EmissionSourceBulkService } from 'src/emission/emission-source/service/emission-source-bulk.service';
import { ProgressRetriever } from 'src/emission/progress-retriever';
import { ProgressDataResponseDto } from 'src/emission/dto/progress-data.dto';
import { ProgresReportService } from 'src/emission/emission-source/service/progres-report.service';
import { ProgressStatus } from 'src/emission/enum/progress-status.enum';
import { ExcelDownloader } from 'src/emission/excel-downloader';

@Injectable()
export class TNDLossService extends TypeOrmCrudService<TNDLossActivityData> implements ExcellUploadable , BulckUpdatable, ProgressRetriever, ExcelDownloader{

  getDto() {
    return new TNDLossActivityData();
  }

  constructor(
    @InjectRepository(TNDLossActivityData) repo,
    @InjectRepository(TNDLossActivityData)
    private readonly tndRepository: Repository<TNDLossActivityData>,
    @InjectRepository(Unit) private unitRepo: Repository<Unit>,
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
  generateTableData(projectId: number, unitIds: number, paras: any[], ownership?: string) {
    throw new Error('Method not implemented.');
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
    // let allMonthFilled: any = {}
    // let response = []
    // let activityData = await this.repo.find({ project: { id: projectId }, unit: { id: In(unitIds) } })
    // let emissionSource = sourceName.t_n_d_loss
    // let parameters = [{name: 'Meter No', code: 'meterNo'}]

    // activityData = activityData.map(ele => {
    //   ele['unitId'] = ele.unit.id
    //   ele['unitName'] = ele.unit.name
    //   return ele
    // })

    // activityData = this.progresReportService.group(activityData, 'unitId')

    // for await (let key of Object.keys(activityData)) {
    //   let pues = await this.puesService.getByUnitAndProjectAndES(parseInt(key), projectId, emissionSource)
    //   if (pues && pues.isComplete){
    //     response.push({
    //       unit: key,
    //       unitName: activityData[key][0]['unitName'],
    //       es: emissionSource,
    //       esName: 'T&D Loss',
    //       completeness: ProgressStatus.COMPLETED,
    //       parameters: parameters
    //     })
    //   } else {
    //     allMonthFilled = this.progresReportService.checkCompleteness(activityData[key], true, true, {para: ['meterNo']})
    //     response.push({
    //       unit: key,
    //       unitName: activityData[key][0]['unitName'],
    //       es: emissionSource,
    //       esName: 'T&D Loss',
    //       completeness: allMonthFilled.isCompleted,
    //       unFilled: allMonthFilled.unFilled,
    //       parameters: parameters
    //     })
    //   }
    // }
    // let assignedUnits = await this.puesService.getAllowedUnitsforProjectAndEs(projectId, emissionSource)

    // let assignedUIds = assignedUnits.map(u => u.code)
    // let uNoData = assignedUIds.filter(ele => !Object.keys(activityData).includes(ele.toString()))
    // let notAssignedIds = unitIds.filter(u => (!assignedUIds.includes(parseInt(u.toString()))))

    // for await (const e of uNoData) {
    //   let unit = await this.unitRepo.findOne({id: e})
    //   response.push({
    //     unit: e.toString(),
    //     unitName: unit.name,
    //     es: emissionSource,
    //     esName: 'T&D Loss',
    //     completeness: ProgressStatus.NOT_ENTERED,
    //     parameters: parameters
    //   })
    // }

    // for await (const e of notAssignedIds) {
    //   let unit = await this.unitRepo.findOne({id: e})
    //   response.push({
    //     unit: e.toString(),
    //     unitName: unit.name,
    //     es: emissionSource,
    //     esName: 'T&D Loss',
    //     completeness: ProgressStatus.NOT_ASSIGNED,
    //     parameters: parameters
    //   })
    // }

    // return response
    return null
  }

  async bulkDelete(ids: number[], isPermant: boolean) {
    return await this.emissionSourceRecalService.bulkDelete(ids,isPermant, this);
  }

   async bulkCalculate(unitIds: number[], projectId: number) {
    return await this.emissionSourceRecalService.bulkCalculate(this, unitIds, projectId, this.repo, sourceName.t_n_d_loss);
  }
  
  async create(createDto: TNDLossActivityData) {
    const calculationData: TNDLossDto = {
      year: createDto.year,
      ec: createDto.consumption,
      ec_unit: createDto.consumption_unit,
      baseData: await this.getBaseData(createDto)
    }

    createDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false;
    createDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false;
    createDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.t_n_d_loss,
      data: calculationData,
    })

    this.updateTotalEmission(createDto, calculationData, emission)
    createDto.emission = emission.e_sc?emission.e_sc :0;

    createDto.e_sc = emission.e_sc ? emission.e_sc : 0;
    createDto.e_sc_co2 = emission.e_sc_co2 ? emission.e_sc_co2 : 0;
    createDto.e_sc_ch4 = emission.e_sc_ch4 ? emission.e_sc_ch4 : 0;
    createDto.e_sc_n2o = emission.e_sc_n2o ? emission.e_sc_n2o : 0;

    return await this.tndRepository.save(createDto);
  }

  async update(id: number, updateDto: TNDLossActivityData) {

    const calculationData: TNDLossDto = {
      year: updateDto.year,
      ec: updateDto.consumption,
      ec_unit: updateDto.consumption_unit,
      baseData: await this.getBaseData(updateDto)
    };

    updateDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    updateDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    updateDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.t_n_d_loss,
      data: calculationData,
    });


    if (updateDto.e_sc !== emission.e_sc){
      let current = await this.repo.findOne(id);
      let updatedEmission = this.calculationService.getDiff(current, emission);
      this.calculationService.updateTotalEmission(
        updatedEmission,
        updateDto.project,
        calculationData.baseData.clasification, 
        sourceName.t_n_d_loss,
        updateDto.unit.id
      );
    }
    // updateDto.emission = emission.e_sc;
    updateDto.e_sc = emission.e_sc ? emission.e_sc : 0;
    updateDto.e_sc_co2 = emission.e_sc_co2 ? emission.e_sc_co2 : 0;
    updateDto.e_sc_ch4 = emission.e_sc_ch4 ? emission.e_sc_ch4 : 0;
    updateDto.e_sc_n2o = emission.e_sc_n2o ? emission.e_sc_n2o : 0;

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
    let deleteDto = await this.repo.findOne({ id: o.value })
    if(deleteDto){
      let updatedEmission = this.calculationService.getDiff(deleteDto, null)
      this.calculationService.updateTotalEmission(
        updatedEmission,
        deleteDto.project,
        (deleteDto.direct ? Clasification.DIRECT : ((deleteDto.indirect ? Clasification.INDIRECT : Clasification.OTHER))),
        sourceName.t_n_d_loss,
        deleteDto.unit.id
      );
      return await this.repo.delete({id: deleteDto.id});
    }else{
      return null;
    }
  }

  async delete(id: any){
    let deleteDto = await this.repo.findOne({ id: id })
    if(deleteDto){
      let updatedEmission = this.calculationService.getDiff(deleteDto, null)
      this.calculationService.updateTotalEmission(
        updatedEmission,
        deleteDto.project,
        (deleteDto.direct ? Clasification.DIRECT : ((deleteDto.indirect ? Clasification.INDIRECT : Clasification.OTHER))),
        sourceName.t_n_d_loss,
        deleteDto.unit.id
      );
      return await this.repo.delete({id: id})
    }else{
      return null;
    }
  }

  async getBaseData(dto: TNDLossActivityData): Promise<BaseDataDto> {
    let activityInfo =  new PuesDataReqActivityData()
    activityInfo.owenerShip = Ownership.getkey(dto.ownership)
    activityInfo.stationary = dto.stationary
    activityInfo.mobile = dto.mobile
    let req = new PuesDataReqDto()
    req.project = dto.project
    req.sourceName = sourceName.t_n_d_loss
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

  async updateTotalEmission(dto: TNDLossActivityData, calData: TNDLossDto, emission: any){
    let reqPues: PuesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.t_n_d_loss,
      unitId: dto.unit.id,
      emission: emission,
      classification: calData.baseData.clasification
    }
    this.puesService.addEmission(reqPues)


    let reqPes : PesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.t_n_d_loss,
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

  async addFromExcell(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number){}

  excellBulkUpload(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number, ownership: string, isMobile: boolean) {
    throw new Error('Method not implemented.');
  }
  downlodExcellBulkUploadVariableMapping() {
    throw new Error('Method not implemented.');
  }

  findAll() {
    return this.tndRepository.find()
  }
}
