import { Test, TestingModule } from '@nestjs/testing';
import { PassengerRailService } from '../service/passenger-rail.service';
import { PassengerRailActivityDataController } from './passenger-rail.controller';

describe('PassengerRailActivityDataController', () => {
  let controller: PassengerRailActivityDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PassengerRailActivityDataController],
      providers: [PassengerRailService],
    }).compile();

    controller = module.get<PassengerRailActivityDataController>(PassengerRailActivityDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
