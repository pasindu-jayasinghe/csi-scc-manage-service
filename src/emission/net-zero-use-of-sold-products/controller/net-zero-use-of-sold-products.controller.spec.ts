import { Test, TestingModule } from '@nestjs/testing';
import { NetZeroUseOfSoldProductsActivityDataController } from './net-zero-use-of-sold-products.controller';
import { NetZeroUseOfSoldProductsService } from '../service/net-zero-use-of-sold-products.service';

describe('NetZeroUseOfSoldProductsController', () => {
  let controller: NetZeroUseOfSoldProductsActivityDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NetZeroUseOfSoldProductsActivityDataController],
      providers: [NetZeroUseOfSoldProductsService],
    }).compile();

    controller = module.get<NetZeroUseOfSoldProductsActivityDataController>(NetZeroUseOfSoldProductsActivityDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
