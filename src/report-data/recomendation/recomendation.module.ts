import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recomendation } from './entities/recomendation.entity';
import { RecomendationController } from './controller/recomendation.controller';
import { RecomendationService } from './service/recomendation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Recomendation
    ]), 
    HttpModule,
  ],
  controllers: [RecomendationController],
  providers: [RecomendationService]
})
export class RecomendationModule {}