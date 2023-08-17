import { Test, TestingModule } from '@nestjs/testing';
import { WasteWaterTreatmentService } from './waste-water-treatment.service';

describe('WasteWaterTreatmentService', () => {
  let service: WasteWaterTreatmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WasteWaterTreatmentService],
    }).compile();

    service = module.get<WasteWaterTreatmentService>(WasteWaterTreatmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
