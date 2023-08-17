import { Test, TestingModule } from '@nestjs/testing';
import { CookingGasService } from './cooking-gas.service';

describe('CookingGasService', () => {
  let service: CookingGasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CookingGasService],
    }).compile();

    service = module.get<CookingGasService>(CookingGasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
