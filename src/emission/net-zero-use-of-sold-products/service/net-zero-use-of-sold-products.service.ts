import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CombustedData, CreateNetZeroUseOfSoldProductDto, DirectCombusted, DirectEnergy, DirectGreenhouse, ElectricityData, FuelData, GreenhouseData, IndirectElectricityData, IndirectEnergy, IndirectFuelData, IndirectGHGData, IndirectRefrigerantdata, IntermediateData, IntermediateProducts, RefrigerantData } from '../dto/create-net-zero-use-of-sold-product.dto';
import { NetZeroUseOfSoldProductActivityData } from '../entities/net-zero-use-of-sold-product.entity';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { VariableValidationType } from 'src/emission/enum/variable-validation-type.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Unit } from 'src/unit/entities/unit.entity';
import { In, Repository } from 'typeorm';
import { CalculationService } from 'src/emission/calculation/calculation.service';
import { ProjectUnitEmissionSourceService } from 'src/project/service/project-unit-emission-source.service';
import { ProjectEmissionSourceService } from 'src/emission/emission-source/service/project-emission-source.service';
import { ProjectService } from 'src/project/service/project.service';
import { ParameterUnit } from 'src/utills/parameter-units';
import { EmissionSourceRecalService } from 'src/emission/emission-source/service/emission-source-recal.service';
import { EmissionSourceBulkService } from 'src/emission/emission-source/service/emission-source-bulk.service';
import { ProgresReportService } from 'src/emission/emission-source/service/progres-report.service';
import { sourceName } from 'src/emission/enum/sourcename.enum';
import { ProgressStatus } from 'src/emission/enum/progress-status.enum';
import { Project } from 'src/project/entities/project.entity';
import { User } from 'src/users/user.entity';
import { UseOfSoldProductsMethod, UseOfSoldProductsTypeNames } from '../enum/use-of-sold-products-method.enum';
import * as crypto from 'crypto';
import { UseOfSoldProductsDto } from 'src/emission/calculation/dto/net-zero-use-of-sold-products.dto';
import { Clasification } from 'src/project/enum/clasification.enum';
import { BaseDataDto } from 'src/emission/calculation/dto/emission-base-data.dto';
import { PuesDataReqActivityData, PuesDataReqDto } from 'src/project/dto/pues-data-req.dto';
import { Ownership } from 'src/project/enum/ownership.enum';
import { PesSumDataReqDto, ProjectSumDataReqDto, PuesSumDataReqDto } from 'src/project/dto/update-total-emission-req.dto';
import { Country } from 'src/country/entities/country.entity';

@Injectable()
export class NetZeroUseOfSoldProductsService extends TypeOrmCrudService<NetZeroUseOfSoldProductActivityData>{
  
  //TODO modify list according to the entity
  private excelBulkVariableMapping: {code: string, name: string,isRequired: boolean,type: VariableValidationType}[] = [    
    // {code: "month", name: 'Month',isRequired: true,type:VariableValidationType.list},
    // {code: "meterNo", name: "Meter No",isRequired: true,type:VariableValidationType.textOrNumber},
    // {code: "consumption", name: "Consumption",isRequired: true,type:VariableValidationType.number},
    // {code: "consumption_unit", name: "Consumption Unit",isRequired: true,type:VariableValidationType.list},
    // {code: "category", name: "Category",isRequired: false,type:VariableValidationType.list},
  ]

  constructor(
    @InjectRepository(NetZeroUseOfSoldProductActivityData) repo,
    @InjectRepository(Unit) private unitRepo: Repository<Unit>,
    private readonly calculationService: CalculationService,
    private puesService: ProjectUnitEmissionSourceService,
    private pesService: ProjectEmissionSourceService,
    private projectService: ProjectService,
    private parameterUnit: ParameterUnit,
    private emissionSourceRecalService: EmissionSourceRecalService,
    private emissionSourceBulkService: EmissionSourceBulkService,
    private progresReportService: ProgresReportService
  ){
    super(repo);
  }

  getVariableMapping() {
    throw new Error('Method not implemented.');
  }

  //TODO: Update according to the entity
  async generateTableData(projectId: number, unitIds: number , paras: any[], ownership?: string) {
    let filter = 'project.id = :projectId AND unit.id IN (:unitIds)'
    let filterValues = {projectId: projectId, unitIds: unitIds}
    let acData = await this.getActivityData(filter, filterValues)

    let row1 = [
      { name: '', code: '' },
      { name: "Consumption", colspan: true }
    ]
    let additionalCols = [{ name: 'Meter no', code: 'meterNo' }]

    let res = this.progresReportService.createTableData(
      acData,
      row1,
      additionalCols,
      'meterNo',
      'consumption'
    )

    return res
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
      .where (filter, filterValues)
      return await data.getMany()
  }
  async getProgressData(projectId: number, unitIds: number[]) {
    let allMonthFilled: any = {}
    let response = []
    let activityData = await this.repo.find({ project: { id: projectId }, unit: { id: In(unitIds) } })
    let emissionSource = sourceName.Use_of_Sold_Products
    let parameters = [{name: 'Meter No', code: 'meterNo'}]

    activityData = activityData.map(ele => {
      ele['unitId'] = ele.unit.id
      ele['unitName'] = ele.unit.name
      return ele
    })

    activityData = this.progresReportService.group(activityData, 'unitId')

    for await (let key of Object.keys(activityData)) {
      let pues = await this.puesService.getByUnitAndProjectAndES(parseInt(key), projectId, emissionSource)
      if (pues && pues.isComplete){
        response.push({
          unit: key,
          unitName: activityData[key][0]['unitName'],
          es: emissionSource,
          esName: 'Use of Sold Products',
          completeness: ProgressStatus.COMPLETED,
          parameters: parameters
        })
      } else {
        allMonthFilled = this.progresReportService.checkCompleteness(activityData[key], true, true, {para: ['meterNo']})
        response.push({
          unit: key,
          unitName: activityData[key][0]['unitName'],
          es: emissionSource,
          esName: 'Use of Sold Products',
          completeness: allMonthFilled.isCompleted,
          unFilled: allMonthFilled.unFilled,
          parameters: parameters
        })
      }
    }

    let assignedUnits = await this.puesService.getAllowedUnitsforProjectAndEs(projectId, emissionSource)

    let assignedUIds = assignedUnits.map(u => u.code)
    let uNoData = assignedUIds.filter(ele => !Object.keys(activityData).includes(ele.toString()))
    let notAssignedIds = unitIds.filter(u => (!assignedUIds.includes(parseInt(u.toString()))))

    for await (const e of uNoData) {
      let unit = await this.unitRepo.findOne({id: e})
      response.push({
        unit: e.toString(),
        unitName: unit.name,
        es: emissionSource,
        esName: 'Use of Sold Products',
        completeness: ProgressStatus.NOT_ENTERED,
        parameters: parameters
      })
    }

    for await (const e of notAssignedIds) {
      let unit = await this.unitRepo.findOne({id: e})
      response.push({
        unit: e.toString(),
        unitName: unit.name,
        es: emissionSource,
        esName: 'Use of Sold Products',
        completeness: ProgressStatus.NOT_ASSIGNED,
        parameters: parameters
      })
    }

    return response
  }

  async bulkDelete(ids: number[], isPermant: boolean) {
    return await this.emissionSourceRecalService.bulkDelete(ids,isPermant, this);
  }

   async bulkCalculate(unitIds: number[], projectId: number) {
    return await this.emissionSourceRecalService.bulkCalculate(this, unitIds, projectId, this.repo, sourceName.Use_of_Sold_Products);
  }

  //TODO: Implement method to compatible with net zero structure
  excellBulkUpload(unit: Unit, project: Project, user: User, data: any, variable_mapping: any[], year: number, ownership: string, isMobile: boolean) {
    // let dto = new PurchasedGoodsAndServicesActivityData();
    // dto = this.emissionSourceBulkService.excellBulkUpload(unit, project,user,data,year,ownership,isMobile,dto,this.excelBulkVariableMapping);
    // try{      
    //   return this.create(dto);
    // }catch(err){
    //   console.log(err);
    //   return null;
    // }
  }

  downlodExcellBulkUploadVariableMapping() {
    return this.excelBulkVariableMapping;
  }

  copyDtotoEntity(createDto: CreateNetZeroUseOfSoldProductDto, groupNumber: string) {
    const activityData = new NetZeroUseOfSoldProductActivityData();

    activityData.project = createDto.project;
    activityData.year = createDto.year;
    activityData.month = createDto.month;
    activityData.unit = createDto.unit;
    activityData.mode = createDto.method;
    activityData.mobile = createDto.mobile;
    activityData.stationary = createDto.stationary;
    activityData.activityDataStatus = createDto.activityDataStatus;
    activityData.ownership = createDto.ownership;
    activityData.groupNo = groupNumber;
    return activityData;
  }

  async create(createDto: CreateNetZeroUseOfSoldProductDto) {
    const groupNumber = createDto.groupNo
      ? createDto.groupNo
      : crypto.randomUUID();

    const basicData = await this.getBaseData(createDto);
    if (createDto.method === UseOfSoldProductsMethod.DIRECT_ENERGY && createDto.directEnergy){
      if (createDto.directEnergy.fuelData){
        for (let data of createDto.directEnergy.fuelData){
          data.typeName = UseOfSoldProductsTypeNames.direct_fuel
          await this.createAllSoldProducts(createDto, groupNumber, data, basicData)
        }
      }
      if (createDto.directEnergy.electricityData){
        for (let data of createDto.directEnergy.electricityData){
          data.typeName = UseOfSoldProductsTypeNames.direct_electricity
          await this.createAllSoldProducts(createDto, groupNumber, data, basicData)
        }
      }
      if (createDto.directEnergy.refrigerantData){
        for (let data of createDto.directEnergy.refrigerantData){
          data.typeName = UseOfSoldProductsTypeNames.direct_refrigerant
          await this.createAllSoldProducts(createDto, groupNumber, data, basicData)
        }
      }
    } else if (createDto.method === UseOfSoldProductsMethod.DIRECT_COMBUSTED && createDto.directCombusted) {
      if (createDto.directCombusted.combustedData) {
        for (let data of createDto.directCombusted.combustedData) {
          data.typeName = UseOfSoldProductsTypeNames.direct_combusted
          await this.createAllSoldProducts(createDto, groupNumber, data, basicData)
        }
      }
    } else if (createDto.method === UseOfSoldProductsMethod.DIRECT_GREENHOUSE && createDto.directGreenhouse.greenhouseData) {
      for (let data of createDto.directGreenhouse.greenhouseData) {
        data.typeName = UseOfSoldProductsTypeNames.direct_greenhouse
        await this.createAllSoldProducts(createDto, groupNumber, data, basicData)
      }
    } else if (createDto.method === UseOfSoldProductsMethod.INDIRECT_ENERGY && createDto.indirectEnergy.fuelData) {
      for (let data of createDto.indirectEnergy.fuelData) {
        data.typeName = UseOfSoldProductsTypeNames.indirect_fuel
        await this.createAllSoldProducts(createDto, groupNumber, data, basicData)
      }
      for (let data of createDto.indirectEnergy.electricityData) {
        data.typeName = UseOfSoldProductsTypeNames.indirect_electricity
        await this.createAllSoldProducts(createDto, groupNumber, data, basicData)
      }
      for (let data of createDto.indirectEnergy.refrigerantData) {
        data.typeName = UseOfSoldProductsTypeNames.indirect_refrigerant
        await this.createAllSoldProducts(createDto, groupNumber, data, basicData)
      }
      for (let data of createDto.indirectEnergy.ghgData) {
        data.typeName = UseOfSoldProductsTypeNames.indirect_ghg
        await this.createAllSoldProducts(createDto, groupNumber, data, basicData)
      }
    } else if (createDto.method === UseOfSoldProductsMethod.INTERMEDIATE_PRODUCTS && createDto.intermediateProducts.intermediateData){
      for (let data of createDto.intermediateProducts.intermediateData) {
        data.typeName = UseOfSoldProductsTypeNames.intermediate
        await this.createAllSoldProducts(createDto, groupNumber, data, basicData)
      }
    } else {}
  }

  async createAllSoldProducts(createDto: CreateNetZeroUseOfSoldProductDto, groupNumber: string, data: any, basicData: any) {
    let activityData = this.copyDtotoEntity(createDto, groupNumber)
    Object.keys(data).map(key => {
      activityData[key] = data[key]
    })
    let calculationData: UseOfSoldProductsDto = {
      year: createDto.year,
      mode: createDto.method,
      data: data,
      month: createDto.month,
      baseData: basicData
    }
    if (data.id) {
      activityData.id = data.id
      await this.update(calculationData, activityData);
    } else {
      await this.createUseOfSoldProducts(calculationData, activityData)
    }
  }


  async createUseOfSoldProducts(caldata: UseOfSoldProductsDto, activityData: NetZeroUseOfSoldProductActivityData) {

    activityData.direct = caldata.baseData.clasification === Clasification.DIRECT ? true : false
    activityData.indirect = caldata.baseData.clasification === Clasification.INDIRECT ? true : false
    activityData.other = caldata.baseData.clasification === Clasification.OTHER ? true : false

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.Use_of_Sold_Products,
      data: caldata,
    });

    this.updateTotalEmission(activityData, caldata, emission)

    activityData.e_sc = emission.e_sc ? emission.e_sc : 0;
    activityData.e_sc_co2 = emission.e_sc_co2 ? emission.e_sc_co2 : 0;
    activityData.e_sc_ch4 = emission.e_sc_ch4 ? emission.e_sc_ch4 : 0;
    activityData.e_sc_n2o = emission.e_sc_n2o ? emission.e_sc_n2o : 0;

    return await this.repo.save(activityData)
  }

  findAll() {
    return this.repo.find();
  }


  async update(calData: UseOfSoldProductsDto, activityData: NetZeroUseOfSoldProductActivityData) {

    activityData.direct = calData.baseData.clasification === Clasification.DIRECT ? true : false
    activityData.indirect = calData.baseData.clasification === Clasification.INDIRECT ? true : false
    activityData.other = calData.baseData.clasification === Clasification.OTHER ? true : false

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.Use_of_Sold_Products,
      data: calData,
    });

    if (activityData.e_sc !== emission.e_sc) {
      let current = await this.repo.findOne(activityData.id);
      let updatedEmission = this.calculationService.getDiff(current, emission);
      this.calculationService.updateTotalEmission(
        updatedEmission,
        activityData.project,
        calData.baseData.clasification,
        sourceName.Use_of_Sold_Products,
        activityData.unit.id
      );
    }

    activityData.e_sc = emission.e_sc ? emission.e_sc : 0;
    activityData.e_sc_co2 = emission.e_sc_co2 ? emission.e_sc_co2 : 0;
    activityData.e_sc_ch4 = emission.e_sc_ch4 ? emission.e_sc_ch4 : 0;
    activityData.e_sc_n2o = emission.e_sc_n2o ? emission.e_sc_n2o : 0;

    const updated = await this.repo.update({
      id: activityData.id
    }, activityData);
    if (updated.affected === 1) {
      return await this.repo.findOne(activityData.id)
    } else {
      throw new InternalServerErrorException("Updating is failed");
    }
  }

  async remove(req) {
    let o = req.parsed.paramsFilter.find(o => o.field === 'id')
    let deleteDto = await this.repo.findOne({id: o.value})
    let updatedEmission = this.calculationService.getDiff(deleteDto, null)
    this.calculationService.updateTotalEmission(
      updatedEmission,
      deleteDto.project,
      (deleteDto.direct ? Clasification.DIRECT : ((deleteDto.indirect ? Clasification.INDIRECT : Clasification.OTHER))), 
      sourceName.Use_of_Sold_Products,
      deleteDto.unit.id
    );
    return await this.repo.delete({id: deleteDto.id});
  }

  async getBaseData(dto: CreateNetZeroUseOfSoldProductDto): Promise<BaseDataDto> {
    let activityInfo =  new PuesDataReqActivityData()
    activityInfo.owenerShip = Ownership.getkey(dto.ownership)
    activityInfo.stationary = dto.stationary
    activityInfo.mobile = dto.mobile
    let req = new PuesDataReqDto()
    req.project = dto.project
    req.sourceName = sourceName.Use_of_Sold_Products
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

  async updateTotalEmission(dto: NetZeroUseOfSoldProductActivityData, calData: UseOfSoldProductsDto, emission: any){
    let reqPues: PuesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Use_of_Sold_Products,
      unitId: dto.unit.id,
      emission: emission,
      classification: calData.baseData.clasification
    }

    await this.puesService.addEmission(reqPues)

    let reqPes : PesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Use_of_Sold_Products,
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

  async getAllUseOfSoldProductsData(option: any, projectId: number, unitId: number): Promise<any> {
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
      .addGroupBy('acData.mode')
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
      .select('project.name as project_name, acData.mode as acData_method,unit.name as unit_name,acData.year as acData_year,acData.month as acData_month,acData.groupNo as acData_groupNo')
      .addSelect('SUM(acData.e_sc)', 'sum')
      .addSelect('MIN(acData.id)', 'id')
      .offset(
        (option.page > 1 ? option.page - 1 : 0) *
        (option.limit != 0 ? option.limit : 0),
      )
      .limit(option.limit != 0 ? option.limit : 100000)
      // .orderBy('acData.createdOn', 'DESC')
      .orderBy('id', 'DESC')

    return {
      data: await data2.getRawMany(),
      total: (await data.getRawMany()).length,
    };
  }

  getEntityToDto<T extends { id: number }>(data: T, entity: NetZeroUseOfSoldProductActivityData) {
    data.id = entity.id;
    Object.getOwnPropertyNames(data).forEach(key => {
      data[key] = entity[key];
    })
    return data;
  }

  async getOneUseOfSoldProductsDataSet(groupNumber: string, isView: string): Promise<any> {
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

    const results = await data.getMany();
    const dto = new CreateNetZeroUseOfSoldProductDto();
    dto.project = results[0].project;
    dto.year = results[0].year;
    dto.month = results[0].month;
    dto.unit = results[0].unit;
    dto.method = results[0].mode;
    dto.mobile = results[0].mobile;
    dto.stationary = results[0].stationary;
    dto.groupNo = results[0].groupNo;
    dto.activityDataStatus = results[0].activityDataStatus;
    dto.ownership = results[0].ownership;
    groupNumber = results[0].groupNo;

    dto.directEnergy = new DirectEnergy()
    dto.directCombusted = new DirectCombusted()
    dto.directGreenhouse = new DirectGreenhouse()
    dto.indirectEnergy = new IndirectEnergy()
    dto.intermediateProducts = new IntermediateProducts()

    for (let res of results) {
      if (res.mode == UseOfSoldProductsMethod.DIRECT_ENERGY) {
        if (res.typeName === UseOfSoldProductsTypeNames.direct_fuel){
          let data = FuelData.getResObject();
          data = this.getEntityToDto<FuelData>(data, res);
          dto.directEnergy.fuelData.push(data)
        } else if (res.typeName === UseOfSoldProductsTypeNames.direct_electricity){
          let data = ElectricityData.getResObject();
          data = this.getEntityToDto<ElectricityData>(data, res);
          dto.directEnergy.electricityData.push(data)
        } else if (res.typeName === UseOfSoldProductsTypeNames.direct_refrigerant){
          let data = RefrigerantData.getResObject();
          data = this.getEntityToDto<RefrigerantData>(data, res);
          dto.directEnergy.refrigerantData.push(data)
        }
      } else if (res.mode == UseOfSoldProductsMethod.DIRECT_COMBUSTED) {
        let data = CombustedData.getResObject();
        data = this.getEntityToDto<CombustedData>(data, res)
        dto.directCombusted.combustedData.push(data)
      } else if (res.mode == UseOfSoldProductsMethod.DIRECT_GREENHOUSE) {
        let data = GreenhouseData.getResObject();
        data = this.getEntityToDto<GreenhouseData>(data, res);
        dto.directGreenhouse.greenhouseData.push(data)
      } else if (res.mode == UseOfSoldProductsMethod.INDIRECT_ENERGY) {
        if (res.typeName === UseOfSoldProductsTypeNames.indirect_fuel){
          let data = IndirectFuelData.getResObject();
          data = this.getEntityToDto<IndirectFuelData>(data, res);
          dto.indirectEnergy.fuelData.push(data)
        } else if (res.typeName === UseOfSoldProductsTypeNames.indirect_electricity){
          let data = IndirectElectricityData.getResObject();
          data = this.getEntityToDto<IndirectElectricityData>(data, res);
          dto.indirectEnergy.electricityData.push(data)
        } else if (res.typeName === UseOfSoldProductsTypeNames.indirect_refrigerant){
          let data = IndirectRefrigerantdata.getResObject();
          data = this.getEntityToDto<IndirectRefrigerantdata>(data, res);
          dto.indirectEnergy.refrigerantData.push(data)
        } else if (res.typeName === UseOfSoldProductsTypeNames.indirect_ghg){
          let data = IndirectGHGData.getResObject();
          data = this.getEntityToDto<IndirectGHGData>(data, res);
          dto.indirectEnergy.ghgData.push(data)
        }
      } else if (res.mode == UseOfSoldProductsMethod.INTERMEDIATE_PRODUCTS) {
        let data = IntermediateData.getResObject();
        data = this.getEntityToDto<IntermediateData>(data, res)
        dto.intermediateProducts.intermediateData.push(data)
      }
    }

    if (isView !== 'true'){
      if (dto.directEnergy.fuelData.length === 0){
        dto.directEnergy.fuelData.push(new FuelData())
      }
      if (dto.directEnergy.electricityData.length === 0){
        dto.directEnergy.electricityData.push(new ElectricityData())
      }
      if (dto.directEnergy.refrigerantData.length === 0){
        dto.directEnergy.refrigerantData.push(new RefrigerantData())
      }
      if (dto.directCombusted.combustedData.length === 0){
        dto.directCombusted.combustedData.push(new CombustedData())
      }
      if (dto.directGreenhouse.greenhouseData.length === 0){
        dto.directGreenhouse.greenhouseData.push(new GreenhouseData())
      }
      if (dto.indirectEnergy.fuelData.length === 0){
        dto.indirectEnergy.fuelData.push(new IndirectFuelData())
      }
      if (dto.indirectEnergy.electricityData.length === 0){
        dto.indirectEnergy.electricityData.push(new IndirectElectricityData())
      }
      if (dto.indirectEnergy.refrigerantData.length === 0){
        dto.indirectEnergy.refrigerantData.push(new IndirectRefrigerantdata())
      }
      if (dto.indirectEnergy.ghgData.length === 0){
        dto.indirectEnergy.ghgData.push(new IndirectGHGData())
      }
      if (dto.intermediateProducts.intermediateData.length === 0){
        dto.intermediateProducts.intermediateData.push(new IntermediateData())
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
    deleteDto: NetZeroUseOfSoldProductActivityData,
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
      sourceName.Use_of_Sold_Products,
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
      sourceName.Use_of_Sold_Products,
      deleteDto.unit.id,
    );
    return await this.repo.delete({ id: deleteDto.id });
  }
}
