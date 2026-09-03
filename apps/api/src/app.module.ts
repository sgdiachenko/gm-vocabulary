import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { WordCollectionsModule } from '@gm-vocabulary/api/collections/feature';
import { UserModule } from '@gm-vocabulary/api/users/feature';
import { WordsModule } from '@gm-vocabulary/api/words/feature';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI', 'mongodb://localhost:27017/gm-vocabulary'),
      }),
    }),
    UserModule,
    WordsModule,
    WordCollectionsModule,
  ],
})
export class AppModule {}
