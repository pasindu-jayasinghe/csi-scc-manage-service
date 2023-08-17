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
import { CapitalGoodsActivityData } from '../entities/capital-goods.entity';
import { CapitalGoodsActivityDataDto, cgBasedData } from '../dto/capital-goods.dto';
import { capitalGoodsDto } from 'src/emission/calculation/dto/capital-goods.dto';

@Injectable()
export class capitalGoodsService extends TypeOrmCrudService<CapitalGoodsActivityData> implements ExcellUploadable, ProgressRetriever, ExcelDownloader {

  getDto() {
    return new CapitalGoodsActivityData();
  }

  private excelBulkVariableMapping: { code: string, name: string, isRequired: boolean, type: VariableValidationType }[] = [
    { code: "month", name: 'Month', isRequired: true, type: VariableValidationType.list },
    { code: "fc", name: 'Consumption', isRequired: true, type: VariableValidationType.number },
    { code: "fuelType", name: 'Fuel Types', isRequired: true, type: VariableValidationType.list },
    { code: "fc_unit", name: 'Fuel Consumption Unit', isRequired: true, type: VariableValidationType.list },
  ]

  constructor(
    @InjectRepository(CapitalGoodsActivityData) repo,
    @InjectRepository(CapitalGoodsActivityData)
    private readonly Capital_GoodsRepository: Repository<CapitalGoodsActivityData>,
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
    return await this.emissionSourceRecalService.bulkCalculate(this, unitIds, projectId, this.repo, sourceName.Capital_Goods);
  }

  excellBulkUpload(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number, ownership: string, isMobile: boolean) {

    // let dto = new CapitalGoodsActivityData();
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

  async createAll(createCapitalGoodsActivityData: CapitalGoodsActivityDataDto) {
    console.log("JJJ")
    const crypto = require('crypto');
    const groupNumber = crypto.randomUUID();
    const basicData = await this.getBaseData(createCapitalGoodsActivityData)


    let methodData: any;
    methodData = createCapitalGoodsActivityData.method_data


    if (methodData) {
      for (let methodA_data of methodData) {
        const _edoltSoldProductsActivityData = new CapitalGoodsActivityData();
        _edoltSoldProductsActivityData.project = createCapitalGoodsActivityData.project
        _edoltSoldProductsActivityData.user = createCapitalGoodsActivityData.user
        _edoltSoldProductsActivityData.unit = createCapitalGoodsActivityData.unit

        const calculationData: capitalGoodsDto = {
          year: createCapitalGoodsActivityData.year,
          month: createCapitalGoodsActivityData.month,
          emission: 0,
          data: methodA_data,
          groupNumber: groupNumber,
          baseData: basicData

        };
        await this.createInvestment(calculationData, _edoltSoldProductsActivityData)


      }
    }
    else {
      return null
    }
  }


  async getAllEoltSoldProductsData(
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
      .select('project.name as project_name,unit.name as unit_name,acData.year as acData_year,acData.month as acData_month,acData.groupNo as acData_groupNo')
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


  async createInvestment(calculationData: capitalGoodsDto, CapitalGoodsActivityData: CapitalGoodsActivityData) {
    CapitalGoodsActivityData.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    CapitalGoodsActivityData.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    CapitalGoodsActivityData.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false
    CapitalGoodsActivityData.month = calculationData.month;
    CapitalGoodsActivityData.year = calculationData.year;
    CapitalGoodsActivityData.groupNo = calculationData.groupNumber;
    CapitalGoodsActivityData.quantity = calculationData.data['quantity']
    CapitalGoodsActivityData.quantity_unit = calculationData.data['quantity_unit']
    CapitalGoodsActivityData.type_of_cg = calculationData.data['type_of_cg']
    CapitalGoodsActivityData.category = calculationData.data['category']
    CapitalGoodsActivityData.user_input_ef = calculationData.data['user_input_ef']
    CapitalGoodsActivityData.user_input_ef_unit = calculationData.data['user_input_ef_unit']

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.Capital_Goods,
      data: calculationData,
    });


    if (emission && (emission.e_sc || emission.e_sc_co2 || emission.e_sc_ch4 || emission.e_sc_n2o)) {
      this.updateTotalEmission(CapitalGoodsActivityData, calculationData, emission)
    }

    CapitalGoodsActivityData.emission = emission.e_sc ? emission.e_sc : 0;

    CapitalGoodsActivityData.e_sc = emission.e_sc ? emission.e_sc : 0;
    CapitalGoodsActivityData.e_sc_co2 = emission.e_sc_co2 ? emission.e_sc_co2 : 0;
    CapitalGoodsActivityData.e_sc_ch4 = emission.e_sc_ch4 ? emission.e_sc_ch4 : 0;
    CapitalGoodsActivityData.e_sc_n2o = emission.e_sc_n2o ? emission.e_sc_n2o : 0;

    return await this.Capital_GoodsRepository.save(CapitalGoodsActivityData);
  }



  async update(id: number, updatecapitalGoodsDto: CapitalGoodsActivityDataDto) {

    const basicData = await this.getBaseData(updatecapitalGoodsDto)
    let methodData: any;
    methodData = updatecapitalGoodsDto.method_data


    if (methodData) {
      for (const methodA_data of methodData) {
        const _CapitalGoodsActivityData = new CapitalGoodsActivityData();
        _CapitalGoodsActivityData.project = updatecapitalGoodsDto.project
        _CapitalGoodsActivityData.user = updatecapitalGoodsDto.user
        _CapitalGoodsActivityData.unit = updatecapitalGoodsDto.unit
        _CapitalGoodsActivityData.groupNo = updatecapitalGoodsDto.groupNo
        const calculationData: capitalGoodsDto = {
          year: updatecapitalGoodsDto.year,
          month: updatecapitalGoodsDto.month,
          emission: 0,
          data: methodA_data,
          groupNumber: updatecapitalGoodsDto.groupNo,
          baseData: basicData
        };
        await this.updateInvestment(methodA_data.id, _CapitalGoodsActivityData, calculationData)
      }
    }

  }

  async updateInvestment(id: number, CapitalGoodsActivityData: CapitalGoodsActivityData, calculationData: capitalGoodsDto) {
    CapitalGoodsActivityData.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    CapitalGoodsActivityData.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    CapitalGoodsActivityData.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false
    CapitalGoodsActivityData.month = calculationData.month;
    CapitalGoodsActivityData.year = calculationData.year;
    CapitalGoodsActivityData.quantity = calculationData.data['quantity']
    CapitalGoodsActivityData.quantity_unit = calculationData.data['quantity_unit']
    CapitalGoodsActivityData.type_of_cg = calculationData.data['type_of_cg']
    CapitalGoodsActivityData.category = calculationData.data['category']
    CapitalGoodsActivityData.user_input_ef = calculationData.data['user_input_ef']
    CapitalGoodsActivityData.user_input_ef_unit = calculationData.data['user_input_ef_unit']


    const emission = await this.calculationService.calculate({
      sourceName: sourceName.Capital_Goods,
      data: calculationData,
    });

    if (CapitalGoodsActivityData.e_sc !== emission.e_sc) {

      let current = await this.repo.findOne({ where: { id: id }, order: { id: 'ASC' } });
      let updatedEmission = this.calculationService.getDiff(current, emission);

      this.calculationService.updateTotalEmission(
        updatedEmission,
        CapitalGoodsActivityData.project,
        calculationData.baseData.clasification,
        sourceName.Capital_Goods,
        CapitalGoodsActivityData.unit.id
      );
    }
    CapitalGoodsActivityData.emission = emission.e_sc ? emission.e_sc : 0;

    CapitalGoodsActivityData.e_sc = emission.e_sc ? emission.e_sc : 0;
    CapitalGoodsActivityData.e_sc_co2 = emission.e_sc_co2 ? emission.e_sc_co2 : 0;
    CapitalGoodsActivityData.e_sc_ch4 = emission.e_sc_ch4 ? emission.e_sc_ch4 : 0;
    CapitalGoodsActivityData.e_sc_n2o = emission.e_sc_n2o ? emission.e_sc_n2o : 0;

    if (id == 0) {
      return await this.repo.save(CapitalGoodsActivityData);
    }
    else {
      const updated = await this.repo.update({
        id: id
      }, CapitalGoodsActivityData);

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
      sourceName.Capital_Goods,
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
        sourceName.Capital_Goods,
        deleteDto.unit.id
      );
      return await this.repo.delete({ id: deleteDto.id });
    });

  }
  async getBaseData(dto: CapitalGoodsActivityDataDto): Promise<BaseDataDto> {
    let activityInfo = new PuesDataReqActivityData()
    activityInfo.owenerShip = Ownership.getkey(dto.ownership)
    activityInfo.stationary = dto.stationary
    activityInfo.mobile = dto.mobile
    let req = new PuesDataReqDto()
    req.project = dto.project
    req.sourceName = sourceName.Capital_Goods
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

  async updateTotalEmission(dto: CapitalGoodsActivityData, calData: capitalGoodsDto, emission: any) {
    let reqPues: PuesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Capital_Goods,
      unitId: dto.unit.id,
      emission: emission,
      classification: calData.baseData.clasification
    }

    await this.puesService.addEmission(reqPues)

    let reqPes: PesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Capital_Goods,
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



  async getEntryById(id: string): Promise<CapitalGoodsActivityDataDto> {
    const groupNo = id;

    const entries = await this.repo.find({
      where: {
        groupNo: groupNo,
      },
    });

    const dto = new CapitalGoodsActivityDataDto();
    dto.method_data = [];


    entries.forEach((item: any) => {
      dto.month = item.month;
      dto.year = item.year;
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
      const methodData = new cgBasedData();
      methodData.type_of_cg = item.type_of_cg;
      methodData.category = item.category;
      methodData.quantity = item.quantity;
      methodData.quantity_unit = item.quantity_unit;
      methodData.user_input_ef = item.user_input_ef;
      methodData.user_input_ef_unit = item.user_input_ef_unit;

      methodData.id = item.id
      dto.method_data.push(methodData);

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
    deleteDto: CapitalGoodsActivityData,
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
      sourceName.Capital_Goods,
      deleteDto.unit.id,
    );
    return await this.repo.delete({ id: deleteDto.id });
  }


}

