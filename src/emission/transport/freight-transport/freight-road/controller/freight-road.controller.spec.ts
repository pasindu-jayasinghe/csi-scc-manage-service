import { Test, TestingModule } from '@nestjs/testing';
import { FreightRoadService } from '../service/freight-road.service';
import { FreightRoadController } from './freight-road.controller';

describe('FreightRoadController', () => {
  let controller: FreightRoadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FreightRoadController],
      providers: [FreightRoadService],
    }).compile();

    controller = module.get<FreightRoadController>(FreightRoadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
