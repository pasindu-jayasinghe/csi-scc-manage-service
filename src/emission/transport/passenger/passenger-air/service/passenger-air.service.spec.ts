import { Test, TestingModule } from '@nestjs/testing';
import { PassengerAirService } from './passenger-air.service';

describe('PassengerAirService', () => {
  let service: PassengerAirService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PassengerAirService],
    }).compile();

    service = module.get<PassengerAirService>(PassengerAirService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
