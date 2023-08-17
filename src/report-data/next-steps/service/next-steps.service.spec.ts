import { Test, TestingModule } from '@nestjs/testing';
import { NextStepsService } from './next-steps.service';

describe('NextStepsService', () => {
  let service: NextStepsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NextStepsService],
    }).compile();

    service = module.get<NextStepsService>(NextStepsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
