import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { WordsModule } from './words/words.module';
import { WordCollectionsModule } from './word-collections/word-collections.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>(
          'MONGODB_URI',
          'mongodb://localhost:27017/gm-vocabulary',
        ),
      }),
    }),
    UserModule,
    WordsModule,
    WordCollectionsModule,
  ],
})
export class AppModule {}
