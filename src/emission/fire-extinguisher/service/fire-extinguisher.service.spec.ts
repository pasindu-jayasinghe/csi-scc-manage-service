import { Test, TestingModule } from '@nestjs/testing';
import { FireExtinguisherService } from './fire-extinguisher.service';

describe('FireExtinguisherService', () => {
  let service: FireExtinguisherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FireExtinguisherService],
    }).compile();

    service = module.get<FireExtinguisherService>(FireExtinguisherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
