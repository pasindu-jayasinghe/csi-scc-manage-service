import { Test, TestingModule } from '@nestjs/testing';
import { BoilerService } from './boiler.service';

describe('BoilerService', () => {
  let service: BoilerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoilerService],
    }).compile();

    service = module.get<BoilerService>(BoilerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
