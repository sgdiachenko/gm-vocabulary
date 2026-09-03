import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { WordCollectionsController } from './word-collections.controller';
import { WordCollectionsService } from './word-collections.service';

describe('WordCollectionsController', () => {
  let controller: WordCollectionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WordCollectionsController],
      providers: [
        { provide: WordCollectionsService, useValue: {} },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    controller = module.get<WordCollectionsController>(WordCollectionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
