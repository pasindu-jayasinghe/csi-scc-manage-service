import { Test, TestingModule } from '@nestjs/testing';
import { MitigationController } from './mitigation.controller';
import { MitigationService } from '../service/mitigation.service';

describe('MitigationController', () => {
  let controller: MitigationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MitigationController],
      providers: [MitigationService],
    }).compile();

    controller = module.get<MitigationController>(MitigationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
