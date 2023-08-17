import { Test, TestingModule } from '@nestjs/testing';
import { EquationLibService } from './equation-lib.service';

describe('EquationLibService', () => {
  let service: EquationLibService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EquationLibService],
    }).compile();

    service = module.get<EquationLibService>(EquationLibService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
