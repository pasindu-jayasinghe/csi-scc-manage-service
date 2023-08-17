import { Test, TestingModule } from '@nestjs/testing';
import { PurchasedGoodsAndServicesService } from '../service/purchased-goods-and-services.service';

describe('PurchasedGoodsAndServicesActivityDataController', () => {
  let controller: PurchasedGoodsAndServicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchasedGoodsAndServicesService],
      providers: [PurchasedGoodsAndServicesService],
    }).compile();

    controller = module.get<PurchasedGoodsAndServicesService>(PurchasedGoodsAndServicesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
