import { Test, TestingModule } from '@nestjs/testing';
import { RefrigerantService } from './refrigerant.service';

describe('RefrigerantService', () => {
  let service: RefrigerantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RefrigerantService],
    }).compile();

    service = module.get<RefrigerantService>(RefrigerantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
