import { Test, TestingModule } from '@nestjs/testing';
import { WeldingEsService } from './welding-es.service';

describe('WeldingEsService', () => {
  let service: WeldingEsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WeldingEsService],
    }).compile();

    service = module.get<WeldingEsService>(WeldingEsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
