import { Test, TestingModule } from '@nestjs/testing';
import { FreightRailService } from './freight-rail.service';

describe('FreightRailService', () => {
  let service: FreightRailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FreightRailService],
    }).compile();

    service = module.get<FreightRailService>(FreightRailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
