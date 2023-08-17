import { Test, TestingModule } from '@nestjs/testing';
import { PassengerOffroadService } from './passenger-offroad.service';

describe('PassengerOffroadService', () => {
  let service: PassengerOffroadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PassengerOffroadService],
    }).compile();

    service = module.get<PassengerOffroadService>(PassengerOffroadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
