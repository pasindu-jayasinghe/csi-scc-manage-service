import { Test, TestingModule } from '@nestjs/testing';
import { PassengerWaterService } from './passenger-water.service';

describe('PassengerWaterService', () => {
  let service: PassengerWaterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PassengerWaterService],
    }).compile();

    service = module.get<PassengerWaterService>(PassengerWaterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
