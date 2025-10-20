import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FilesystemModule } from './filesystem/filesystem.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoviesModule } from './movies/movies.module';
import { PromptsModule } from './prompts/prompts.module';
import { VectorSearchModule } from './vector-search/vector-search.module';
import { ConfigModule } from '@nestjs/config';
import { GmailModule } from './gmail/gmail.module';
import { DiscogsModule } from './discogs/discogs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    FilesystemModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    MoviesModule,
    PromptsModule,
    VectorSearchModule,
    GmailModule,
    DiscogsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
