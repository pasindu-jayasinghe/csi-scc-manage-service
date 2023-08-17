import { Test, TestingModule } from '@nestjs/testing';
import { EvidenceRequestController } from './evidence-request.controller';
import { EvidenceRequestService } from '../service/evidence-request.service';

describe('EvidenceRequestController', () => {
  let controller: EvidenceRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvidenceRequestController],
      providers: [EvidenceRequestService],
    }).compile();

    controller = module.get<EvidenceRequestController>(EvidenceRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
