import { Test, TestingModule } from '@nestjs/testing';
import { PassengerOffroadService } from '../service/passenger-offroad.service';
import { PassengerOffroadActivityDataController } from './passenger-offroad.controller';

describe('PassengerOffroadActivityDataController', () => {
  let controller: PassengerOffroadActivityDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PassengerOffroadActivityDataController],
      providers: [PassengerOffroadService],
    }).compile();

    controller = module.get<PassengerOffroadActivityDataController>(PassengerOffroadActivityDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
