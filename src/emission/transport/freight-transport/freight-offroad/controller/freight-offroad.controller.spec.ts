import { Test, TestingModule } from '@nestjs/testing';
import { FreightOffroadController } from './freight-offroad.controller';
import { FreightOffroadService } from '../service/freight-offroad.service';

describe('FreightOffroadController', () => {
  let controller: FreightOffroadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FreightOffroadController],
      providers: [FreightOffroadService],
    }).compile();

    controller = module.get<FreightOffroadController>(FreightOffroadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
