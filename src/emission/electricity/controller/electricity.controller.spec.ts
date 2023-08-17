import { Test, TestingModule } from '@nestjs/testing';
import { ElectricityActivityDataController } from './electricity.controller';
import { ElectricityService } from '../service/electricity.service';

describe('ElectricityController', () => {
  let controller: ElectricityActivityDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ElectricityActivityDataController],
      providers: [ElectricityService],
    }).compile();

    controller = module.get<ElectricityActivityDataController>(ElectricityActivityDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
