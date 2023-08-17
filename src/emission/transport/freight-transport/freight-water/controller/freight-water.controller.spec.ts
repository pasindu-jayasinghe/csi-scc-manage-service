import { Test, TestingModule } from '@nestjs/testing';
import { FreightWaterService } from '../service/freight-water.service';
import { FreightWaterController } from './freight-water.controller';

describe('FreightWaterController', () => {
  let controller: FreightWaterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FreightWaterController],
      providers: [FreightWaterService],
    }).compile();

    controller = module.get<FreightWaterController>(FreightWaterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
