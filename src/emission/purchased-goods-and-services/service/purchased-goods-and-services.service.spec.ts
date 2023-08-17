import { Test, TestingModule } from '@nestjs/testing';
import { PurchasedGoodsAndServicesService } from './purchased-goods-and-services.service';

describe('PurchasedGoodsAndServicesService', () => {
  let service: PurchasedGoodsAndServicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PurchasedGoodsAndServicesService],
    }).compile();

    service = module.get<PurchasedGoodsAndServicesService>(PurchasedGoodsAndServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
