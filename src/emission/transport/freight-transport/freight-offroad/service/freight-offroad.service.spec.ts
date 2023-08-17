import { Test, TestingModule } from '@nestjs/testing';
import { FreightOffroadService } from './freight-offroad.service';

describe('FreightOffroadService', () => {
  let service: FreightOffroadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FreightOffroadService],
    }).compile();

    service = module.get<FreightOffroadService>(FreightOffroadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
