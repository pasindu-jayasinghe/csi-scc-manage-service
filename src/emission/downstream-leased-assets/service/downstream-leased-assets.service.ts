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

import { DownstreamLeasedAssetsActivityData } from '../entities/downstream-leased-assets.entity';
import { AssetSpecificDownstreamLeasedAssetsEmissionSourceData, DownstreamLeasedAssetsActivityDataDto, DownstreamLeasedAssetsEmissionSourceDataMethod, LeasedAssetsDownstreamLeasedAssetsEmissionSourceData, LeasedBuildingsDownstreamLeasedAssetsEmissionSourceData, LessorSpecificDownstreamLeasedAssetsEmissionSourceData } from '../dto/downstream-leased-assets-dto.dto';
import { DownstreamLeasedAssetsDto } from 'src/emission/calculation/dto/downstream-leased-assets.dto';
import { Country } from 'src/country/entities/country.entity';


@Injectable()
export class DownstreamLeasedAssetsService
  extends TypeOrmCrudService<DownstreamLeasedAssetsActivityData>
  implements ExcellUploadable, ProgressRetriever, ExcelDownloader
{
  getDto() {
    return new DownstreamLeasedAssetsActivityData();
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
    @InjectRepository(DownstreamLeasedAssetsActivityData) repo,
    @InjectRepository(DownstreamLeasedAssetsActivityData)
    private readonly DownstreamLeasedAssetsRepository: Repository<DownstreamLeasedAssetsActivityData>,
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
      sourceName.Downstream_Leased_Assets,
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
    let dto = new DownstreamLeasedAssetsActivityData();
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
    createDownstreamLeasedAssetsDto: DownstreamLeasedAssetsActivityDataDto,
    groupNumber: string,
  ): DownstreamLeasedAssetsActivityData {
    const netZeroEmployeeCommutingActivityData =
      new DownstreamLeasedAssetsActivityData();

    netZeroEmployeeCommutingActivityData.project =
      createDownstreamLeasedAssetsDto.project;
    netZeroEmployeeCommutingActivityData.year =
      createDownstreamLeasedAssetsDto.year;
    netZeroEmployeeCommutingActivityData.month =
      createDownstreamLeasedAssetsDto.month;
    netZeroEmployeeCommutingActivityData.unit =
      createDownstreamLeasedAssetsDto.unit;
    netZeroEmployeeCommutingActivityData.method =
      createDownstreamLeasedAssetsDto.method;
    netZeroEmployeeCommutingActivityData.mobile =
      createDownstreamLeasedAssetsDto.mobile;
    netZeroEmployeeCommutingActivityData.stationary =
      createDownstreamLeasedAssetsDto.stationary;
    netZeroEmployeeCommutingActivityData.activityDataStatus =
      createDownstreamLeasedAssetsDto.activityDataStatus;
    netZeroEmployeeCommutingActivityData.ownership =
      createDownstreamLeasedAssetsDto.ownership;
    netZeroEmployeeCommutingActivityData.groupNo = groupNumber;
    return netZeroEmployeeCommutingActivityData;
  }
  async createALLDownstreamLeasedAssets(
    createDownstreamLeasedAssetsDto: DownstreamLeasedAssetsActivityDataDto,
  ) {
    const crypto = require('crypto');
    const groupNumber = createDownstreamLeasedAssetsDto.groupNo
      ? createDownstreamLeasedAssetsDto.groupNo
      : crypto.randomUUID();

    const basicData = await this.getBaseDataDownstreamLeasedAssets(
      createDownstreamLeasedAssetsDto,
    );
    if (
      createDownstreamLeasedAssetsDto.method ==
        DownstreamLeasedAssetsEmissionSourceDataMethod.AssetSpecificMethod &&
      createDownstreamLeasedAssetsDto.asset_specific_method_data
    ) {
      if (
        createDownstreamLeasedAssetsDto.asset_specific_method_data.fuel_data
      ) {

        
        for (let fuel of createDownstreamLeasedAssetsDto
          .asset_specific_method_data.fuel_data) {
           
          const downstreamLeasedAssetsActivityData = this.copyDtotoEntity(
            createDownstreamLeasedAssetsDto,
            groupNumber,
          );
          downstreamLeasedAssetsActivityData.fuel_type = fuel.fuel_type;
          downstreamLeasedAssetsActivityData.fuel_quntity_unit = fuel.fuel_quntity_unit;
          downstreamLeasedAssetsActivityData.fuel_quntity = fuel.fuel_quntity;
        
          const calculationData: DownstreamLeasedAssetsDto = {
            year: createDownstreamLeasedAssetsDto.year,
            month: createDownstreamLeasedAssetsDto.month,
            method: createDownstreamLeasedAssetsDto.method,
            baseData: basicData,
            emission: 0,
            data: fuel,
            groupNumber: groupNumber,
          };
          if (fuel.id) {
            downstreamLeasedAssetsActivityData.id = fuel.id;
            await this.updateDownstreamLeasedAssets(
              calculationData,
              downstreamLeasedAssetsActivityData,
            );
          } else {
            await this.createDownstreamLeasedAssets(
              calculationData,
              downstreamLeasedAssetsActivityData,
            );
          }
        }
      }

      if (
        createDownstreamLeasedAssetsDto.asset_specific_method_data.refrigerant_data
      ) {

        
        for (let ref of createDownstreamLeasedAssetsDto
          .asset_specific_method_data.refrigerant_data) {
           
          const downstreamLeasedAssetsActivityData = this.copyDtotoEntity(
            createDownstreamLeasedAssetsDto,
            groupNumber,
          );
          downstreamLeasedAssetsActivityData.refrigerant_type = ref.refrigerant_type;
          downstreamLeasedAssetsActivityData.refrigerant_quntity = ref.refrigerant_quntity;
          downstreamLeasedAssetsActivityData.refrigerant_quntity_unit = ref.refrigerant_quntity_unit;
          downstreamLeasedAssetsActivityData.process_emission = ref.process_emission;
          downstreamLeasedAssetsActivityData.process_emission_unit = ref.process_emission_unit;
        
          const calculationData: DownstreamLeasedAssetsDto = {
            year: createDownstreamLeasedAssetsDto.year,
            month: createDownstreamLeasedAssetsDto.month,
            method: createDownstreamLeasedAssetsDto.method,
            baseData: basicData,
            emission: 0,
            data: ref,
            groupNumber: groupNumber,
          };
          if (ref.id) {
            downstreamLeasedAssetsActivityData.id = ref.id;
            await this.updateDownstreamLeasedAssets(
              calculationData,
              downstreamLeasedAssetsActivityData,
            );
          } else {
            await this.createDownstreamLeasedAssets(
              calculationData,
              downstreamLeasedAssetsActivityData,
            );
          }
        }
      }
     
    } else if (
      createDownstreamLeasedAssetsDto.method ==
        DownstreamLeasedAssetsEmissionSourceDataMethod.LessorSpecificMethod &&
      createDownstreamLeasedAssetsDto
    ) {
      if (
        createDownstreamLeasedAssetsDto.lessor_specific_method_data
          .lessor_data
      ) {
        for (let lessor_data of createDownstreamLeasedAssetsDto
          .lessor_specific_method_data.lessor_data) {
            
          const downstreamLeasedAssetsActivityData = this.copyDtotoEntity(
            createDownstreamLeasedAssetsDto,
            groupNumber,
          );
          downstreamLeasedAssetsActivityData.scp1scp2_emissions_lessor =
          lessor_data.scp1scp2_emissions_lessor;
          downstreamLeasedAssetsActivityData.scp1scp2_emissions_lessor_unit =
          lessor_data.scp1scp2_emissions_lessor_unit;
          downstreamLeasedAssetsActivityData.lease_assests_ratio =
          lessor_data.lease_assests_ratio;
          downstreamLeasedAssetsActivityData.lessor_type =
          lessor_data.lessor_type;
          downstreamLeasedAssetsActivityData.user_input_ef =
          lessor_data.user_input_ef;
         
          const calculationData: DownstreamLeasedAssetsDto = {
            year: createDownstreamLeasedAssetsDto.year,
            month: createDownstreamLeasedAssetsDto.month,
            method: createDownstreamLeasedAssetsDto.method,
            baseData: basicData,
            emission: 0,
            data: lessor_data,
            groupNumber: groupNumber,
          };
          if (lessor_data.id) {
            downstreamLeasedAssetsActivityData.id = lessor_data.id;
            await this.updateDownstreamLeasedAssets(
              calculationData,
              downstreamLeasedAssetsActivityData,
            );
          } else {
            await this.createDownstreamLeasedAssets(
              calculationData,
              downstreamLeasedAssetsActivityData,
            );
          }
        }
      }
    
    } else if (
      createDownstreamLeasedAssetsDto.method ==
        DownstreamLeasedAssetsEmissionSourceDataMethod.LeasedBuildingsMethod &&
      createDownstreamLeasedAssetsDto.leased_buildings_method_data
    ) {
      if (
        createDownstreamLeasedAssetsDto.leased_buildings_method_data
          .leased_data
      ) {
        for (let leased_data of createDownstreamLeasedAssetsDto
          .leased_buildings_method_data.leased_data) {
          const downstreamLeasedAssetsActivityData = this.copyDtotoEntity(
            createDownstreamLeasedAssetsDto,
            groupNumber,
          );
          downstreamLeasedAssetsActivityData.total_floor_space =
          leased_data.total_floor_space;
          downstreamLeasedAssetsActivityData.total_floor_space_unit =
            leased_data.total_floor_space_unit;
            downstreamLeasedAssetsActivityData.building_type =
            leased_data.building_type;
            downstreamLeasedAssetsActivityData.user_input_ef =
            leased_data.user_input_ef;
            
         
          const calculationData: DownstreamLeasedAssetsDto = {
            year: createDownstreamLeasedAssetsDto.year,
            month: createDownstreamLeasedAssetsDto.month,
            method: createDownstreamLeasedAssetsDto.method,
            baseData: basicData,
            emission: 0,
            data: leased_data,
            groupNumber: groupNumber,
          };
          if (leased_data.id) {
            downstreamLeasedAssetsActivityData.id = leased_data.id;
            await this.updateDownstreamLeasedAssets(
              calculationData,
              downstreamLeasedAssetsActivityData,
            );
          } else {
            await this.createDownstreamLeasedAssets(
              calculationData,
              downstreamLeasedAssetsActivityData,
            );
          }
        }
      }
    } else if (
      createDownstreamLeasedAssetsDto.method ==
        DownstreamLeasedAssetsEmissionSourceDataMethod.LeasedAssetsMethod &&
      createDownstreamLeasedAssetsDto.leased_assets_method_data
    ) {
      if (
        createDownstreamLeasedAssetsDto.leased_assets_method_data
          .leased_data
      ) {
        for (let leased_data of createDownstreamLeasedAssetsDto
          .leased_assets_method_data.leased_data) {
          const downstreamLeasedAssetsActivityData = this.copyDtotoEntity(
            createDownstreamLeasedAssetsDto,
            groupNumber,
          );
          downstreamLeasedAssetsActivityData.number_of_assets =
          leased_data.number_of_assets;
            downstreamLeasedAssetsActivityData.asset_type =
            leased_data.asset_type;

            downstreamLeasedAssetsActivityData.user_input_ef =
            leased_data.user_input_ef;
         
         
          const calculationData: DownstreamLeasedAssetsDto = {
            year: createDownstreamLeasedAssetsDto.year,
            month: createDownstreamLeasedAssetsDto.month,
            method: createDownstreamLeasedAssetsDto.method,
            baseData: basicData,
            emission: 0,
            data: leased_data,
            groupNumber: groupNumber,
          };
          if (leased_data.id) {
            downstreamLeasedAssetsActivityData.id = leased_data.id;
            await this.updateDownstreamLeasedAssets(
              calculationData,
              downstreamLeasedAssetsActivityData,
            );
          } else {
            await this.createDownstreamLeasedAssets(
              calculationData,
              downstreamLeasedAssetsActivityData,
            );
          }
        }
      }
    } else {
      return null;
    }
    return null
  }

  async createDownstreamLeasedAssets(
    calculationData: DownstreamLeasedAssetsDto,
    netZeroEmployeeCommutingActivityData: DownstreamLeasedAssetsActivityData,
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
      sourceName: sourceName.Downstream_Leased_Assets,
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

    return await this.DownstreamLeasedAssetsRepository.save(
      netZeroEmployeeCommutingActivityData,
    );
  }
  async updateDownstreamLeasedAssets(
    calculationData: DownstreamLeasedAssetsDto,
    updateDownstreamLeasedAssetsDto: DownstreamLeasedAssetsActivityData,
  ) {
    updateDownstreamLeasedAssetsDto.direct =
      calculationData.baseData.clasification === Clasification.DIRECT
        ? true
        : false;
    updateDownstreamLeasedAssetsDto.indirect =
      calculationData.baseData.clasification === Clasification.INDIRECT
        ? true
        : false;
    updateDownstreamLeasedAssetsDto.other =
      calculationData.baseData.clasification === Clasification.OTHER
        ? true
        : false;

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.Downstream_Leased_Assets,
      data: calculationData,
    });

    if (updateDownstreamLeasedAssetsDto.e_sc !== emission.e_sc) {
      let current = await this.repo.findOne(
        updateDownstreamLeasedAssetsDto.id,
      );
      let updatedEmission = this.calculationService.getDiff(current, emission);
      this.calculationService.updateTotalEmission(
        updatedEmission,
        updateDownstreamLeasedAssetsDto.project,
        calculationData.baseData.clasification,
        sourceName.Downstream_Leased_Assets,
        updateDownstreamLeasedAssetsDto.unit.id,
      );
    }
    updateDownstreamLeasedAssetsDto.emission = emission.e_sc
      ? emission.e_sc
      : 0;

    updateDownstreamLeasedAssetsDto.e_sc = emission.e_sc ? emission.e_sc : 0;
    updateDownstreamLeasedAssetsDto.e_sc_co2 = emission.e_sc_co2
      ? emission.e_sc_co2
      : 0;
    updateDownstreamLeasedAssetsDto.e_sc_ch4 = emission.e_sc_ch4
      ? emission.e_sc_ch4
      : 0;
    updateDownstreamLeasedAssetsDto.e_sc_n2o = emission.e_sc_n2o
      ? emission.e_sc_n2o
      : 0;

    const updated = await this.repo.update(
      {
        id: updateDownstreamLeasedAssetsDto.id,
      },
      updateDownstreamLeasedAssetsDto,
    );
    if (updated.affected === 1) {
      return await this.repo.findOne(updateDownstreamLeasedAssetsDto.id);
    } else {
      throw new InternalServerErrorException('Updating is failed');
    }
  }

  async create(
    createDownstreamLeasedAssetsDto: DownstreamLeasedAssetsActivityData,
  ) {}

  async update(
    id: number,
    updateDownstreamLeasedAssetsDto: DownstreamLeasedAssetsActivityData,
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
      sourceName.Downstream_Leased_Assets,
      deleteDto.unit.id,
    );
    return await this.repo.delete({ id: deleteDto.id });
  }
  async getBaseDataDownstreamLeasedAssets(
    dto: DownstreamLeasedAssetsActivityDataDto,
  ): Promise<BaseDataDto> {
    let activityInfo = new PuesDataReqActivityData();
    activityInfo.owenerShip = Ownership.getkey(dto.ownership);
    activityInfo.stationary = dto.stationary;
    activityInfo.mobile = dto.mobile;
    let req = new PuesDataReqDto();
    req.project = dto.project;
    req.sourceName = sourceName.Downstream_Leased_Assets;
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
    dto: DownstreamLeasedAssetsActivityData,
  ): Promise<BaseDataDto> {
    let activityInfo = new PuesDataReqActivityData();
    activityInfo.owenerShip = Ownership.getkey(dto.ownership);
    activityInfo.stationary = dto.stationary;
    activityInfo.mobile = dto.mobile;
    let req = new PuesDataReqDto();
    req.project = dto.project;
    req.sourceName = sourceName.Downstream_Leased_Assets;
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
    dto: DownstreamLeasedAssetsActivityData,
    calData: DownstreamLeasedAssetsDto,
    emission: any,
  ) {
    let reqPues: PuesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Downstream_Leased_Assets,
      unitId: dto.unit.id,
      emission: emission,
      classification: calData.baseData.clasification,
    };

    await this.puesService.addEmission(reqPues);

    let reqPes: PesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Downstream_Leased_Assets,
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

  async getAllDownstreamLeasedAssetsData(
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

  async getOneDownstreamLeasedAssetsDataSet(groupNumber: string): Promise<any> {
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
      .where(filter, { groupNumber })
      .orderBy('acData.createdOn', 'ASC');

    // console.log(await data.getCount())
    const results = await data.getMany();
   
    const dto = new DownstreamLeasedAssetsActivityDataDto();
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
    
    dto.asset_specific_method_data =
    new AssetSpecificDownstreamLeasedAssetsEmissionSourceData();
    dto.lessor_specific_method_data =
    new LessorSpecificDownstreamLeasedAssetsEmissionSourceData();
    dto.leased_buildings_method_data =
        new LeasedBuildingsDownstreamLeasedAssetsEmissionSourceData();
        dto.leased_assets_method_data =
        new LeasedAssetsDownstreamLeasedAssetsEmissionSourceData();
    for await (let res of results) {
   
      if (
        res.method == DownstreamLeasedAssetsEmissionSourceDataMethod.AssetSpecificMethod
      ) {
      
        if (res.fuel_type) {
          if (!dto.asset_specific_method_data.fuel_data) {
            dto.asset_specific_method_data.fuel_data = [];
          }
          dto.asset_specific_method_data.fuel_data.push({
            id: res.id,
            fuel_type: res.fuel_type,
            fuel_quntity_unit: res.fuel_quntity_unit,
            fuel_quntity:res.fuel_quntity,
          
          });
        }

        if (res.refrigerant_type) {
          if (!dto.asset_specific_method_data.refrigerant_data) {
            dto.asset_specific_method_data.refrigerant_data = [];
          }
          dto.asset_specific_method_data.refrigerant_data.push({
            id: res.id,
            refrigerant_type: res.refrigerant_type,
            refrigerant_quntity: res.refrigerant_quntity,
            refrigerant_quntity_unit:res.refrigerant_quntity_unit,
            process_emission: res.process_emission,
            process_emission_unit: res.process_emission_unit,
          });
        }
      } else if (
        res.method ==
        DownstreamLeasedAssetsEmissionSourceDataMethod.LessorSpecificMethod
      ) {
     
        if (res.scp1scp2_emissions_lessor) {
          if (!dto.lessor_specific_method_data.lessor_data) {
            dto.lessor_specific_method_data.lessor_data = [];
          }
          dto.lessor_specific_method_data.lessor_data.push({
            id: res.id,
            scp1scp2_emissions_lessor: res.scp1scp2_emissions_lessor,
            scp1scp2_emissions_lessor_unit: res.scp1scp2_emissions_lessor_unit,
            lease_assests_ratio:res.lease_assests_ratio,
            lessor_type:res.lessor_type,
            user_input_ef:res.user_input_ef,
           
          });
        }

      } else if (
        res.method ==
        DownstreamLeasedAssetsEmissionSourceDataMethod.LeasedBuildingsMethod
      ) {
        
        if (res.total_floor_space) {
          if (!dto.leased_buildings_method_data.leased_data) {
            dto.leased_buildings_method_data.leased_data = [];
          }
          dto.leased_buildings_method_data.leased_data.push({
            id: res.id,
            total_floor_space: res.total_floor_space,
            total_floor_space_unit: res.total_floor_space_unit,
            building_type:res.building_type,
            user_input_ef:res.user_input_ef,
          });
        }
      } else {

     
        // console.log(res)
        if (res.number_of_assets) {
          if (!dto.leased_assets_method_data.leased_data) {
            dto.leased_assets_method_data.leased_data = [];
          }

          dto.leased_assets_method_data.leased_data.push({
            id: res.id,
            number_of_assets: res.number_of_assets,
            asset_type: res.asset_type,
            user_input_ef:res.user_input_ef, 
           
            
          });
        }
      }
    }
    console.log('DownstreamLeasedAsset',dto);

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
    deleteDto: DownstreamLeasedAssetsActivityData,
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
      sourceName.Downstream_Leased_Assets,
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
      sourceName.Downstream_Leased_Assets,
      deleteDto.unit.id,
    );
    return await this.repo.delete({ id: deleteDto.id });
  }
}
