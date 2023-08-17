import { Test, TestingModule } from '@nestjs/testing';
import { PassengerWaterService } from '../service/passenger-water.service';
import { PassengerWaterController } from './passenger-water.controller';

describe('PassengerWaterController', () => {
  let controller: PassengerWaterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PassengerWaterController],
      providers: [PassengerWaterService],
    }).compile();

    controller = module.get<PassengerWaterController>(PassengerWaterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
