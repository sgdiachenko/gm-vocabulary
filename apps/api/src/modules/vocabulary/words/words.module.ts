import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WordsService } from './words.service';
import { WordsController } from './words.controller';
import { Word, WordSchema } from './word.entity';
import { WordCollection, WordCollectionSchema } from '../collections/word-collection.entity';
import { AuthModule } from '../../auth/auth.module';

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
