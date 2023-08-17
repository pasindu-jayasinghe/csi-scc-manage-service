import { Test, TestingModule } from '@nestjs/testing';
import { FreightRoadService } from './freight-road.service';

describe('FreightRoadService', () => {
  let service: FreightRoadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FreightRoadService],
    }).compile();

    service = module.get<FreightRoadService>(FreightRoadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
