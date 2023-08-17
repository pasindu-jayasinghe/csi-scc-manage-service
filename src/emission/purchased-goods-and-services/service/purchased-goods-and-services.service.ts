import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AverageData, AverageMethod, CreatePurchasedGoodsAndServiceDto, MaterialData, MaterialTransportData, PurchaseData, SpendBasedMethod, SpendData, SupplierData, SupplierSpecificMethod, WasteData, WasteOtherData, hybridMethod } from '../dto/create-purchased-goods-and-service.dto';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { PurchasedGoodsAndServicesActivityData } from '../entities/purchased-goods-and-services.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Unit } from 'src/unit/entities/unit.entity';
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
import { VariableValidationType } from 'src/emission/enum/variable-validation-type.enum';
import { Clasification } from 'src/project/enum/clasification.enum';
import { BaseDataDto } from 'src/emission/calculation/dto/emission-base-data.dto';
import { PuesDataReqActivityData, PuesDataReqDto } from 'src/project/dto/pues-data-req.dto';
import { Ownership } from 'src/project/enum/ownership.enum';
import { PesSumDataReqDto, ProjectSumDataReqDto, PuesSumDataReqDto } from 'src/project/dto/update-total-emission-req.dto';
import { PurchasedGoodsAndServicesDto } from 'src/emission/calculation/dto/purchased-goods-and-services.dto';
import { PurchasedGoodsAndServicesMethod, TypeNames } from '../enum/purchased-good-and-services-method.enum';

@Injectable()
export class PurchasedGoodsAndServicesService extends TypeOrmCrudService<PurchasedGoodsAndServicesActivityData>{

  //TODO modify list according to the entity
  private excelBulkVariableMapping: {code: string, name: string,isRequired: boolean,type: VariableValidationType}[] = [    
    // {code: "month", name: 'Month',isRequired: true,type:VariableValidationType.list},
    // {code: "meterNo", name: "Meter No",isRequired: true,type:VariableValidationType.textOrNumber},
    // {code: "consumption", name: "Consumption",isRequired: true,type:VariableValidationType.number},
    // {code: "consumption_unit", name: "Consumption Unit",isRequired: true,type:VariableValidationType.list},
    // {code: "category", name: "Category",isRequired: false,type:VariableValidationType.list},
  ]

  constructor(
    @InjectRepository(PurchasedGoodsAndServicesActivityData) repo,
    @InjectRepository(PurchasedGoodsAndServicesActivityData)
    private readonly purchasedGoodsAndServicesRepository: Repository<PurchasedGoodsAndServicesActivityData>,
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
    let emissionSource = sourceName.Purchased_Goods_and_Services
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
          esName: 'Purchase Good And Services',
          completeness: ProgressStatus.COMPLETED,
          parameters: parameters
        })
      } else {
        allMonthFilled = this.progresReportService.checkCompleteness(activityData[key], true, true, {para: ['meterNo']})
        response.push({
          unit: key,
          unitName: activityData[key][0]['unitName'],
          es: emissionSource,
          esName: 'Purchase Good And Services',
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
        esName: 'Purchase Good And Services',
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
        esName: 'Purchase Good And Services',
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
    return await this.emissionSourceRecalService.bulkCalculate(this, unitIds, projectId, this.repo, sourceName.Purchased_Goods_and_Services);
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

  copyDtotoEntity(createDto: CreatePurchasedGoodsAndServiceDto, groupNumber: string) {
    const activityData = new PurchasedGoodsAndServicesActivityData();

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

  async create(createDto: CreatePurchasedGoodsAndServiceDto) {
    const crypto = require('crypto');
    const groupNumber = createDto.groupNo
      ? createDto.groupNo
      : crypto.randomUUID();

    const basicData = await this.getBaseData(createDto);
    if (createDto.method === PurchasedGoodsAndServicesMethod.supplier_specific_method && createDto.supplierSpecificMethod){
      if (createDto.supplierSpecificMethod.supplierData){
        for (let data of createDto.supplierSpecificMethod.supplierData){
          data.typeName = 'Supplier'
          await this.createAllurchaseGoodAndServices(createDto, groupNumber, data, basicData)
        }
      }
    } else if (createDto.method === PurchasedGoodsAndServicesMethod.hybrid_method && createDto.hybridMethod) {
      if (createDto.hybridMethod.purchaseData) {
        for (let data of createDto.hybridMethod.purchaseData) {
          data.typeName = TypeNames.purchase
          await this.createAllurchaseGoodAndServices(createDto, groupNumber, data, basicData)
        }
      }
      if (createDto.hybridMethod.materialData) {
        for (let data of createDto.hybridMethod.materialData) {
          data.typeName = TypeNames.material
          await this.createAllurchaseGoodAndServices(createDto, groupNumber, data, basicData)
        }
      }
      if (createDto.hybridMethod.materialTrasportData) {
        for (let data of createDto.hybridMethod.materialTrasportData) {
          data.typeName = TypeNames.transport
          await this.createAllurchaseGoodAndServices(createDto, groupNumber, data, basicData)
        }
      }
      if (createDto.hybridMethod.wasteData) {
        for (let data of createDto.hybridMethod.wasteData) {
          data.typeName = TypeNames.waste
          await this.createAllurchaseGoodAndServices(createDto, groupNumber, data, basicData)
        }
      }
      if (createDto.hybridMethod.otherData) {
        for (let data of createDto.hybridMethod.otherData) {
          data.typeName = TypeNames.other
          await this.createAllurchaseGoodAndServices(createDto, groupNumber, data, basicData)
        }
      }
    } else if (createDto.method === PurchasedGoodsAndServicesMethod.average_data_method && createDto.averageDataMethod.averageData) {
      for (let data of createDto.averageDataMethod.averageData) {
        data.typeName = 'Average'
        await this.createAllurchaseGoodAndServices(createDto, groupNumber, data, basicData)
      }
    } else if (createDto.method === PurchasedGoodsAndServicesMethod.spend_based_method && createDto.spendBasedMethod.spendData) {
      for (let data of createDto.spendBasedMethod.spendData) {
        data.typeName = 'Spend'
        await this.createAllurchaseGoodAndServices(createDto, groupNumber, data, basicData)
      }
    } else {}
  }

  async createAllurchaseGoodAndServices(createDto: CreatePurchasedGoodsAndServiceDto, groupNumber: string, data: any, basicData: any) {
    let activityData = this.copyDtotoEntity(createDto, groupNumber)
    Object.keys(data).map(key => {
      activityData[key] = data[key]
    })
    let calculationData: PurchasedGoodsAndServicesDto = {
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
      await this.createPurchaseGoodAndServices(calculationData, activityData)
    }
  }


  async createPurchaseGoodAndServices(caldata: PurchasedGoodsAndServicesDto, activityData: PurchasedGoodsAndServicesActivityData) {

    activityData.direct = caldata.baseData.clasification === Clasification.DIRECT ? true : false
    activityData.indirect = caldata.baseData.clasification === Clasification.INDIRECT ? true : false
    activityData.other = caldata.baseData.clasification === Clasification.OTHER ? true : false

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.Purchased_Goods_and_Services,
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
    return this.purchasedGoodsAndServicesRepository.find();
  }


  async update(calData: PurchasedGoodsAndServicesDto, activityData: PurchasedGoodsAndServicesActivityData) {

    activityData.direct = calData.baseData.clasification === Clasification.DIRECT ? true : false
    activityData.indirect = calData.baseData.clasification === Clasification.INDIRECT ? true : false
    activityData.other = calData.baseData.clasification === Clasification.OTHER ? true : false

    const emission = await this.calculationService.calculate({
      sourceName: sourceName.Purchased_Goods_and_Services,
      data: calData,
    });

    if (activityData.e_sc !== emission.e_sc) {
      let current = await this.repo.findOne(activityData.id);
      let updatedEmission = this.calculationService.getDiff(current, emission);
      this.calculationService.updateTotalEmission(
        updatedEmission,
        activityData.project,
        calData.baseData.clasification,
        sourceName.Purchased_Goods_and_Services,
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
      sourceName.Purchased_Goods_and_Services,
      deleteDto.unit.id
    );
    return await this.repo.delete({id: deleteDto.id});
  }

  async getBaseData(dto: CreatePurchasedGoodsAndServiceDto): Promise<BaseDataDto> {
    let activityInfo =  new PuesDataReqActivityData()
    activityInfo.owenerShip = Ownership.getkey(dto.ownership)
    activityInfo.stationary = dto.stationary
    activityInfo.mobile = dto.mobile
    let req = new PuesDataReqDto()
    req.project = dto.project
    req.sourceName = sourceName.Purchased_Goods_and_Services
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

  async updateTotalEmission(dto: PurchasedGoodsAndServicesActivityData, calData: PurchasedGoodsAndServicesDto, emission: any){
    let reqPues: PuesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Purchased_Goods_and_Services,
      unitId: dto.unit.id,
      emission: emission,
      classification: calData.baseData.clasification
    }

    await this.puesService.addEmission(reqPues)

    let reqPes : PesSumDataReqDto = {
      project: dto.project,
      sourceName: sourceName.Purchased_Goods_and_Services,
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

  async getAllPurchaseGoodAndServicesData(option: any, projectId: number, unitId: number): Promise<any> {
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

  getEntityToDto<T extends { id: number }>(data: T, entity: PurchasedGoodsAndServicesActivityData) {
    data.id = entity.id;
    Object.getOwnPropertyNames(data).forEach(key => {
      data[key] = entity[key];
    })
    return data;
  }

  async getOnePurchaseGoodAndServicesDataSet(groupNumber: string, isView: string): Promise<any> {
    console.log(typeof isView, isView)
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

    const results = await data.getMany();
    const dto = new CreatePurchasedGoodsAndServiceDto();
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

    dto.supplierSpecificMethod = new SupplierSpecificMethod()
    dto.hybridMethod = new hybridMethod()
    dto.averageDataMethod = new AverageMethod()
    dto.spendBasedMethod = new SpendBasedMethod()

    for (let res of results) {
      if (res.mode == PurchasedGoodsAndServicesMethod.supplier_specific_method) {
        let data = SupplierData.getResObject();
        data = this.getEntityToDto<SupplierData>(data, res);
        dto.supplierSpecificMethod.supplierData.push(data)
      } else if (res.mode == PurchasedGoodsAndServicesMethod.hybrid_method) {
        if (res.otherEmission) {
          let otherData = WasteOtherData.getResObject();
          otherData = this.getEntityToDto<WasteOtherData>(otherData, res)
          dto.hybridMethod.otherData.push(otherData)
        } else if (res.purchaseType) {
          let purchaseData = PurchaseData.getResObject();
          purchaseData = this.getEntityToDto<PurchaseData>(purchaseData, res);
          dto.hybridMethod.purchaseData.push(purchaseData)
        } else if (res.materialType) {
          let materialData = MaterialData.getResObject();
          materialData = this.getEntityToDto<MaterialData>(materialData, res);
          dto.hybridMethod.materialData.push(materialData)
        } else if (res.materialTransType) {
          let materialTransData = MaterialTransportData.getResObject();
          materialTransData = this.getEntityToDto<MaterialTransportData>(materialTransData, res);
          dto.hybridMethod.materialTrasportData.push(materialTransData)
        } else if (res.wasteType) {
          let wasteData = WasteData.getResObject();
          wasteData = this.getEntityToDto<WasteData>(wasteData, res);
          dto.hybridMethod.wasteData.push(wasteData)
        }
      } else if (res.mode == PurchasedGoodsAndServicesMethod.average_data_method) {
        let data = AverageData.getResObject();
        data = this.getEntityToDto<AverageData>(data, res);
        dto.averageDataMethod.averageData.push(data)
      } else if (res.mode == PurchasedGoodsAndServicesMethod.spend_based_method) {
        let data = SpendData.getResObject();
        data = this.getEntityToDto<SpendData>(data, res);
        dto.spendBasedMethod.spendData.push(data)
      }
    }

    if (isView === 'false'){
      if (dto.supplierSpecificMethod.supplierData.length === 0){
        dto.supplierSpecificMethod.supplierData.push(new SupplierData())
      }
      if (dto.hybridMethod.purchaseData.length === 0){
        dto.hybridMethod.purchaseData.push(new PurchaseData())
      }
      if (dto.hybridMethod.materialData.length === 0){
        dto.hybridMethod.materialData.push(new MaterialData())
      }
      if (dto.hybridMethod.materialTrasportData.length === 0){
        dto.hybridMethod.materialTrasportData.push(new MaterialTransportData())
      }
      if (dto.hybridMethod.wasteData.length === 0){
        dto.hybridMethod.wasteData.push(new WasteData())
      }
      if (dto.hybridMethod.otherData.length === 0){
        dto.hybridMethod.otherData.push(new WasteOtherData())
      }
      if (dto.averageDataMethod.averageData.length === 0){
        dto.averageDataMethod.averageData.push(new AverageData())
      }
      if (dto.spendBasedMethod.spendData.length === 0){
        dto.spendBasedMethod.spendData.push(new SpendData())
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
    deleteDto: PurchasedGoodsAndServicesActivityData,
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
      sourceName.Purchased_Goods_and_Services,
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
      sourceName.Purchased_Goods_and_Services,
      deleteDto.unit.id,
    );
    return await this.repo.delete({ id: deleteDto.id });
  }
}
