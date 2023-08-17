import { Test, TestingModule } from '@nestjs/testing';
import { WasteWaterTreatmentService } from '../service/waste-water-treatment.service';
import { WasteWaterTreatmentActivityDataController } from './waste-water-treatment.controller';


describe('WasteWaterTreatmentController', () => {
  let controller: WasteWaterTreatmentActivityDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WasteWaterTreatmentActivityDataController],
      providers: [WasteWaterTreatmentService],
    }).compile();

    controller = module.get<WasteWaterTreatmentActivityDataController>(WasteWaterTreatmentActivityDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
