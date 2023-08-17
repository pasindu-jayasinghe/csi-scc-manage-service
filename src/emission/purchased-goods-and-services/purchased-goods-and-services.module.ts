import { Module } from '@nestjs/common';
import { PurchasedGoodsAndServicesService } from './service/purchased-goods-and-services.service';
import { PurchasedGoodsAndServicesActivityDataController } from './controller/purchased-goods-and-services.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchasedGoodsAndServicesActivityData } from './entities/purchased-goods-and-services.entity';
import { Unit } from 'src/unit/entities/unit.entity';
import { HttpModule } from '@nestjs/axios';
import { ProjectModule } from 'src/project/project.module';
import { EmissionSourceModule } from '../emission-source/emission-source.module';
import { UnitModule } from 'src/unit/unit.module';
import { CalculationService } from '../calculation/calculation.service';
import { ParameterUnit } from 'src/utills/parameter-units';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PurchasedGoodsAndServicesActivityData,
      Unit
    ]), 
    HttpModule,
    ProjectModule,
    EmissionSourceModule,
    UnitModule
  ],
  controllers: [PurchasedGoodsAndServicesActivityDataController],
  providers: [PurchasedGoodsAndServicesService, CalculationService, ParameterUnit],
  exports: [PurchasedGoodsAndServicesService]
})
export class PurchasedGoodsAndServicesModule {}
