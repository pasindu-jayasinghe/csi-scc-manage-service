import { Module } from '@nestjs/common';
import { ParameterService } from './service/parameter.service';
import { ParameterController } from './controller/parameter.controller';
import { Parameter } from './entities/parameter.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmissionSource } from 'src/emission/emission-source/entities/emission-source.entity';
import { EmissionSourceModule } from 'src/emission/emission-source/emission-source.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Parameter
    ]),
    EmissionSourceModule
  ],
  controllers: [ParameterController],
  providers: [ParameterService],
  exports: [ParameterService]
})
export class ParameterModule {}
