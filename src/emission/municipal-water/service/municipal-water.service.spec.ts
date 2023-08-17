import { Test, TestingModule } from '@nestjs/testing';
import { MunicipalWaterService } from './municipal-water.service';

describe('MunicipalWaterService', () => {
  let service: MunicipalWaterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MunicipalWaterService],
    }).compile();

    service = module.get<MunicipalWaterService>(MunicipalWaterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
