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
import { EndOfLifeTreatmentOfSoldProductsActivityDataDto, wasteBasedData } from '../dto/eoltSoldProducts.dto';
import { EndOfLifeTreatmentOfSoldProductsActivityData } from '../entities/eoltSoldProducts.entity';
import { eoltSoldProductsDto } from 'src/emission/calculation/dto/eolt-sold-products.dto';

@Injectable()
export class eoltSoldProductsService extends TypeOrmCrudService<EndOfLifeTreatmentOfSoldProductsActivityData> implements ExcellUploadable, ProgressRetriever, ExcelDownloader {

  getDto() {
    return new EndOfLifeTreatmentOfSoldProductsActivityData();
  }

  private excelBulkVariableMapping: { code: string, name: string, isRequired: boolean, type: VariableValidationType }[] = [
    { code: "month", name: 'Month', isRequired: true, type: VariableValidationType.list },
    { code: "fc", name: 'Consumption', isRequired: true, type: VariableValidationType.number },
    { code: "fuelType", name: 'Fuel Types', isRequired: true, type: VariableValidationType.list },
    { code: "fc_unit", name: 'Fuel Consumption Unit', isRequired: true, type: VariableValidationType.list },
  ]

  constructor(
    @InjectRepository(EndOfLifeTreatmentOfSoldProductsActivityData) repo,
    @InjectRepository(EndOfLifeTreatmentOfSoldProductsActivityData)
    private readonly End_of_Life_Treatment_of_Sold_ProductsRepository: Repository<EndOfLifeTreatmentOfSoldProductsActivityData>,
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
    return await this.emissionSourceRecalService.bulkCalculate(this, unitIds, projectId, this.repo, sourceName.End_of_Life_Treatment_of_Sold_Products);
  }

  excellBulkUpload(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number, ownership: string, isMobile: boolean) {

    // let dto = new EndOfLifeTreatmentOfSoldProductsActivityData();
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

  async createAll(createeoltSoldProductsDto: EndOfLifeTreatmentOfSoldProductsActivityDataDto) {
    console.log("INNNNN",createeoltSoldProductsDto)

    const crypto = require('crypto');
    const groupNumber = crypto.randomUUID();
    console.log("zzzzzzzzzzz")

    const basicData = await this.getBaseData(createeoltSoldProductsDto)
    console.log("XXXXXXXXXXX----",basicData)


    let methodData: any;
    methodData = createeoltSoldProductsDto.method_data


    if (methodData) {
      for (let methodA_data of methodData) {
        const _edoltSoldProductsActivityData = new EndOfLifeTreatmentOfSoldProductsActivityData();
        _edoltSoldProductsActivityData.project = createeoltSoldProductsDto.project
        _edoltSoldProductsActivityData.user = createeoltSoldProductsDto.user
        _edoltSoldProductsActivityData.unit = createeoltSoldProductsDto.unit

        const calculationData: eoltSoldProductsDto = {
          year: createeoltSoldProductsDto.year,
          month: createeoltSoldProductsDto.month,
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
      // .addGroupBy('acData.activityType')
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


  async createInvestment(calculationData: eoltSoldProductsDto, EndOfLifeTreatmentOfSoldProductsActivityData: EndOfLifeTreatmentOfSoldProductsActivityData) {

    EndOfLifeTreatmentOfSoldProductsActivityData.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    EndOfLifeTreatmentOfSoldProductsActivityData.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    EndOfLifeTreatmentOfSoldProductsActivityData.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false
    EndOfLifeTreatmentOfSoldProductsActivityData.month = calculationData.month;
    EndOfLifeTreatmentOfSoldProductsActivityData.year = calculationData.year;
    EndOfLifeTreatmentOfSoldProductsActivityData.groupNo = calculationData.groupNumber;
    EndOfLifeTreatmentOfSoldProductsActivityData.wasteMethod = calculationData.data['wasteMethod']
    EndOfLifeTreatmentOfSoldProductsActivityData.totalWaste = calculationData.data['totalWaste']
    EndOfLifeTreatmentOfSoldProductsActivityData.soldProducts = calculationData.data['soldProducts']







    const emission = await this.calculationService.calculate({
      sourceName: sourceName.End_of_Life_Treatment_of_Sold_Products,
      data: calculationData,
    });

    console.log("llll", emission)

    if (emission && (emission.e_sc || emission.e_sc_co2 || emission.e_sc_ch4 || emission.e_sc_n2o)) {
      this.updateTotalEmission(EndOfLifeTreatmentOfSoldProductsActivityData, calculationData, emission)
    }

    EndOfLifeTreatmentOfSoldProductsActivityData.emission = emission.e_sc ? emission.e_sc : 0;

    EndOfLifeTreatmentOfSoldProductsActivityData.e_sc = emission.e_sc ? emission.e_sc : 0;
    EndOfLifeTreatmentOfSoldProductsActivityData.e_sc_co2 = emission.e_sc_co2 ? emission.e_sc_co2 : 0;
    EndOfLifeTreatmentOfSoldProductsActivityData.e_sc_ch4 = emission.e_sc_ch4 ? emission.e_sc_ch4 : 0;
    EndOfLifeTreatmentOfSoldProductsActivityData.e_sc_n2o = emission.e_sc_n2o ? emission.e_sc_n2o : 0;

    return await this.End_of_Life_Treatment_of_Sold_ProductsRepository.save(EndOfLifeTreatmentOfSoldProductsActivityData);
  }



  async update(id: number, updateeoltSoldProductsDto: EndOfLifeTreatmentOfSoldProductsActivityDataDto) {

    console.log("UPDATE--", updateeoltSoldProductsDto)


    const basicData = await this.getBaseData(updateeoltSoldProductsDto)

    let methodData: any;
    methodData = updateeoltSoldProductsDto.method_data


    if (methodData) {

      for (const methodA_data of methodData) {

        const _EndOfLifeTreatmentOfSoldProductsActivityData = new EndOfLifeTreatmentOfSoldProductsActivityData();
        _EndOfLifeTreatmentOfSoldProductsActivityData.project = updateeoltSoldProductsDto.project
        _EndOfLifeTreatmentOfSoldProductsActivityData.user = updateeoltSoldProductsDto.user
        _EndOfLifeTreatmentOfSoldProductsActivityData.unit = updateeoltSoldProductsDto.unit
        _EndOfLifeTreatmentOfSoldProductsActivityData.groupNo = updateeoltSoldProductsDto.groupNo


        const calculationData: eoltSoldProductsDto = {
          year: updateeoltSoldProductsDto.year,
          month: updateeoltSoldProductsDto.month,
          emission: 0,
          data: methodA_data,
          groupNumber: updateeoltSoldProductsDto.groupNo,
          baseData: basicData
        };
        await this.updateInvestment(methodA_data.id, _EndOfLifeTreatmentOfSoldProductsActivityData, calculationData)
      }
    }












  }
  async updateInvestment(id: number, EndOfLifeTreatmentOfSoldProductsActivityData: EndOfLifeTreatmentOfSoldProductsActivityData, calculationData: eoltSoldProductsDto) {
    EndOfLifeTreatmentOfSoldProductsActivityData.direct = calculationData.baseData.clasification === Clasification.DIRECT ? true : false
    EndOfLifeTreatmentOfSoldProductsActivityData.indirect = calculationData.baseData.clasification === Clasification.INDIRECT ? true : false
    EndOfLifeTreatmentOfSoldProductsActivityData.other = calculationData.baseData.clasification === Clasification.OTHER ? true : false
    EndOfLifeTreatmentOfSoldProductsActivityData.month = calculationData.month;
    EndOfLifeTreatmentOfSoldProductsActivityData.year = calculationData.year;
    EndOfLifeTreatmentOfSoldProductsActivityData.wasteMethod = calculationData.data['wasteMethod']
    EndOfLifeTreatmentOfSoldProductsActivityData.totalWaste = calculationData.data['totalWaste']
    EndOfLifeTreatmentOfSoldProductsActivityData.soldProducts = calculationData.data['soldProducts']

 
    const emission = await this.calculationService.calculate({
      sourceName: sourceName.End_of_Life_Treatment_of_Sold_Products,
      data: calculationData,
    });

    if (EndOfLifeTreatmentOfSoldProductsActivityData.e_sc !== emission.e_sc) {

      let current = await this.repo.findOne({ where: { id: id }, order: { id: 'ASC' } });
      let updatedEmission = this.calculationService.getDiff(current, emission);

      this.calculationService.updateTotalEmission(
        updatedEmission,
        EndOfLifeTreatmentOfSoldProductsActivityData.project,
        calculationData.baseData.clasification,
        sourceName.End_of_Life_Treatment_of_Sold_Products,
        EndOfLifeTreatmentOfSoldProductsActivityData.unit.id
      );
    }
    EndOfLifeTreatmentOfSoldProductsActivityData.emission = emission.e_sc ? emission.e_sc : 0;

    EndOfLifeTreatmentOfSoldProductsActivityData.e_sc = emission.e_sc ? emission.e_sc : 0;
    EndOfLifeTreatmentOfSoldProductsActivityData.e_sc_co2 = emission.e_sc_co2 ? emission.e_sc_co2 : 0;
    EndOfLifeTreatmentOfSoldProductsActivityData.e_sc_ch4 = emission.e_sc_ch4 ? emission.e_sc_ch4 : 0;
    EndOfLifeTreatmentOfSoldProductsActivityData.e_sc_n2o = emission.e_sc_n2o ? emission.e_sc_n2o : 0;

    if (id == 0) {
      return await this.repo.save(EndOfLifeTreatmentOfSoldProductsActivityData);
    }
    else {
      const updated = await this.repo.update({
        id: id
      }, EndOfLifeTreatmentOfSoldProductsActivityData);

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
      sourceName.End_of_Life_Treatment_of_Sold_Products,
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
        sourceName.End_of_Life_Treatment_of_Sold_Products,
        deleteDto.unit.id
      );
      return await this.repo.delete({ id: deleteDto.id });
    });

  }
  async getBaseData(dto: EndOfLifeTreatmentOfSoldProductsActivityDataDto): Promise<BaseDataDto> {
    console.log("nnnnnnn")
    let activityInfo = new PuesDataReqActivityData()
    activityInfo.owenerShip = Ownership.getkey(dto.ownership)
    activityInfo.stationary = dto.stationary
    activityInfo.mobile = dto.mobile
    let req = new PuesDataReqDto()
    req.project = dto.project
    req.sourceName = sourceName.End_of_Life_Treatment_of_Sold_Products
    req.unitId = dto.unit.id
    req.user = dto.user
    req.activityInfo = activityInfo

    console.log("reqqqqqqqq",req)

    let puesData = await this.puesService.getPuesData(req)
    console.log("nnnnnnn",puesData)

    return {
      clasification: puesData.clasification,
      tier: puesData.tier,
      sourceType: puesData.sourceType,
      industry: puesData.industry.code,
      countryCode: puesData.countryCode,
      projectId: dto.project.id
    }
  }

  async updateTotalEmission(dto: EndOfLifeTreatmentOfSoldProductsActivityData, calData: eoltSoldProductsDto, emission: any) {
    let reqPues: PuesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.End_of_Life_Treatment_of_Sold_Products,
      unitId: dto.unit.id,
      emission: emission,
      classification: calData.baseData.clasification
    }

    await this.puesService.addEmission(reqPues)

    let reqPes: PesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.End_of_Life_Treatment_of_Sold_Products,
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



  async getEntryById(id: string): Promise<EndOfLifeTreatmentOfSoldProductsActivityDataDto> {
    // let res = await this.repo.findOne({

    //   where: {
    //     id: id,
    //   },

    // })

    const groupNo = id;

    const entries = await this.repo.find({
      where: {
        groupNo: groupNo,
      },
    });

    const dto = new EndOfLifeTreatmentOfSoldProductsActivityDataDto();
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
      const methodData = new wasteBasedData();
      methodData.wasteMethod = item.wasteMethod;
      methodData.totalWaste = item.totalWaste;
      methodData.soldProducts = item.soldProducts;
      methodData.id = item.id
      dto.method_data.push(methodData);

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
    deleteDto: EndOfLifeTreatmentOfSoldProductsActivityData,
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
      sourceName.End_of_Life_Treatment_of_Sold_Products,
      deleteDto.unit.id,
    );
    return await this.repo.delete({ id: deleteDto.id });
  }


}

