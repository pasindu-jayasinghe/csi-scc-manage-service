import { Test, TestingModule } from '@nestjs/testing';
import { ForkliftsActivityDataController } from './forklifts.controller';
import { ForkliftsService } from '../service/forklifts.service';

describe('ForkliftsController', () => {
  let controller: ForkliftsActivityDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForkliftsActivityDataController],
      providers: [ForkliftsService],
    }).compile();

    controller = module.get<ForkliftsActivityDataController>(ForkliftsActivityDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
