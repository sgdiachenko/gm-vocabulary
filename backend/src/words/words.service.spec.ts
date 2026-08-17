import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { WordsService } from './words.service';

describe('WordsService', () => {
  const exec = jest.fn();
  const wordModel = {
    find: jest.fn(),
    insertMany: jest.fn(),
    updateOne: jest.fn(() => ({ exec })),
    deleteMany: jest.fn(() => ({ exec })),
  };
  const collectionModel = {
    find: jest.fn(),
  };
  const service = new WordsService(
    wordModel as never,
    collectionModel as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    wordModel.updateOne.mockReturnValue({ exec });
    wordModel.deleteMany.mockReturnValue({ exec });
  });

  it('should scope word updates to both word and user IDs', async () => {
    const wordId = new Types.ObjectId();
    const userId = new Types.ObjectId();
    exec.mockResolvedValue({ matchedCount: 1 });

    await service.update(wordId, { translation: 'кіт' }, userId.toString());

    expect(wordModel.updateOne).toHaveBeenCalledWith(
      { _id: wordId, userId },
      { translation: 'кіт' },
    );
  });

  it('should hide missing or foreign words behind a not-found response', async () => {
    exec.mockResolvedValue({ matchedCount: 0 });

    await expect(
      service.update(
        new Types.ObjectId(),
        { translation: 'кіт' },
        new Types.ObjectId().toString(),
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('should delete only words owned by the authenticated user', async () => {
    const wordId = new Types.ObjectId();
    const userId = new Types.ObjectId();
    exec.mockResolvedValue({ deletedCount: 1 });

    await expect(
      service.remove([wordId.toString()], userId.toString()),
    ).resolves.toEqual({ message: 'Words deleted', deletedCount: 1 });
    expect(wordModel.deleteMany).toHaveBeenCalledWith({
      _id: { $in: [wordId] },
      userId,
    });
  });

  it('should copy words from shared collections without assigning a collection', async () => {
    const wordId = new Types.ObjectId();
    const groupId = new Types.ObjectId();
    const sourceOwnerId = new Types.ObjectId();
    const userId = new Types.ObjectId();
    const sourceWord = {
      _id: wordId,
      word: 'cat',
      translation: 'кіт',
      description: 'animal',
      groupId,
      userId: sourceOwnerId,
    };
    const copiedWord = { ...sourceWord, _id: new Types.ObjectId(), userId };

    wordModel.find.mockReturnValue({
      lean: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([sourceWord]),
      }),
    });
    collectionModel.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([{ _id: groupId }]),
        }),
      }),
    });
    wordModel.insertMany.mockResolvedValue([copiedWord]);

    await expect(
      service.copy([wordId.toString()], userId.toString()),
    ).resolves.toEqual([copiedWord]);

    expect(wordModel.insertMany).toHaveBeenCalledWith([
      {
        word: 'cat',
        translation: 'кіт',
        description: 'animal',
        userId,
      },
    ]);
  });
});
