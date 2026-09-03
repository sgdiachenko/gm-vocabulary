import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateWordCollectionDto } from './dto/create-word-collection.dto';
import { UpdateWordCollectionDto } from './dto/update-word-collection.dto';
import { WordCollection, WordCollectionDocument } from '@gm-vocabulary/api/collections/data-access';

@Injectable()
export class WordCollectionsService {
  constructor(
    @InjectModel(WordCollection.name)
    private readonly collectionModel: Model<WordCollectionDocument>,
  ) {}

  create(createWordCollectionDto: CreateWordCollectionDto, userId: string) {
    return this.collectionModel.create({
      ...createWordCollectionDto,
      userId: new Types.ObjectId(userId),
    });
  }

  findAll(userId: string) {
    return this.collectionModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('words')
      .exec();
  }

  findShared(userId: string) {
    return this.collectionModel
      .find({ isShared: true, userId: { $ne: new Types.ObjectId(userId) } })
      .populate('words')
      .exec();
  }

  async findOne(id: Types.ObjectId, userId: string) {
    const collection = await this.collectionModel
      .findOne({
        _id: id,
        $or: [{ userId: new Types.ObjectId(userId) }, { isShared: true }],
      })
      .populate('words')
      .exec();
    if (!collection) {
      throw new NotFoundException('Collection not found');
    }
    return collection;
  }

  createBulk(groups: CreateWordCollectionDto[], userId: string) {
    return this.collectionModel.insertMany(
      groups.map((group) => ({ ...group, userId: new Types.ObjectId(userId) })),
    );
  }

  async update(
    id: Types.ObjectId,
    updateWordCollectionDto: UpdateWordCollectionDto,
    userId: string,
  ): Promise<void> {
    const result = await this.collectionModel
      .updateOne({ _id: id, userId: new Types.ObjectId(userId) }, updateWordCollectionDto)
      .exec();
    if (result.matchedCount === 0) {
      throw new NotFoundException('Collection not found');
    }
  }

  async remove(id: Types.ObjectId, userId: string): Promise<void> {
    // TODO: Decide whether deleting a collection should delete its words or set their groupId to null.
    const result = await this.collectionModel
      .deleteOne({
        _id: id,
        userId: new Types.ObjectId(userId),
      })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Collection not found');
    }
  }
}
