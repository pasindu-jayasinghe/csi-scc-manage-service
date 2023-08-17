import { Test, TestingModule } from '@nestjs/testing';
import { RecomendationController } from './recomendation.controller';
import { RecomendationService } from '../service/recomendation.service';

describe('RecomendationController', () => {
  let controller: RecomendationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecomendationController],
      providers: [RecomendationService],
    }).compile();

    controller = module.get<RecomendationController>(RecomendationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
