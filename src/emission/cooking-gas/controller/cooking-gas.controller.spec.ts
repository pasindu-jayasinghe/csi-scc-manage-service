import { Test, TestingModule } from '@nestjs/testing';
import { CookingGasActivityDataController } from './cooking-gas.controller';
import { CookingGasService } from '../service/cooking-gas.service';

describe('CookingGasController', () => {
  let controller: CookingGasActivityDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CookingGasActivityDataController],
      providers: [CookingGasService],
    }).compile();

    controller = module.get<CookingGasActivityDataController>(CookingGasActivityDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
