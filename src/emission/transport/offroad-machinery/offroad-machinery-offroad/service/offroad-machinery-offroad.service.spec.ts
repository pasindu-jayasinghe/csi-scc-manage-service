import { Test, TestingModule } from '@nestjs/testing';
import { OffroadMachineryOffroadService } from './offroad-machinery-offroad.service';

describe('OffroadMachineryOffroadService', () => {
  let service: OffroadMachineryOffroadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OffroadMachineryOffroadService],
    }).compile();

    service = module.get<OffroadMachineryOffroadService>(OffroadMachineryOffroadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
