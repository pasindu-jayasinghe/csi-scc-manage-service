import { Test, TestingModule } from '@nestjs/testing';
import { NetZeroUseOfSoldProductsService } from './net-zero-use-of-sold-products.service';

describe('NetZeroUseOfSoldProductsService', () => {
  let service: NetZeroUseOfSoldProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NetZeroUseOfSoldProductsService],
    }).compile();

    service = module.get<NetZeroUseOfSoldProductsService>(NetZeroUseOfSoldProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
