import { Test, TestingModule } from '@nestjs/testing';
import { GeneratorActivityDataController } from './generator.controller';

describe('GeneratorController', () => {
  let controller: GeneratorActivityDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeneratorActivityDataController],
    }).compile();

    controller = module.get<GeneratorActivityDataController>(GeneratorActivityDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
