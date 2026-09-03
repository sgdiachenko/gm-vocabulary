import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WordsService } from './words.service';
import { WordsController } from './words.controller';
import { Word, WordSchema } from '@gm-vocabulary/api/words/data-access';
import { WordCollection, WordCollectionSchema } from '@gm-vocabulary/api/collections/data-access';
import { AuthModule } from '@gm-vocabulary/api/auth/feature';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Word.name, schema: WordSchema },
      { name: WordCollection.name, schema: WordCollectionSchema },
    ]),
    AuthModule,
  ],
  controllers: [WordsController],
  providers: [WordsService],
})
export class WordsModule {}
