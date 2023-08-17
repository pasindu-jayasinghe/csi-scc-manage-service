import { Test, TestingModule } from '@nestjs/testing';
import { FreightAirService } from '../service/freight-air.service';
import { FreightAirController } from './freight-air.controller';


describe('FreightAirController', () => {
  let controller: FreightAirController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FreightAirController],
      providers: [FreightAirService],
    }).compile();

    controller = module.get<FreightAirController>(FreightAirController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
