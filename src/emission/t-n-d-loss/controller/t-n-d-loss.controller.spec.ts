import { Test, TestingModule } from '@nestjs/testing';
import { TNDLossService } from '../service/t-n-d-loss.service';
import { TNDLossActivityDataController } from './t-n-d-loss.controller';

describe('TNDLossController', () => {
  let controller: TNDLossActivityDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TNDLossActivityDataController],
      providers: [TNDLossService],
    }).compile();

    controller = module.get<TNDLossActivityDataController>(TNDLossActivityDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
