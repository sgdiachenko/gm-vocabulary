import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { WordCollectionsService } from './word-collections.service';

describe('WordCollectionsService', () => {
  const exec = jest.fn();
  const query = { populate: jest.fn(), exec };
  const collectionModel = {
    find: jest.fn(() => query),
    updateOne: jest.fn(() => ({ exec })),
  };
  const service = new WordCollectionsService(collectionModel as never);

  beforeEach(() => {
    jest.clearAllMocks();
    query.populate.mockReturnValue(query);
    collectionModel.find.mockReturnValue(query);
    collectionModel.updateOne.mockReturnValue({ exec });
  });

  it('should return only shared collections owned by other users', async () => {
    const userId = new Types.ObjectId();
    exec.mockResolvedValue([]);

    await service.findShared(userId.toString());

    expect(collectionModel.find).toHaveBeenCalledWith({
      isShared: true,
      userId: { $ne: userId },
    });
    expect(query.populate).toHaveBeenCalledWith('words');
  });

  it('should scope updates to both collection and user IDs', async () => {
    const collectionId = new Types.ObjectId();
    const userId = new Types.ObjectId();
    exec.mockResolvedValue({ matchedCount: 1 });

    await service.update(collectionId, { name: 'Updated' }, userId.toString());

    expect(collectionModel.updateOne).toHaveBeenCalledWith(
      { _id: collectionId, userId },
      { name: 'Updated' },
    );
  });

  it('should hide missing or foreign collections behind a not-found response', async () => {
    exec.mockResolvedValue({ matchedCount: 0 });

    await expect(
      service.update(
        new Types.ObjectId(),
        { name: 'Updated' },
        new Types.ObjectId().toString(),
      ),
    ).rejects.toThrow(NotFoundException);
  });
});
