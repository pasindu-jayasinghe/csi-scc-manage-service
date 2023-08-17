import { Test, TestingModule } from '@nestjs/testing';
import { PassengerAirPortController } from './passenger-air-port.controller';

describe('PassengerAirPortController', () => {
  let controller: PassengerAirPortController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PassengerAirPortController],
    }).compile();

    controller = module.get<PassengerAirPortController>(PassengerAirPortController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
