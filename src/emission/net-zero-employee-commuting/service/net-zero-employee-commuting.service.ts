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
import { NetZeroEmployeeCommutingActivityData } from '../entities/net-zero-employee-commuting.entity';

import {
  AverageDataNetZeroEmployeeCommutingEmissionSourceData,
  DistanceBasedNetZeroEmployeeCommutingEmissionSourceData,
  FuelBasedNetZeroEmployeeCommutingEmissionSourceData,
  FuelFuelBasedNetZeroEmployeeCommutingEmissionSourceData,
  GridFuelBasedNetZeroEmployeeCommutingEmissionSourceData,
  NetZeroEmployeeCommutingActivityDataDto,
  NetZeroEmployeeCommutingEmissionSourceDataMethod,
  NetZeroEmployeeCommutingEmissionSourceDataTypeNames,
  RefrigerantFuelBasedNetZeroEmployeeCommutingEmissionSourceData,
  VehicleDistanceBasedNetZeroEmployeeCommutingEmissionSourceData,
} from '../dto/net-zero-employee-commuting-dto.dto';
import { NetZeroEmployeeCommutingDto } from 'src/emission/calculation/dto/net-zero-employee-commuting.dto';
import { result } from 'src/report/dto/create-report.dto';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { WasteGeneratedInOperationsDto } from 'src/emission/calculation/dto/waste-generated-in-operations.dto';
import { Country } from 'src/country/entities/country.entity';

@Injectable()
export class NetZeroEmployeeCommutingService
  extends TypeOrmCrudService<NetZeroEmployeeCommutingActivityData>
  implements ExcellUploadable, ProgressRetriever, ExcelDownloader {
  getDto() {
    return new NetZeroEmployeeCommutingActivityData();
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
    @InjectRepository(NetZeroEmployeeCommutingActivityData) repo,
    @InjectRepository(NetZeroEmployeeCommutingActivityData)
    private readonly netZeroEmployeeCommutingRepository: Repository<NetZeroEmployeeCommutingActivityData>,
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
      sourceName.Net_Zero_Employee_Commuting,
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
    let dto = new NetZeroEmployeeCommutingActivityData();
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
    createNetZeroEmployeeCommutingDto: NetZeroEmployeeCommutingActivityDataDto,
    groupNumber: string,
  ): NetZeroEmployeeCommutingActivityData {
    const netZeroEmployeeCommutingActivityData =
      new NetZeroEmployeeCommutingActivityData();

    netZeroEmployeeCommutingActivityData.project =
      createNetZeroEmployeeCommutingDto.project;
    netZeroEmployeeCommutingActivityData.year =
      createNetZeroEmployeeCommutingDto.year;
    netZeroEmployeeCommutingActivityData.month =
      createNetZeroEmployeeCommutingDto.month;
    netZeroEmployeeCommutingActivityData.unit =
      createNetZeroEmployeeCommutingDto.unit;
    netZeroEmployeeCommutingActivityData.method =
      createNetZeroEmployeeCommutingDto.method;
    netZeroEmployeeCommutingActivityData.mobile =
      createNetZeroEmployeeCommutingDto.mobile;
    netZeroEmployeeCommutingActivityData.stationary =
      createNetZeroEmployeeCommutingDto.stationary;
    netZeroEmployeeCommutingActivityData.activityDataStatus =
      createNetZeroEmployeeCommutingDto.activityDataStatus;
    netZeroEmployeeCommutingActivityData.ownership =
      createNetZeroEmployeeCommutingDto.ownership;
    netZeroEmployeeCommutingActivityData.groupNo = groupNumber;
    return netZeroEmployeeCommutingActivityData;
  }
  async createALLNetZeroEmployeeCommuting(
    createNetZeroEmployeeCommutingDto: NetZeroEmployeeCommutingActivityDataDto,
  ) {
    const crypto = require('crypto');
    const groupNumber = createNetZeroEmployeeCommutingDto.groupNo
      ? createNetZeroEmployeeCommutingDto.groupNo
      : crypto.randomUUID();

    const basicData = await this.getBaseDataNetZeroEmployeeCommuting(
      createNetZeroEmployeeCommutingDto,
    );
    if (
      createNetZeroEmployeeCommutingDto.method ==
      NetZeroEmployeeCommutingEmissionSourceDataMethod.FUEL_BASE &&
      createNetZeroEmployeeCommutingDto.fuel_emission_source_data
    ) {
      if (
        createNetZeroEmployeeCommutingDto.fuel_emission_source_data.fuel_data
      ) {
        for (let fuel of createNetZeroEmployeeCommutingDto
          .fuel_emission_source_data.fuel_data) {
          fuel.typeName =
            NetZeroEmployeeCommutingEmissionSourceDataTypeNames.Fuel;
          const netZeroEmployeeCommutingActivityData = this.copyDtotoEntity(
            createNetZeroEmployeeCommutingDto,
            groupNumber,
          );
          netZeroEmployeeCommutingActivityData.fuel_type = fuel.fuel_type;
          netZeroEmployeeCommutingActivityData.fuel_quntity = fuel.quntity;
          netZeroEmployeeCommutingActivityData.fuel_quntity_unit =
            fuel.fuel_quntity_unit;
          const calculationData: NetZeroEmployeeCommutingDto = {
            year: createNetZeroEmployeeCommutingDto.year,
            month: createNetZeroEmployeeCommutingDto.month,
            method: createNetZeroEmployeeCommutingDto.method,
            baseData: basicData,
            emission: 0,
            data: fuel,
            groupNumber: groupNumber,
          };
          if (fuel.id) {
            netZeroEmployeeCommutingActivityData.id = fuel.id;
            await this.updateNetZeroEmployeeCommuting(
              calculationData,
              netZeroEmployeeCommutingActivityData,
            );
          } else {
            await this.createNetZeroEmployeeCommuting(
              calculationData,
              netZeroEmployeeCommutingActivityData,
            );
          }
        }
      }
      if (
        createNetZeroEmployeeCommutingDto.fuel_emission_source_data.grid_data
      ) {
        for (let grid of createNetZeroEmployeeCommutingDto
          .fuel_emission_source_data.grid_data) {
          grid.typeName =
            NetZeroEmployeeCommutingEmissionSourceDataTypeNames.Grid;
          const netZeroEmployeeCommutingActivityData = this.copyDtotoEntity(
            createNetZeroEmployeeCommutingDto,
            groupNumber,
          );
          netZeroEmployeeCommutingActivityData.grid_type = grid.grid_type;
          netZeroEmployeeCommutingActivityData.grid_quntity = grid.quntity;
          netZeroEmployeeCommutingActivityData.grid_quntity_unit =
            grid.grid_quntity_unit;
          const calculationData: NetZeroEmployeeCommutingDto = {
            year: createNetZeroEmployeeCommutingDto.year,
            month: createNetZeroEmployeeCommutingDto.month,
            method: createNetZeroEmployeeCommutingDto.method,
            baseData: basicData,
            emission: 0,
            data: grid,
            groupNumber: groupNumber,
          };
          if (grid.id) {
            netZeroEmployeeCommutingActivityData.id = grid.id;
            await this.updateNetZeroEmployeeCommuting(
              calculationData,
              netZeroEmployeeCommutingActivityData,
            );
          } else {
            await this.createNetZeroEmployeeCommuting(
              calculationData,
              netZeroEmployeeCommutingActivityData,
            );
          }
        }
      }
      if (
        createNetZeroEmployeeCommutingDto.fuel_emission_source_data
          .refrigerant_data
      ) {
        for (let ref of createNetZeroEmployeeCommutingDto
          .fuel_emission_source_data.refrigerant_data) {
          ref.typeName =
            NetZeroEmployeeCommutingEmissionSourceDataTypeNames.Ref;
          const netZeroEmployeeCommutingActivityData = this.copyDtotoEntity(
            createNetZeroEmployeeCommutingDto,
            groupNumber,
          );
          netZeroEmployeeCommutingActivityData.refrigerant_type =
            ref.refrigerant_type;
          netZeroEmployeeCommutingActivityData.refrigerant_quntity =
            ref.quntity;
          netZeroEmployeeCommutingActivityData.refrigerant_quntity_unit =
            ref.refrigerant_quntity_unit;
          const calculationData: NetZeroEmployeeCommutingDto = {
            year: createNetZeroEmployeeCommutingDto.year,
            month: createNetZeroEmployeeCommutingDto.month,
            method: createNetZeroEmployeeCommutingDto.method,
            baseData: basicData,
            emission: 0,
            data: ref,
            groupNumber: groupNumber,
          };
          if (ref.id) {
            netZeroEmployeeCommutingActivityData.id = ref.id;
            await this.updateNetZeroEmployeeCommuting(
              calculationData,
              netZeroEmployeeCommutingActivityData,
            );
          } else {
            await this.createNetZeroEmployeeCommuting(
              calculationData,
              netZeroEmployeeCommutingActivityData,
            );
          }
        }
      }
    } else if (
      createNetZeroEmployeeCommutingDto.method ==
      NetZeroEmployeeCommutingEmissionSourceDataMethod.DISTANCE_BASE &&
      createNetZeroEmployeeCommutingDto.distance_emission_source_data
    ) {
      if (
        createNetZeroEmployeeCommutingDto.distance_emission_source_data
          .vehicale_data
      ) {
        for (let vehical of createNetZeroEmployeeCommutingDto
          .distance_emission_source_data.vehicale_data) {
          vehical.typeName =
            NetZeroEmployeeCommutingEmissionSourceDataTypeNames.Distance;
          const netZeroEmployeeCommutingActivityData = this.copyDtotoEntity(
            createNetZeroEmployeeCommutingDto,
            groupNumber,
          );
          netZeroEmployeeCommutingActivityData.vehicleType =
            vehical.vehicleType;
          netZeroEmployeeCommutingActivityData.totalDistanceTravelled =
            vehical.totalDistanceTravelled;
          netZeroEmployeeCommutingActivityData.totalDistanceTravelled_unit =
            vehical.totalDistanceTravelled_unit;
          netZeroEmployeeCommutingActivityData.commutingDaysPerYear =
            vehical.commutingDaysPerYear;
          const calculationData: NetZeroEmployeeCommutingDto = {
            year: createNetZeroEmployeeCommutingDto.year,
            month: createNetZeroEmployeeCommutingDto.month,
            method: createNetZeroEmployeeCommutingDto.method,
            baseData: basicData,
            emission: 0,
            data: vehical,
            groupNumber: groupNumber,
          };
          if (vehical.id) {
            netZeroEmployeeCommutingActivityData.id = vehical.id;
            await this.updateNetZeroEmployeeCommuting(
              calculationData,
              netZeroEmployeeCommutingActivityData,
            );
          } else {
            await this.createNetZeroEmployeeCommuting(
              calculationData,
              netZeroEmployeeCommutingActivityData,
            );
          }
        }
      }
      if (
        createNetZeroEmployeeCommutingDto.distance_emission_source_data
          .energy_data
      ) {
        for (let energy of createNetZeroEmployeeCommutingDto
          .distance_emission_source_data.energy_data) {
          energy.typeName =
            NetZeroEmployeeCommutingEmissionSourceDataTypeNames.Energy;
          const netZeroEmployeeCommutingActivityData = this.copyDtotoEntity(
            createNetZeroEmployeeCommutingDto,
            groupNumber,
          );
          netZeroEmployeeCommutingActivityData.energy = energy.energy;
          netZeroEmployeeCommutingActivityData.energy_source =
            energy.energy_source;
          netZeroEmployeeCommutingActivityData.energy_unit = energy.energy_unit;
          netZeroEmployeeCommutingActivityData.user_input_ef =
            energy.user_input_ef;

          const calculationData: NetZeroEmployeeCommutingDto = {
            year: createNetZeroEmployeeCommutingDto.year,
            month: createNetZeroEmployeeCommutingDto.month,
            method: createNetZeroEmployeeCommutingDto.method,
            baseData: basicData,
            emission: 0,
            data: energy,
            groupNumber: groupNumber,
          };
          if (energy.id) {
            netZeroEmployeeCommutingActivityData.id = energy.id;
            await this.updateNetZeroEmployeeCommuting(
              calculationData,
              netZeroEmployeeCommutingActivityData,
            );
          } else {
            await this.createNetZeroEmployeeCommuting(
              calculationData,
              netZeroEmployeeCommutingActivityData,
            );
          }
        }
      }
    } else if (
      createNetZeroEmployeeCommutingDto.method ==
      NetZeroEmployeeCommutingEmissionSourceDataMethod.AVERAGE_DATA_BASE &&
      createNetZeroEmployeeCommutingDto.average_data_emission_source_data
    ) {
      if (
        createNetZeroEmployeeCommutingDto.average_data_emission_source_data
          .average_data
      ) {
        for (let average of createNetZeroEmployeeCommutingDto
          .average_data_emission_source_data.average_data) {
          const netZeroEmployeeCommutingActivityData = this.copyDtotoEntity(
            createNetZeroEmployeeCommutingDto,
            groupNumber,
          );
          netZeroEmployeeCommutingActivityData.vehicleType =
            average.travel_type;
          netZeroEmployeeCommutingActivityData.workingDayPerYear =
            average.workingDayPerYear;
          netZeroEmployeeCommutingActivityData.oneWayDistance =
            average.oneWayDistance;
          netZeroEmployeeCommutingActivityData.oneWayDistance_unit =
            average.oneWayDistance_unit;
          netZeroEmployeeCommutingActivityData.numberOfEmplyees =
            average.numberOfEmplyees;
          netZeroEmployeeCommutingActivityData.presentageUsingVehcleType =
            average.presentageUsingVehcleType;
          // netZeroEmployeeCommutingActivityData.user_input_ef=average.user_input_ef;
          const calculationData: NetZeroEmployeeCommutingDto = {
            year: createNetZeroEmployeeCommutingDto.year,
            month: createNetZeroEmployeeCommutingDto.month,
            method: createNetZeroEmployeeCommutingDto.method,
            baseData: basicData,
            emission: 0,
            data: average,
            groupNumber: groupNumber,
          };
          if (average.id) {
            netZeroEmployeeCommutingActivityData.id = average.id;
            await this.updateNetZeroEmployeeCommuting(
              calculationData,
              netZeroEmployeeCommutingActivityData,
            );
          } else {
            await this.createNetZeroEmployeeCommuting(
              calculationData,
              netZeroEmployeeCommutingActivityData,
            );
          }
        }
      }
    } else {
      return null;
    }
  }

  async createNetZeroEmployeeCommuting(
    calculationData: NetZeroEmployeeCommutingDto,
    netZeroEmployeeCommutingActivityData: NetZeroEmployeeCommutingActivityData,
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
      sourceName: sourceName.Net_Zero_Employee_Commuting,
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

    netZeroEmployeeCommutingActivityData.emission =  emission.e_sc
      ? emission.e_sc
      : 0;

    netZeroEmployeeCommutingActivityData.e_sc =  emission.e_sc
      ? emission.e_sc
      : 0;
    netZeroEmployeeCommutingActivityData.e_sc_co2 =  emission.e_sc_co2
      ? emission.e_sc_co2
      : 0;
    netZeroEmployeeCommutingActivityData.e_sc_ch4 =  emission.e_sc_ch4
      ? emission.e_sc_ch4
      : 0;
    netZeroEmployeeCommutingActivityData.e_sc_n2o =  emission.e_sc_n2o
      ? emission.e_sc_n2o
      : 0;

    return await this.netZeroEmployeeCommutingRepository.save(
      netZeroEmployeeCommutingActivityData,
    );
  }
  async updateNetZeroEmployeeCommuting(
    calculationData: NetZeroEmployeeCommutingDto,
    updateNetZeroEmployeeCommutingDto: NetZeroEmployeeCommutingActivityData,
  ) {
    updateNetZeroEmployeeCommutingDto.direct =
      calculationData.baseData.clasification === Clasification.DIRECT
        ? true
        : false;
    updateNetZeroEmployeeCommutingDto.indirect =
      calculationData.baseData.clasification === Clasification.INDIRECT
        ? true
        : false;
    updateNetZeroEmployeeCommutingDto.other =
      calculationData.baseData.clasification === Clasification.OTHER
        ? true
        : false;

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.Net_Zero_Employee_Commuting,
      data: calculationData,
    });

    if (updateNetZeroEmployeeCommutingDto.e_sc !== emission.e_sc) {
      let current = await this.repo.findOne(
        updateNetZeroEmployeeCommutingDto.id,
      );
      let updatedEmission = this.calculationService.getDiff(current, emission);
      this.calculationService.updateTotalEmission(
        updatedEmission,
        updateNetZeroEmployeeCommutingDto.project,
        calculationData.baseData.clasification,
        sourceName.Net_Zero_Employee_Commuting,
        updateNetZeroEmployeeCommutingDto.unit.id,
      );
    }
    updateNetZeroEmployeeCommutingDto.emission =  emission.e_sc
      ? emission.e_sc
      : 0;

    updateNetZeroEmployeeCommutingDto.e_sc =  emission.e_sc ? emission.e_sc : 0;
    updateNetZeroEmployeeCommutingDto.e_sc_co2 = emission.e_sc_co2
      ? emission.e_sc_co2
      : 0;
    updateNetZeroEmployeeCommutingDto.e_sc_ch4 =  emission.e_sc_ch4
      ? emission.e_sc_ch4
      : 0;
    updateNetZeroEmployeeCommutingDto.e_sc_n2o =  emission.e_sc_n2o
      ? emission.e_sc_n2o
      : 0;

    const updated = await this.repo.update(
      {
        id: updateNetZeroEmployeeCommutingDto.id,
      },
      updateNetZeroEmployeeCommutingDto,
    );
    if (updated.affected === 1) {
      return await this.repo.findOne(updateNetZeroEmployeeCommutingDto.id);
    } else {
      throw new InternalServerErrorException('Updating is failed');
    }
  }

  async create(
    createNetZeroEmployeeCommutingDto: NetZeroEmployeeCommutingActivityData,
  ) { }

  async update(
    id: number,
    updateNetZeroEmployeeCommutingDto: NetZeroEmployeeCommutingActivityData,
  ) { }

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
      sourceName.Net_Zero_Employee_Commuting,
      deleteDto.unit.id,
    );
    return await this.repo.delete({ id: deleteDto.id });
  }
  async getBaseDataNetZeroEmployeeCommuting(
    dto: NetZeroEmployeeCommutingActivityDataDto,
  ): Promise<BaseDataDto> {
    let activityInfo = new PuesDataReqActivityData();
    activityInfo.owenerShip = Ownership.getkey(dto.ownership);
    activityInfo.stationary = dto.stationary;
    activityInfo.mobile = dto.mobile;
    let req = new PuesDataReqDto();
    req.project = dto.project;
    req.sourceName = sourceName.Net_Zero_Employee_Commuting;
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
    dto: NetZeroEmployeeCommutingActivityData,
  ): Promise<BaseDataDto> {
    let activityInfo = new PuesDataReqActivityData();
    activityInfo.owenerShip = Ownership.getkey(dto.ownership);
    activityInfo.stationary = dto.stationary;
    activityInfo.mobile = dto.mobile;
    let req = new PuesDataReqDto();
    req.project = dto.project;
    req.sourceName = sourceName.Net_Zero_Employee_Commuting;
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
    dto: NetZeroEmployeeCommutingActivityData,
    calData: NetZeroEmployeeCommutingDto,
    emission: any,
  ) {
    let reqPues: PuesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Net_Zero_Employee_Commuting,
      unitId: dto.unit.id,
      emission: emission,
      classification: calData.baseData.clasification,
    };

    await this.puesService.addEmission(reqPues);

    let reqPes: PesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Net_Zero_Employee_Commuting,
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

  async getAllEmployeeCommutingData(
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

      .innerJoin(
        'acData.project',
        'project',
        'project.id = acData.projectId',
      )
      .innerJoin('acData.unit', 'unit', 'unit.id = acData.unitId')
      .select('project.name as project_name, acData.method as acData_method,unit.name as unit_name,acData.year as acData_year,acData.month as acData_month,acData.groupNo as acData_groupNo')
      .addSelect('SUM(acData.e_sc)', 'sum')
      .addSelect('MIN(acData.id)', 'id')
      .orderBy('id', 'DESC')
      .offset(
        (option.page > 1 ? option.page - 1 : 0) *
        (option.limit != 0 ? option.limit : 0),
      )
      .limit(option.limit != 0 ? option.limit : 100000);

    // console.log((await data.getRawMany()).length)
    return {
      data: await data2.getRawMany(),
      total: (await data.getRawMany()).length,
    };
  }

  async getOneEmployeeCommutingDataSet(groupNumber: string): Promise<any> {
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
      .innerJoinAndMapOne(
        'unit.country',
        Country,
        'country',
        'unit.countryId = country.id',
      )
      .where(filter, { groupNumber })
      .orderBy('acData.createdOn', 'ASC');

    // console.log(await data.getCount())
    const results = await data.getMany();
    console.log(results);
    const dto = new NetZeroEmployeeCommutingActivityDataDto();
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
    dto.fuel_emission_source_data =
      new FuelBasedNetZeroEmployeeCommutingEmissionSourceData();
    dto.distance_emission_source_data =
      new DistanceBasedNetZeroEmployeeCommutingEmissionSourceData();
    dto.average_data_emission_source_data =
      new AverageDataNetZeroEmployeeCommutingEmissionSourceData();
    for await (let res of results) {
      if (
        res.method == NetZeroEmployeeCommutingEmissionSourceDataMethod.FUEL_BASE
      ) {
        if (res.fuel_type && res.fuel_quntity) {
          if (!dto.fuel_emission_source_data.fuel_data) {
            dto.fuel_emission_source_data.fuel_data = [];
          }
          dto.fuel_emission_source_data.fuel_data.push({
            id: res.id,
            fuel_type: res.fuel_type,
            quntity: res.fuel_quntity,
            typeName: '',
            fuel_quntity_unit: res.fuel_quntity_unit,
          });
        } else if (res.grid_type && res.grid_quntity) {
          if (!dto.fuel_emission_source_data.grid_data) {
            dto.fuel_emission_source_data.grid_data = [];
          }
          dto.fuel_emission_source_data.grid_data.push({
            id: res.id,
            grid_type: res.grid_type,
            quntity: res.grid_quntity,
            typeName: '',
            grid_quntity_unit: res.grid_quntity_unit,
          });
        } else if (res.refrigerant_type && res.refrigerant_quntity) {
          if (!dto.fuel_emission_source_data.refrigerant_data) {
            dto.fuel_emission_source_data.refrigerant_data = [];
          }
          dto.fuel_emission_source_data.refrigerant_data.push({
            id: res.id,
            refrigerant_type: res.refrigerant_type,
            quntity: res.refrigerant_quntity,
            typeName: '',
            refrigerant_quntity_unit: res.refrigerant_quntity_unit,
          });
        }
      } else if (
        res.method ==
        NetZeroEmployeeCommutingEmissionSourceDataMethod.DISTANCE_BASE
      ) {
        if (res.vehicleType) {
          if (!dto.distance_emission_source_data.vehicale_data) {
            dto.distance_emission_source_data.vehicale_data = [];
          }
          dto.distance_emission_source_data.vehicale_data.push({
            id: res.id,
            vehicleType: res.vehicleType,
            totalDistanceTravelled: res.totalDistanceTravelled,
            typeName: '',
            totalDistanceTravelled_unit: res.totalDistanceTravelled_unit,
            commutingDaysPerYear: res.commutingDaysPerYear,
          });
        } else if (res.energy_source) {
          if (!dto.distance_emission_source_data.energy_data) {
            dto.distance_emission_source_data.energy_data = [];
          }
          dto.distance_emission_source_data.energy_data.push({
            id: res.id,
            typeName: res.totalDistanceTravelled_unit,
            energy: res.energy,
            energy_unit: res.energy_unit,
            energy_source: res.energy_source,
            user_input_ef: res.user_input_ef,
          });
        }
      } else {
        // console.log(res)
        if (res.vehicleType) {
          if (!dto.average_data_emission_source_data.average_data) {
            dto.average_data_emission_source_data.average_data = [];
          }

          dto.average_data_emission_source_data.average_data.push({
            id: res.id,
            travel_type: res.vehicleType,
            workingDayPerYear: res.workingDayPerYear,
            oneWayDistance: res.oneWayDistance,
            oneWayDistance_unit: res.oneWayDistance_unit,
            numberOfEmplyees: res.numberOfEmplyees,
            presentageUsingVehcleType: res.presentageUsingVehcleType,
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
    deleteDto: NetZeroEmployeeCommutingActivityData,
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
      sourceName.Net_Zero_Employee_Commuting,
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
      sourceName.Net_Zero_Employee_Commuting,
      deleteDto.unit.id,
    );
    return await this.repo.delete({ id: deleteDto.id });
  }
}
