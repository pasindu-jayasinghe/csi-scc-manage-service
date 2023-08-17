import { Test, TestingModule } from '@nestjs/testing';
import { PassengerRoadService } from './passenger-road.service';

describe('PassengerRoadService', () => {
  let service: PassengerRoadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PassengerRoadService],
    }).compile();

    service = module.get<PassengerRoadService>(PassengerRoadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
