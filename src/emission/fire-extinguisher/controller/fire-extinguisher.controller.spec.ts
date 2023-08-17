import { Test, TestingModule } from '@nestjs/testing';
import { FireExtinguisherActivityDataController } from './fire-extinguisher.controller';
import { FireExtinguisherService } from '../service/fire-extinguisher.service';

describe('FireExtinguisherController', () => {
  let controller: FireExtinguisherActivityDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FireExtinguisherActivityDataController],
      providers: [FireExtinguisherService],
    }).compile();

    controller = module.get<FireExtinguisherActivityDataController>(FireExtinguisherActivityDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
