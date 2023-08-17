import { Test, TestingModule } from '@nestjs/testing';
import { FreightRailController } from './freight-rail.controller';
import { FreightRailService } from '../service/freight-rail.service';

describe('FreightRailController', () => {
  let controller: FreightRailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FreightRailController],
      providers: [FreightRailService],
    }).compile();

    controller = module.get<FreightRailController>(FreightRailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
