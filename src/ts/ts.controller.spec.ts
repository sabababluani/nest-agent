import { Test, TestingModule } from '@nestjs/testing';
import { TsController } from './ts.controller';
import { TsService } from './ts.service';

describe('TsController', () => {
  let controller: TsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TsController],
      providers: [TsService],
    }).compile();

    controller = module.get<TsController>(TsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
