import { Module } from '@nestjs/common';
import { NetZeroUseOfSoldProductsActivityDataController } from './controller/net-zero-use-of-sold-products.controller';
import { NetZeroUseOfSoldProductsService } from './service/net-zero-use-of-sold-products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NetZeroUseOfSoldProductActivityData } from './entities/net-zero-use-of-sold-product.entity';
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
      NetZeroUseOfSoldProductActivityData,
      Unit
    ]), 
    HttpModule,
    ProjectModule,
    EmissionSourceModule,
    UnitModule
  ],
  controllers: [NetZeroUseOfSoldProductsActivityDataController],
  providers: [NetZeroUseOfSoldProductsService, CalculationService, ParameterUnit],
  exports: [NetZeroUseOfSoldProductsService]
})
export class NetZeroUseOfSoldProductsModule {}
