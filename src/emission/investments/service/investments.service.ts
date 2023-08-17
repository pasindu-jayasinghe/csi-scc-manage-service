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
import { sourceName } from '../../enum/sourcename.enum';
import { EmissionSourceRecalService } from 'src/emission/emission-source/service/emission-source-recal.service';
import { EmissionSourceBulkService } from 'src/emission/emission-source/service/emission-source-bulk.service';
import { VariableValidationType } from 'src/emission/enum/variable-validation-type.enum';
import { ProgressRetriever } from 'src/emission/progress-retriever';
import { ProgressDataResponseDto } from 'src/emission/dto/progress-data.dto';
import { ProgresReportService } from 'src/emission/emission-source/service/progres-report.service';
import { ProgressStatus } from 'src/emission/enum/progress-status.enum';
import { ExcelDownloader } from 'src/emission/excel-downloader';
import { InvestmentsActivityData } from '../entities/investments.entity';
import { InvestmentsDto } from 'src/emission/calculation/dto/investments.dto';
import { ActivityType, InvestmentsActivityDataDto, methodABasedData, methodBBasedData, methodCBasedData, methodDBasedData, methodEBasedData } from '../dto/investments.dto';
import { NetZeroBusinessTravelDto } from 'src/emission/calculation/dto/net-zero-business-travel.dto';
import { async } from 'rxjs';

@Injectable()
export class InvestmentsService extends TypeOrmCrudService<InvestmentsActivityData> implements ExcellUploadable, ProgressRetriever, ExcelDownloader {

  getDto() {
    return new InvestmentsActivityData();
  }

  private excelBulkVariableMapping: { code: string, name: string, isRequired: boolean, type: VariableValidationType }[] = [
    { code: "month", name: 'Month', isRequired: true, type: VariableValidationType.list },
    { code: "fc", name: 'Consumption', isRequired: true, type: VariableValidationType.number },
    { code: "fuelType", name: 'Fuel Types', isRequired: true, type: VariableValidationType.list },
    { code: "fc_unit", name: 'Fuel Consumption Unit', isRequired: true, type: VariableValidationType.list },
  ]

  constructor(
    @InjectRepository(InvestmentsActivityData) repo,
    @InjectRepository(InvestmentsActivityData)
    private readonly investmentsRepository: Repository<InvestmentsActivityData>,
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
  create(dto: any) {
    throw new Error('Method not implemented.');
  }
  getVariableMapping() {
    throw new Error('Method not implemented.');
  }
  async generateTableData(projectId: number, unitIds: number, paras: any[], ownership?: string) {
   

    return null
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

    return response
  }

  async bulkDelete(ids: number[], isPermant: boolean) {
    return await this.emissionSourceRecalService.bulkDelete(ids, isPermant, this);
  }

  async bulkCalculate(unitIds: number[], projectId: number) {
    return await this.emissionSourceRecalService.bulkCalculate(this, unitIds, projectId, this.repo, sourceName.Investments);
  }

  excellBulkUpload(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number, ownership: string, isMobile: boolean) {

    // let dto = new InvestmentsActivityData();
    // dto = this.emissionSourceBulkService.excellBulkUpload(unit, project,user,data,year,ownership,isMobile,dto,this.excelBulkVariableMapping);
    // try{      
    //   return this.create();
    // }catch(err){
    //   console.log(err);
    //   return null;
    // }
  }

  downlodExcellBulkUploadVariableMapping() {
    return this.excelBulkVariableMapping;
  }

  async createAll(createInvestmentsDto: InvestmentsActivityDataDto) {
    const crypto = require('crypto');
    const groupNumber = crypto.randomUUID();
    const basicData = await this.getBaseData(createInvestmentsDto)
    let methodData: any;
    switch (createInvestmentsDto.activityType) {
      case ActivityType.methodA: {
        methodData = createInvestmentsDto.methodA_data
        break;
      }
      case ActivityType.methodB: {
        methodData = createInvestmentsDto.methodB_data
        break;
      }
      case ActivityType.methodC: {
        methodData = createInvestmentsDto.methodC_data
        break;
      }
      case ActivityType.methodD: {
        methodData = createInvestmentsDto.methodD_data
        break;
      }
      case ActivityType.methodE: {
        methodData = createInvestmentsDto.methodE_data
        break;
      }
      default: {
        //statements; 
        break;
      }
    }

    if (methodData) {
      for (let methodA_data of methodData) {
        const investmentsActivityData = new InvestmentsActivityData();
        investmentsActivityData.project = createInvestmentsDto.project
        investmentsActivityData.user = createInvestmentsDto.user
        investmentsActivityData.unit = createInvestmentsDto.unit
        
        const calculationData: InvestmentsDto = {
          year: createInvestmentsDto.year,
          month: createInvestmentsDto.month,
          activityType: createInvestmentsDto.activityType,
          emission: 0,
          data: methodA_data,
          groupNumber: groupNumber,
          baseData: basicData

        };
        await this.createInvestment(calculationData, investmentsActivityData)


      }
    }
    else {
      return null
    }
  }


  async getAllInvestmentData(
    option: any,
    projectId: number,
    unitId: number,
  ): Promise<any> {
    console.log(projectId, unitId);
    let filter = '';
    if (projectId != 0) {
      if (filter) {
        filter = filter + ' and project.id=:projectId';
      } else {
        filter = 'project.id=:projectId';
      }
    }

    if (unitId != 0) {
      if (filter) {
        filter = filter + ' and unit.id=:unitId';
      } else {
        filter = 'unit.id=:unitId';
      }
    }

    let data = this.repo
      .createQueryBuilder('acData')
      .select('acData.groupNo')
      
      .innerJoinAndSelect(
        'acData.project',
        'project',
        'project.id = acData.projectId',
      )     

      .innerJoinAndSelect('acData.unit', 'unit', 'unit.id = acData.unitId')

      .where(filter, { projectId, unitId })

      .groupBy('acData.groupNo');

    let data2 = this.repo
      .createQueryBuilder('acData')

      .where(filter, { projectId, unitId })

      .groupBy('acData.groupNo')
      .addGroupBy('acData.activityType')
      .addGroupBy('acData.unitId ')
      .addGroupBy('acData.projectId')
      .addGroupBy('acData.year')
      .addGroupBy('acData.month')
      .addGroupBy('acData.groupNo')
      
      .innerJoin(
        'acData.project',
        'project',
        'project.id = acData.projectId',
      )
      .innerJoin('acData.unit', 'unit', 'unit.id = acData.unitId')
      .select('project.name as project_name, acData.activityType as acData_activityType,unit.name as unit_name,acData.year as acData_year,acData.month as acData_month,acData.groupNo as acData_groupNo')
      .addSelect('SUM(acData.e_sc)', 'sum')
      .addSelect('MAX(acData.createdOn)', 'create_date')
      .orderBy('create_date','DESC')
      .offset(
        (option.page > 1 ? option.page - 1 : 0) *
          (option.limit != 0 ? option.limit : 0),
      )
      .limit(option.limit != 0 ? option.limit : 100000);

    // console.log("test " ,(await data.execute()))
    return {
      data: await data2.getRawMany(),
      total: (await data.execute()).length,
    };
  }

  


  async createInvestment(calculationData: InvestmentsDto, investmentsActivityData: InvestmentsActivityData) {

    investmentsActivityData.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    investmentsActivityData.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    investmentsActivityData.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false
    investmentsActivityData.month = calculationData.month;
    investmentsActivityData.year = calculationData.year;
    investmentsActivityData.groupNo = calculationData.groupNumber;
    investmentsActivityData.activityType = calculationData.activityType;
    investmentsActivityData.scp1scpe2EmissionsOfEquityInvestment = calculationData.data['scp1scpe2EmissionsOfEquityInvestment']
    investmentsActivityData.shareOfEquity = calculationData.data['shareOfEquity']
    investmentsActivityData.investeeCompanyTotalRevenue = calculationData.data['investeeCompanyTotalRevenue']
    investmentsActivityData.ef_InvesteeSector = calculationData.data['ef_InvesteeSector']
    investmentsActivityData.scp1scp2EmissionRelevantProject = calculationData.data['scp1scp2EmissionRelevantProject']
    investmentsActivityData.shareOfTotalProjectCosts = calculationData.data['shareOfTotalProjectCosts']
    investmentsActivityData.projectConstructionCost = calculationData.data['projectConstructionCost']
    investmentsActivityData.ef_ReleventConsSector = calculationData.data['ef_ReleventConsSector']
    investmentsActivityData.projectRevenueInReportingYear = calculationData.data['projectRevenueInReportingYear']
    investmentsActivityData.ef_relevantOperatingSector = calculationData.data['ef_relevantOperatingSector']
    investmentsActivityData.projectedAnnualEmissionsOfProject = calculationData.data['projectedAnnualEmissionsOfProject']
    investmentsActivityData.projectedLifetimeOfProject = calculationData.data['projectedLifetimeOfProject']
    investmentsActivityData.scp1scpe2EmissionsOfEquityInvestment_unit = calculationData.data['scp1scpe2EmissionsOfEquityInvestment_unit']
    investmentsActivityData.scp1scp2EmissionRelevantProject_unit = calculationData.data['scp1scp2EmissionRelevantProject_unit']
    investmentsActivityData.projectedAnnualEmissionsOfProject_unit = calculationData.data['projectedAnnualEmissionsOfProject_unit']
    investmentsActivityData.investeeSector = calculationData.data['investeeSector']
    investmentsActivityData.operatingtSector = calculationData.data['operatingtSector']
    investmentsActivityData.constructSector = calculationData.data['constructSector']







    const emission = await this.calculationService.calculate({
      sourceName: sourceName.Investments,
      data: calculationData,
    });

    console.log("llll",emission)

    if (emission && (emission.e_sc || emission.e_sc_co2 || emission.e_sc_ch4 || emission.e_sc_n2o)) {
      this.updateTotalEmission(investmentsActivityData, calculationData, emission)
    }

    investmentsActivityData.emission = emission.e_sc ? emission.e_sc : 0;

    investmentsActivityData.e_sc = emission.e_sc ? emission.e_sc : 0;
    investmentsActivityData.e_sc_co2 = emission.e_sc_co2 ? emission.e_sc_co2 : 0;
    investmentsActivityData.e_sc_ch4 = emission.e_sc_ch4 ? emission.e_sc_ch4 : 0;
    investmentsActivityData.e_sc_n2o = emission.e_sc_n2o ? emission.e_sc_n2o : 0;

    return await this.investmentsRepository.save(investmentsActivityData);
  }



  async update(id: number, updateInvestmentsDto: InvestmentsActivityDataDto) {

    console.log("UPDATE--", updateInvestmentsDto)


    const basicData = await this.getBaseData(updateInvestmentsDto)

    let methodData: any;
    switch (updateInvestmentsDto.activityType) {
      case ActivityType.methodA: {
        methodData = updateInvestmentsDto.methodA_data
        break;
      }
      case ActivityType.methodB: {
        methodData = updateInvestmentsDto.methodB_data
        break;
      }
      case ActivityType.methodC: {
        methodData = updateInvestmentsDto.methodC_data
        break;
      }
      case ActivityType.methodD: {
        methodData = updateInvestmentsDto.methodD_data
        break;
      }
      case ActivityType.methodE: {
        methodData = updateInvestmentsDto.methodE_data
        break;
      }
      default: {
        //statements; 
        break;
      }
    }


    if (methodData) {

      for (const methodA_data of methodData) {

        const investmentsActivityData = new InvestmentsActivityData();
        investmentsActivityData.project = updateInvestmentsDto.project
        investmentsActivityData.user = updateInvestmentsDto.user
        investmentsActivityData.unit = updateInvestmentsDto.unit
        investmentsActivityData.groupNo = updateInvestmentsDto.groupNo


        const calculationData: InvestmentsDto = {
          year: updateInvestmentsDto.year,
          month: updateInvestmentsDto.month,
          activityType: updateInvestmentsDto.activityType,
          emission: 0,
          data: methodA_data,
          groupNumber: updateInvestmentsDto.groupNo,
          baseData: basicData
        };
        await this.updateInvestment(methodA_data.id, investmentsActivityData, calculationData)
      }
    }












  }
  async updateInvestment(id: number, investmentsActivityData: InvestmentsActivityData, calculationData: InvestmentsDto) {
    console.log("oooooooo")
    investmentsActivityData.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    investmentsActivityData.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    investmentsActivityData.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false
    investmentsActivityData.month = calculationData.month;
    investmentsActivityData.year = calculationData.year;
    investmentsActivityData.activityType = calculationData.activityType;
    investmentsActivityData.scp1scpe2EmissionsOfEquityInvestment = calculationData.data['scp1scpe2EmissionsOfEquityInvestment']
    investmentsActivityData.shareOfEquity = calculationData.data['shareOfEquity']
    investmentsActivityData.investeeCompanyTotalRevenue = calculationData.data['investeeCompanyTotalRevenue']
    investmentsActivityData.ef_InvesteeSector = calculationData.data['ef_InvesteeSector']
    investmentsActivityData.scp1scp2EmissionRelevantProject = calculationData.data['scp1scp2EmissionRelevantProject']
    investmentsActivityData.shareOfTotalProjectCosts = calculationData.data['shareOfTotalProjectCosts']
    investmentsActivityData.projectConstructionCost = calculationData.data['projectConstructionCost']
    investmentsActivityData.ef_ReleventConsSector = calculationData.data['ef_ReleventConsSector']
    investmentsActivityData.projectRevenueInReportingYear = calculationData.data['projectRevenueInReportingYear']
    investmentsActivityData.ef_relevantOperatingSector = calculationData.data['ef_relevantOperatingSector']
    investmentsActivityData.projectedAnnualEmissionsOfProject = calculationData.data['projectedAnnualEmissionsOfProject']
    investmentsActivityData.projectedLifetimeOfProject = calculationData.data['projectedLifetimeOfProject']

    investmentsActivityData.scp1scpe2EmissionsOfEquityInvestment_unit = calculationData.data['scp1scpe2EmissionsOfEquityInvestment_unit']
    investmentsActivityData.scp1scp2EmissionRelevantProject_unit = calculationData.data['scp1scp2EmissionRelevantProject_unit']
    investmentsActivityData.projectedAnnualEmissionsOfProject_unit = calculationData.data['projectedAnnualEmissionsOfProject_unit']
    investmentsActivityData.investeeSector = calculationData.data['investeeSector']
    investmentsActivityData.operatingtSector = calculationData.data['operatingtSector']
    investmentsActivityData.constructSector = calculationData.data['constructSector']

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.Investments,
      data: calculationData,
    });

    if (investmentsActivityData.e_sc !== emission.e_sc) {

      let current = await this.repo.findOne({ where: { id: id }, order: { id: 'ASC' } });
      let updatedEmission = this.calculationService.getDiff(current, emission);

      this.calculationService.updateTotalEmission(
        updatedEmission,
        investmentsActivityData.project,
        calculationData.baseData.clasification,
        sourceName.Investments,
        investmentsActivityData.unit.id
      );
    }
    investmentsActivityData.emission = emission.e_sc ? emission.e_sc : 0;

    investmentsActivityData.e_sc = emission.e_sc ? emission.e_sc : 0;
    investmentsActivityData.e_sc_co2 = emission.e_sc_co2 ? emission.e_sc_co2 : 0;
    investmentsActivityData.e_sc_ch4 = emission.e_sc_ch4 ? emission.e_sc_ch4 : 0;
    investmentsActivityData.e_sc_n2o = emission.e_sc_n2o ? emission.e_sc_n2o : 0;

    if (id == 0) {
      return await this.repo.save(investmentsActivityData);
    }
    else {
      const updated = await this.repo.update({
        id: id
      }, investmentsActivityData);

      if (updated.affected === 1) {
        return await this.repo.findOne(id);
      } else {
        throw new InternalServerErrorException("Updating is failed");
      }
    }




  }

  async remove(req) {
    let deleteDto = await this.repo.findOne({ id: req })
    let updatedEmission = this.calculationService.getDiff(deleteDto, null)
    this.calculationService.updateTotalEmission(
      updatedEmission,
      deleteDto.project,
      (deleteDto.direct ? Clasification.DIRECT : ((deleteDto.indirect ? Clasification.INDIRECT : Clasification.OTHER))),
      sourceName.Investments,
      deleteDto.unit.id
    );
    return await this.repo.delete({ id: deleteDto.id });
  }

  async removeAll(req) {

    const entries = await this.repo.find({
      where: {
        groupNo: req,
      },
    });
    entries.forEach(async (item: any) => {

      let deleteDto = await this.repo.findOne({ id: item.id })
      let updatedEmission = this.calculationService.getDiff(deleteDto, null)
      this.calculationService.updateTotalEmission(
        updatedEmission,
        deleteDto.project,
        (deleteDto.direct ? Clasification.DIRECT : ((deleteDto.indirect ? Clasification.INDIRECT : Clasification.OTHER))),
        sourceName.Investments,
        deleteDto.unit.id
      );
      return await this.repo.delete({ id: deleteDto.id });
    });

  }
  async getBaseData(dto: InvestmentsActivityDataDto): Promise<BaseDataDto> {
    let activityInfo = new PuesDataReqActivityData()
    activityInfo.owenerShip = Ownership.getkey(dto.ownership)
    activityInfo.stationary = dto.stationary
    activityInfo.mobile = dto.mobile
    let req = new PuesDataReqDto()
    req.project = dto.project
    req.sourceName = sourceName.Investments
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

  async updateTotalEmission(dto: InvestmentsActivityData, calData: InvestmentsDto, emission: any) {
    let reqPues: PuesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Investments,
      unitId: dto.unit.id,
      emission: emission,
      classification: calData.baseData.clasification
    }

    await this.puesService.addEmission(reqPues)

    let reqPes: PesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Investments,
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


  async addFromExcell(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number) {

  }



  async getEntryById(id: string): Promise<InvestmentsActivityDataDto> {
    // let res = await this.repo.findOne({

    //   where: {
    //     id: id,
    //   },

    // })

    const groupNo = id;

    const entries = await this.repo.find({
      where: {
        groupNo: groupNo,
      },
    });

    const dto = new InvestmentsActivityDataDto();
    dto.methodA_data = [];
    dto.methodB_data = [];
    dto.methodC_data = [];
    dto.methodD_data = [];
    dto.methodE_data = [];

    entries.forEach((item: any) => {
      dto.month = item.month;
      dto.year = item.year;
      dto.activityType = item.activityType;
      dto.mobile = item.mobile;
      dto.stationary = item.stationary;
      dto.user = item.user;
      dto.unit = item.unit;
      dto.project = item.project;
      dto.ownership = item.ownership;
      dto.direct = item.direct;
      dto.indirect = item.indirect;
      dto.other = item.other;
      dto.groupNo = item.groupNo
      const methodAData = new methodABasedData();
      methodAData.scp1scpe2EmissionsOfEquityInvestment = item.scp1scpe2EmissionsOfEquityInvestment;
      methodAData.shareOfEquity = item.shareOfEquity;
      methodAData.id = item.id

      dto.methodA_data.push(methodAData);


      const methodBData = new methodBBasedData();
      methodBData.ef_InvesteeSector = item.ef_InvesteeSector;
      methodBData.shareOfEquity = item.shareOfEquity;
      methodBData.investeeCompanyTotalRevenue = item.investeeCompanyTotalRevenue;
      methodBData.investeeSector = item.investeeSector
      methodBData.id = item.id
      dto.methodB_data.push(methodBData);

      const methodCData = new methodCBasedData();
      methodCData.scp1scp2EmissionRelevantProject = item.scp1scp2EmissionRelevantProject;
      methodCData.shareOfTotalProjectCosts = item.shareOfTotalProjectCosts;
      methodCData.id = item.id

      dto.methodC_data.push(methodCData);

      const methodDData = new methodDBasedData();
      methodDData.ef_ReleventConsSector = item.ef_ReleventConsSector;
      methodDData.ef_relevantOperatingSector = item.ef_relevantOperatingSector;
      methodDData.projectConstructionCost = item.projectConstructionCost;
      methodDData.projectRevenueInReportingYear = item.projectRevenueInReportingYear;
      methodDData.shareOfTotalProjectCosts = item.shareOfTotalProjectCosts;
      methodDData.operatingtSector = item.operatingtSector
      methodDData.constructSector = item.constructSector
      methodDData.id = item.id

      dto.methodD_data.push(methodDData);

      const methodEData = new methodEBasedData();
      methodEData.projectedAnnualEmissionsOfProject = item.projectedAnnualEmissionsOfProject;
      methodEData.projectedLifetimeOfProject = item.projectedLifetimeOfProject;
      methodEData.shareOfTotalProjectCosts = item.shareOfTotalProjectCosts;
      methodEData.id = item.id

      dto.methodE_data.push(methodEData);


    });

    return dto;

  }

  async deleteWholeGroup(groupNumber: string) {
    console.log("GGGGG",groupNumber)
    let deleteDtos = await this.repo.find({ where: { groupNo: groupNumber } });
    for await (let deleteDto of deleteDtos) {
      await this.removeOneForWholegroup(deleteDto);
    }
    return true;
  }

  async removeOneForWholegroup(
    deleteDto: InvestmentsActivityData,
  ) {
    let updatedEmission = this.calculationService.getDiff(deleteDto, null);
    this.calculationService.updateTotalEmission(
      updatedEmission,
      deleteDto.project,
      deleteDto.direct
        ? Clasification.DIRECT
        : deleteDto.indirect
        ? Clasification.INDIRECT
        : Clasification.OTHER,
      sourceName.Investments,
      deleteDto.unit.id,
    );
    return await this.repo.delete({ id: deleteDto.id });
  }


}

