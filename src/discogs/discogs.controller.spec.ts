import { Test, TestingModule } from '@nestjs/testing';
import { DiscogsController } from './discogs.controller';
import { DiscogsService } from './discogs.service';

describe('DiscogsController', () => {
  let controller: DiscogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscogsController],
      providers: [DiscogsService],
    }).compile();

    controller = module.get<DiscogsController>(DiscogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
