import { Module } from '@nestjs/common';
import { VectorSearchService } from './vector-search.service';
import { VectorSearchController } from './vector-search.controller';
import { MoviesModule } from 'src/movies/movies.module';

@Module({
  imports: [MoviesModule],
  controllers: [VectorSearchController],
  providers: [VectorSearchService],
})
export class VectorSearchModule {}
