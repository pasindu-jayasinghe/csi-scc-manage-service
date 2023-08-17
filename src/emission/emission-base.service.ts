import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Project } from "src/project/entities/project.entity";
import { Unit } from "src/unit/entities/unit.entity";
import { User } from "src/users/user.entity";

import { sourceName } from './enum/sourcename.enum';
import { ExcellUploadable } from './excell-uploadable';
import * as XLSX from 'xlsx';
import { ProjectService } from 'src/project/service/project.service';
import { UnitService } from 'src/unit/unit.service';
import { UsersService } from 'src/users/users.service';
import { EmissionSourceService } from './emission-source/service/emission-source.service';
import { ElectricityService } from './electricity/service/electricity.service';
import { GeneratorService } from "./generator/service/generator.service";
import { CookingGasService } from "./cooking-gas/service/cooking-gas.service";
import { WeldingEsService } from "./welding-es/service/welding-es.service";
import { FreightAirService } from "./transport/freight-transport/freight-air/service/freight-air.service";
import { FreightRoadService } from "./transport/freight-transport/freight-road/service/freight-road.service";
import { FreightRailActivityData } from "./transport/freight-transport/freight-rail/entities/freight-rail.entity";
import { FreightRailService } from "./transport/freight-transport/freight-rail/service/freight-rail.service";
import { FireExtinguisherService } from "./fire-extinguisher/service/fire-extinguisher.service";
import { WasteWaterTreatmentService } from "./waste-water-treatment/service/waste-water-treatment.service";
import { PassengerOffroadService } from "./transport/passenger/passenger-offroad/service/passenger-offroad.service";
import { map, retry } from "rxjs";
import { PassengerAirService } from "./transport/passenger/passenger-air/service/passenger-air.service";
import { PassengerRailService } from "./transport/passenger/passenger-rail/service/passenger-rail.service";
import { PassengerRoadService } from "./transport/passenger/passenger-road/service/passenger-road.service";
import { OffroadMachineryOffroadService } from "./transport/offroad-machinery/offroad-machinery-offroad/service/offroad-machinery-offroad.service";
import { FreightOffroadService } from "./transport/freight-transport/freight-offroad/service/freight-offroad.service";
import { RefrigerantService } from "./refrigerant/service/refrigerant.service";
import { BoilerService } from "./boiler/service/boiler.service";
import { MunicipalWaterService } from "./municipal-water/service/municipal-water.service";
import { FreightWaterService } from "./transport/freight-transport/freight-water/service/freight-water.service";
import { WasteDisposalService } from "./waste-disposal/service/waste-disposal.service";
import { getConnection, Not, QueryRunner } from "typeorm";
import { ProjectUnitEmissionSourceService } from "src/project/service/project-unit-emission-source.service";
import { ProjectUnitService } from "src/project/service/project-unit.service";
import { RecordStatus } from "src/shared/entities/base.tracking.entity";
import { ProjectEmissionSourceService } from "./emission-source/service/project-emission-source.service";
import { EmissionSource } from "./emission-source/entities/emission-source.entity";
import { PassengerWaterService } from "./transport/passenger/passenger-water/service/passenger-water.service";
import { BulckUpdatable } from "./bulck-updatable";
import { BusinessTravelService } from "./transport/passenger/business-travel/service/business-travel.service";
import { BulckDeletDto } from "./dto/bulck-delete.dto";
import { EmissionSourceBulkService } from "./emission-source/service/emission-source-bulk.service";
import { ValidationSheetMapDto } from "./dto/validation.sheet.map.dto";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { ProgressRetriever } from "./progress-retriever";
import { TNDLossService } from "./t-n-d-loss/service/t-n-d-loss.service";
import { Parameter } from "src/parameter/entities/parameter.entity";
import { ParameterUnit } from "src/utills/parameter-units";
import { Ownership } from "src/project/enum/ownership.enum";
import { ExcelDownloader } from "./excel-downloader";
import { NetZeroBusinessTravelService } from "./net-zero-business-travel/service/net-zero-business-travel.service";
import { InvestmentsService } from "./investments/service/investments.service";
import { FuelEnergyRelatedActivitiesActivityDataController } from "./fuel_energy_related_activities/controller/fuel_energy_related_activities.controller";

import { NetZeroEmployeeCommutingService } from "./net-zero-employee-commuting/service/net-zero-employee-commuting.service";
import { FuelEnergyRelatedActivitiesService } from "./fuel_energy_related_activities/service/fuel_energy_related_activities.service";
import { eoltSoldProductsService } from "./EOLT-SoldProducts/service/eoltSoldProducts.service";
import { UpstreamLeasedAssetsService } from "./upstream-leased-assets/service/upstream-leased-assets.service";
import { ProcessingOfSoldProductsService } from "./processing-of-sold-product/service/processing-of-sold-product.service";
import { WasteGeneratedInOperationsService } from "./waste-generated-in-operations/service/waste-generated-in-operations.service";
import { FranchisesService } from "./net-zero-franchises/service/franchises.service";
import { PurchasedGoodsAndServicesService } from "./purchased-goods-and-services/service/purchased-goods-and-services.service";
import { DownstreamTransportationService } from "./net-zero-downstream-transportation/service/downstream-transportation.service";
import { DownstreamLeasedAssetsService } from "./downstream-leased-assets/service/downstream-leased-assets.service";
import { UpstreamTransportationService } from "./net-zero-upstream-transportation/service/upstream-transportation.service";
import { NetZeroUseOfSoldProductsService } from "./net-zero-use-of-sold-products/service/net-zero-use-of-sold-products.service";
import { capitalGoodsService } from "./capital-goods/service/capital-goods.service";

@Injectable()
export class EmissionBaseService {



  constructor(
    private projectService: ProjectService,
    private unitService: UnitService,
    private userService: UsersService,
    private emissionSourceService: EmissionSourceService,

    private tNDLossService: TNDLossService,
    private electricityService: ElectricityService,
    private generatorService: GeneratorService,
    private cookingGasService: CookingGasService,
    private weldingGasService: WeldingEsService,
    private freightAirService: FreightAirService,
    private freightRoadService: FreightRoadService,
    private freightRailService: FreightRailService,
    private fireExtinguisherService: FireExtinguisherService,
    private wasteWaterTreatmentService: WasteWaterTreatmentService,
    private passengerRailService: PassengerRailService,
    private passengerOffroadService: PassengerOffroadService,
    private passengerRoadService: PassengerRoadService,
    private offroadMachineryOffroadService: OffroadMachineryOffroadService,
    private passengerAirService: PassengerAirService,
    private freightOffroadService: FreightOffroadService,
    private refrigerantService: RefrigerantService,
    private boilerService: BoilerService,
    private municipalWaterService: MunicipalWaterService,
    private freightWaterService: FreightWaterService,
    private wasteDisposalService: WasteDisposalService,
    private projectUnitEmissionSourceService: ProjectUnitEmissionSourceService,
    private projectUnitService: ProjectUnitService,
    private projectEmissionSourceService: ProjectEmissionSourceService,
    private passengerWaterService: PassengerWaterService,
    private businessTravelService: BusinessTravelService,
    private emissionSourceBulkService: EmissionSourceBulkService,
    private parameterUnit: ParameterUnit,
    private netZeroBusinessTravelService: NetZeroBusinessTravelService,
    private investmentsService: InvestmentsService,
    private fuelEnergyRelatedService: FuelEnergyRelatedActivitiesService,
    private netZeroEmpcomService: NetZeroEmployeeCommutingService,
    private fuel_energy_related_activitiesService: FuelEnergyRelatedActivitiesService,
    private end_of_life_treatment_of_sold_productsService: eoltSoldProductsService,
    private upstreamLeasedAssetsService: UpstreamLeasedAssetsService,
    private downstreamLeasedAssetsService: DownstreamLeasedAssetsService,
    private ProcessingOfSoldProducts:ProcessingOfSoldProductsService,
    private wasteGeneratedInOperationsService: WasteGeneratedInOperationsService,
    private franchisesService: FranchisesService,
    private purchasedGoodsAndServicesService: PurchasedGoodsAndServicesService,
    private downstreamTransportationService: DownstreamTransportationService,
    private upTransportationService: UpstreamTransportationService,
    private netZeroUseOfSoldProductsService: NetZeroUseOfSoldProductsService,
    private netZeroCapitalGoodsService:capitalGoodsService
  ) {
  }

  async bulkDelete(req: BulckDeletDto) {
    try {
      let service = this.getService(req.es) as BulckUpdatable;
      return await service.bulkDelete(req.ids, req.isPermant);
    } catch (err) {
      throw new InternalServerErrorException("No service found")
    }
  }

  async bulkRecalculate(projectId: number, unitIds: number[], esList: sourceName[]) {
    try {
      let data = {}
      await Promise.all(esList.map(async es => {
        console.log("es----", es)
        let service = this.getService(es) as BulckUpdatable;

        let res = await service.bulkCalculate(unitIds, projectId);
        data[es] = res;
      }))
      return data;
    } catch (err) {
      throw new InternalServerErrorException("No service found")
    }
  }

  async getManyActivityData(projectId: number, unitIds: number[], userIds: number[], es: sourceName) {
    const queryRunner = getConnection().createQueryRunner()
    await queryRunner.connect();
    // await queryRunner.startTransaction();
    try {

      let source = this.formatSourceName(es);

      let filter: string = "acData.status = :status ";
      if (projectId > 0) {
        filter = `${filter} AND project.id = :projectId`;
      }
      if (unitIds.length > 0) {
        filter = `${filter} AND unit.id IN (:unitIds)`;
      }
      if (userIds.length > 0) {
        filter = `${filter} AND user.id IN (:userIds)`;
      }
      let status = RecordStatus.Active;
      let quearyObj = queryRunner.manager.getRepository(source.class)
        .createQueryBuilder('acData')
        .innerJoinAndSelect(
          'acData.project',
          'project',
          'project.id = acData.projectId'
        )
        .innerJoinAndSelect(
          'acData.unit',
          'unit',
          'unit.id = acData.unitId'
        ).innerJoinAndSelect(
          'acData.user',
          'user',
          'user.id = acData.userId'
        )
        .where(filter, { status: status, projectId: projectId, unitIds: unitIds, userIds: userIds });
      let data = await quearyObj.getMany();
      return data;
    } catch (err) {
      console.log("getManyActivityData service ", err);
      throw new InternalServerErrorException();
    } finally {
      queryRunner.release();
    }
  }

  getVariableMapping(esCode: string) {
    let service = this.getService(esCode) as ExcellUploadable;
    if (service) {
      return service.downlodExcellBulkUploadVariableMapping();
    } else {
      throw new InternalServerErrorException("No service found")
    }
  }

  async uploadBulkMultipleUnit(projectId: number, esCode: sourceName, buffer: Buffer, userId: number, mapping: ValidationSheetMapDto[]) {
    console.log("AAAAA")
    try {
      let service = this.getService(esCode) as ExcellUploadable;
      console.log("bbb")

      if (service) {
        let errors = await this.emissionSourceBulkService.excellValidate(projectId, esCode, buffer, mapping, service.downlodExcellBulkUploadVariableMapping());
        if (errors.length > 0) {
          console.log("cccc")

          return errors;
        } else {
          console.log("dddd")


          let project = await this.projectService.findOne(projectId);
          let year = this.getYear(project.isFinancialYear, project.year, project.fyFrom, project.fyTo);
          let user = await this.userService.findOne(userId);
          return await this.emissionSourceBulkService.excellBulckValidatedSave(project, user, year, buffer, service.downlodExcellBulkUploadVariableMapping(), service);
        }
      } else {
        throw new InternalServerErrorException("service not found")
      }
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(err)
    }
  }

  async uploadBulk(projectId: number, esCode: sourceName, buffer: Buffer, userId: number, unitId: number, ownerShip: string, isMobile: boolean) {
    // throw new Error('Method not implemented.');

    const workbook = XLSX.read(buffer);
    let data_sheet = workbook.Sheets['in'];
    try {
      if (data_sheet) {
        let data = XLSX.utils.sheet_to_json(data_sheet);
        let user = await this.userService.findOne(userId);
        let project = await this.projectService.findOne(projectId);
        let unit = await this.unitService.findOne(unitId);
        if (esCode && project && user && unit) {
          let year = this.getYear(project.isFinancialYear, project.year, project.fyFrom, project.fyTo);

          let service = this.getService(esCode) as ExcellUploadable;
          if (service) {
            data.forEach(d => {
              service.excellBulkUpload(unit, project, user, d, [], year, ownerShip, isMobile);
            })

            return {
              status: true,
              message: 'Uploaded'
            }
          } else {
            return {
              status: false,
              message: 'Service is null'
            }
          }
        }
      } else {
        console.log("no data_sheet");
        throw new InternalServerErrorException("no data_sheet")
      }
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(err)
    }

  }


  async addFromExcell(projectId: number, esId: number, buffer: Buffer, userId: number, unitId: number | undefined) {
    console.log("addFromExcell -----------")
    try {
      const workbook = XLSX.read(buffer);
      let data_sheet = workbook.Sheets['in']

      console.log("unit", unitId, projectId)
      if (data_sheet) {
        let data = XLSX.utils.sheet_to_json(data_sheet);
        let es = await this.emissionSourceService.findOne(esId);
        let user = await this.userService.findOne(userId);
        let project = await this.projectService.findOne(projectId);
        if (es && project && user) {
          let unit = null;
          // unitId = 1;
          if (unitId) {
            unit = await this.unitService.findOne(unitId)
          }
          let master_mapping_sheet = workbook.Sheets['master-mapping'];
          let com_mapping_sheet = workbook.Sheets['com-mapping'];
          let variable_mapping_sheet = workbook.Sheets['variable-mapping'];
          if (master_mapping_sheet && com_mapping_sheet && variable_mapping_sheet) {
            let master_mapping = XLSX.utils.sheet_to_json(master_mapping_sheet);
            let com_mapping = XLSX.utils.sheet_to_json(com_mapping_sheet);
            let variable_mapping = XLSX.utils.sheet_to_json(variable_mapping_sheet);

            let primaryKey = master_mapping.find(mp => mp['key'] === 'PRIMARY_KEY') as object;
            let comIdVar = master_mapping.find(mp => mp['key'] === 'COM_ID') as object;
            let comNameVar = master_mapping.find(mp => mp['key'] === 'COM_NAME') as object;
            let branchIdVar = master_mapping.find(mp => mp['key'] === 'BRANCH_ID') as object;
            let branchNameVar = master_mapping.find(mp => mp['key'] === 'BRANCH_NAME') as object;


            let created = await Promise.all(data.map(async (d: any) => {
              let p = d[primaryKey['val']];
              if (!unitId) {
                unit = null;

                if (branchIdVar && d[branchIdVar['val']]) {
                  let branchMap = com_mapping.find(cm => cm['Is branch'] === 1 && cm['v1-ID'] === d[branchIdVar['val']]);
                  if (branchMap) {
                    unit = await this.unitService.findOne(branchMap['v2-ID'])
                  }
                }
                if (comIdVar && d[comIdVar['val']] && !unit) {

                  let comMap = com_mapping.find(cm => cm['Is branch'] === 0 && cm['v1-ID'] === d[comIdVar['val']]);


                  if (comMap) {
                    unit = await this.unitService.findOne(comMap['v2-ID'])
                  }
                }
              }
              if (unit) {
                let service = this.getService(es.code) as ExcellUploadable;
                try {
                  if (service) {
                    let year = this.getYear(project.isFinancialYear, project.year, project.fyFrom, project.fyTo);
                    let res = await service.addFromExcell(unit, project, user, d, variable_mapping, year);
                    if (res) {
                      return {
                        id: p,
                        status: true,
                        message: 'savd'
                      }
                    } else {
                      return {
                        id: p,
                        status: false,
                        message: 'not saved due to resullt in null'
                      }
                    }
                  } else {
                    return {
                      id: p,
                      status: false,
                      message: 'Service is null'
                    }
                  }
                } catch (err) {
                  console.log(err);
                  return {
                    id: p,
                    status: false,
                    message: 'not saved due to ' + err.message
                  }
                }
              } else {
                console.log("no unit", unit);
                return {
                  id: p,
                  status: false,
                  message: 'not saved due to unit is ' + unit
                }
              }
            }));

            console.log("created from excell --------------------------")
            if (created) {
              created.forEach(c => console.log(c));
            }
            return created;
          } else {
            console.log("master_mapping_sheet , com_mapping_sheet , variable_mapping_sheet", master_mapping_sheet, com_mapping_sheet, variable_mapping_sheet)
            throw new InternalServerErrorException("No master_mapping_sheet , com_mapping_sheet , variable_mapping_sheet")
          }
        } else {
          console.log("es , project , user", es, project, user)
          throw new InternalServerErrorException("No es , project , user")
        }
      } else {
        console.log("no data_sheet");
        throw new InternalServerErrorException("no data_sheet")
      }
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(err)
    }
  }


  getYear(isFy: boolean, year: number | string, fyFrom: Date, fyTo: Date, isAllMonth: boolean = false) {
    // console.log(isFy, year, fyFrom, fyTo, isAllMonth);
    if (!isFy) {
      return year as number;
    } else {
      if (isAllMonth) {
        if ((12 - fyFrom.getMonth()) >= fyTo.getMonth()) {
          return fyFrom.getFullYear();
        } else {
          return fyTo.getFullYear();
        }
      } else {
        const date = new Date();
        return date.getFullYear();
      }
    }
  }

  getService(code: string): ExcellUploadable | BulckUpdatable | ProgressRetriever | ExcelDownloader {
    switch (code) {
      case sourceName.t_n_d_loss:
        return this.tNDLossService;
      case sourceName.Generator:
        return this.generatorService;
      case sourceName.cooking_gas:
        return this.cookingGasService
      case sourceName.freight_road:
        return this.freightRoadService
      case sourceName.freight_rail:
        return this.freightRailService
      case sourceName.WeldingEs:
        return this.weldingGasService
      case sourceName.freight_air:
        return this.freightAirService
      case sourceName.freight_rail:
        return this.freightRailService
      case sourceName.freight_water:
        return this.freightWaterService
      case sourceName.Electricity:
        return this.electricityService
      case sourceName.FireExtinguisher:
        return this.fireExtinguisherService
      case sourceName.Waste_water_treatment:
        return this.wasteWaterTreatmentService
      case sourceName.passenger_rail:
        return this.passengerRailService
      case sourceName.passenger_offroad:
        return this.passengerOffroadService;
      case sourceName.passenger_road:
        return this.passengerRoadService;
      case sourceName.offroad_machinery:
        return this.offroadMachineryOffroadService
      case sourceName.passenger_air:
        return this.passengerAirService
      case sourceName.freight_offroad:
        return this.freightOffroadService
      case sourceName.Refrigerant:
        return this.refrigerantService
      case sourceName.Boilers:
        return this.boilerService
      case sourceName.Municipal_water:
        return this.municipalWaterService
      case sourceName.waste_disposal:
        return this.wasteDisposalService
      case sourceName.passenger_water:
        return this.passengerWaterService;
      case sourceName.business_travel:
        return this.businessTravelService;
      case sourceName.t_n_d_loss:
        return this.tNDLossService;
      case sourceName.Net_Zero_Business_Travel:
         return this.netZeroBusinessTravelService;
      case sourceName.Investments:
          return this.investmentsService;        
      case sourceName.Fuel_Energy_Related_Activities:
          return this.fuelEnergyRelatedService;        
      case sourceName.Net_Zero_Employee_Commuting:
        return this.netZeroEmpcomService;
      case sourceName.End_of_Life_Treatment_of_Sold_Products:
        return this.end_of_life_treatment_of_sold_productsService;
      case sourceName.Upstream_Leased_Assets:
        return this.upstreamLeasedAssetsService;
      case sourceName.Processing_of_Sold_Products:
          return this.ProcessingOfSoldProducts;
      case sourceName.Waste_Generated_in_Operations:
        return this.wasteGeneratedInOperationsService
      case sourceName.Franchises:
        return this.franchisesService;
      case sourceName.Purchased_Goods_and_Services:
        return this.purchasedGoodsAndServicesService
      case sourceName.Downstream_Transportation_and_Distribution:
        return this.downstreamTransportationService
      case sourceName.Downstream_Leased_Assets:
        return this.downstreamLeasedAssetsService;
      case sourceName.Upstream_Transportation_and_Distribution:
        return this.upTransportationService; 
      case sourceName.Use_of_Sold_Products:
        return this.netZeroUseOfSoldProductsService 
        case sourceName.Capital_Goods:
          return this.netZeroCapitalGoodsService 
    }

  }

  // Offroad Machinery should be removed
  async updateTotal(projectId: number|null, unitId: number|null) {

    await this.makeZerrowAll(projectId, unitId);

    const queryRunner = getConnection().createQueryRunner();
    let esList = await this.emissionSourceService.findAll();
    // let esList =[await this.emissionSourceService.findOne(1)]
    // let esList = [];

    await queryRunner.connect();
    await queryRunner.startTransaction();

    let projectData = await Promise.all(esList.map(async es => {

      if (es.code !== sourceName.passenger_road) {
        let source = this.formatSourceName(es.code);

        await this.updatePUES(1, 0, 0, queryRunner, source, es,projectId, unitId);
        let direct = await this.updatePES(1, 0, 0, queryRunner, source, es,projectId, unitId);

        await this.updatePUES(0, 1, 0, queryRunner, source, es,projectId, unitId);
        let indirect = await this.updatePES(0, 1, 0, queryRunner, source, es,projectId, unitId);

        await this.updatePUES(0, 0, 1, queryRunner, source, es,projectId, unitId);
        let other = await this.updatePES(0, 0, 1, queryRunner, source, es,projectId, unitId);

        return {
          es: es.code,
          directPES: direct,
          indirectPES: indirect,
          otherPES: other
        }
      }

    }));

    let sumention: {
      projectId: number,

      directEmission: number,
      directCH4Emission: number,
      directCO2Emission: number,
      directN2OEmission: number,

      indirectEmission: number,
      indirectCH4Emission: number,
      indirectCO2Emission: number,
      indirectN2OEmission: number,

      otherEmission: number,
      otherCH4Emission: number,
      otherCO2Emission: number,
      otherN2OEmission: number,

    }[] = []

    if (projectData) {
      projectData.map(pd => {
        pd?.directPES.map(dpd => {
          let sumP = sumention.find(s => s.projectId === dpd.projectId);
          if (sumP) {
            sumP.directEmission = sumP.directEmission + dpd.e_sc;
            sumP.directCH4Emission = sumP.directCH4Emission + dpd.e_sc_ch4;
            sumP.directCO2Emission = sumP.directCO2Emission + dpd.e_sc_co2;
            sumP.directN2OEmission = sumP.directN2OEmission + dpd.e_sc_n2o;
            sumention = sumention.filter(s => s.projectId !== dpd.projectId)
            sumention.push(sumP);
          } else {
            sumP = {
              projectId: dpd.projectId,
              directEmission: dpd.e_sc,
              directCH4Emission: dpd.e_sc_ch4,
              directCO2Emission: dpd.e_sc_co2,
              directN2OEmission: dpd.e_sc_n2o,

              indirectEmission: 0,
              indirectCH4Emission: 0,
              indirectCO2Emission: 0,
              indirectN2OEmission: 0,

              otherEmission: 0,
              otherCH4Emission: 0,
              otherCO2Emission: 0,
              otherN2OEmission: 0,
            }
            sumention.push(sumP);
          }
        });

        pd?.indirectPES.map(idpd => {
          let sumP = sumention.find(s => s.projectId === idpd.projectId);
          if (sumP) {
            sumP.indirectEmission = sumP.indirectEmission + idpd.e_sc;
            sumP.indirectEmission = sumP.indirectEmission + idpd.e_sc_ch4;
            sumP.indirectCO2Emission = sumP.indirectCO2Emission + idpd.e_sc_co2;
            sumP.indirectN2OEmission = sumP.indirectN2OEmission + idpd.e_sc_n2o;
            sumention = sumention.filter(s => s.projectId !== idpd.projectId)
            sumention.push(sumP);
          } else {
            sumP = {
              projectId: idpd.projectId,
              indirectEmission: idpd.e_sc,
              indirectCH4Emission: idpd.e_sc_ch4,
              indirectCO2Emission: idpd.e_sc_co2,
              indirectN2OEmission: idpd.e_sc_n2o,

              directEmission: 0,
              directCH4Emission: 0,
              directCO2Emission: 0,
              directN2OEmission: 0,

              otherEmission: 0,
              otherCH4Emission: 0,
              otherCO2Emission: 0,
              otherN2OEmission: 0,
            }
            sumention.push(sumP);
          }
        })

        pd?.otherPES.map(opd => {
          let sumP = sumention.find(s => s.projectId === opd.projectId);
          if (sumP) {
            sumP.otherEmission = sumP.otherEmission + opd.e_sc;
            sumP.otherCH4Emission = sumP.otherCH4Emission + opd.e_sc_ch4;
            sumP.otherCO2Emission = sumP.otherCO2Emission + opd.e_sc_co2;
            sumP.otherN2OEmission = sumP.otherN2OEmission + opd.e_sc_n2o;
            sumention = sumention.filter(s => s.projectId !== opd.projectId)
            sumention.push(sumP);
          } else {
            sumP = {
              projectId: opd.projectId,
              otherEmission: opd.e_sc,
              otherCH4Emission: opd.e_sc_ch4,
              otherCO2Emission: opd.e_sc_co2,
              otherN2OEmission: opd.e_sc_n2o,

              directEmission: 0,
              directCH4Emission: 0,
              directCO2Emission: 0,
              directN2OEmission: 0,

              indirectEmission: 0,
              indirectCH4Emission: 0,
              indirectCO2Emission: 0,
              indirectN2OEmission: 0,
            }
            sumention.push(sumP);
          }
        })
      })
    }

    sumention.forEach(async s => {
      let p = await this.projectService.findOne(s.projectId);
      if (p) {
        p.directEmission = s.directEmission;
        p.directCH4Emission = s.directCH4Emission;
        p.directCO2Emission = s.directCO2Emission;
        p.directN2OEmission = s.directN2OEmission;

        p.indirectEmission = s.indirectEmission;
        p.indirectCH4Emission = s.indirectCH4Emission;
        p.indirectCO2Emission = s.indirectCO2Emission;
        p.indirectN2OEmission = s.indirectN2OEmission;

        p.otherEmission = s.otherEmission;
        p.otherCH4Emission = s.otherCH4Emission;
        p.otherCO2Emission = s.otherCO2Emission;
        p.otherN2OEmission = s.otherN2OEmission;

        this.projectService.update(p.id, p);
      }
    });

    // queryRunner.commitTransaction()
    await queryRunner.release();


    setTimeout(() => {
      this.passengerRoadService.updateTotal(projectId, unitId);
    }, 5000)
    return sumention;

  }

  async updatePES(direct: number, indirect: number, other: number, queryRunner: QueryRunner, source: { class: string; }, es: EmissionSource,projectId: number|null, unitId: number|null) {
    let status = RecordStatus.Active;

    let filter = "acData.direct = :direct and acData.indirect = :indirect and acData.other = :other and status = :status";
    let filterValues = { direct: direct, indirect: indirect, other: other, status: status };

    if(projectId){
      filter = `${filter} and acData.projectId =:projectId`;
      filterValues['projectId'] = projectId;
    }

    let projectQ = queryRunner.manager.getRepository(source.class)
      .createQueryBuilder('acData')
      .select('projectId, sum(e_sc) as e_sc,sum(e_sc_ch4) as e_sc_ch4, sum(e_sc_co2) as e_sc_co2, sum(e_sc_n2o) as e_sc_n2o')
      .where(filter, filterValues)
      .groupBy('projectId')
      ;
    let projectData = await projectQ.execute();

    if (projectData) {
      await Promise.all(projectData.map(async record => {
        let pes = await this.projectEmissionSourceService.findOne({ project: { id: record.projectId }, emissionSource: { code: es.code }, status: RecordStatus.Active })
        if (pes) {
          if (direct === 1) {
            pes.directEmission = parseFloat(record.e_sc);
            pes.directCH4Emission = record.e_sc_ch4;
            pes.directCO2Emission = record.e_sc_co2;
            pes.directN2OEmission = record.e_sc_n2o;
          }

          if (indirect === 1) {
            pes.indirectEmission = record.e_sc;
            pes.indirectCH4Emission = record.e_sc_ch4;
            pes.indirectCO2Emission = record.e_sc_co2;
            pes.indirectN2OEmission = record.e_sc_n2o;
          }

          if (other === 1) {
            pes.otherEmission = record.e_sc;
            pes.otherCH4Emission = record.e_sc_ch4;
            pes.otherCO2Emission = record.e_sc_co2;
            pes.otherN2OEmission = record.e_sc_n2o;
          }

          let updated = await this.projectEmissionSourceService.update(pes.id, pes);
        }
      }));

      return projectData;
    }
  }

  async updatePUES(direct: number, indirect: number, other: number, queryRunner: QueryRunner, source: { class: string; }, es: EmissionSource,projectId: number|null, unitId: number|null) {
    let status = RecordStatus.Active;

    let filter = "acData.direct = :direct and acData.indirect = :indirect and acData.other = :other and status = :status";
    let filterValues = { direct: direct, indirect: indirect, other: other, status: status };

    if(projectId){
      filter = `${filter} and acData.projectId =:projectId`;
      filterValues['projectId'] = projectId;
    }

    let projectUnitQ = queryRunner.manager.getRepository(source.class)
      .createQueryBuilder('acData')
      .select('projectId, unitId, sum(e_sc) as e_sc,sum(e_sc_ch4) as e_sc_ch4, sum(e_sc_co2) as e_sc_co2, sum(e_sc_n2o) as e_sc_n2o')
      .where(filter, filterValues)
      .groupBy('projectId,unitId')
      ;

    // console.log(projectUnitQ.getQuery(), projectUnitQ.getParameters());

    let projectUnitData = await projectUnitQ.execute();

    if (projectUnitData) {
      await Promise.all(projectUnitData.map(async record => {
        let pu = await this.projectUnitService.findOne({ project: { id: record.projectId }, unit: { id: record.unitId } });
        if (pu) {
          let pues = await this.projectUnitEmissionSourceService.findOne({ projectUnit: { id: pu.id }, emissionSource: { code: es.code }, status: RecordStatus.Active })
          if (pues) {
            if (direct === 1) {
              pues.directEmission = record.e_sc;
              pues.directCH4Emission = record.e_sc_ch4;
              pues.directCO2Emission = record.e_sc_co2;
              pues.directN2OEmission = record.e_sc_n2o;
            }

            if (indirect === 1) {
              pues.indirectEmission = record.e_sc;
              pues.indirectCH4Emission = record.e_sc_ch4;
              pues.indirectCO2Emission = record.e_sc_co2;
              pues.indirectN2OEmission = record.e_sc_n2o;
            }

            if (other === 1) {
              pues.otherEmission = record.e_sc;
              pues.otherCH4Emission = record.e_sc_ch4;
              pues.otherCO2Emission = record.e_sc_co2;
              pues.otherN2OEmission = record.e_sc_n2o;
            }
            await this.projectUnitEmissionSourceService.update(pues.id, pues);
          }
        }
      }));
    }
  }

  async makeZerrowAll(projectId: number | null, unitId: number | null) {
    await this.projectEmissionSourceService.makeALLTotalZerrow(projectId, unitId);
    await this.projectUnitEmissionSourceService.makeALLTotalZerrow(projectId, unitId);
    await this.projectService.makeALLTotalZerrow(projectId, unitId);
  }

  formatSourceName(s: string) {
    let _class = (s.split("_").join(" ")
      .replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())
      .replace(/\s/g, '')) + 'ActivityData'

    let _entity = s + '_activity_data'
    return {
      class: _class, entity: _entity
    }
  }

  async validateMonth(code: sourceName, projectId: number, unitId: number, year: string, month: number) {
    let es = this.formatSourceName(code)
    const queryRunner = getConnection().createQueryRunner()
    try {
      let obj = {};
      await queryRunner.connect();
      await queryRunner.startTransaction();
      let data = queryRunner.manager.getRepository(es.class)
        .createQueryBuilder('acData')
        .innerJoin(
          'acData.project',
          'project',
          'project.id = acData.project'
        )
        .innerJoin(
          'acData.unit',
          'unit',
          'unit.id = acData.unitId'
        )
        .where('project.id = :projectId AND unit.id = :unitId AND acData.year = :year AND month = :month',
          { projectId: projectId, unitId: unitId, year: year, month: month });
      // console.log("getCount", await data.getCount(), data.getQuery())
      return (await data.getCount() !== 0);
    } catch (err) {
      console.error(err);
      // await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err);
    } finally {
      await queryRunner.release();
    }
  }

  async getProgressData(projectId: number, unitId: number) {
    try {
      let esList = await this.emissionSourceService.find({ status: Not(RecordStatus.Deleted) })
      let data = []
      let units = await this.unitService.getChildUnits(unitId);
      let ids = units.map(u => u.id);
      ids.push(unitId)
      await Promise.all(esList.map(async es => {
        let service = this.getService(es.code) as ProgressRetriever;
        if (service) {
          let res = await service.getProgressData(projectId, ids);
          if (res) data.push(...res)
        } else {
          throw new InternalServerErrorException("No service found for " + es.code)
        }
      }))
      data = this.group(data, 'unit')
      delete data['undefined']

      let res = []
      await Promise.all(
        Object.keys(data).map(async key => {
          let unit = await this.unitService.findOne({ id: parseInt(key) })
          let obj = { unitId: key, unitName: unit.name }
          data[key] = this.group(data[key], 'es')
          obj = { ...obj, ...data[key] }
          res.push(obj)
        })
      )
      return res;
    } catch (err) {
      console.log(err)
      throw new InternalServerErrorException("No service found")
    }
  }

  group(list: any[], prop: string | number) {
    return list.reduce((groups, item) => ({
      ...groups,
      [item[prop]]: [...(groups[item[prop]] || []), item]
    }), {});
  }

  async generateActiviyData(projectId: number, unitId: number, esCode: string, paras: any[]) {
    let ownership: string
    const lastIndex = esCode.lastIndexOf('_')
    if (lastIndex) {
      const es = esCode.slice(0, lastIndex);
      ownership = esCode.slice(lastIndex + 1);
      if ([Ownership.OWN, Ownership.HIRED, Ownership.RENTED, undefined, null, 'null'].includes(ownership as Ownership)) {
        esCode = es as sourceName
      } else if (['LP Gas', 'Biogas', 'Bio Gas'].includes(ownership)) {
        esCode = es as sourceName
      }
    }

    let service = this.getService(esCode) as ProgressRetriever;
    if (service) {
      let res: any
      if (ownership) {
        res = await service.generateTableData(projectId, unitId, paras, ownership)
      } else {
        res = await service.generateTableData(projectId, unitId, paras)
      }
      return res
    } else {
      throw new InternalServerErrorException("No service found for " + esCode)
    }
  }


  async modifyActivityData(projectId: number, unitId: number, esCode: sourceName, paras: any[]) {
    const queryRunner = getConnection().createQueryRunner()
    await queryRunner.connect();
    let modified = []
    let acData = []

    let ids = [unitId]

    let ownership: string
    const lastIndex = esCode.lastIndexOf('_')
    if (lastIndex) {
      const es = esCode.slice(0, lastIndex);
      ownership = esCode.slice(lastIndex + 1);
      if ([Ownership.OWN, Ownership.HIRED, Ownership.RENTED, undefined, null, 'null'].includes(ownership as Ownership)) {
        esCode = es as sourceName
      } else if (['LP Gas', 'Biogas', 'Bio Gas'].includes(ownership)) {
        esCode = es as sourceName
      }
    }

    try {
      let parameters = await queryRunner.manager.getRepository('parameter')
        .createQueryBuilder('para')
        .innerJoin(
          'para.source',
          'es',
          'es.id = para.sourceId'
        )
        .where('es.code = :code', { code: esCode })
        .getMany()

      if (paras) {
        parameters.push(...paras)
      }


      let service = this.getService(esCode) as ProgressRetriever;
      if (service) {
        let res: any
        let filter
        let filterValues
        if (ownership) {
          filter = 'project.id = :projectId AND unit.id IN (:unitIds) AND ownership = :ownership'
          filterValues = { projectId: projectId, unitIds: ids, ownership: ownership }
        } else {
          filter = 'project.id = :projectId AND unit.id IN (:unitIds)'
          filterValues = { projectId: projectId, unitIds: ids }
        }
        res = await service.getActivityData(filter, filterValues)

        if (res) acData.push(...res)
      } else {
        throw new InternalServerErrorException("No service found for " + esCode)
      }

      let months = this.parameterUnit.months
      parameters.forEach((para: Parameter) => {
        let obj: IActivityData = {
          Parameter: '',
          code: '',
          January: 0,
          February: 0,
          March: 0,
          April: 0,
          May: 0,
          June: 0,
          July: 0,
          August: 0,
          September: 0,
          October: 0,
          November: 0,
          December: 0,
          All: 0,
        }
        obj['Parameter'] = para.name
        obj['code'] = para.code
        let temp = []
        let isExist = false
        acData.forEach(data => {
          let month = months.find(o => o.value === data.month)
          const key = month.name;
          if (obj[key] !== 0) {
            // temp.push(obj)
            if (temp.length > 0) {
              for (const [idx, t] of temp.entries()) {
                if (temp[idx][key] === 0) {
                  isExist = true
                  obj = temp[idx]
                  obj[key] = data[para.code] + this.getParameterUnit(data, para.code)
                  break;
                }
              }
            }
            if (!isExist) {
              obj = {
                Parameter: '',
                code: '',
                January: 0,
                February: 0,
                March: 0,
                April: 0,
                May: 0,
                June: 0,
                July: 0,
                August: 0,
                September: 0,
                October: 0,
                November: 0,
                December: 0,
                All: 0,
              }
              obj['Parameter'] = para.name
              obj['code'] = para.code
              obj[key] = data[para.code] + this.getParameterUnit(data, para.code)
              temp.push(obj)
            }

          } else {
            // let exist: IActivityData[] = temp.filter((o: IActivityData) => o.code === para.code)
            if (temp.length !== 0) {
              for (const [idx, t] of temp.entries()) {
                if (temp[idx][key] === 0) {
                  obj = temp[idx]
                  obj[key] = data[para.code] + this.getParameterUnit(data, para.code)
                  break;
                }
              }
            } else {
              obj[key] = data[para.code] + this.getParameterUnit(data, para.code)
              temp.push(obj)
            }
          }
        })
        // temp.push(obj)
        modified.push(...temp)
        temp = []
      })
      return modified
    } catch (err) {
      console.log("error", err)
    } finally {
      queryRunner.release()
    }
  }

  getParameterUnit(data: any, code: string) {
    if (data[code] !== null) {
      let unit = data[code + '_unit']
      if (unit) {
        return " " + (this.parameterUnit.parameterUnits[unit]).label
      } else {
        return ''
      }
    } else {
      return ''
    }
  }

  async downloadActivityData(projectId: number, esCode: string, optional?: { month?: number, unitIds?: number[] }) {
    let filter = 'project.id = :projectId'
    let filterValue = { projectId: projectId }
    if (optional) {
      if (optional.unitIds) {
        filter = filter + ' AND unit.id IN (:unitIds)'
        filterValue = { ...filterValue, ...{ unitIds: optional.unitIds } }
      }
      if (optional.month) {
        filter = filter + ' AND month = :month'
        filterValue = { ...filterValue, ...{ month: optional.month } }
      }
    }
    try {
      let variableMapping: any
      let acData: any
      let service = this.getService(esCode) as ExcelDownloader
      let removeCols = ["createdBy", "createdOn", "editedBy", "editedOn", "status", "user", "unit", "project"]
      if (service) {
        // variableMapping = service.getVariableMapping()
        acData = await service.getActivityData(filter, filterValue)
        acData = acData.map(data => {
          if (!optional?.unitIds) {
            data.unit_name = data.unit.name + (data.unit.perfix !== null ? ' - ' + data.unit.perfix : '')
          }
          for (let col of removeCols) {
            delete data[col]
          }
          return Object.keys(data)
            .sort()
            .reduce(function (acc, key) {
              acc[key] = data[key];
              return acc;
            }, {});
        })
        return acData
      } else {
        throw new InternalServerErrorException("No service found for " + esCode)
      }
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException("Getting data failed")
    }
  }
}

export interface IActivityData {
  'Parameter': any,
  'code': any,
  January: number,
  February: number,
  March: number,
  April: number,
  May: number,
  June: number,
  July: number,
  August: number,
  September: number,
  October: number,
  November: number,
  December: number,
  All: number,
}


      // console.log(source.class)
      // console.log(q.getQuery())
      // console.log(q.getParameters())
      // console.log(data);
      // console.log("-----------------------")
