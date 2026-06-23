import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WordsService } from './words.service';
import { WordsController } from './words.controller';
import { Word, WordSchema } from './entities/word.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Word.name, schema: WordSchema }]),
    UserModule,
  ],
  controllers: [WordsController],
  providers: [WordsService],
})
export class WordsModule {}
