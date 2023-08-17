import { Test, TestingModule } from '@nestjs/testing';
import { PassengerAirService } from '../service/passenger-air.service';
import { PassengerAirActivityDataController } from './passenger-air.controller';

describe('PassengerAirActivityDataController', () => {
  let controller: PassengerAirActivityDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PassengerAirActivityDataController],
      providers: [PassengerAirService],
    }).compile();

    controller = module.get<PassengerAirActivityDataController>(PassengerAirActivityDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
