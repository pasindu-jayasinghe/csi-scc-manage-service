import { Test, TestingModule } from '@nestjs/testing';
import { FreightWaterService } from './freight-water.service';

describe('FreightWaterService', () => {
  let service: FreightWaterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FreightWaterService],
    }).compile();

    service = module.get<FreightWaterService>(FreightWaterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
