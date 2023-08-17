import { Test, TestingModule } from '@nestjs/testing';
import { TNDLossService } from './t-n-d-loss.service';

describe('TNDLossService', () => {
  let service: TNDLossService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TNDLossService],
    }).compile();

    service = module.get<TNDLossService>(TNDLossService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
