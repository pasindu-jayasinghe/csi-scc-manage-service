import { Module } from '@nestjs/common';
import { NextStepsService } from './service/next-steps.service';
import { NextStepsController } from './controller/next-steps.controller';
import { HttpModule } from '@nestjs/axios';
import { NextStep } from './entities/next-step.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NextStep
    ]), 
    HttpModule,
  ],
  controllers: [NextStepsController],
  providers: [NextStepsService]
})
export class NextStepsModule {}
