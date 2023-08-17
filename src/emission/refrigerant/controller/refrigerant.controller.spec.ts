import { Test, TestingModule } from '@nestjs/testing';
import { RefrigerantActivityDataController } from './refrigerant.controller';
import { RefrigerantService } from '../service/refrigerant.service';

describe('RefrigerantController', () => {
  let controller: RefrigerantActivityDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RefrigerantActivityDataController],
      providers: [RefrigerantService],
    }).compile();

    controller = module.get<RefrigerantActivityDataController>(RefrigerantActivityDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
