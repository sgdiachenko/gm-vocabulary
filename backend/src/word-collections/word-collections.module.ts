import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WordCollectionsService } from './word-collections.service';
import { WordCollectionsController } from './word-collections.controller';
import {
  WordCollection,
  WordCollectionSchema,
} from './entities/word-collection.entity';
import { UserModule } from '../user/user.module';
import { Word, WordSchema } from '../words/entities/word.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WordCollection.name, schema: WordCollectionSchema },
      { name: Word.name, schema: WordSchema },
    ]),
    UserModule,
  ],
  controllers: [WordCollectionsController],
  providers: [WordCollectionsService],
})
export class WordCollectionsModule {}
