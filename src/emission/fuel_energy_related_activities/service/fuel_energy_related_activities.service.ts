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
import { NetZeroBusinessTravelDto } from 'src/emission/calculation/dto/net-zero-business-travel.dto';
import { async } from 'rxjs';
import { FuelEnergyRelatedActivitiesActivityData } from '../entities/fuel_energy_related_activities.entity';
import { ActivityType, elecBasedData, fuelBsedData, FuelEnergyRelatedActivitiesActivityDataDto, purchsoldBasedData, tanddBasedData } from '../dro/fuel_energy_related_activities.dto';
import { FuelEnergyRelatedActivitiesDto } from 'src/emission/calculation/dto/fuel_energy_related_activities.dto';

@Injectable()
export class FuelEnergyRelatedActivitiesService extends TypeOrmCrudService<FuelEnergyRelatedActivitiesActivityData> implements ExcellUploadable, ProgressRetriever, ExcelDownloader {

  getDto() {
    return new FuelEnergyRelatedActivitiesActivityData();
  }

  private excelBulkVariableMapping: { code: string, name: string, isRequired: boolean, type: VariableValidationType }[] = [
    { code: "month", name: 'Month', isRequired: true, type: VariableValidationType.list },
    { code: "fc", name: 'Consumption', isRequired: true, type: VariableValidationType.number },
    { code: "fuelType", name: 'Fuel Types', isRequired: true, type: VariableValidationType.list },
    { code: "fc_unit", name: 'Fuel Consumption Unit', isRequired: true, type: VariableValidationType.list },
  ]

  constructor(
    @InjectRepository(FuelEnergyRelatedActivitiesActivityData) repo,
    @InjectRepository(FuelEnergyRelatedActivitiesActivityData)
    private readonly fuelandenergyRepo: Repository<FuelEnergyRelatedActivitiesActivityData>,
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
    return await this.emissionSourceRecalService.bulkCalculate(this, unitIds, projectId, this.repo, sourceName.Fuel_Energy_Related_Activities);
  }

  excellBulkUpload(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number, ownership: string, isMobile: boolean) {

  }

  downlodExcellBulkUploadVariableMapping() {
    return this.excelBulkVariableMapping;
  }

  async createAll(createFuelEnergyRelatedActivitiesDto: FuelEnergyRelatedActivitiesActivityDataDto) {
    const crypto = require('crypto');
    const groupNumber = crypto.randomUUID();
    const basicData = await this.getBaseData(createFuelEnergyRelatedActivitiesDto)
    let methodData: any;
    switch (createFuelEnergyRelatedActivitiesDto.activityType) {
      case ActivityType.methodA:
      case ActivityType.methodB:
        {
          methodData = createFuelEnergyRelatedActivitiesDto.methodA_data
          break;
        }
 
      case ActivityType.methodC: {
        methodData = createFuelEnergyRelatedActivitiesDto.methodC_data
        break;
      }
      case ActivityType.methodD: {
        methodData = createFuelEnergyRelatedActivitiesDto.methodD_data
        break;
      }

      default: {
        //statements; 
        break;
      }
    }

    if (methodData) {
      for (let methodA_data of methodData) {
        const fuelEnergyRelatedActivitiesActivityData = new FuelEnergyRelatedActivitiesActivityData();
        fuelEnergyRelatedActivitiesActivityData.project = createFuelEnergyRelatedActivitiesDto.project
        fuelEnergyRelatedActivitiesActivityData.user = createFuelEnergyRelatedActivitiesDto.user
        fuelEnergyRelatedActivitiesActivityData.unit = createFuelEnergyRelatedActivitiesDto.unit
        const calculationData: FuelEnergyRelatedActivitiesDto = {
          year: createFuelEnergyRelatedActivitiesDto.year,
          month: createFuelEnergyRelatedActivitiesDto.month,
          activityType: createFuelEnergyRelatedActivitiesDto.activityType,
          emission: 0,
          data: methodA_data,
          groupNumber: groupNumber,
          baseData: basicData

        };
        await this.createFuelandEnergy(calculationData, fuelEnergyRelatedActivitiesActivityData)


      }
    }
    else {
      return null
    }
  }


  async getAllFuelEnergyData(
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
      .addSelect('MIN(acData.id)', 'id')
      .orderBy('id','DESC')
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


  async createFuelandEnergy(calculationData: FuelEnergyRelatedActivitiesDto, FuelEnergyRelatedActivitiesActivityData: FuelEnergyRelatedActivitiesActivityData) {
    FuelEnergyRelatedActivitiesActivityData.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    FuelEnergyRelatedActivitiesActivityData.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    FuelEnergyRelatedActivitiesActivityData.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false
    FuelEnergyRelatedActivitiesActivityData.month = calculationData.month;
    FuelEnergyRelatedActivitiesActivityData.year = calculationData.year;
    FuelEnergyRelatedActivitiesActivityData.groupNo = calculationData.groupNumber;
    FuelEnergyRelatedActivitiesActivityData.activityType = calculationData.activityType;
    FuelEnergyRelatedActivitiesActivityData.consumption = calculationData.data['consumption']
    FuelEnergyRelatedActivitiesActivityData.fuelType = calculationData.data['fuelType']
    FuelEnergyRelatedActivitiesActivityData.consumption_unit = calculationData.data['consumption_unit']
    FuelEnergyRelatedActivitiesActivityData.user_input_ef = calculationData.data['user_input_ef']




    const emission = await this.calculationService.calculate({
      sourceName: sourceName.Fuel_Energy_Related_Activities,
      data: calculationData,
    });


    if (emission && (emission.e_sc || emission.e_sc_co2 || emission.e_sc_ch4 || emission.e_sc_n2o)) {
      this.updateTotalEmission(FuelEnergyRelatedActivitiesActivityData, calculationData, emission)
    }

    FuelEnergyRelatedActivitiesActivityData.emission = emission.e_sc ? emission.e_sc : 0;

    FuelEnergyRelatedActivitiesActivityData.e_sc = emission.e_sc ? emission.e_sc : 0;
    FuelEnergyRelatedActivitiesActivityData.e_sc_co2 = emission.e_sc_co2 ? emission.e_sc_co2 : 0;
    FuelEnergyRelatedActivitiesActivityData.e_sc_ch4 = emission.e_sc_ch4 ? emission.e_sc_ch4 : 0;
    FuelEnergyRelatedActivitiesActivityData.e_sc_n2o = emission.e_sc_n2o ? emission.e_sc_n2o : 0;


    return await this.fuelandenergyRepo.save(FuelEnergyRelatedActivitiesActivityData);
  }


  async update(id: number, updateFuelEnergyRelatedActivitiesDto: FuelEnergyRelatedActivitiesActivityDataDto) {

    console.log("HHHHHH",updateFuelEnergyRelatedActivitiesDto)

    const basicData = await this.getBaseData(updateFuelEnergyRelatedActivitiesDto)

    let methodData: any;
    switch (updateFuelEnergyRelatedActivitiesDto.activityType) {
      case ActivityType.methodA: {
        methodData = updateFuelEnergyRelatedActivitiesDto.methodA_data
        break;
      }
      case ActivityType.methodB: {
        methodData = updateFuelEnergyRelatedActivitiesDto.methodB_data
        break;
      }
      case ActivityType.methodC: {
        methodData = updateFuelEnergyRelatedActivitiesDto.methodC_data
        break;
      }
      case ActivityType.methodD: {
        methodData = updateFuelEnergyRelatedActivitiesDto.methodD_data
        break;
      }

      default: {
        //statements; 
        break;
      }
    }


    if (methodData) {

      for (const methodA_data of methodData) {

        const fuelEnergyRelatedActivitiesActivityData = new FuelEnergyRelatedActivitiesActivityData();
        fuelEnergyRelatedActivitiesActivityData.project = updateFuelEnergyRelatedActivitiesDto.project
        fuelEnergyRelatedActivitiesActivityData.user = updateFuelEnergyRelatedActivitiesDto.user
        fuelEnergyRelatedActivitiesActivityData.unit = updateFuelEnergyRelatedActivitiesDto.unit
        fuelEnergyRelatedActivitiesActivityData.groupNo = updateFuelEnergyRelatedActivitiesDto.groupNo


        const calculationData: FuelEnergyRelatedActivitiesDto = {
          year: updateFuelEnergyRelatedActivitiesDto.year,
          month: updateFuelEnergyRelatedActivitiesDto.month,
          activityType: updateFuelEnergyRelatedActivitiesDto.activityType,
          emission: 0,
          data: methodA_data,
          groupNumber: updateFuelEnergyRelatedActivitiesDto.groupNo,
          baseData: basicData
        };
        await this.UpdateFuelEnergyRelatedActivities(methodA_data.id, fuelEnergyRelatedActivitiesActivityData, calculationData)
      }
    }












  }
  async UpdateFuelEnergyRelatedActivities(id: number, FuelEnergyRelatedActivitiesActivityData: FuelEnergyRelatedActivitiesActivityData, calculationData: FuelEnergyRelatedActivitiesDto) {
    FuelEnergyRelatedActivitiesActivityData.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    FuelEnergyRelatedActivitiesActivityData.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    FuelEnergyRelatedActivitiesActivityData.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false
    FuelEnergyRelatedActivitiesActivityData.month = calculationData.month;
    FuelEnergyRelatedActivitiesActivityData.year = calculationData.year;
    FuelEnergyRelatedActivitiesActivityData.activityType = calculationData.activityType;
    FuelEnergyRelatedActivitiesActivityData.consumption = calculationData.data['consumption']
    FuelEnergyRelatedActivitiesActivityData.fuelType = calculationData.data['fuelType']
    FuelEnergyRelatedActivitiesActivityData.consumption_unit = calculationData.data['consumption_unit']
    FuelEnergyRelatedActivitiesActivityData.user_input_ef = calculationData.data['user_input_ef']


    console.log("userrrr",FuelEnergyRelatedActivitiesActivityData)


    const emission = await this.calculationService.calculate({
      sourceName: sourceName.Fuel_Energy_Related_Activities,
      data: calculationData,
    });

    if (FuelEnergyRelatedActivitiesActivityData.e_sc !== emission.e_sc) {

      let current = await this.repo.findOne({ where: { id: id }, order: { id: 'ASC' } });
      let updatedEmission = this.calculationService.getDiff(current, emission);

      this.calculationService.updateTotalEmission(
        updatedEmission,
        FuelEnergyRelatedActivitiesActivityData.project,
        calculationData.baseData.clasification,
        sourceName.Fuel_Energy_Related_Activities,
        FuelEnergyRelatedActivitiesActivityData.unit.id
      );
    }
    FuelEnergyRelatedActivitiesActivityData.emission = emission.e_sc ? emission.e_sc : 0;

    FuelEnergyRelatedActivitiesActivityData.e_sc = emission.e_sc ? emission.e_sc : 0;
    FuelEnergyRelatedActivitiesActivityData.e_sc_co2 = emission.e_sc_co2 ? emission.e_sc_co2 : 0;
    FuelEnergyRelatedActivitiesActivityData.e_sc_ch4 = emission.e_sc_ch4 ? emission.e_sc_ch4 : 0;
    FuelEnergyRelatedActivitiesActivityData.e_sc_n2o = emission.e_sc_n2o ? emission.e_sc_n2o : 0;

    if (id == 0) {
      return await this.repo.save(FuelEnergyRelatedActivitiesActivityData);
    }
    else {
      const updated = await this.repo.update({
        id: id
      }, FuelEnergyRelatedActivitiesActivityData);

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
      sourceName.Fuel_Energy_Related_Activities,
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
        sourceName.Fuel_Energy_Related_Activities,
        deleteDto.unit.id
      );
      return await this.repo.delete({ id: deleteDto.id });
    });

  }
  async getBaseData(dto: FuelEnergyRelatedActivitiesActivityDataDto): Promise<BaseDataDto> {
    let activityInfo = new PuesDataReqActivityData()
    activityInfo.owenerShip = Ownership.getkey(dto.ownership)
    activityInfo.stationary = dto.stationary
    activityInfo.mobile = dto.mobile
    let req = new PuesDataReqDto()
    req.project = dto.project
    req.sourceName = sourceName.Fuel_Energy_Related_Activities
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

  async updateTotalEmission(dto: FuelEnergyRelatedActivitiesActivityData, calData: FuelEnergyRelatedActivitiesDto, emission: any) {
    let reqPues: PuesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Fuel_Energy_Related_Activities,
      unitId: dto.unit.id,
      emission: emission,
      classification: calData.baseData.clasification
    }

    await this.puesService.addEmission(reqPues)

    let reqPes: PesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Fuel_Energy_Related_Activities,
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



  async getEntryById(id: string): Promise<FuelEnergyRelatedActivitiesActivityDataDto> {

    const groupNo = id;

    const entries = await this.repo.find({
      where: {
        groupNo: groupNo,
      },
    });

    const dto = new FuelEnergyRelatedActivitiesActivityDataDto();
    dto.methodA_data = [];
    dto.methodB_data = [];
    dto.methodC_data = [];
    dto.methodD_data = [];

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
      const methodAData = new fuelBsedData();
      methodAData.consumption = item.consumption;
      methodAData.fuelType = item.fuelType;
      methodAData.consumption_unit = item.consumption_unit
      methodAData.id = item.id

      dto.methodA_data.push(methodAData);


      const methodBData = new elecBasedData();
      methodBData.consumption = item.consumption;
      methodBData.fuelType = item.fuelType;
      methodBData.consumption_unit = item.consumption_unit
      methodBData.id = item.id
      methodAData.user_input_ef = item.user_input_ef
      dto.methodB_data.push(methodBData);

      const methodCData = new tanddBasedData();
      methodCData.consumption = item.consumption;
      methodCData.fuelType = item.fuelType;
      methodCData.consumption_unit = item.consumption_unit
      methodCData.id = item.id
      methodCData.user_input_ef = item.user_input_ef


      dto.methodC_data.push(methodCData);

      const methodDData = new purchsoldBasedData();
      methodDData.consumption = item.consumption;
      methodDData.fuelType = item.fuelType;
      methodDData.consumption_unit = item.consumption_unit
      methodDData.id = item.id
      methodDData.user_input_ef =  item.user_input_ef
      dto.methodD_data.push(methodDData);



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
    deleteDto: FuelEnergyRelatedActivitiesActivityData,
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
      sourceName.Fuel_Energy_Related_Activities,
      deleteDto.unit.id,
    );
    return await this.repo.delete({ id: deleteDto.id });
  }




}

