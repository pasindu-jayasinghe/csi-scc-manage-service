import { Test, TestingModule } from '@nestjs/testing';
import { WasteDisposalActivityDataController } from './waste-disposal.controller';
import { WasteDisposalService } from './waste-disposal.service';

describe('WasteDisposalController', () => {
  let controller: WasteDisposalActivityDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WasteDisposalActivityDataController],
      providers: [WasteDisposalService],
    }).compile();

    controller = module.get<WasteDisposalActivityDataController>(WasteDisposalActivityDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
