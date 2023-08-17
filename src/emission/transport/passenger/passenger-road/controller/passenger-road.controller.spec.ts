import { Test, TestingModule } from '@nestjs/testing';
import { PassengerRoadService } from '../service/passenger-road.service';
import { PassengerRoadActivityDataController } from './passenger-road.controller';

describe('PassengerRoadActivityDataController', () => {
  let controller: PassengerRoadActivityDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PassengerRoadActivityDataController],
      providers: [PassengerRoadService],
    }).compile();

    controller = module.get<PassengerRoadActivityDataController>(PassengerRoadActivityDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
