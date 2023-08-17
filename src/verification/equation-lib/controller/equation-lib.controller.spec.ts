import { Test, TestingModule } from '@nestjs/testing';
import { EquationLibController } from './equation-lib.controller';

describe('EquationLibController', () => {
  let controller: EquationLibController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EquationLibController],
    }).compile();

    controller = module.get<EquationLibController>(EquationLibController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
