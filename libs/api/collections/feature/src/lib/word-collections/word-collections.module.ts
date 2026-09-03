import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WordCollectionsService } from './word-collections.service';
import { WordCollectionsController } from './word-collections.controller';
import { WordCollection, WordCollectionSchema } from '@gm-vocabulary/api/collections/data-access';
import { AuthModule } from '@gm-vocabulary/api/auth/feature';
import { Word, WordSchema } from '@gm-vocabulary/api/words/data-access';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WordCollection.name, schema: WordCollectionSchema },
      { name: Word.name, schema: WordSchema },
    ]),
    AuthModule,
  ],
  controllers: [WordCollectionsController],
  providers: [WordCollectionsService],
})
export class WordCollectionsModule {}
