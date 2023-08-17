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
import { FranchisesActivityData } from '../entities/franchises.entity';
import {
  AverageDataMethodFloorSpaceData,
  AverageDataMethodFloorSpaceDataParameters,
  AverageDataMethodNotFloorSpaceData,
  AverageDataMethodNotFloorSpaceDataParameters,
  FranchisesActivityDataDto,
  FranchisesEmissionSourceDataMethod,
  NotSubMeteredData,
  NotSubMeteredParameters,
  SampleGroupParameters,
  SampleGroupsData,
  SpecificMethodData,
  SpecificMethodParameters,
} from '../dto/franchises-dto.dto';
import { FranchisesDto } from 'src/emission/calculation/dto/franchises.dto';
import * as crypto from 'crypto';

@Injectable()
export class FranchisesService
  extends TypeOrmCrudService<FranchisesActivityData>
  implements ExcellUploadable, ProgressRetriever, ExcelDownloader {
  getDto() {
    return new FranchisesActivityData();
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
    @InjectRepository(FranchisesActivityData) repo,
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
      sourceName.Franchises,
    );
  }

  excellBulkUpload(unit: Unit,project: Project,user: User,data: any,variable_mapping: any[],year: number,ownership: string,isMobile: boolean,) {
    let dto = new FranchisesActivityData();
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

  copyDtotoEntity(createFranchisesDto: FranchisesActivityDataDto, groupNumber: string): FranchisesActivityData {
    const franchisesActivityData = new FranchisesActivityData();

    franchisesActivityData.project = createFranchisesDto.project;
    franchisesActivityData.year = createFranchisesDto.year;
    franchisesActivityData.month = createFranchisesDto.month;
    franchisesActivityData.unit = createFranchisesDto.unit;
    franchisesActivityData.method = createFranchisesDto.method;
    franchisesActivityData.mobile = createFranchisesDto.mobile;
    franchisesActivityData.stationary = createFranchisesDto.stationary;
    franchisesActivityData.activityDataStatus = createFranchisesDto.activityDataStatus;
    franchisesActivityData.ownership = createFranchisesDto.ownership;
    franchisesActivityData.groupNo = groupNumber;

    return franchisesActivityData;
  }

  /**
   * Maps the properties of a DTO object onto a FranchisesActivityData entity
   *
   * @param {FranchisesActivityData} entity - the entity to map the DTO onto
   * @param {T} dto - the DTO object to map onto the entity
   * @returns {FranchisesActivityData} the entity with the mapped properties from the DTO
   */
  getMappedEntity<T>(entity: FranchisesActivityData, dto: T) {
    Object.keys(dto).forEach(key => {
      entity[key] = dto[key];
    })
    return entity;
  }

  /**
   * Returns a FranchisesDto object with the specified data and baseData.
   *
   * @param {FranchisesActivityDataDto} dto - The DTO containing the month, year, and method.
   * @param {string} groupNumber - The group number.
   * @param {BaseDataDto} baseData - The base data.
   * @param {T} data - The data to be included in the FranchisesDto.
   * @return {FranchisesDto<T>} The FranchisesDto object with the specified data and baseData.
   */
  getCalReq<T>(dto: FranchisesActivityDataDto, groupNumber: string, baseData: BaseDataDto, data: T): FranchisesDto<T> {
    const calculationData: FranchisesDto<T> = {
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
   * @param {FranchisesEmissionSourceDataMethod} method - The method used to calculate the entity.
   * @param {FranchisesActivityDataDto} reqDto - The DTO containing data for the request.
   * @param {string} groupNumber - The number of the group.
   * @param {T} data - The data to be saved.
   * @param {BaseDataDto} basicData - The DTO containing basic data.
   * @return {Promise<any>} A promise containing the result of the method used to save the entity.
   */
  async saveCalculatedEntity<T extends { id: number, typeName: string }>(method: FranchisesEmissionSourceDataMethod, reqDto: FranchisesActivityDataDto, groupNumber: string, data: T, basicData: BaseDataDto) {
    data.typeName = '';
    let franchisesActivityData = this.copyDtotoEntity(reqDto, groupNumber);
    franchisesActivityData = this.getMappedEntity(franchisesActivityData, data);
    franchisesActivityData.method = method;
    const calculationDataReq: FranchisesDto<T> = this.getCalReq<T>(reqDto, groupNumber, basicData, data);
    if (data.id) {
      franchisesActivityData.id = franchisesActivityData.id;
      return await this.updateFranchises<T>(calculationDataReq, franchisesActivityData);
    } else {
      return await this.createFranchises<T>(calculationDataReq, franchisesActivityData);
    }
  }

  /**
 * Creates all franchises based on the provided data.
 *
 * @param {FranchisesActivityDataDto} createFranchisesDto - The data required to create franchises.
 * @return {Promise<boolean>} - Returns true if franchises were successfully created.
 */
  async createAllFranchises(createFranchisesDto: FranchisesActivityDataDto): Promise<boolean> {
    const groupNumber = createFranchisesDto.groupNo || crypto.randomUUID();
    const basicData = await this.getBaseDataFranchises(createFranchisesDto);

    const emissionSourceData = [
      { method: FranchisesEmissionSourceDataMethod.SPECIFIC_METHOD, data: createFranchisesDto.specific_method_data },
      { method: FranchisesEmissionSourceDataMethod.NOT_SUB_METERED, data: createFranchisesDto.not_sub_metered_data },
      { method: FranchisesEmissionSourceDataMethod.SAMPLE_GROUPS, data: createFranchisesDto.sample_groups_data },
      { method: FranchisesEmissionSourceDataMethod.AVERAGE_DATA_METHOD_FLOOR_SPACE, data: createFranchisesDto.average_data_method_floor_space_data },
      { method: FranchisesEmissionSourceDataMethod.AVERAGE_DATA_METHOD_NOT_FLOOR_SPACE, data: createFranchisesDto.average_data_method_not_floor_space_data },
    ];

    for (const { method, data } of emissionSourceData) {
      if (data?.data) {
        for (const datum of data.data) {
          this.saveCalculatedEntity(method, createFranchisesDto, groupNumber, datum, basicData);
        }
      }
    }
    return true;
  }

  async createFranchises<T>(calculationData: FranchisesDto<T>, franchisesActivityData: FranchisesActivityData,) {
    franchisesActivityData.groupNo = calculationData.groupNumber;
    franchisesActivityData.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false;
    franchisesActivityData.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false;
    franchisesActivityData.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false;

    const emission = await this.calculationService.calculate({ sourceName: sourceName.Franchises, data: calculationData });
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
  async updateFranchises<T>(calculationData: FranchisesDto<T>, updateFranchisesDto: FranchisesActivityData) {
    updateFranchisesDto.groupNo = calculationData.groupNumber;
    updateFranchisesDto.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false;
    updateFranchisesDto.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false;
    updateFranchisesDto.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false;

    const emission = await this.calculationService.calculate({ sourceName: sourceName.Franchises, data: calculationData });

    if (updateFranchisesDto.e_sc !== emission.e_sc) {
      let current = await this.repo.findOne(updateFranchisesDto.id);
      let updatedEmission = this.calculationService.getDiff(current, emission);
      this.calculationService.updateTotalEmission(
        updatedEmission,
        updateFranchisesDto.project,
        calculationData.baseData.clasification,
        sourceName.Franchises,
        updateFranchisesDto.unit.id,
      );
    }
    updateFranchisesDto.emission = emission && emission.e_sc ? emission.e_sc : 0;
    updateFranchisesDto.e_sc = emission && emission.e_sc ? emission.e_sc : 0;
    updateFranchisesDto.e_sc_co2 = emission && emission.e_sc_co2 ? emission.e_sc_co2 : 0;
    updateFranchisesDto.e_sc_ch4 = emission && emission.e_sc_ch4 ? emission.e_sc_ch4 : 0;
    updateFranchisesDto.e_sc_n2o = emission && emission.e_sc_n2o ? emission.e_sc_n2o : 0;

    const updated = await this.repo.update({ id: updateFranchisesDto.id, }, updateFranchisesDto);
    if (updated.affected === 1) {
      return await this.repo.findOne(updateFranchisesDto.id);
    } else {
      // TODO: odify the updated total emission
      throw new InternalServerErrorException('Updating is failed');
    }
  }

  async create(
    createFranchisesDto: FranchisesActivityData,
  ) { }

  async update(
    id: number,
    updateFranchisesDto: FranchisesActivityData,
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
      sourceName.Franchises,
      deleteDto.unit.id,
    );
    return await this.repo.delete({ id: deleteDto.id });
  }
  async getBaseDataFranchises(
    dto: FranchisesActivityDataDto,
  ): Promise<BaseDataDto> {
    let activityInfo = new PuesDataReqActivityData();
    activityInfo.owenerShip = Ownership.getkey(dto.ownership);
    activityInfo.stationary = dto.stationary;
    activityInfo.mobile = dto.mobile;
    let req = new PuesDataReqDto();
    req.project = dto.project;
    req.sourceName = sourceName.Franchises;
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
    dto: FranchisesActivityData,
  ): Promise<BaseDataDto> {
    let activityInfo = new PuesDataReqActivityData();
    activityInfo.owenerShip = Ownership.getkey(dto.ownership);
    activityInfo.stationary = dto.stationary;
    activityInfo.mobile = dto.mobile;
    let req = new PuesDataReqDto();
    req.project = dto.project;
    req.sourceName = sourceName.Franchises;
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

  async updateTotalEmission(dto: FranchisesActivityData, calData: FranchisesDto<any>,emission: any) {
    let reqPues: PuesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Franchises,
      unitId: dto.unit.id,
      emission: emission,
      classification: calData.baseData.clasification,
    };
    await this.puesService.addEmission(reqPues);

    let reqPes: PesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Franchises,
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

  async getAllFranchisesData(option: any, projectId: number, unitId: number): Promise<any> {
    console.log("getAllFranchisesDatagetAllFranchisesData")
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

  getEntityToDto<T extends { id: number }>(data: T, entity: FranchisesActivityData) {
    data.id = entity.id;
    Object.getOwnPropertyNames(data).forEach(key => {
      console.log(key);
      data[key] = entity[key];
    })
    return data;
  }

  async getOneFranchisesDataSet(groupNumber: string): Promise<any> {
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
    const dto = new FranchisesActivityDataDto();
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

    dto.specific_method_data = new SpecificMethodData();
    dto.not_sub_metered_data = new NotSubMeteredData();
    dto.sample_groups_data = new SampleGroupsData();
    dto.average_data_method_floor_space_data = new AverageDataMethodFloorSpaceData();
    dto.average_data_method_not_floor_space_data = new AverageDataMethodNotFloorSpaceData();

    for (let res of results) {
      if (res.method == FranchisesEmissionSourceDataMethod.SPECIFIC_METHOD) {
        let data = SpecificMethodParameters.getResObject();
        data = this.getEntityToDto<SpecificMethodParameters>(data, res);
        dto.specific_method_data.data.push(data)
      } else if (res.method == FranchisesEmissionSourceDataMethod.NOT_SUB_METERED) {
        let data = NotSubMeteredParameters.getResObject();
        data = this.getEntityToDto<NotSubMeteredParameters>(data, res);
        dto.not_sub_metered_data.data.push(data)
      } else if (res.method == FranchisesEmissionSourceDataMethod.SAMPLE_GROUPS) {
        let data = SampleGroupParameters.getResObject();
        data = this.getEntityToDto<SampleGroupParameters>(data, res);
        dto.sample_groups_data.data.push(data)
      } else if (res.method == FranchisesEmissionSourceDataMethod.AVERAGE_DATA_METHOD_FLOOR_SPACE) {
        let data = AverageDataMethodFloorSpaceDataParameters.getResObject();
        data = this.getEntityToDto<AverageDataMethodFloorSpaceDataParameters>(data, res);
        dto.average_data_method_floor_space_data.data.push(data)
      } else if (res.method == FranchisesEmissionSourceDataMethod.AVERAGE_DATA_METHOD_NOT_FLOOR_SPACE) {
        let data = AverageDataMethodNotFloorSpaceDataParameters.getResObject();
        data = this.getEntityToDto<AverageDataMethodNotFloorSpaceDataParameters>(data, res);
        dto.average_data_method_not_floor_space_data.data.push(data)
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
    deleteDto: FranchisesActivityData,
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
      sourceName.Franchises,
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
      sourceName.Franchises,
      deleteDto.unit.id,
    );
    return await this.repo.delete({ id: deleteDto.id });
  }
}
