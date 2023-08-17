import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { BaseDataDto } from 'src/emission/calculation/dto/emission-base-data.dto';
import { ElectricityActivityData } from 'src/emission/electricity/entities/electricity.entity';
import { ProjectEmissionSourceService } from 'src/emission/emission-source/service/project-emission-source.service';
import { ExcellUploadable } from 'src/emission/excell-uploadable';
import { BulckUpdatable } from 'src/emission/bulck-updatable';
import {
  PuesDataReqActivityData,
  PuesDataReqDto,
} from 'src/project/dto/pues-data-req.dto';
import {
  PuesSumDataReqDto,
  PesSumDataReqDto,
  ProjectSumDataReqDto,
} from 'src/project/dto/update-total-emission-req.dto';
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

import { result } from 'src/report/dto/create-report.dto';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';

import {
  WasteGeneratedInOperationsActivityDataDto,
  WasteGeneratedInOperationsEmissionSourceDataMethod,
  WasteGeneratedInOperationsEmissionSourceDataTypeNames,
  AverageDataWasteGeneratedInOperationsEmissionSourceData,
  SupplierSpecificWasteGeneratedInOperationsEmissionSourceData,
  WasteTypeSpecificWasteGeneratedInOperationsEmissionSourceData,
  WasteGeneratedInOperationsEmissionSourceDataSolidWater,
} from '../dto/waste-generated-in-operations-dto.dto';
import { WasteGeneratedInOperationsActivityData } from '../entities/waste-generated-in-operations.entity';
import { WasteGeneratedInOperationsDto } from 'src/emission/calculation/dto/waste-generated-in-operations.dto';

@Injectable()
export class WasteGeneratedInOperationsService
  extends TypeOrmCrudService<WasteGeneratedInOperationsActivityData>
  implements ExcellUploadable, ProgressRetriever, ExcelDownloader
{
  getDto() {
    return new WasteGeneratedInOperationsActivityData();
  }

  private excelBulkVariableMapping: {
    code: string;
    name: string;
    isRequired: boolean;
    type: VariableValidationType;
  }[] = [
    {
      code: 'month',
      name: 'Month',
      isRequired: true,
      type: VariableValidationType.list,
    },
    // {code: "fc", name: 'Consumption',isRequired: true,type:VariableValidationType.number},
    // {code: "fuelType", name: 'Fuel Types',isRequired: true,type:VariableValidationType.list},
    // {code: "fc_unit", name: 'Fuel Consumption Unit',isRequired: true,type:VariableValidationType.list},
  ];

  constructor(
    @InjectRepository(WasteGeneratedInOperationsActivityData) repo,
    @InjectRepository(WasteGeneratedInOperationsActivityData)
    private readonly WasteGeneratedInOperationsRepository: Repository<WasteGeneratedInOperationsActivityData>,
    @InjectRepository(Unit) private unitRepo: Repository<Unit>,
    private readonly calculationService: CalculationService,
    private puesService: ProjectUnitEmissionSourceService,
    private pesService: ProjectEmissionSourceService,
    private projectService: ProjectService,
    private parameterUnit: ParameterUnit,
    private emissionSourceRecalService: EmissionSourceRecalService,
    private emissionSourceBulkService: EmissionSourceBulkService,
    private progresReportService: ProgresReportService,
  ) {
    super(repo);
  }
  getVariableMapping() {
    throw new Error('Method not implemented.');
  }
  async generateTableData(
    projectId: number,
    unitIds: number,
    paras: any[],
    ownership?: string,
  ) {
    // TODO: need to modify

    return null;
  }
  async getActivityData(filter: any, filterValues: any) {
    let data = this.repo
      .createQueryBuilder('acData')
      .innerJoinAndSelect(
        'acData.project',
        'project',
        'project.id = acData.projectId',
      )
      .innerJoinAndSelect('acData.unit', 'unit', 'unit.id = acData.unitId')
      .where(filter, filterValues);
    return await data.getMany();
  }
  async getProgressData(projectId: number, unitIds: number[]) {
    // TODO: need to modify
    let allMonthFilled: any = {};
    let response = [];

    return response;
  }

  async bulkDelete(ids: number[], isPermant: boolean) {
    return await this.emissionSourceRecalService.bulkDelete(
      ids,
      isPermant,
      this,
    );
  }

  async bulkCalculate(unitIds: number[], projectId: number) {
    return await this.emissionSourceRecalService.bulkCalculate(
      this,
      unitIds,
      projectId,
      this.repo,
      sourceName.Waste_Generated_in_Operations,
    );
  }

  excellBulkUpload(
    unit: Unit,
    project: Project,
    user: User,
    data: any,
    variable_mapping: any[],
    year: number,
    ownership: string,
    isMobile: boolean,
  ) {
    let dto = new WasteGeneratedInOperationsActivityData();
    dto = this.emissionSourceBulkService.excellBulkUpload(
      unit,
      project,
      user,
      data,
      year,
      ownership,
      isMobile,
      dto,
      this.excelBulkVariableMapping,
    );
    try {
      return this.create(dto);
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  downlodExcellBulkUploadVariableMapping() {
    return this.excelBulkVariableMapping;
  }

  copyDtotoEntity(
    createWasteGeneratedInOperationsDto: WasteGeneratedInOperationsActivityDataDto,
    groupNumber: string,
  ): WasteGeneratedInOperationsActivityData {
    const netZeroEmployeeCommutingActivityData =
      new WasteGeneratedInOperationsActivityData();

    netZeroEmployeeCommutingActivityData.project =
      createWasteGeneratedInOperationsDto.project;
    netZeroEmployeeCommutingActivityData.year =
      createWasteGeneratedInOperationsDto.year;
    netZeroEmployeeCommutingActivityData.month =
      createWasteGeneratedInOperationsDto.month;
    netZeroEmployeeCommutingActivityData.unit =
      createWasteGeneratedInOperationsDto.unit;
    netZeroEmployeeCommutingActivityData.method =
      createWasteGeneratedInOperationsDto.method;
    netZeroEmployeeCommutingActivityData.mobile =
      createWasteGeneratedInOperationsDto.mobile;
    netZeroEmployeeCommutingActivityData.stationary =
      createWasteGeneratedInOperationsDto.stationary;
    netZeroEmployeeCommutingActivityData.activityDataStatus =
      createWasteGeneratedInOperationsDto.activityDataStatus;
    netZeroEmployeeCommutingActivityData.ownership =
      createWasteGeneratedInOperationsDto.ownership;
    netZeroEmployeeCommutingActivityData.groupNo = groupNumber;
    return netZeroEmployeeCommutingActivityData;
  }
  async createALLWasteGeneratedInOperations(
    createWasteGeneratedInOperationsDto: WasteGeneratedInOperationsActivityDataDto,
  ) {
    const crypto = require('crypto');
    const groupNumber = createWasteGeneratedInOperationsDto.groupNo
      ? createWasteGeneratedInOperationsDto.groupNo
      : crypto.randomUUID();

    const basicData = await this.getBaseDataWasteGeneratedInOperations(
      createWasteGeneratedInOperationsDto,
    );
    if (
      createWasteGeneratedInOperationsDto.method ==
        WasteGeneratedInOperationsEmissionSourceDataMethod.SUPPLIER &&
      createWasteGeneratedInOperationsDto.supplier_specific_emission_source_data
    ) {
      if (
        createWasteGeneratedInOperationsDto
          .supplier_specific_emission_source_data.scope_data
      ) {
        for (let supplier of createWasteGeneratedInOperationsDto
          .supplier_specific_emission_source_data.scope_data) {
          const wasteGeneratedInOperationsActivityData = this.copyDtotoEntity(
            createWasteGeneratedInOperationsDto,
            groupNumber,
          );
          wasteGeneratedInOperationsActivityData.company = supplier.company;
          wasteGeneratedInOperationsActivityData.scpoeOne = supplier.scpoeOne;
          wasteGeneratedInOperationsActivityData.scpoeOne_unit =
            supplier.scpoeOne_unit;
          wasteGeneratedInOperationsActivityData.scpoeTwo = supplier.scpoeTwo;
          wasteGeneratedInOperationsActivityData.scpoeTwo_unit =
            supplier.scpoeTwo_unit;
          const calculationData: WasteGeneratedInOperationsDto = {
            year: createWasteGeneratedInOperationsDto.year,
            month: createWasteGeneratedInOperationsDto.month,
            method: createWasteGeneratedInOperationsDto.method,
            baseData: basicData,
            emission: 0,
            data: supplier,
            groupNumber: groupNumber,
          };
          if (supplier.id) {
            wasteGeneratedInOperationsActivityData.id = supplier.id;
            await this.updateWasteGeneratedInOperations(
              calculationData,
              wasteGeneratedInOperationsActivityData,
            );
          } else {
            await this.createWasteGeneratedInOperations(
              calculationData,
              wasteGeneratedInOperationsActivityData,
            );
          }
        }
      }
    } else if (
      createWasteGeneratedInOperationsDto.method ==
        WasteGeneratedInOperationsEmissionSourceDataMethod.WASTE &&
      createWasteGeneratedInOperationsDto.waste_type_specific_emission_source_data
    ) {
      if (
        createWasteGeneratedInOperationsDto
          .waste_type_specific_emission_source_data.waste_data
      ) {
        for (let waste of createWasteGeneratedInOperationsDto
          .waste_type_specific_emission_source_data.waste_data) {
          const wasteGeneratedInOperationsActivityData = this.copyDtotoEntity(
            createWasteGeneratedInOperationsDto,
            groupNumber,
          );
          wasteGeneratedInOperationsActivityData.solid_or_water = createWasteGeneratedInOperationsDto
          .waste_type_specific_emission_source_data.solid_or_water;
          if(createWasteGeneratedInOperationsDto
            .waste_type_specific_emission_source_data.solid_or_water==WasteGeneratedInOperationsEmissionSourceDataSolidWater.SOLID){
              wasteGeneratedInOperationsActivityData.wasteType = waste.wasteType;
              wasteGeneratedInOperationsActivityData.disposalType =
                waste.disposalType;
            }else{
              wasteGeneratedInOperationsActivityData.treatmentMethod =
                waste.treatmentMethod;
            }
        
          wasteGeneratedInOperationsActivityData.user_input_ef =
            waste.wasteTypeEF;
          wasteGeneratedInOperationsActivityData.wasteProdused =
            waste.wasteProdused;
          wasteGeneratedInOperationsActivityData.wasteProdused_unit =
            waste.wasteProdused_unit;
          const calculationData: WasteGeneratedInOperationsDto = {
            year: createWasteGeneratedInOperationsDto.year,
            month: createWasteGeneratedInOperationsDto.month,
            method: createWasteGeneratedInOperationsDto.method,
            baseData: basicData,
            emission: 0,
            data: waste,
            groupNumber: groupNumber,
          };
          if (waste.id) {
            wasteGeneratedInOperationsActivityData.id = waste.id;
            await this.updateWasteGeneratedInOperations(
              calculationData,
              wasteGeneratedInOperationsActivityData,
            );
          } else {
            await this.createWasteGeneratedInOperations(
              calculationData,
              wasteGeneratedInOperationsActivityData,
            );
          }
        }
      }
    } else if (
      createWasteGeneratedInOperationsDto.method ==
        WasteGeneratedInOperationsEmissionSourceDataMethod.AVERAGE_DATA &&
      createWasteGeneratedInOperationsDto.average_data_emission_source_data
    ) {
      if (
        createWasteGeneratedInOperationsDto.average_data_emission_source_data
          .waste_data
      ) {
        for (let average of createWasteGeneratedInOperationsDto
          .average_data_emission_source_data.waste_data) {
          const wasteGeneratedInOperationsActivityData = this.copyDtotoEntity(
            createWasteGeneratedInOperationsDto,
            groupNumber,
          );
          wasteGeneratedInOperationsActivityData.treatmentMethod =
            average.treatmentMethod;
          wasteGeneratedInOperationsActivityData.user_input_ef =
            average.treatmentMethodEF;
          wasteGeneratedInOperationsActivityData.massOfWaste =
            average.massOfWaste;
          wasteGeneratedInOperationsActivityData.massOfWaste_unit =
            average.massOfWaste_unit;
          wasteGeneratedInOperationsActivityData.proportionOfWaste =
            average.proportionOfWaste;

          const calculationData: WasteGeneratedInOperationsDto = {
            year: createWasteGeneratedInOperationsDto.year,
            month: createWasteGeneratedInOperationsDto.month,
            method: createWasteGeneratedInOperationsDto.method,
            baseData: basicData,
            emission: 0,
            data: average,
            groupNumber: groupNumber,
          };
          if (average.id) {
            wasteGeneratedInOperationsActivityData.id = average.id;
            await this.updateWasteGeneratedInOperations(
              calculationData,
              wasteGeneratedInOperationsActivityData,
            );
          } else {
            await this.createWasteGeneratedInOperations(
              calculationData,
              wasteGeneratedInOperationsActivityData,
            );
          }
        }
      }
    } else {
      return null;
    }
  }

  async createWasteGeneratedInOperations(
    calculationData: WasteGeneratedInOperationsDto,
    netZeroEmployeeCommutingActivityData: WasteGeneratedInOperationsActivityData,
  ) {
    netZeroEmployeeCommutingActivityData.groupNo = calculationData.groupNumber;
    netZeroEmployeeCommutingActivityData.direct =
      calculationData.baseData.clasification === Clasification.DIRECT
        ? true
        : false;
    netZeroEmployeeCommutingActivityData.indirect =
      calculationData.baseData.clasification === Clasification.INDIRECT
        ? true
        : false;
    netZeroEmployeeCommutingActivityData.other =
      calculationData.baseData.clasification === Clasification.OTHER
        ? true
        : false;

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.Waste_Generated_in_Operations,
      data: calculationData,
    });
    console.log('emissione', emission);
    if (
      emission &&
      (emission.e_sc ||
        emission.e_sc_co2 ||
        emission.e_sc_ch4 ||
        emission.e_sc_n2o)
    ) {
      this.updateTotalEmission(
        netZeroEmployeeCommutingActivityData,
        calculationData,
        emission,
      );
    }

    netZeroEmployeeCommutingActivityData.emission = emission.e_sc
      ? emission.e_sc
      : 0;

    netZeroEmployeeCommutingActivityData.e_sc = emission.e_sc
      ? emission.e_sc
      : 0;
    netZeroEmployeeCommutingActivityData.e_sc_co2 = emission.e_sc_co2
      ? emission.e_sc_co2
      : 0;
    netZeroEmployeeCommutingActivityData.e_sc_ch4 = emission.e_sc_ch4
      ? emission.e_sc_ch4
      : 0;
    netZeroEmployeeCommutingActivityData.e_sc_n2o = emission.e_sc_n2o
      ? emission.e_sc_n2o
      : 0;

    return await this.WasteGeneratedInOperationsRepository.save(
      netZeroEmployeeCommutingActivityData,
    );
  }
  async updateWasteGeneratedInOperations(
    calculationData: WasteGeneratedInOperationsDto,
    updateWasteGeneratedInOperationsDto: WasteGeneratedInOperationsActivityData,
  ) {
    updateWasteGeneratedInOperationsDto.direct =
      calculationData.baseData.clasification === Clasification.DIRECT
        ? true
        : false;
    updateWasteGeneratedInOperationsDto.indirect =
      calculationData.baseData.clasification === Clasification.INDIRECT
        ? true
        : false;
    updateWasteGeneratedInOperationsDto.other =
      calculationData.baseData.clasification === Clasification.OTHER
        ? true
        : false;

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.Waste_Generated_in_Operations,
      data: calculationData,
    });

    if (updateWasteGeneratedInOperationsDto.e_sc !== emission.e_sc) {
      let current = await this.repo.findOne(
        updateWasteGeneratedInOperationsDto.id,
      );
      let updatedEmission = this.calculationService.getDiff(current, emission);
      this.calculationService.updateTotalEmission(
        updatedEmission,
        updateWasteGeneratedInOperationsDto.project,
        calculationData.baseData.clasification,
        sourceName.Waste_Generated_in_Operations,
        updateWasteGeneratedInOperationsDto.unit.id,
      );
    }
    updateWasteGeneratedInOperationsDto.emission = emission.e_sc
      ? emission.e_sc
      : 0;

    updateWasteGeneratedInOperationsDto.e_sc = emission.e_sc
      ? emission.e_sc
      : 0;
    updateWasteGeneratedInOperationsDto.e_sc_co2 = emission.e_sc_co2
      ? emission.e_sc_co2
      : 0;
    updateWasteGeneratedInOperationsDto.e_sc_ch4 = emission.e_sc_ch4
      ? emission.e_sc_ch4
      : 0;
    updateWasteGeneratedInOperationsDto.e_sc_n2o = emission.e_sc_n2o
      ? emission.e_sc_n2o
      : 0;

    const updated = await this.repo.update(
      {
        id: updateWasteGeneratedInOperationsDto.id,
      },
      updateWasteGeneratedInOperationsDto,
    );
    if (updated.affected === 1) {
      return await this.repo.findOne(updateWasteGeneratedInOperationsDto.id);
    } else {
      throw new InternalServerErrorException('Updating is failed');
    }
  }

  async create(
    createWasteGeneratedInOperationsDto: WasteGeneratedInOperationsActivityData,
  ) {}

  async update(
    id: number,
    updateWasteGeneratedInOperationsDto: WasteGeneratedInOperationsActivityData,
  ) {}

  async remove(req) {
    let o = req.parsed.paramsFilter.find((o) => o.field === 'id');
    let deleteDto = await this.repo.findOne({ id: o.value });
    let updatedEmission = this.calculationService.getDiff(deleteDto, null);
    this.calculationService.updateTotalEmission(
      updatedEmission,
      deleteDto.project,
      deleteDto.direct
        ? Clasification.DIRECT
        : deleteDto.indirect
        ? Clasification.INDIRECT
        : Clasification.OTHER,
      sourceName.Waste_Generated_in_Operations,
      deleteDto.unit.id,
    );
    return await this.repo.delete({ id: deleteDto.id });
  }
  async getBaseDataWasteGeneratedInOperations(
    dto: WasteGeneratedInOperationsActivityDataDto,
  ): Promise<BaseDataDto> {
    let activityInfo = new PuesDataReqActivityData();
    activityInfo.owenerShip = Ownership.getkey(dto.ownership);
    activityInfo.stationary = dto.stationary;
    activityInfo.mobile = dto.mobile;
    let req = new PuesDataReqDto();
    req.project = dto.project;
    req.sourceName = sourceName.Waste_Generated_in_Operations;
    req.unitId = dto.unit.id;
    req.user = dto.user;
    req.activityInfo = activityInfo;

    let puesData = await this.puesService.getPuesData(req);

    return {
      clasification: puesData.clasification,
      tier: puesData.tier,
      sourceType: puesData.sourceType,
      industry: puesData.industry.code,
      countryCode: puesData.countryCode,
      projectId: dto.project.id,
    };
  }
  async getBaseData(
    dto: WasteGeneratedInOperationsActivityData,
  ): Promise<BaseDataDto> {
    let activityInfo = new PuesDataReqActivityData();
    activityInfo.owenerShip = Ownership.getkey(dto.ownership);
    activityInfo.stationary = dto.stationary;
    activityInfo.mobile = dto.mobile;
    let req = new PuesDataReqDto();
    req.project = dto.project;
    req.sourceName = sourceName.Waste_Generated_in_Operations;
    req.unitId = dto.unit.id;
    req.user = dto.user;
    req.activityInfo = activityInfo;

    let puesData = await this.puesService.getPuesData(req);

    return {
      clasification: puesData.clasification,
      tier: puesData.tier,
      sourceType: puesData.sourceType,
      industry: puesData.industry.code,
      countryCode: puesData.countryCode,
      projectId: dto.project.id,
    };
  }

  async updateTotalEmission(
    dto: WasteGeneratedInOperationsActivityData,
    calData: WasteGeneratedInOperationsDto,
    emission: any,
  ) {
    let reqPues: PuesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Waste_Generated_in_Operations,
      unitId: dto.unit.id,
      emission: emission,
      classification: calData.baseData.clasification,
    };

    await this.puesService.addEmission(reqPues);

    let reqPes: PesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Waste_Generated_in_Operations,
      emission: emission,
      classification: calData.baseData.clasification,
    };
    this.pesService.addEmission(reqPes);

    let reqProject: ProjectSumDataReqDto = {
      project: dto.project,
      classification: calData.baseData.clasification,
      emission: emission,
    };
    this.projectService.addEmission(reqProject);
  }

  async addFromExcell(
    unit: Unit,
    project: Project,
    user: User,
    data: any,
    variable_mapping: any[],
    year: number,
  ) {
    throw new InternalServerErrorException('no implimentation');
  }

  async getAllWasteGeneratedInOperationsData(
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
        filter = 'unit.id=:projectId';
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
      .addGroupBy('acData.method')
      .addGroupBy('acData.unitId ')
      .addGroupBy('acData.projectId')
      .addGroupBy('acData.year')
      .addGroupBy('acData.month')
      // .addGroupBy('acData.groupNo')

      .innerJoin('acData.project', 'project', 'project.id = acData.projectId')
      .innerJoin('acData.unit', 'unit', 'unit.id = acData.unitId')
      .select(
        'project.name as project_name, acData.method as acData_method,unit.name as unit_name,acData.year as acData_year,acData.month as acData_month,acData.groupNo as acData_groupNo',
      )
      .addSelect('SUM(acData.e_sc)', 'sum')
      .addSelect('MIN(acData.id)', 'id')
      .orderBy('id', 'DESC')
      .offset(
        (option.page > 1 ? option.page - 1 : 0) *
          (option.limit != 0 ? option.limit : 0),
      )
      .limit(option.limit != 0 ? option.limit : 100000);

    console.log(await data2.getRawMany());
    return {
      data: await data2.getRawMany(),
      total: (await data.getRawMany()).length,
    };
  }

  async getOneWasteGeneratedInOperationsDataSet(
    groupNumber: string,
  ): Promise<any> {
    let filter = 'acData.groupNo=:groupNumber';

    let data = this.repo
      .createQueryBuilder('acData')
      .innerJoinAndMapOne(
        'acData.project',
        Project,

        'project',

        'project.id = acData.projectId',
      )
      .innerJoinAndMapOne(
        'acData.unit',
        Unit,
        'unit',
        'unit.id = acData.unitId',
      )
      .where(filter, { groupNumber })
      .orderBy('acData.createdOn', 'ASC');

    // console.log(await data.getCount())
    const results = await data.getMany();
    console.log('asdsadas', results);
    const dto = new WasteGeneratedInOperationsActivityDataDto();
    dto.project = results[0].project;
    dto.year = results[0].year;
    dto.month = results[0].month;
    dto.unit = results[0].unit;
    dto.method = results[0].method;
    dto.mobile = results[0].mobile;
    dto.stationary = results[0].stationary;
    dto.groupNo = results[0].groupNo;
    dto.activityDataStatus = results[0].activityDataStatus;
    dto.ownership = results[0].ownership;
    groupNumber = results[0].groupNo;
    dto.supplier_specific_emission_source_data =
      new SupplierSpecificWasteGeneratedInOperationsEmissionSourceData();
    dto.waste_type_specific_emission_source_data =
      new WasteTypeSpecificWasteGeneratedInOperationsEmissionSourceData();
    dto.average_data_emission_source_data =
      new AverageDataWasteGeneratedInOperationsEmissionSourceData();
    for await (let res of results) {
      console.log('asdsadas');
      if (
        res.method ==
        WasteGeneratedInOperationsEmissionSourceDataMethod.SUPPLIER
      ) {
        if (res.company) {
          if (!dto.supplier_specific_emission_source_data.scope_data) {
            dto.supplier_specific_emission_source_data.scope_data = [];
          }
          dto.supplier_specific_emission_source_data.scope_data.push({
            id: res.id,
            company: res.company,
            scpoeOne: res.scpoeOne,
            scpoeOne_unit: res.scpoeOne_unit,
            scpoeTwo: res.scpoeTwo,
            scpoeTwo_unit: res.scpoeTwo_unit,
          });
        }
      } else if (
        res.method == WasteGeneratedInOperationsEmissionSourceDataMethod.WASTE
      ) {
        dto.waste_type_specific_emission_source_data.solid_or_water = results[0].solid_or_water;
        if (res.wasteType||res.treatmentMethod) {
          if (!dto.waste_type_specific_emission_source_data.waste_data) {
            dto.waste_type_specific_emission_source_data.waste_data = [];
          }
          dto.waste_type_specific_emission_source_data.waste_data.push({
            id: res.id,
            wasteType: res.wasteType,
            wasteTypeEF: res.user_input_ef,
            disposalType: res.disposalType,
            wasteProdused: res.wasteProdused,
            wasteProdused_unit: res.wasteProdused_unit,
            treatmentMethod:res.treatmentMethod
          });
        }
      } else {
        // console.log(res)
        if (res.treatmentMethod) {
          if (!dto.average_data_emission_source_data.waste_data) {
            dto.average_data_emission_source_data.waste_data = [];
          }

          dto.average_data_emission_source_data.waste_data.push({
            id: res.id,
            treatmentMethod: res.treatmentMethod,
            treatmentMethodEF: res.user_input_ef,
            massOfWaste: res.massOfWaste,
            massOfWaste_unit: res.massOfWaste_unit,
            proportionOfWaste: res.proportionOfWaste,
          });
        }
      }
    }

    return dto;
  }
  async deleteWholeGroup(groupNumber: string) {
    let deleteDtos = await this.repo.find({ where: { groupNo: groupNumber } });
    for await (let deleteDto of deleteDtos) {
      await this.removeOneForWholegroup(deleteDto);
    }
    return true;
  }

  async removeOneForWholegroup(
    deleteDto: WasteGeneratedInOperationsActivityData,
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
      sourceName.Waste_Generated_in_Operations,
      deleteDto.unit.id,
    );
    return await this.repo.delete({ id: deleteDto.id });
  }

  async removeOneRow(id: number) {
    let deleteDto = await this.repo.findOne({ id: id });
    let updatedEmission = this.calculationService.getDiff(deleteDto, null);
    this.calculationService.updateTotalEmission(
      updatedEmission,
      deleteDto.project,
      deleteDto.direct
        ? Clasification.DIRECT
        : deleteDto.indirect
        ? Clasification.INDIRECT
        : Clasification.OTHER,
      sourceName.Waste_Generated_in_Operations,
      deleteDto.unit.id,
    );
    return await this.repo.delete({ id: deleteDto.id });
  }
}
