import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { Word, WordDocument } from '@gm-vocabulary/api/words/data-access';
import { WordCollection, WordCollectionDocument } from '@gm-vocabulary/api/collections/data-access';

@Injectable()
export class WordsService {
  constructor(
    @InjectModel(Word.name) private readonly wordModel: Model<WordDocument>,
    @InjectModel(WordCollection.name)
    private readonly collectionModel: Model<WordCollectionDocument>,
  ) {}

  create(createWordDto: CreateWordDto, userId: string) {
    return this.wordModel.create({
      ...createWordDto,
      groupId: createWordDto.groupId ? new Types.ObjectId(createWordDto.groupId) : undefined,
      userId: new Types.ObjectId(userId),
    });
  }

  findAll(userId: string) {
    return this.wordModel.find({ userId: new Types.ObjectId(userId) }).exec();
  }

  async copy(ids: string[], userId: string) {
    const ownerId = new Types.ObjectId(userId);
    const sourceWords = await this.wordModel
      .find({ _id: { $in: ids.map((id) => new Types.ObjectId(id)) } })
      .lean()
      .exec();
    const groupIds = sourceWords.flatMap((word) => (word.groupId ? [word.groupId] : []));
    const sharedCollections = await this.collectionModel
      .find({
        _id: { $in: groupIds },
        isShared: true,
        userId: { $ne: ownerId },
      })
      .select('_id')
      .lean()
      .exec();
    const sharedCollectionIds = new Set(
      sharedCollections.map((collection) => collection._id.toString()),
    );
    const wordsToCopy = sourceWords.filter(
      (word) => word.groupId && sharedCollectionIds.has(word.groupId.toString()),
    );

    if (wordsToCopy.length !== ids.length) {
      throw new NotFoundException('One or more words not found');
    }

    return this.wordModel.insertMany(
      wordsToCopy.map(({ word, translation, description }) => ({
        word,
        translation,
        description,
        userId: ownerId,
      })),
    );
  }

  async update(id: Types.ObjectId, updateWordDto: UpdateWordDto, userId: string): Promise<void> {
    const update = {
      word: updateWordDto.word,
      translation: updateWordDto.translation,
      description: updateWordDto.description,
      ...(updateWordDto.groupId !== undefined && {
        groupId: updateWordDto.groupId ? new Types.ObjectId(updateWordDto.groupId) : undefined,
      }),
    };
    const result = await this.wordModel
      .updateOne({ _id: id, userId: new Types.ObjectId(userId) }, update)
      .exec();
    if (result.matchedCount === 0) {
      throw new NotFoundException('Word not found');
    }
  }

  async remove(ids: string[], userId: string) {
    const result = await this.wordModel
      .deleteMany({
        _id: { $in: ids.map((id) => new Types.ObjectId(id)) },
        userId: new Types.ObjectId(userId),
      })
      .exec();
    return { message: 'Words deleted', deletedCount: result.deletedCount };
  }
}
