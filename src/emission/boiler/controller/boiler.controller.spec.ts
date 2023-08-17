import { Test, TestingModule } from '@nestjs/testing';
import { BoilerController } from './boiler.controller';
import { BoilerService } from '../service/boiler.service';

describe('BoilerController', () => {
  let controller: BoilerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoilerController],
      providers: [BoilerService],
    }).compile();

    controller = module.get<BoilerController>(BoilerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
