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
import { UpstreamLeasedAssetssDto } from 'src/emission/calculation/dto/upstream-leased-asset.dto';
import { InvestmentsService } from 'src/emission/investments/service/investments.service';
import { ProcessingOfSoldProductsActivityData } from '../entities/processing-of-sold-product.entity';
import { AverageDataMethodData, ProcessingOfSoldProductsActivityDataDto, ProcessingOfSoldProductsMethod, SiteSpecificMethodCO2Data } from '../dto/processing-of-sold-product-dto.dto';
import { ProcessingOfSoldProductsDto } from 'src/emission/calculation/dto/processing-of-sold-products.dto';
import { ProcessingOfSoldProductDataTypeNames } from '../dto/datatype-names.enum';

@Injectable()
export class ProcessingOfSoldProductsService extends TypeOrmCrudService<ProcessingOfSoldProductsActivityData> implements ExcellUploadable, ProgressRetriever, ExcelDownloader {

  getDto() {
    return new ProcessingOfSoldProductsActivityData();
  }

  private excelBulkVariableMapping: { code: string, name: string, isRequired: boolean, type: VariableValidationType }[] = [
    { code: "month", name: 'Month', isRequired: true, type: VariableValidationType.list },
    { code: "fc", name: 'Consumption', isRequired: true, type: VariableValidationType.number },
    { code: "fuelType", name: 'Fuel Types', isRequired: true, type: VariableValidationType.list },
    { code: "fc_unit", name: 'Fuel Consumption Unit', isRequired: true, type: VariableValidationType.list },
  ]

  constructor(
    @InjectRepository(ProcessingOfSoldProductsActivityData) repo,
    @InjectRepository(ProcessingOfSoldProductsActivityData)
    private readonly investmentsRepository: Repository<ProcessingOfSoldProductsActivityData>,
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

    // let dto = new ProcessingOfSoldProductsActivityData();
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

  async createAll(createUpstreamLeasedAssetssDto: ProcessingOfSoldProductsActivityDataDto) {
    console.log("ooooooooooooo-----", createUpstreamLeasedAssetssDto.site_specific_method_cO2_data.waste_data)
    const crypto = require('crypto');
    const groupNumber = crypto.randomUUID();
    const basicData = await this.getBaseData(createUpstreamLeasedAssetssDto)
    let methodData: any = [];
    switch (createUpstreamLeasedAssetssDto.activityType) {
      case ProcessingOfSoldProductsMethod.SiteSpecificMethodCO2: {
        if (createUpstreamLeasedAssetssDto.site_specific_method_cO2_data.fuel_data.length > 0) {
          console.log("yyy")



          methodData = methodData.concat(createUpstreamLeasedAssetssDto.site_specific_method_cO2_data.fuel_data);


        }
        if (createUpstreamLeasedAssetssDto.site_specific_method_cO2_data.refrigerant_data.length > 0) {
          console.log("xxx")

          methodData = methodData.concat(createUpstreamLeasedAssetssDto.site_specific_method_cO2_data.refrigerant_data);
        }

          if (createUpstreamLeasedAssetssDto.site_specific_method_cO2_data.waste_data.length > 0) {
            console.log("uuuuuu")

            methodData = methodData.concat(createUpstreamLeasedAssetssDto.site_specific_method_cO2_data.waste_data);
            console.log("MMMMM",methodData)

          }
      

        break;
      }

      case ProcessingOfSoldProductsMethod.AverageDataMethod: {
        methodData = createUpstreamLeasedAssetssDto.average_data_method
        break;
      }


      default: {
        //statements; 
        break;
      }
    }

    if (methodData) {
      for (let methodA_data of methodData) {
        const upstreamLeasedAssetsActivityData = new ProcessingOfSoldProductsActivityData();
        upstreamLeasedAssetsActivityData.project = createUpstreamLeasedAssetssDto.project
        upstreamLeasedAssetsActivityData.user = createUpstreamLeasedAssetssDto.user
        upstreamLeasedAssetsActivityData.unit = createUpstreamLeasedAssetssDto.unit

        const calculationData: ProcessingOfSoldProductsDto = {
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
      .addSelect('MAX(acData.id)', 'id')
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


  async createUpstreamLeasedAssets(calculationData: ProcessingOfSoldProductsDto, upstreamLeasedAssetsActivityData: ProcessingOfSoldProductsActivityData) {

    upstreamLeasedAssetsActivityData.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    upstreamLeasedAssetsActivityData.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    upstreamLeasedAssetsActivityData.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false
    upstreamLeasedAssetsActivityData.month = calculationData.month;
    upstreamLeasedAssetsActivityData.year = calculationData.year;
    upstreamLeasedAssetsActivityData.groupNo = calculationData.groupNumber;
    upstreamLeasedAssetsActivityData.activityType = calculationData.activityType as ProcessingOfSoldProductsMethod;
    upstreamLeasedAssetsActivityData.quntity = calculationData.data['quntity']
    upstreamLeasedAssetsActivityData.quntity_unit = calculationData.data['quntity_unit']
    upstreamLeasedAssetsActivityData.fuel_type = calculationData.data['fuel_type']
    upstreamLeasedAssetsActivityData.refrigerant_type = calculationData.data['refrigerant_type']
    upstreamLeasedAssetsActivityData.user_input_ef = calculationData.data['user_input_ef']
    upstreamLeasedAssetsActivityData.mass = calculationData.data['mass']
    upstreamLeasedAssetsActivityData.mass_unit = calculationData.data['mass_unit']
    upstreamLeasedAssetsActivityData.sold_intermediate_type = calculationData.data['sold_intermediate_type']
    upstreamLeasedAssetsActivityData.disposalMethod = calculationData.data['disposalMethod']
    upstreamLeasedAssetsActivityData.waste_type = calculationData.data['waste_type']



    const emission = await this.calculationService.calculate({
      sourceName: sourceName.Processing_of_Sold_Products,
      data: calculationData,
    });


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



  async update(id: number, updateUpstreamLeasedAssetssDto: ProcessingOfSoldProductsActivityDataDto) {


    const basicData = await this.getBaseData(updateUpstreamLeasedAssetssDto)

    let methodData: any = [];
    switch (updateUpstreamLeasedAssetssDto.activityType) {
      case ProcessingOfSoldProductsMethod.SiteSpecificMethodCO2: {

        if (updateUpstreamLeasedAssetssDto.site_specific_method_cO2_data.fuel_data.length > 0) {

          methodData = methodData.concat(updateUpstreamLeasedAssetssDto.site_specific_method_cO2_data.fuel_data);

        }
        if (updateUpstreamLeasedAssetssDto.site_specific_method_cO2_data.refrigerant_data.length > 0) {

          methodData = methodData.concat(updateUpstreamLeasedAssetssDto.site_specific_method_cO2_data.refrigerant_data);

        }
          if (updateUpstreamLeasedAssetssDto.site_specific_method_cO2_data.waste_data.length > 0) {

            methodData = methodData.concat(updateUpstreamLeasedAssetssDto.site_specific_method_cO2_data.waste_data);

          }
        

        break;
      }

      case ProcessingOfSoldProductsMethod.AverageDataMethod: {
        methodData = updateUpstreamLeasedAssetssDto.average_data_method
        break;
      }

    }

    if (methodData) {

      for (const methodA_data of methodData) {

        const upstreamLeasedAssetsActivityData = new ProcessingOfSoldProductsActivityData();
        upstreamLeasedAssetsActivityData.project = updateUpstreamLeasedAssetssDto.project
        upstreamLeasedAssetsActivityData.user = updateUpstreamLeasedAssetssDto.user
        upstreamLeasedAssetsActivityData.unit = updateUpstreamLeasedAssetssDto.unit
        upstreamLeasedAssetsActivityData.groupNo = updateUpstreamLeasedAssetssDto.groupNo


        const calculationData: ProcessingOfSoldProductsDto = {
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
  async updateUpstreamLeasedAssets(id: number, upstreamLeasedAssetsActivityData: ProcessingOfSoldProductsActivityData, calculationData: ProcessingOfSoldProductsDto) {

    upstreamLeasedAssetsActivityData.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    upstreamLeasedAssetsActivityData.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    upstreamLeasedAssetsActivityData.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false
    upstreamLeasedAssetsActivityData.month = calculationData.month;
    upstreamLeasedAssetsActivityData.year = calculationData.year;
    upstreamLeasedAssetsActivityData.activityType = calculationData.activityType as ProcessingOfSoldProductsMethod;
    upstreamLeasedAssetsActivityData.quntity = calculationData.data['quntity']
    upstreamLeasedAssetsActivityData.quntity_unit = calculationData.data['quntity_unit']
    upstreamLeasedAssetsActivityData.fuel_type = calculationData.data['fuel_type']
    upstreamLeasedAssetsActivityData.refrigerant_type = calculationData.data['refrigerant_type']
    upstreamLeasedAssetsActivityData.user_input_ef = calculationData.data['user_input_ef']
    upstreamLeasedAssetsActivityData.disposalMethod = calculationData.data['disposalMethod']
    upstreamLeasedAssetsActivityData.waste_type = calculationData.data['waste_type']
    upstreamLeasedAssetsActivityData.mass = calculationData.data['mass']
    upstreamLeasedAssetsActivityData.mass_unit = calculationData.data['mass_unit']
    upstreamLeasedAssetsActivityData.sold_intermediate_type = calculationData.data['sold_intermediate_type']
  



    const emission = await this.calculationService.calculate({
      sourceName: sourceName.Processing_of_Sold_Products,
      data: calculationData,
    });

    if (upstreamLeasedAssetsActivityData.e_sc !== emission.e_sc) {

      let current = await this.repo.findOne({ where: { id: id }, order: { id: 'ASC' } });
      let updatedEmission = this.calculationService.getDiff(current, emission);

      this.calculationService.updateTotalEmission(
        updatedEmission,
        upstreamLeasedAssetsActivityData.project,
        calculationData.baseData.clasification,
        sourceName.Processing_of_Sold_Products,
        upstreamLeasedAssetsActivityData.unit.id
      );
    }
    upstreamLeasedAssetsActivityData.emission = emission.e_sc ? emission.e_sc : 0;

    upstreamLeasedAssetsActivityData.e_sc = emission.e_sc ? emission.e_sc : 0;
    upstreamLeasedAssetsActivityData.e_sc_co2 = emission.e_sc_co2 ? emission.e_sc_co2 : 0;
    upstreamLeasedAssetsActivityData.e_sc_ch4 = emission.e_sc_ch4 ? emission.e_sc_ch4 : 0;
    upstreamLeasedAssetsActivityData.e_sc_n2o = emission.e_sc_n2o ? emission.e_sc_n2o : 0;

    if (id == 0) {
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
  async getBaseData(dto: ProcessingOfSoldProductsActivityDataDto): Promise<BaseDataDto> {
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

  async updateTotalEmission(dto: ProcessingOfSoldProductsActivityData, calData: ProcessingOfSoldProductsDto, emission: any) {
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



  async getEntryById(id: string): Promise<ProcessingOfSoldProductsActivityDataDto> {

    const groupNo = id;

    const entries = await this.repo.find({
      where: {
        groupNo: groupNo,
      },
    });


    const dto = new ProcessingOfSoldProductsActivityDataDto();

    dto.site_specific_method_cO2_data = new SiteSpecificMethodCO2Data()
    dto.site_specific_method_cO2_data.fuel_data = [];

    dto.site_specific_method_cO2_data.refrigerant_data = [];
    dto.site_specific_method_cO2_data.waste_data = [];



    dto.average_data_method = [];


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

      if (item.fuel_type) {

        dto.site_specific_method_cO2_data.fuel_data.push({
          id: item.id,
          fuel_type: item.fuel_type,
          quntity_unit: item.quntity_unit,
          quntity: item.quntity,
          typeName: item.typeName,
          user_input_ef:item.user_input_ef
        })

      }

      if (item.refrigerant_type) {

        dto.site_specific_method_cO2_data.refrigerant_data.push({
          id: item.id,
          refrigerant_type: item.refrigerant_type,
          quntity_unit: item.quntity_unit,
          quntity: item.quntity,
          typeName: item.typeName

        })
      }

      if (item.waste_type) {

        dto.site_specific_method_cO2_data.waste_data.push({
          id: item.id,
          disposalMethod: item.disposalMethod,
          waste_type: item.waste_type,
          mass_unit: item.mass_unit,
          mass: item.mass,
          typeName: item.typeName

        })
      }



      const methodBData = new AverageDataMethodData();
      methodBData.sold_intermediate_type = item.sold_intermediate_type;
      methodBData.mass = item.mass;
      methodBData.mass_unit = item.mass_unit;
      methodBData.user_input_ef = item.user_input_ef;
      methodBData.id = item.id
      dto.average_data_method.push(methodBData);





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
    deleteDto: ProcessingOfSoldProductsActivityData,
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

