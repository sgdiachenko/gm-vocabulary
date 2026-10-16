import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { WordCollectionsModule } from './modules/vocabulary/collections/word-collections.module';
import { AuthModule } from './modules/auth/auth.module';
import { WordsModule } from './modules/vocabulary/words/words.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI', 'mongodb://localhost:27017/gm-vocabulary'),
      }),
    }),
    AuthModule,
    WordsModule,
    WordCollectionsModule,
  ],
})
export class AppModule {}
