import { Test, TestingModule } from '@nestjs/testing';
import { WasteDisposalService } from './waste-disposal.service';

describe('WasteDisposalService', () => {
  let service: WasteDisposalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WasteDisposalService],
    }).compile();

    service = module.get<WasteDisposalService>(WasteDisposalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
