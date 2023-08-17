import { Test, TestingModule } from '@nestjs/testing';
import { NextStepsController } from './next-steps.controller';
import { NextStepsService } from './service/next-steps.service';

describe('NextStepsController', () => {
  let controller: NextStepsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NextStepsController],
      providers: [NextStepsService],
    }).compile();

    controller = module.get<NextStepsController>(NextStepsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
