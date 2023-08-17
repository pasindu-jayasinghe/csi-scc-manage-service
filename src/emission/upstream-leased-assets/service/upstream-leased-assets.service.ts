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
import { UpstreamLeasedAssetsActivityData } from '../entities/upstream-leased-assets.entity';
import { AssetSpecificMethodData, FuelBasedeData, LeasedAssetsMethodData, LeasedBuildingsMethodData, LessorSpecificMethodData, UpstreamLeasedAssetDataMethod, UpstreamLeasedAssetsActivityDataDto } from '../dto/upstream-leased-assets-dto.dto';
import { UpstreamLeasedAssetssDto } from 'src/emission/calculation/dto/upstream-leased-asset.dto';
import { InvestmentsService } from 'src/emission/investments/service/investments.service';

@Injectable()
export class UpstreamLeasedAssetsService extends TypeOrmCrudService<UpstreamLeasedAssetsActivityData> implements ExcellUploadable, ProgressRetriever, ExcelDownloader {

  getDto() {
    return new UpstreamLeasedAssetsActivityData();
  }

  private excelBulkVariableMapping: { code: string, name: string, isRequired: boolean, type: VariableValidationType }[] = [
    { code: "month", name: 'Month', isRequired: true, type: VariableValidationType.list },
    { code: "fc", name: 'Consumption', isRequired: true, type: VariableValidationType.number },
    { code: "fuelType", name: 'Fuel Types', isRequired: true, type: VariableValidationType.list },
    { code: "fc_unit", name: 'Fuel Consumption Unit', isRequired: true, type: VariableValidationType.list },
  ]

  constructor(
    @InjectRepository(UpstreamLeasedAssetsActivityData) repo,
    @InjectRepository(UpstreamLeasedAssetsActivityData)
    private readonly investmentsRepository: Repository<UpstreamLeasedAssetsActivityData>,
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
    return await this.emissionSourceRecalService.bulkCalculate(this, unitIds, projectId, this.repo, sourceName.Upstream_Leased_Assets);
  }

  excellBulkUpload(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number, ownership: string, isMobile: boolean) {

    // let dto = new UpstreamLeasedAssetsActivityData();
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

  async createAll(createUpstreamLeasedAssetssDto: UpstreamLeasedAssetsActivityDataDto) {
    const crypto = require('crypto');
    const groupNumber = crypto.randomUUID();
    const basicData = await this.getBaseData(createUpstreamLeasedAssetssDto)
    let methodData: any = [];
    switch (createUpstreamLeasedAssetssDto.activityType) {
      case UpstreamLeasedAssetDataMethod.FuelAssetSpecificMethod: {
        if (createUpstreamLeasedAssetssDto.asset_specific_method_data.fuel_data.length > 0) {
          for (const entry of createUpstreamLeasedAssetssDto.asset_specific_method_data.fuel_data) {
            entry.typeName = "Fuel";
          }
          methodData = methodData.concat(createUpstreamLeasedAssetssDto.asset_specific_method_data.fuel_data);

        }
        if (createUpstreamLeasedAssetssDto.asset_specific_method_data.refrigerant_data.length > 0) {
          for (const entry of createUpstreamLeasedAssetssDto.asset_specific_method_data.refrigerant_data) {
            entry.typeName = "Refrigerent";
          }
          methodData = methodData.concat(createUpstreamLeasedAssetssDto.asset_specific_method_data.refrigerant_data);

        }

        if (createUpstreamLeasedAssetssDto.asset_specific_method_data.elec_data.length > 0) {
          for (const entry of createUpstreamLeasedAssetssDto.asset_specific_method_data.elec_data) {
            entry.typeName = "Electricity";
          }
          methodData = methodData.concat(createUpstreamLeasedAssetssDto.asset_specific_method_data.elec_data);

          console.log("hHHH",methodData)

        }
        break;
      }

      case UpstreamLeasedAssetDataMethod.DistanceLessorSpecificMethod: {
        methodData = createUpstreamLeasedAssetssDto.lessor_specific_method_data
        break;
      }
      case UpstreamLeasedAssetDataMethod.SpendLeasedBuildingsMethod: {
        methodData = createUpstreamLeasedAssetssDto.leased_buildings_method_data
        break;
      }
      case UpstreamLeasedAssetDataMethod.LeasedAssetsMethod: {
        methodData = createUpstreamLeasedAssetssDto.leased_assets_method_data
        break;
      }

      default: {
        //statements; 
        break;
      }
    }

    if (methodData) {
      for (let methodA_data of methodData) {
        const upstreamLeasedAssetsActivityData = new UpstreamLeasedAssetsActivityData();
        upstreamLeasedAssetsActivityData.project = createUpstreamLeasedAssetssDto.project
        upstreamLeasedAssetsActivityData.user = createUpstreamLeasedAssetssDto.user
        upstreamLeasedAssetsActivityData.unit = createUpstreamLeasedAssetssDto.unit

        const calculationData: UpstreamLeasedAssetssDto = {
          year: createUpstreamLeasedAssetssDto.year,
          month: createUpstreamLeasedAssetssDto.month,
          activityType: createUpstreamLeasedAssetssDto.activityType,
          emission: 0,
          data: methodA_data,
          groupNumber: groupNumber,
          baseData: basicData

        };
        await this.createUpstreamLeasedAssets(calculationData, upstreamLeasedAssetsActivityData)


      }
    }
    else {
      return null
    }
  }


  async getAllUpstreamLeasedAssetsData(
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
      .orderBy('id', 'DESC')
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


  async createUpstreamLeasedAssets(calculationData: UpstreamLeasedAssetssDto, upstreamLeasedAssetsActivityData: UpstreamLeasedAssetsActivityData) {
    console.log("INNNNNNN")
    upstreamLeasedAssetsActivityData.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    upstreamLeasedAssetsActivityData.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    upstreamLeasedAssetsActivityData.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false
    upstreamLeasedAssetsActivityData.month = calculationData.month;
    upstreamLeasedAssetsActivityData.year = calculationData.year;
    upstreamLeasedAssetsActivityData.groupNo = calculationData.groupNumber;
    upstreamLeasedAssetsActivityData.activityType = calculationData.activityType as UpstreamLeasedAssetDataMethod;
    upstreamLeasedAssetsActivityData.fuel_quntity = calculationData.data['fuel_quntity']

    upstreamLeasedAssetsActivityData.fuel_quntity_unit = calculationData.data['fuel_quntity_unit']
    upstreamLeasedAssetsActivityData.refrigerant_quntity = calculationData.data['refrigerant_quntity']
    upstreamLeasedAssetsActivityData.refrigerant_quntity_unit = calculationData.data['refrigerant_quntity_unit']
    upstreamLeasedAssetsActivityData.fuel_type = calculationData.data['fuel_type']
    upstreamLeasedAssetsActivityData.refrigerant_type = calculationData.data['refrigerant_type']
    upstreamLeasedAssetsActivityData.scp1scp2_emissions_lessor = calculationData.data['scp1scp2_emissions_lessor']
    upstreamLeasedAssetsActivityData.scp1scp2_emissions_lessor_unit = calculationData.data['scp1scp2_emissions_lessor_unit']
    upstreamLeasedAssetsActivityData.lease_assests_ratio = calculationData.data['lease_assests_ratio']
    upstreamLeasedAssetsActivityData.total_floor_space = calculationData.data['total_floor_space']
    upstreamLeasedAssetsActivityData.total_floor_space_unit = calculationData.data['total_floor_space_unit']
    upstreamLeasedAssetsActivityData.building_type = calculationData.data['building_type']
    upstreamLeasedAssetsActivityData.number_of_assets = calculationData.data['number_of_assets']
    upstreamLeasedAssetsActivityData.asset_type = calculationData.data['asset_type']
    upstreamLeasedAssetsActivityData.process_emission = calculationData.data['process_emission']
    upstreamLeasedAssetsActivityData.user_input_ef = calculationData.data['userInputEF']
    upstreamLeasedAssetsActivityData.lessor_type = calculationData.data['lessorType']
    upstreamLeasedAssetsActivityData.process_emission_unit = calculationData.data['process_emission_unit']



    const emission = await this.calculationService.calculate({
      sourceName: sourceName.Upstream_Leased_Assets,
      data: calculationData,
    });

    console.log("rrrrrrr---->", upstreamLeasedAssetsActivityData)


    if (emission && (emission.e_sc || emission.e_sc_co2 || emission.e_sc_ch4 || emission.e_sc_n2o)) {
      this.updateTotalEmission(upstreamLeasedAssetsActivityData, calculationData, emission)
    }

    upstreamLeasedAssetsActivityData.emission = emission.e_sc ? emission.e_sc : 0;

    upstreamLeasedAssetsActivityData.e_sc = emission.e_sc ? emission.e_sc : 0;
    upstreamLeasedAssetsActivityData.e_sc_co2 = emission.e_sc_co2 ? emission.e_sc_co2 : 0;
    upstreamLeasedAssetsActivityData.e_sc_ch4 = emission.e_sc_ch4 ? emission.e_sc_ch4 : 0;
    upstreamLeasedAssetsActivityData.e_sc_n2o = emission.e_sc_n2o ? emission.e_sc_n2o : 0;

    return await this.investmentsRepository.save(upstreamLeasedAssetsActivityData);
  }



  async update(id: number, updateUpstreamLeasedAssetssDto: UpstreamLeasedAssetsActivityDataDto) {

    const basicData = await this.getBaseData(updateUpstreamLeasedAssetssDto)

    let methodData: any;
    switch (updateUpstreamLeasedAssetssDto.activityType) {
      case UpstreamLeasedAssetDataMethod.FuelAssetSpecificMethod: {
        if (updateUpstreamLeasedAssetssDto.asset_specific_method_data.fuel_data) {
          methodData = updateUpstreamLeasedAssetssDto.asset_specific_method_data.fuel_data

        }
        else if (updateUpstreamLeasedAssetssDto.asset_specific_method_data.refrigerant_data) {
          methodData = updateUpstreamLeasedAssetssDto.asset_specific_method_data.refrigerant_data

        }
        break;
      }
      case UpstreamLeasedAssetDataMethod.DistanceLessorSpecificMethod: {
        methodData = updateUpstreamLeasedAssetssDto.lessor_specific_method_data
        break;
      }
      case UpstreamLeasedAssetDataMethod.SpendLeasedBuildingsMethod: {
        methodData = updateUpstreamLeasedAssetssDto.leased_buildings_method_data
        break;
      }
      case UpstreamLeasedAssetDataMethod.LeasedAssetsMethod: {
        methodData = updateUpstreamLeasedAssetssDto.leased_assets_method_data
        break;
      }

      default: {
        //statements; 
        break;
      }
    }


    if (methodData) {

      for (const methodA_data of methodData) {

        const upstreamLeasedAssetsActivityData = new UpstreamLeasedAssetsActivityData();
        upstreamLeasedAssetsActivityData.project = updateUpstreamLeasedAssetssDto.project
        upstreamLeasedAssetsActivityData.user = updateUpstreamLeasedAssetssDto.user
        upstreamLeasedAssetsActivityData.unit = updateUpstreamLeasedAssetssDto.unit
        upstreamLeasedAssetsActivityData.groupNo = updateUpstreamLeasedAssetssDto.groupNo


        const calculationData: UpstreamLeasedAssetssDto = {
          year: updateUpstreamLeasedAssetssDto.year,
          month: updateUpstreamLeasedAssetssDto.month,
          activityType: updateUpstreamLeasedAssetssDto.activityType,
          emission: 0,
          data: methodA_data,
          groupNumber: updateUpstreamLeasedAssetssDto.groupNo,
          baseData: basicData
        };
        await this.updateUpstreamLeasedAssets(methodA_data.id, upstreamLeasedAssetsActivityData, calculationData)
      }
    }












  }
  async updateUpstreamLeasedAssets(id: number, upstreamLeasedAssetsActivityData: UpstreamLeasedAssetsActivityData, calculationData: UpstreamLeasedAssetssDto) {
    upstreamLeasedAssetsActivityData.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    upstreamLeasedAssetsActivityData.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    upstreamLeasedAssetsActivityData.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false
    upstreamLeasedAssetsActivityData.month = calculationData.month;
    upstreamLeasedAssetsActivityData.year = calculationData.year;
    upstreamLeasedAssetsActivityData.activityType = calculationData.activityType as UpstreamLeasedAssetDataMethod;
    upstreamLeasedAssetsActivityData.fuel_quntity = calculationData.data['fuel_quntity']
    upstreamLeasedAssetsActivityData.fuel_quntity_unit = calculationData.data['fuel_quntity_unit']
    upstreamLeasedAssetsActivityData.refrigerant_quntity = calculationData.data['refrigerant_quntity']
    upstreamLeasedAssetsActivityData.refrigerant_quntity_unit = calculationData.data['refrigerant_quntity_unit']
    upstreamLeasedAssetsActivityData.fuel_type = calculationData.data['fuel_type']
    upstreamLeasedAssetsActivityData.refrigerant_type = calculationData.data['refrigerant_type']
    upstreamLeasedAssetsActivityData.scp1scp2_emissions_lessor = calculationData.data['scp1scp2_emissions_lessor']
    upstreamLeasedAssetsActivityData.scp1scp2_emissions_lessor_unit = calculationData.data['scp1scp2_emissions_lessor_unit']
    upstreamLeasedAssetsActivityData.lease_assests_ratio = calculationData.data['lease_assests_ratio']
    upstreamLeasedAssetsActivityData.total_floor_space = calculationData.data['total_floor_space']
    upstreamLeasedAssetsActivityData.total_floor_space_unit = calculationData.data['total_floor_space_unit']
    upstreamLeasedAssetsActivityData.building_type = calculationData.data['building_type']
    upstreamLeasedAssetsActivityData.number_of_assets = calculationData.data['number_of_assets']
    upstreamLeasedAssetsActivityData.asset_type = calculationData.data['asset_type']
    upstreamLeasedAssetsActivityData.process_emission = calculationData.data['process_emission']
    upstreamLeasedAssetsActivityData.process_emission_unit = calculationData.data['process_emission_unit']
    upstreamLeasedAssetsActivityData.user_input_ef = calculationData.data['userInputEF'] ? calculationData.data['userInputEF'] : 0



    const emission = await this.calculationService.calculate({
      sourceName: sourceName.Upstream_Leased_Assets,
      data: calculationData,
    });

    if (upstreamLeasedAssetsActivityData.e_sc !== emission.e_sc) {

      let current = await this.repo.findOne({ where: { id: id }, order: { id: 'ASC' } });
      let updatedEmission = this.calculationService.getDiff(current, emission);

      this.calculationService.updateTotalEmission(
        updatedEmission,
        upstreamLeasedAssetsActivityData.project,
        calculationData.baseData.clasification,
        sourceName.Upstream_Leased_Assets,
        upstreamLeasedAssetsActivityData.unit.id
      );
    }
    upstreamLeasedAssetsActivityData.emission = emission.e_sc ? emission.e_sc : 0;

    upstreamLeasedAssetsActivityData.e_sc = emission.e_sc ? emission.e_sc : 0;
    upstreamLeasedAssetsActivityData.e_sc_co2 = emission.e_sc_co2 ? emission.e_sc_co2 : 0;
    upstreamLeasedAssetsActivityData.e_sc_ch4 = emission.e_sc_ch4 ? emission.e_sc_ch4 : 0;
    upstreamLeasedAssetsActivityData.e_sc_n2o = emission.e_sc_n2o ? emission.e_sc_n2o : 0;

    if (id == 0) {
      console.log("AAAA--", upstreamLeasedAssetsActivityData)

      return await this.repo.save(upstreamLeasedAssetsActivityData);
    }
    else {
      const updated = await this.repo.update({
        id: id
      }, upstreamLeasedAssetsActivityData);

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
      sourceName.Upstream_Leased_Assets,
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
        sourceName.Upstream_Leased_Assets,
        deleteDto.unit.id
      );
      return await this.repo.delete({ id: deleteDto.id });
    });

  }
  async getBaseData(dto: UpstreamLeasedAssetsActivityDataDto): Promise<BaseDataDto> {
    let activityInfo = new PuesDataReqActivityData()
    activityInfo.owenerShip = Ownership.getkey(dto.ownership)
    activityInfo.stationary = dto.stationary
    activityInfo.mobile = dto.mobile
    let req = new PuesDataReqDto()
    req.project = dto.project
    req.sourceName = sourceName.Upstream_Leased_Assets
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

  async updateTotalEmission(dto: UpstreamLeasedAssetsActivityData, calData: UpstreamLeasedAssetssDto, emission: any) {
    let reqPues: PuesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Upstream_Leased_Assets,
      unitId: dto.unit.id,
      emission: emission,
      classification: calData.baseData.clasification
    }

    await this.puesService.addEmission(reqPues)

    let reqPes: PesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Upstream_Leased_Assets,
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



  async getEntryById(id: string): Promise<UpstreamLeasedAssetsActivityDataDto> {
    // let res = await this.repo.findOne({

    //   where: {
    //     id: id,
    //   },

    // })

    const groupNo = id;
    console.log("hhhhhh", groupNo)

    const entries = await this.repo.find({
      where: {
        groupNo: groupNo,
      },
    });


    const dto = new UpstreamLeasedAssetsActivityDataDto();
    console.log("dddd")

    dto.asset_specific_method_data = new AssetSpecificMethodData()
    dto.asset_specific_method_data.fuel_data = [];

    dto.asset_specific_method_data.refrigerant_data = [];
    console.log("qqq")


    dto.lessor_specific_method_data = [];
    dto.leased_buildings_method_data = [];
    dto.leased_assets_method_data = [];

    entries.forEach((item: any) => {
      console.log("iiii", item)

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

      if (item.fuel_type) {

        dto.asset_specific_method_data.fuel_data.push({
          id: item.id,
          fuel_type: item.fuel_type,
          fuel_quntity_unit: item.fuel_quntity_unit,
          fuel_quntity: item.fuel_quntity,
          typeName: item.typeName
        })


      }
      console.log("BBBBB", dto.asset_specific_method_data)

      if (item.refrigerant_type) {

        dto.asset_specific_method_data.refrigerant_data.push({
          id: item.id,
          refrigerant_type: item.refrigerant_type,
          refrigerant_quntity_unit: item.refrigerant_quntity_unit,
          refrigerant_quntity: item.refrigerant_quntity,
          process_emission: item.process_emission,
          process_emission_unit: item.process_emission_unit,
          typeName: item.typeName
        })
      }




      const methodBData = new LessorSpecificMethodData();
      methodBData.scp1scp2_emissions_lessor = item.scp1scp2_emissions_lessor;
      methodBData.lessorType = item.lessor_type;
      methodBData.scp1scp2_emissions_lessor_unit = item.scp1scp2_emissions_lessor_unit;
      methodBData.lease_assests_ratio = item.lease_assests_ratio;
      methodBData.id = item.id
      methodBData.userInputEF = item.user_input_ef;
      dto.lessor_specific_method_data.push(methodBData);

      const methodCData = new LeasedBuildingsMethodData();
      methodCData.total_floor_space = item.total_floor_space;
      methodCData.total_floor_space_unit = item.total_floor_space_unit;
      methodCData.building_type = item.building_type;
      methodCData.userInputEF = item.user_input_ef;
      methodCData.id = item.id

      dto.leased_buildings_method_data.push(methodCData);

      const methodDData = new LeasedAssetsMethodData();
      methodDData.number_of_assets = item.number_of_assets;
      methodDData.asset_type = item.asset_type;
      methodDData.userInputEF = item.user_input_ef;
      methodDData.id = item.id

      dto.leased_assets_method_data.push(methodDData);



    });

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
    deleteDto: UpstreamLeasedAssetsActivityData,
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

}

