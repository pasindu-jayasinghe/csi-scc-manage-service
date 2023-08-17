import { Module } from '@nestjs/common';
import { ForkliftsService } from './service/forklifts.service';
import { ForkliftsActivityDataController } from './controller/forklifts.controller';
import { HttpModule } from '@nestjs/axios';
import { CalculationService } from '../calculation/calculation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForkliftsActivityData } from './entities/forklift.entity';
import { ProjectModule } from 'src/project/project.module';
import { EmissionSourceModule } from '../emission-source/emission-source.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([ForkliftsActivityData]), 
    HttpModule,
    ProjectModule,
    EmissionSourceModule
  ],
  controllers: [ForkliftsActivityDataController],
  providers: [ForkliftsService, CalculationService]
})
export class ForkliftsModule {}
