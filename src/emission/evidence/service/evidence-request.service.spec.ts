import { Test, TestingModule } from '@nestjs/testing';
import { EvidenceRequestService } from './evidence-request.service';

describe('EvidenceRequestService', () => {
  let service: EvidenceRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EvidenceRequestService],
    }).compile();

    service = module.get<EvidenceRequestService>(EvidenceRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
