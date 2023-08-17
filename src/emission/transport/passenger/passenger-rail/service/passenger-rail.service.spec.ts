import { Test, TestingModule } from '@nestjs/testing';
import { PassengerRailService } from './passenger-rail.service';

describe('PassengerRailService', () => {
  let service: PassengerRailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PassengerRailService],
    }).compile();

    service = module.get<PassengerRailService>(PassengerRailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
