import { Test, TestingModule } from '@nestjs/testing';
import { MunicipalWaterActivityDataController } from './municipal-water.controller';
import { MunicipalWaterService } from '../service/municipal-water.service';

describe('MunicipalWaterController', () => {
  let controller: MunicipalWaterActivityDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MunicipalWaterActivityDataController],
      providers: [MunicipalWaterService],
    }).compile();

    controller = module.get<MunicipalWaterActivityDataController>(MunicipalWaterActivityDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
