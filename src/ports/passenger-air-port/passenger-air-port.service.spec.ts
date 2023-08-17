import { Test, TestingModule } from '@nestjs/testing';
import { PassengerAirPortService } from './passenger-air-port.service';

describe('PassengerAirPortService', () => {
  let service: PassengerAirPortService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PassengerAirPortService],
    }).compile();

    service = module.get<PassengerAirPortService>(PassengerAirPortService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
