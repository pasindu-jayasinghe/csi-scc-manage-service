import { Module } from '@nestjs/common';
import { ElectricityModule } from './electricity/electricity.module';
import { EmissionSourceModule } from './emission-source/emission-source.module';
import { CalculationService } from './calculation/calculation.service';
import { HttpModule } from '@nestjs/axios';
import { GeneratorModule } from './generator/generator.module';
import { FireExtinguisherModule } from './fire-extinguisher/fire-extinguisher.module';
import { RefrigerantModule } from './refrigerant/refrigerant.module';
// import { GasBiomassModule } from './gas-biomass/gas-biomass.module';
import { WeldingEsModule } from './welding-es/welding-es.module';
import { ForkliftsModule } from './forklifts/forklifts.module';
import { EvidenceModule } from './evidence/evidence.module';
import { BoilerModule } from './boiler/boiler.module';
import { WasteWaterTreatmentModule } from './waste-water-treatment/waste-water-treatment.module';
import { MunicipalWaterModule } from './municipal-water/municipal-water.module';
import { WasteDisposalModule } from './waste-disposal/waste-disposal.module';
import { CookingGasModule } from './cooking-gas/cooking-gas.module';
import { FreightAirModule } from './transport/freight-transport/freight-air/freight-air.module';
import { FreightRailModule } from './transport/freight-transport/freight-rail/freight-rail.module';
import { FreightRoadModule } from './transport/freight-transport/freight-road/freight-road.module';
import { FreightWaterModule } from './transport/freight-transport/freight-water/freight-water.module';
import { FreightOffroadModule } from './transport/freight-transport/freight-offroad/freight-offroad.module';
import { PassengerRoadModule } from './transport/passenger/passenger-road/passenger-road.module';
import { PassengerOffroadModule } from './transport/passenger/passenger-offroad/passenger-offroad.module';
import { PassengerRailModule } from './transport/passenger/passenger-rail/passenger-rail.module';
import { PassengerAirModule } from './transport/passenger/passenger-air/passenger-air.module';
import { OffroadMachineryOffroadModule } from './transport/offroad-machinery/offroad-machinery-offroad/offroad-machinery-offroad.module';
import { ProjectModule } from 'src/project/project.module';
import { EmissionBaseController } from './emission-base.controller';
import { UsersModule } from 'src/users/users.module';
import { UnitModule } from 'src/unit/unit.module';
import { EmissionBaseService } from './emission-base.service';
import { PassengerWaterModule } from './transport/passenger/passenger-water/passenger-water.module';
import { TNDLossModule } from './t-n-d-loss/t-n-d-loss.module';
import { BusinessTravelModule } from './transport/passenger/business-travel/business-travel.module';
import { ParameterUnit } from 'src/utills/parameter-units';
import { PurchasedGoodsAndServicesModule } from './purchased-goods-and-services/purchased-goods-and-services.module';
import { FuelEnergyRelatedActivitiesModule } from './fuel_energy_related_activities/fuel_energy_related_activities.module';
import { InvestmentsModule } from './investments/investments.module';
import { WasteGeneratedInOperationsModule } from './waste-generated-in-operations/waste-generated-in-operations.module';
import { NetZeroBusinessTravelModule } from './net-zero-business-travel/net-zero-business-travel.module';
import { NetZeroEmployeeCommutingModule } from './net-zero-employee-commuting/net-zero-employee-commuting.module';
import { eoltSoldProductsModule } from './EOLT-SoldProducts/eoltSoldProducts.module';
import { UpstreamLeasedAssetsModule } from './upstream-leased-assets/upstream-leased-assets.module';
import { ProcessingOfSoldProductsModule } from './processing-of-sold-product/processing-of-sold-product.module';
import { FranchisesModule } from './net-zero-franchises/franchises.module';
import { DownstreamLeasedAssetsModule } from './downstream-leased-assets/downstream-leased-assets.module';
import { DownstreamTransportationModule } from './net-zero-downstream-transportation/downstream-transportation.module';
import { UpstreamTransportationModule } from './net-zero-upstream-transportation/upstream-transportation.module';
import { NetZeroUseOfSoldProductsModule } from './net-zero-use-of-sold-products/net-zero-use-of-sold-products.module';
import { capitalGoodsModule } from './capital-goods/capital-goods.module';

@Module({
  imports: [
    ElectricityModule, 
    EmissionSourceModule, 
    HttpModule, 
    GeneratorModule,
    
    FireExtinguisherModule, 
    RefrigerantModule, 
    // GasBiomassModule, 
    WeldingEsModule, 
    ForkliftsModule, 
    BoilerModule,
    WasteWaterTreatmentModule,
    MunicipalWaterModule,
    EvidenceModule,
    WasteDisposalModule,
    CookingGasModule,
    FreightAirModule,
    FreightRailModule,
    FreightRoadModule,
    FreightWaterModule,
    FreightOffroadModule,
    PassengerRoadModule,
    PassengerOffroadModule,
    PassengerRailModule,
    PassengerAirModule,
    PassengerWaterModule,
    BusinessTravelModule,
    OffroadMachineryOffroadModule,
    ProjectModule,
    UsersModule,
    UnitModule,
    TNDLossModule,
    PurchasedGoodsAndServicesModule,
    WasteGeneratedInOperationsModule,
    FuelEnergyRelatedActivitiesModule,
    InvestmentsModule,
    WasteGeneratedInOperationsModule,
    NetZeroBusinessTravelModule,
    NetZeroEmployeeCommutingModule,
    eoltSoldProductsModule,
    UpstreamLeasedAssetsModule,
    ProcessingOfSoldProductsModule,
    FranchisesModule,
    DownstreamLeasedAssetsModule,
    ProcessingOfSoldProductsModule,
    DownstreamTransportationModule,
    UpstreamTransportationModule,
    NetZeroUseOfSoldProductsModule,
    capitalGoodsModule
  ],  
  controllers: [EmissionBaseController],
  providers: [CalculationService,EmissionBaseService, ParameterUnit],
  exports: [CalculationService, EmissionSourceModule,EmissionBaseService],
})
export class EmissionModule {}
