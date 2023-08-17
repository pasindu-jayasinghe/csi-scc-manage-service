import { Test, TestingModule } from '@nestjs/testing';
import { MitigationService } from './mitigation.service';

describe('MitigationService', () => {
  let service: MitigationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MitigationService],
    }).compile();

    service = module.get<MitigationService>(MitigationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
