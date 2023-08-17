import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { BaseDataDto } from 'src/emission/calculation/dto/emission-base-data.dto';
import { ProjectEmissionSourceService } from 'src/emission/emission-source/service/project-emission-source.service';
import { ExcellUploadable } from 'src/emission/excell-uploadable';
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

import { CalculationService } from '../../calculation/calculation.service';
import { sourceName } from '../../enum/sourcename.enum';
import { EmissionSourceRecalService } from 'src/emission/emission-source/service/emission-source-recal.service';
import { EmissionSourceBulkService } from 'src/emission/emission-source/service/emission-source-bulk.service';
import { VariableValidationType } from 'src/emission/enum/variable-validation-type.enum';
import { ProgressRetriever } from 'src/emission/progress-retriever';
import { ExcelDownloader } from 'src/emission/excel-downloader';
import { UpstreamTransportationActivityData } from '../entities/upstream-transportation.entity';
import {
  BackhaulParameters,
  DTAverageDataMethodData,
  DTAverageDataMethodDataParameters,
  DistanceBaseMethodData,
  DistanceBaseMethodDataParameters,
  UpstreamTransportationActivityDataDto,
  UpstreamTransportationEmissionSourceDataMethod,
  UpstreamTransportationFuelBaseType,
  ElectricityParameters,
  FuelBaseMethodData,  
  FuelParameters,  
  RefrigerentParameters,  
  SiteSpecificMethodData,
  SiteSpecificMethodParameters,
  SpendBaseMethodData,
  SpendBaseMethodDataParameters,
} from '../dto/upstream-transportation-dto.dto';
import { UpstreamTransportationDto } from 'src/emission/calculation/dto/upstream-transportation.dto';
import * as crypto from 'crypto';
import { Country } from 'src/country/entities/country.entity';

@Injectable()
export class UpstreamTransportationService
  extends TypeOrmCrudService<UpstreamTransportationActivityData>
  implements ExcellUploadable, ProgressRetriever, ExcelDownloader {
  getDto() {
    return new UpstreamTransportationActivityData();
  }

  private excelBulkVariableMapping: { code: string; name: string; isRequired: boolean; type: VariableValidationType }[] = [
    {
      code: 'month',
      name: 'Month',
      isRequired: true,
      type: VariableValidationType.list,
    },
  ];

  constructor(
    @InjectRepository(UpstreamTransportationActivityData) repo,
    private readonly calculationService: CalculationService,
    private puesService: ProjectUnitEmissionSourceService,
    private pesService: ProjectEmissionSourceService,
    private projectService: ProjectService,
    private emissionSourceRecalService: EmissionSourceRecalService,
    private emissionSourceBulkService: EmissionSourceBulkService,
  ) {
    super(repo);
  }
  getVariableMapping() {
    throw new Error('Method not implemented.');
  }
  async generateTableData(projectId: number, unitIds: number, paras: any[], ownership?: string,) {
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
      sourceName.Upstream_Transportation_and_Distribution,
    );
  }

  excellBulkUpload(unit: Unit,project: Project,user: User,data: any,variable_mapping: any[],year: number,ownership: string,isMobile: boolean,) {
    let dto = new UpstreamTransportationActivityData();
    dto = this.emissionSourceBulkService.excellBulkUpload(unit,project,user,data,year,ownership,isMobile,dto,this.excelBulkVariableMapping,);
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

  copyDtotoEntity(createUpstreamTransportationDto: UpstreamTransportationActivityDataDto, groupNumber: string): UpstreamTransportationActivityData {
    const franchisesActivityData = new UpstreamTransportationActivityData();

    franchisesActivityData.project = createUpstreamTransportationDto.project;
    franchisesActivityData.year = createUpstreamTransportationDto.year;
    franchisesActivityData.month = createUpstreamTransportationDto.month;
    franchisesActivityData.unit = createUpstreamTransportationDto.unit;
    franchisesActivityData.method = createUpstreamTransportationDto.method;
    franchisesActivityData.mobile = createUpstreamTransportationDto.mobile;
    franchisesActivityData.stationary = createUpstreamTransportationDto.stationary;
    franchisesActivityData.activityDataStatus = createUpstreamTransportationDto.activityDataStatus;
    franchisesActivityData.ownership = createUpstreamTransportationDto.ownership;
    franchisesActivityData.groupNo = groupNumber;

    return franchisesActivityData;
  }

  /**
   * Maps the properties of a DTO object onto a UpstreamTransportationActivityData entity
   *
   * @param {UpstreamTransportationActivityData} entity - the entity to map the DTO onto
   * @param {T} dto - the DTO object to map onto the entity
   * @returns {UpstreamTransportationActivityData} the entity with the mapped properties from the DTO
   */
  getMappedEntity<T>(entity: UpstreamTransportationActivityData, dto: T) {
    Object.keys(dto).forEach(key => {
      entity[key] = dto[key];
    })
    return entity;
  }

  /**
   * Returns a UpstreamTransportationDto object with the specified data and baseData.
   *
   * @param {UpstreamTransportationActivityDataDto} dto - The DTO containing the month, year, and method.
   * @param {string} groupNumber - The group number.
   * @param {BaseDataDto} baseData - The base data.
   * @param {T} data - The data to be included in the UpstreamTransportationDto.
   * @return {UpstreamTransportationDto<T>} The UpstreamTransportationDto object with the specified data and baseData.
   */
  getCalReq<T>(dto: UpstreamTransportationActivityDataDto, groupNumber: string, baseData: BaseDataDto, data: T): UpstreamTransportationDto<T> {
    const calculationData: UpstreamTransportationDto<T> = {
      month: dto.month,
      year: dto.year,
      method: dto.method,
      data: data,
      groupNumber: groupNumber,
      emission: 0,
      baseData: baseData
    }
    return calculationData;
  }

  /**
   * Saves a calculated entity.
   *
   * @async
   * @template T
   * @param {UpstreamTransportationEmissionSourceDataMethod} method - The method used to calculate the entity.
   * @param {UpstreamTransportationActivityDataDto} reqDto - The DTO containing data for the request.
   * @param {string} groupNumber - The number of the group.
   * @param {T} data - The data to be saved.
   * @param {BaseDataDto} basicData - The DTO containing basic data.
   * @return {Promise<any>} A promise containing the result of the method used to save the entity.
   */
  async saveCalculatedEntity<T extends { id: number, typeName: string }>(method: UpstreamTransportationEmissionSourceDataMethod, reqDto: UpstreamTransportationActivityDataDto, groupNumber: string, data: T, basicData: BaseDataDto) {
    if(!data.typeName){
      data.typeName = ''
    }
    let franchisesActivityData = this.copyDtotoEntity(reqDto, groupNumber);
    franchisesActivityData = this.getMappedEntity(franchisesActivityData, data);
    franchisesActivityData.method = method;
    const calculationDataReq: UpstreamTransportationDto<T> = this.getCalReq<T>(reqDto, groupNumber, basicData, data);
    if (data.id) {
      franchisesActivityData.id = franchisesActivityData.id;
      return await this.updateUpstreamTransportation<T>(calculationDataReq, franchisesActivityData);
    } else {
      return await this.createUpstreamTransportation<T>(calculationDataReq, franchisesActivityData);
    }
  }

  /**
 * Creates all franchises based on the provided data.
 *
 * @param {UpstreamTransportationActivityDataDto} createUpstreamTransportationDto - The data required to create upstream-transportation.
 * @return {Promise<boolean>} - Returns true if franchises were successfully created.
 */
  async createAllUpstreamTransportation(createUpstreamTransportationDto: UpstreamTransportationActivityDataDto): Promise<boolean> {
    const groupNumber = createUpstreamTransportationDto.groupNo || crypto.randomUUID();
    const basicData = await this.getBaseDataUpstreamTransportation(createUpstreamTransportationDto);

    const emissionSourceData = [
      { method: UpstreamTransportationEmissionSourceDataMethod.FUEL_BASE_METHOD, data: createUpstreamTransportationDto.fule_based_method_data },
      { method: UpstreamTransportationEmissionSourceDataMethod.DISTANCE_BASE_METHOD, data: createUpstreamTransportationDto.distance_based_method_data },
      { method: UpstreamTransportationEmissionSourceDataMethod.SPEND_BASE_METHOD, data: createUpstreamTransportationDto.spend_based_method_data },
      { method: UpstreamTransportationEmissionSourceDataMethod.SITE_SPECIFIC_METHOD, data: createUpstreamTransportationDto.site_specific_method_data },
      { method: UpstreamTransportationEmissionSourceDataMethod.AVERAGE_DATA_METHOD, data: createUpstreamTransportationDto.average_data_method_data },
    ];

    for (const { method, data } of emissionSourceData) {

      if(method === UpstreamTransportationEmissionSourceDataMethod.FUEL_BASE_METHOD){
        let fuelData = data as FuelBaseMethodData;   
        if(fuelData?.fuel_data){
          for (const datum of fuelData.fuel_data) {
            datum.typeName = UpstreamTransportationFuelBaseType.FUEL_DATA;
            this.saveCalculatedEntity(method, createUpstreamTransportationDto, groupNumber, datum, basicData);
          }
        }
        if(fuelData?.electricity_data){
          for (const datum of fuelData.electricity_data) {
            datum.typeName = UpstreamTransportationFuelBaseType.ELECTRICITY_DATA;
            this.saveCalculatedEntity(method, createUpstreamTransportationDto, groupNumber, datum, basicData);
          }
        }
        if(fuelData?.refrigerent_data){
          for (const datum of fuelData.refrigerent_data) {
            datum.typeName = UpstreamTransportationFuelBaseType.REFRIGENT_DATA;
            this.saveCalculatedEntity(method, createUpstreamTransportationDto, groupNumber, datum, basicData);
          }
        }
        if(fuelData?.backhaul_data){
          for (const datum of fuelData.backhaul_data) {
            datum.typeName = UpstreamTransportationFuelBaseType.BACKHAUL_DATA;
            this.saveCalculatedEntity(method, createUpstreamTransportationDto, groupNumber, datum, basicData);
          }
        }
      }else{
        let d = data as DistanceBaseMethodData | SpendBaseMethodData | SiteSpecificMethodData | DTAverageDataMethodData;
        if(d?.data){
          for (const datum of d.data) {
            this.saveCalculatedEntity(method, createUpstreamTransportationDto, groupNumber, datum, basicData);
          }
        }      
      }
    }
    return true;
  }

  async createUpstreamTransportation<T>(calculationData: UpstreamTransportationDto<T>, franchisesActivityData: UpstreamTransportationActivityData,) {
    franchisesActivityData.groupNo = calculationData.groupNumber;
    franchisesActivityData.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false;
    franchisesActivityData.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false;
    franchisesActivityData.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false;

    const emission = await this.calculationService.calculate({ sourceName: sourceName.Upstream_Transportation_and_Distribution, data: calculationData });
    console.log('emissione', emission);
    if (emission && (emission.e_sc || emission.e_sc_co2 || emission.e_sc_ch4 || emission.e_sc_n2o)) {
      this.updateTotalEmission(franchisesActivityData, calculationData, emission,);
    }

    franchisesActivityData.emission = emission && emission.e_sc ? emission.e_sc : 0;
    franchisesActivityData.e_sc = emission && emission.e_sc ? emission.e_sc : 0;
    franchisesActivityData.e_sc_co2 = emission && emission.e_sc_co2 ? emission.e_sc_co2 : 0;
    franchisesActivityData.e_sc_ch4 = emission && emission.e_sc_ch4 ? emission.e_sc_ch4 : 0;
    franchisesActivityData.e_sc_n2o = emission && emission.e_sc_n2o ? emission.e_sc_n2o : 0;

    try {
      return await this.repo.save(franchisesActivityData,);
    } catch (e) {
      // TODO: odify the updated total emission
      throw new InternalServerErrorException(e);
    }
  }
  async updateUpstreamTransportation<T>(calculationData: UpstreamTransportationDto<T>, updateUpstreamTransportationDto: UpstreamTransportationActivityData) {
    updateUpstreamTransportationDto.groupNo = calculationData.groupNumber;
    updateUpstreamTransportationDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false;
    updateUpstreamTransportationDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false;
    updateUpstreamTransportationDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false;

    const emission = await this.calculationService.calculate({ sourceName: sourceName.Upstream_Transportation_and_Distribution, data: calculationData });

    if (updateUpstreamTransportationDto.e_sc !== emission.e_sc) {
      let current = await this.repo.findOne(updateUpstreamTransportationDto.id);
      let updatedEmission = this.calculationService.getDiff(current, emission);
      this.calculationService.updateTotalEmission(
        updatedEmission,
        updateUpstreamTransportationDto.project,
        calculationData.baseData.clasification,
        sourceName.Upstream_Transportation_and_Distribution,
        updateUpstreamTransportationDto.unit.id,
      );
    }
    updateUpstreamTransportationDto.emission = emission && emission.e_sc ? emission.e_sc : 0;
    updateUpstreamTransportationDto.e_sc = emission && emission.e_sc ? emission.e_sc : 0;
    updateUpstreamTransportationDto.e_sc_co2 = emission && emission.e_sc_co2 ? emission.e_sc_co2 : 0;
    updateUpstreamTransportationDto.e_sc_ch4 = emission && emission.e_sc_ch4 ? emission.e_sc_ch4 : 0;
    updateUpstreamTransportationDto.e_sc_n2o = emission && emission.e_sc_n2o ? emission.e_sc_n2o : 0;

    const updated = await this.repo.update({ id: updateUpstreamTransportationDto.id, }, updateUpstreamTransportationDto);
    if (updated.affected === 1) {
      return await this.repo.findOne(updateUpstreamTransportationDto.id);
    } else {
      // TODO: odify the updated total emission
      throw new InternalServerErrorException('Updating is failed');
    }
  }

  async create(
    createUpstreamTransportationDto: UpstreamTransportationActivityData,
  ) { }

  async update(
    id: number,
    updateUpstreamTransportationDto: UpstreamTransportationActivityData,
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
      sourceName.Upstream_Transportation_and_Distribution,
      deleteDto.unit.id,
    );
    return await this.repo.delete({ id: deleteDto.id });
  }
  async getBaseDataUpstreamTransportation(
    dto: UpstreamTransportationActivityDataDto,
  ): Promise<BaseDataDto> {
    let activityInfo = new PuesDataReqActivityData();
    activityInfo.owenerShip = Ownership.getkey(dto.ownership);
    activityInfo.stationary = dto.stationary;
    activityInfo.mobile = dto.mobile;
    let req = new PuesDataReqDto();
    req.project = dto.project;
    req.sourceName = sourceName.Upstream_Transportation_and_Distribution;
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
    dto: UpstreamTransportationActivityData,
  ): Promise<BaseDataDto> {
    let activityInfo = new PuesDataReqActivityData();
    activityInfo.owenerShip = Ownership.getkey(dto.ownership);
    activityInfo.stationary = dto.stationary;
    activityInfo.mobile = dto.mobile;
    let req = new PuesDataReqDto();
    req.project = dto.project;
    req.sourceName = sourceName.Upstream_Transportation_and_Distribution;
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

  async updateTotalEmission(dto: UpstreamTransportationActivityData, calData: UpstreamTransportationDto<any>,emission: any) {
    let reqPues: PuesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Upstream_Transportation_and_Distribution,
      unitId: dto.unit.id,
      emission: emission,
      classification: calData.baseData.clasification,
    };
    await this.puesService.addEmission(reqPues);

    let reqPes: PesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Upstream_Transportation_and_Distribution,
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

  async getAllUpstreamTransportationData(option: any, projectId: number, unitId: number): Promise<any> {
    console.log("getAllUpstreamTransportationDatagetAllUpstreamTransportationData")
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

    return {
      data: await data2.getRawMany(),
      total: (await data.getRawMany()).length,
    };
  }

  getEntityToDto<T extends { id: number }>(data: T, entity: UpstreamTransportationActivityData) {
    data.id = entity.id;
    Object.getOwnPropertyNames(data).forEach(key => {
      console.log(key);
      data[key] = entity[key];
    })
    return data;
  }

  async getOneUpstreamTransportationDataSet(groupNumber: string): Promise<any> {
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
        'country.id = unit.countryId',
      )
      .where(filter, { groupNumber })
      .orderBy('acData.createdOn', 'ASC');

    // console.log(await data.getCount())
    const results = await data.getMany();
    console.log("resssss",results)


    const dto = new UpstreamTransportationActivityDataDto();
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

    dto.fule_based_method_data = new FuelBaseMethodData();
    dto.distance_based_method_data = new DistanceBaseMethodData();
    dto.spend_based_method_data = new SpendBaseMethodData();
    dto.site_specific_method_data = new SiteSpecificMethodData();
    dto.average_data_method_data = new DTAverageDataMethodData();

    for (let res of results) {
      if (res.method == UpstreamTransportationEmissionSourceDataMethod.FUEL_BASE_METHOD) {
        let fuel = FuelParameters.getResObject();
        let elec = ElectricityParameters.getResObject();
        let ref = RefrigerentParameters.getResObject();
        let back = BackhaulParameters.getResObject();
        
        fuel = this.getEntityToDto<FuelParameters>(fuel, res);
        elec = this.getEntityToDto<ElectricityParameters>(elec, res);
        ref = this.getEntityToDto<RefrigerentParameters>(ref, res);
        back = this.getEntityToDto<BackhaulParameters>(back, res);

        switch (res.typeName) {
          case UpstreamTransportationFuelBaseType.FUEL_DATA:
            dto.fule_based_method_data.fuel_data.push(fuel);
            break;

          case UpstreamTransportationFuelBaseType.ELECTRICITY_DATA:
            dto.fule_based_method_data.electricity_data.push(elec);
            break;

          case UpstreamTransportationFuelBaseType.REFRIGENT_DATA:
            dto.fule_based_method_data.refrigerent_data.push(ref);
            break;

          case UpstreamTransportationFuelBaseType.BACKHAUL_DATA:
            dto.fule_based_method_data.backhaul_data.push(back);
            break;
        }
        
        
      } else if (res.method == UpstreamTransportationEmissionSourceDataMethod.DISTANCE_BASE_METHOD) {
        let data = DistanceBaseMethodDataParameters.getResObject();
        data = this.getEntityToDto<DistanceBaseMethodDataParameters>(data, res);
        dto.distance_based_method_data.data.push(data)
      } else if (res.method == UpstreamTransportationEmissionSourceDataMethod.SPEND_BASE_METHOD) {
        let data = SpendBaseMethodDataParameters.getResObject();
        data = this.getEntityToDto<SpendBaseMethodDataParameters>(data, res);
        dto.spend_based_method_data.data.push(data)
      } else if (res.method == UpstreamTransportationEmissionSourceDataMethod.SITE_SPECIFIC_METHOD) {
        let data = SiteSpecificMethodParameters.getResObject();
        data = this.getEntityToDto<SiteSpecificMethodParameters>(data, res);
        dto.site_specific_method_data.data.push(data)
      } else if (res.method == UpstreamTransportationEmissionSourceDataMethod.AVERAGE_DATA_METHOD) {
        let data = DTAverageDataMethodDataParameters.getResObject();
        data = this.getEntityToDto<DTAverageDataMethodDataParameters>(data, res);
        dto.average_data_method_data.data.push(data)
      }
    }

    console.log("ddd",dto)
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
    deleteDto: UpstreamTransportationActivityData,
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
      sourceName.Upstream_Transportation_and_Distribution,
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
      sourceName.Upstream_Transportation_and_Distribution,
      deleteDto.unit.id,
    );
    return await this.repo.delete({ id: deleteDto.id });
  }
}
