import { Test, TestingModule } from '@nestjs/testing';
import { OffroadMachineryOffroadService } from '../service/offroad-machinery-offroad.service';
import { OffroadMachineryOffroadActivityDataController } from './offroad-machinery-offroad.controller';


describe('OffroadMachineryOffroadActivityDataController', () => {
  let controller: OffroadMachineryOffroadActivityDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OffroadMachineryOffroadActivityDataController],
      providers: [OffroadMachineryOffroadService],
    }).compile();

    controller = module.get<OffroadMachineryOffroadActivityDataController>(OffroadMachineryOffroadActivityDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
