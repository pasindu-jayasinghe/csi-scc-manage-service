import { Test, TestingModule } from '@nestjs/testing';
import { ForkliftsService } from './forklifts.service';

describe('ForkliftsService', () => {
  let service: ForkliftsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ForkliftsService],
    }).compile();

    service = module.get<ForkliftsService>(ForkliftsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
