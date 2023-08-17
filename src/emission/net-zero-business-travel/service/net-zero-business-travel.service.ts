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
import { NetZeroBusinessTravelActivityData } from '../entities/net-zero-business-travel.entity';
import {
  AmountSpendBasedNetZeroBusinessTravelEmissionSourceData,
  DistanceBasedNetZeroBusinessTravelEmissionSourceData,
  FuelBasedNetZeroBusinessTravelEmissionSourceData,
  FuelFuelBasedNetZeroBusinessTravelEmissionSourceData,
  GridFuelBasedNetZeroBusinessTravelEmissionSourceData,
  HotelDistanceBasedNetZeroBusinessTravelEmissionSourceData,
  NetZeroBusinessTravelActivityDataDto,
  NetZeroBusinessTravelEmissionSourceDataMethod,
  NetZeroBusinessTravelEmissionSourceDataTypeNames,
  RefrigerantFuelBasedNetZeroBusinessTravelEmissionSourceData,
  SpendBasedNetZeroBusinessTravelEmissionSourceData,
  VehicleDistanceBasedNetZeroBusinessTravelEmissionSourceData,
} from '../dto/net-zero-business-travel-dto.dto';
import { NetZeroBusinessTravelDto } from 'src/emission/calculation/dto/net-zero-business-travel.dto';
import { result } from 'src/report/dto/create-report.dto';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { WasteGeneratedInOperationsDto } from 'src/emission/calculation/dto/waste-generated-in-operations.dto';
import { Country } from 'src/country/entities/country.entity';

@Injectable()
export class NetZeroBusinessTravelService
  extends TypeOrmCrudService<NetZeroBusinessTravelActivityData>
  implements ExcellUploadable, ProgressRetriever, ExcelDownloader
{
  getDto() {
    return new NetZeroBusinessTravelActivityData();
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
    @InjectRepository(NetZeroBusinessTravelActivityData) repo,
    @InjectRepository(NetZeroBusinessTravelActivityData)
    private readonly WasteGeneratedInOperationsRepository: Repository<NetZeroBusinessTravelActivityData>,
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
  create(dto: any) {
    throw new Error('Method not implemented.');
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
      sourceName.Net_Zero_Business_Travel,
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
    let dto = new NetZeroBusinessTravelActivityData();
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
      // return this.create(dto);
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  downlodExcellBulkUploadVariableMapping() {
    return this.excelBulkVariableMapping;
  }

  copyDtotoEntity(
    createNetZeroBusinessTravelDto: NetZeroBusinessTravelActivityDataDto,
    groupNumber: string,
  ): NetZeroBusinessTravelActivityData {
    const netZeroBusinessTravelActivityData =
      new NetZeroBusinessTravelActivityData();

    netZeroBusinessTravelActivityData.project =
      createNetZeroBusinessTravelDto.project;
    netZeroBusinessTravelActivityData.year =
      createNetZeroBusinessTravelDto.year;
    netZeroBusinessTravelActivityData.month =
      createNetZeroBusinessTravelDto.month;
    netZeroBusinessTravelActivityData.unit =
      createNetZeroBusinessTravelDto.unit;
    netZeroBusinessTravelActivityData.method =
      createNetZeroBusinessTravelDto.method;
    netZeroBusinessTravelActivityData.mobile =
      createNetZeroBusinessTravelDto.mobile;
    netZeroBusinessTravelActivityData.stationary =
      createNetZeroBusinessTravelDto.stationary;
    netZeroBusinessTravelActivityData.activityDataStatus =
      createNetZeroBusinessTravelDto.activityDataStatus;
    netZeroBusinessTravelActivityData.ownership =
      createNetZeroBusinessTravelDto.ownership;
    netZeroBusinessTravelActivityData.groupNo = groupNumber;
    return netZeroBusinessTravelActivityData;
  }
  async createALLNetZeroBusinessTravel(
    createNetZeroBusinessTravelDto: NetZeroBusinessTravelActivityDataDto,
  ) {
    const crypto = require('crypto');
    const groupNumber = createNetZeroBusinessTravelDto.groupNo
      ? createNetZeroBusinessTravelDto.groupNo
      : crypto.randomUUID();

    const basicData = await this.getBaseDataNetZeroBusinessTravel(
      createNetZeroBusinessTravelDto,
    );
    if (
      createNetZeroBusinessTravelDto.method ==
        NetZeroBusinessTravelEmissionSourceDataMethod.FUEL_BASE &&
      createNetZeroBusinessTravelDto.fuel_emission_source_data
    ) {
      if (createNetZeroBusinessTravelDto.fuel_emission_source_data.fuel_data) {
        for (let fuel of createNetZeroBusinessTravelDto
          .fuel_emission_source_data.fuel_data) {
          fuel.typeName = NetZeroBusinessTravelEmissionSourceDataTypeNames.Fuel;
          const netZeroBusinessTravelActivityData = this.copyDtotoEntity(
            createNetZeroBusinessTravelDto,
            groupNumber,
          );
          netZeroBusinessTravelActivityData.fuel_type = fuel.fuel_type;
          netZeroBusinessTravelActivityData.fuel_quntity = fuel.quntity;
          netZeroBusinessTravelActivityData.fuel_quntity_unit =
            fuel.fuel_quntity_unit;
          const calculationData: NetZeroBusinessTravelDto = {
            year: createNetZeroBusinessTravelDto.year,
            month: createNetZeroBusinessTravelDto.month,
            method: createNetZeroBusinessTravelDto.method,
            baseData: basicData,
            emission: 0,
            data: fuel,
            groupNumber: groupNumber,
          };
          if (fuel.id) {
            netZeroBusinessTravelActivityData.id = fuel.id;
            await this.updateNetZeroBusinessTravel(
              calculationData,
              netZeroBusinessTravelActivityData,
            );
          } else {
            await this.createNetZeroBusinessTravel(
              calculationData,
              netZeroBusinessTravelActivityData,
            );
          }
        }
      }
      if (createNetZeroBusinessTravelDto.fuel_emission_source_data.grid_data) {
        for (let grid of createNetZeroBusinessTravelDto
          .fuel_emission_source_data.grid_data) {
          grid.typeName = NetZeroBusinessTravelEmissionSourceDataTypeNames.Grid;
          const netZeroBusinessTravelActivityData = this.copyDtotoEntity(
            createNetZeroBusinessTravelDto,
            groupNumber,
          );
          netZeroBusinessTravelActivityData.grid_type = grid.grid_type;
          netZeroBusinessTravelActivityData.grid_quntity = grid.quntity;
          netZeroBusinessTravelActivityData.grid_quntity_unit =
            grid.grid_quntity_unit;
          const calculationData: NetZeroBusinessTravelDto = {
            year: createNetZeroBusinessTravelDto.year,
            month: createNetZeroBusinessTravelDto.month,
            method: createNetZeroBusinessTravelDto.method,
            baseData: basicData,
            emission: 0,
            data: grid,
            groupNumber: groupNumber,
          };
          if (grid.id) {
            netZeroBusinessTravelActivityData.id = grid.id;
            await this.updateNetZeroBusinessTravel(
              calculationData,
              netZeroBusinessTravelActivityData,
            );
          } else {
            await this.createNetZeroBusinessTravel(
              calculationData,
              netZeroBusinessTravelActivityData,
            );
          }
        }
      }
      if (
        createNetZeroBusinessTravelDto.fuel_emission_source_data
          .refrigerant_data
      ) {
        for (let ref of createNetZeroBusinessTravelDto.fuel_emission_source_data
          .refrigerant_data) {
          ref.typeName = NetZeroBusinessTravelEmissionSourceDataTypeNames.Ref;
          const netZeroBusinessTravelActivityData = this.copyDtotoEntity(
            createNetZeroBusinessTravelDto,
            groupNumber,
          );
          netZeroBusinessTravelActivityData.refrigerant_type =
            ref.refrigerant_type;
          netZeroBusinessTravelActivityData.refrigerant_quntity = ref.quntity;
          netZeroBusinessTravelActivityData.refrigerant_quntity_unit =
            ref.refrigerant_quntity_unit;
          const calculationData: NetZeroBusinessTravelDto = {
            year: createNetZeroBusinessTravelDto.year,
            month: createNetZeroBusinessTravelDto.month,
            method: createNetZeroBusinessTravelDto.method,
            baseData: basicData,
            emission: 0,
            data: ref,
            groupNumber: groupNumber,
          };
          if (ref.id) {
            netZeroBusinessTravelActivityData.id = ref.id;
            await this.updateNetZeroBusinessTravel(
              calculationData,
              netZeroBusinessTravelActivityData,
            );
          } else {
            await this.createNetZeroBusinessTravel(
              calculationData,
              netZeroBusinessTravelActivityData,
            );
          }
        }
      }
    } else if (
      createNetZeroBusinessTravelDto.method ==
        NetZeroBusinessTravelEmissionSourceDataMethod.DISTANCE_BASE &&
      createNetZeroBusinessTravelDto.distance_emission_source_data
    ) {
      if (
        createNetZeroBusinessTravelDto.distance_emission_source_data
          .vehicale_data
      ) {
        for (let vehical of createNetZeroBusinessTravelDto
          .distance_emission_source_data.vehicale_data) {
          vehical.typeName =
            NetZeroBusinessTravelEmissionSourceDataTypeNames.Distance;
          const netZeroBusinessTravelActivityData = this.copyDtotoEntity(
            createNetZeroBusinessTravelDto,
            groupNumber,
          );
          netZeroBusinessTravelActivityData.vehicleType = vehical.vehicleType;
          netZeroBusinessTravelActivityData.totalDistanceTravelled =
            vehical.totalDistanceTravelled;
          netZeroBusinessTravelActivityData.totalDistanceTravelled_unit =
            vehical.totalDistanceTravelled_unit;
          const calculationData: NetZeroBusinessTravelDto = {
            year: createNetZeroBusinessTravelDto.year,
            month: createNetZeroBusinessTravelDto.month,
            method: createNetZeroBusinessTravelDto.method,
            baseData: basicData,
            emission: 0,
            data: vehical,
            groupNumber: groupNumber,
          };
          if (vehical.id) {
            netZeroBusinessTravelActivityData.id = vehical.id;
            await this.updateNetZeroBusinessTravel(
              calculationData,
              netZeroBusinessTravelActivityData,
            );
          } else {
            await this.createNetZeroBusinessTravel(
              calculationData,
              netZeroBusinessTravelActivityData,
            );
          }
        }
      }
      if (
        createNetZeroBusinessTravelDto.distance_emission_source_data.hotel_data
      ) {
        for (let hotel of createNetZeroBusinessTravelDto
          .distance_emission_source_data.hotel_data) {
          hotel.typeName =
            NetZeroBusinessTravelEmissionSourceDataTypeNames.Hotel;
          const netZeroBusinessTravelActivityData = this.copyDtotoEntity(
            createNetZeroBusinessTravelDto,
            groupNumber,
          );
          netZeroBusinessTravelActivityData.countryCode = hotel.countryCode;
          netZeroBusinessTravelActivityData.totalNumberHotelNight =
            hotel.totalNumberHotelNight;
          netZeroBusinessTravelActivityData.user_input_ef = hotel.user_input_ef;

          const calculationData: NetZeroBusinessTravelDto = {
            year: createNetZeroBusinessTravelDto.year,
            month: createNetZeroBusinessTravelDto.month,
            method: createNetZeroBusinessTravelDto.method,
            baseData: basicData,
            emission: 0,
            data: hotel,
            groupNumber: groupNumber,
          };
          if (hotel.id) {
            netZeroBusinessTravelActivityData.id = hotel.id;
            await this.updateNetZeroBusinessTravel(
              calculationData,
              netZeroBusinessTravelActivityData,
            );
          } else {
            await this.createNetZeroBusinessTravel(
              calculationData,
              netZeroBusinessTravelActivityData,
            );
          }
        }
      }
    } else if (
      createNetZeroBusinessTravelDto.method ==
        NetZeroBusinessTravelEmissionSourceDataMethod.SPEND_BASE &&
      createNetZeroBusinessTravelDto.spend_emission_source_data
    ) {
      if (
        createNetZeroBusinessTravelDto.spend_emission_source_data.amount_data
      ) {
        for (let amount of createNetZeroBusinessTravelDto
          .spend_emission_source_data.amount_data) {
          const netZeroBusinessTravelActivityData = this.copyDtotoEntity(
            createNetZeroBusinessTravelDto,
            groupNumber,
          );
          netZeroBusinessTravelActivityData.travel_type = amount.travel_type;
          netZeroBusinessTravelActivityData.totalAmountOnTravel =
            amount.totalAmountOnTravel;
          netZeroBusinessTravelActivityData.totalAmountOnTravel_unit =
            amount.totalAmountOnTravel_unit;
          netZeroBusinessTravelActivityData.user_input_ef =
            amount.user_input_ef;
          const calculationData: NetZeroBusinessTravelDto = {
            year: createNetZeroBusinessTravelDto.year,
            month: createNetZeroBusinessTravelDto.month,
            method: createNetZeroBusinessTravelDto.method,
            baseData: basicData,
            emission: 0,
            data: amount,
            groupNumber: groupNumber,
          };
          if (amount.id) {
            netZeroBusinessTravelActivityData.id = amount.id;
            await this.updateNetZeroBusinessTravel(
              calculationData,
              netZeroBusinessTravelActivityData,
            );
          } else {
            await this.createNetZeroBusinessTravel(
              calculationData,
              netZeroBusinessTravelActivityData,
            );
          }
        }
      }
    } else {
      return null;
    }
  }

  async createNetZeroBusinessTravel(
    calculationData: NetZeroBusinessTravelDto,
    netZeroBusinessTravelActivityData: NetZeroBusinessTravelActivityData,
  ) {
    netZeroBusinessTravelActivityData.groupNo = calculationData.groupNumber;
    netZeroBusinessTravelActivityData.direct =
      calculationData.baseData.clasification === Clasification.DIRECT
        ? true
        : false;
    netZeroBusinessTravelActivityData.indirect =
      calculationData.baseData.clasification === Clasification.INDIRECT
        ? true
        : false;
    netZeroBusinessTravelActivityData.other =
      calculationData.baseData.clasification === Clasification.OTHER
        ? true
        : false;

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.Net_Zero_Business_Travel,
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
        netZeroBusinessTravelActivityData,
        calculationData,
        emission,
      );
    }

    netZeroBusinessTravelActivityData.emission =  emission.e_sc
      ? emission.e_sc
      : 0;

    netZeroBusinessTravelActivityData.e_sc =  emission.e_sc ? emission.e_sc : 0;
    netZeroBusinessTravelActivityData.e_sc_co2 =  emission.e_sc_co2
      ? emission.e_sc_co2
      : 0;
    netZeroBusinessTravelActivityData.e_sc_ch4 =  emission.e_sc_ch4
      ? emission.e_sc_ch4
      : 0;
    netZeroBusinessTravelActivityData.e_sc_n2o =  emission.e_sc_n2o
      ? emission.e_sc_n2o
      : 0;

    return await this.WasteGeneratedInOperationsRepository.save(
      netZeroBusinessTravelActivityData,
    );
  }
  async updateNetZeroBusinessTravel(
    calculationData: NetZeroBusinessTravelDto,
    updateNetZeroBusinessTravelDto: NetZeroBusinessTravelActivityData,
  ) {
    updateNetZeroBusinessTravelDto.direct =
      calculationData.baseData.clasification === Clasification.DIRECT
        ? true
        : false;
    updateNetZeroBusinessTravelDto.indirect =
      calculationData.baseData.clasification === Clasification.INDIRECT
        ? true
        : false;
    updateNetZeroBusinessTravelDto.other =
      calculationData.baseData.clasification === Clasification.OTHER
        ? true
        : false;

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.Net_Zero_Business_Travel,
      data: calculationData,
    });

    if (updateNetZeroBusinessTravelDto.e_sc !== emission.e_sc) {
      let current = await this.repo.findOne(updateNetZeroBusinessTravelDto.id);
      let updatedEmission = this.calculationService.getDiff(current, emission);
      this.calculationService.updateTotalEmission(
        updatedEmission,
        updateNetZeroBusinessTravelDto.project,
        calculationData.baseData.clasification,
        sourceName.Net_Zero_Business_Travel,
        updateNetZeroBusinessTravelDto.unit.id,
      );
    }
    updateNetZeroBusinessTravelDto.emission =  emission.e_sc ? emission.e_sc : 0;

    updateNetZeroBusinessTravelDto.e_sc =  emission.e_sc ? emission.e_sc : 0;
    updateNetZeroBusinessTravelDto.e_sc_co2 =  emission.e_sc_co2
      ? emission.e_sc_co2
      : 0;
    updateNetZeroBusinessTravelDto.e_sc_ch4 =  emission.e_sc_ch4
      ? emission.e_sc_ch4
      : 0;
    updateNetZeroBusinessTravelDto.e_sc_n2o =  emission.e_sc_n2o
      ? emission.e_sc_n2o
      : 0;

    const updated = await this.repo.update(
      {
        id: updateNetZeroBusinessTravelDto.id,
      },
      updateNetZeroBusinessTravelDto,
    );
    if (updated.affected === 1) {
      return await this.repo.findOne(updateNetZeroBusinessTravelDto.id);
    } else {
      throw new InternalServerErrorException('Updating is failed');
    }
  }





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
      sourceName.Net_Zero_Business_Travel,
      deleteDto.unit.id,
    );
    return await this.repo.delete({ id: deleteDto.id });
  }
  async getBaseDataNetZeroBusinessTravel(
    dto: NetZeroBusinessTravelActivityDataDto,
  ): Promise<BaseDataDto> {
    let activityInfo = new PuesDataReqActivityData();
    activityInfo.owenerShip = Ownership.getkey(dto.ownership);
    activityInfo.stationary = dto.stationary;
    activityInfo.mobile = dto.mobile;
    let req = new PuesDataReqDto();
    req.project = dto.project;
    req.sourceName = sourceName.Net_Zero_Business_Travel;
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
    dto: NetZeroBusinessTravelActivityData,
  ): Promise<BaseDataDto> {
    let activityInfo = new PuesDataReqActivityData();
    activityInfo.owenerShip = Ownership.getkey(dto.ownership);
    activityInfo.stationary = dto.stationary;
    activityInfo.mobile = dto.mobile;
    let req = new PuesDataReqDto();
    req.project = dto.project;
    req.sourceName = sourceName.Net_Zero_Business_Travel;
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
    dto: NetZeroBusinessTravelActivityData,
    calData: NetZeroBusinessTravelDto,
    emission: any,
  ) {
    let reqPues: PuesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Net_Zero_Business_Travel,
      unitId: dto.unit.id,
      emission: emission,
      classification: calData.baseData.clasification,
    };

    await this.puesService.addEmission(reqPues);

    let reqPes: PesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Net_Zero_Business_Travel,
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

  async getAllBussinesTravelData(
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

    if (filter) {
      filter = filter + ' and acData.unitId is not null';
    } else {
      filter = 'acData.unitId is not null';
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

    console.log("test " ,(await data.execute()))
    return {
      data: await data2.getRawMany(),
      total: (await data.execute()).length,
    };
  }

  async getOneBussinesTravelDataSet(groupNumber: string): Promise<any> {
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
      ).innerJoinAndMapOne(
        'unit.country',
        Country,
        'country',
        'unit.countryId = country.id',
      )
      .where(filter, { groupNumber });

    // console.log(await data.getCount())
    const results = await data.getMany();
    console.log(results);
    const dto = new NetZeroBusinessTravelActivityDataDto();
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
      new FuelBasedNetZeroBusinessTravelEmissionSourceData();
    dto.distance_emission_source_data =
      new DistanceBasedNetZeroBusinessTravelEmissionSourceData();
    dto.spend_emission_source_data =
      new SpendBasedNetZeroBusinessTravelEmissionSourceData();
    for (let res of results) {
      if (
        res.method == NetZeroBusinessTravelEmissionSourceDataMethod.FUEL_BASE
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
        NetZeroBusinessTravelEmissionSourceDataMethod.DISTANCE_BASE
      ) {
        if (res.vehicleType && res.totalDistanceTravelled) {
          if (!dto.distance_emission_source_data.vehicale_data) {
            dto.distance_emission_source_data.vehicale_data = [];
          }
          dto.distance_emission_source_data.vehicale_data.push({
            id: res.id,
            vehicleType: res.vehicleType,
            totalDistanceTravelled: res.totalDistanceTravelled,
            typeName: '',
            totalDistanceTravelled_unit: res.totalDistanceTravelled_unit,
          });
        } else if (res.countryCode && res.totalNumberHotelNight) {
          if (!dto.distance_emission_source_data.hotel_data) {
            dto.distance_emission_source_data.hotel_data = [];
          }
          dto.distance_emission_source_data.hotel_data.push({
            id: res.id,
            countryCode: res.countryCode,
            totalNumberHotelNight: res.totalNumberHotelNight,
            typeName: '',
            user_input_ef: res.user_input_ef,
          });
        }
      } else {
        console.log(res);
        if (res.travel_type && res.totalAmountOnTravel) {
          if (!dto.spend_emission_source_data.amount_data) {
            dto.spend_emission_source_data.amount_data = [];
          }

          dto.spend_emission_source_data.amount_data.push({
            id: res.id,
            travel_type: res.travel_type,
            totalAmountOnTravel: res.totalAmountOnTravel,
            totalAmountOnTravel_unit: res.totalAmountOnTravel_unit,
            user_input_ef: res.user_input_ef,
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
    deleteDto: NetZeroBusinessTravelActivityData,
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
      sourceName.Net_Zero_Business_Travel,
      deleteDto.unit.id,
    );
    return await this.repo.delete({ id: deleteDto.id });
  }
}
