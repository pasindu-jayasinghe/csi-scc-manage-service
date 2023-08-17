import { Test, TestingModule } from '@nestjs/testing';
import { WeldingEsActivityDataController } from './welding-es.controller';
import { WeldingEsService } from '../service/welding-es.service';

describe('WeldingEsController', () => {
  let controller: WeldingEsActivityDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeldingEsActivityDataController],
      providers: [WeldingEsService],
    }).compile();

    controller = module.get<WeldingEsActivityDataController>(WeldingEsActivityDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
