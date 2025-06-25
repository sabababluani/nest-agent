import { Controller, Post, Body, Get } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesRepository } from './repositories/movies.repository';

@Controller('movies')
export class MoviesController {
  constructor(
    private readonly moviesService: MoviesService,
    private readonly moviesRepository: MoviesRepository,
  ) {}

  @Post()
  analyzePrompt(@Body() body: { prompt: string }) {
    return this.moviesService.analyzePrompt(body.prompt);
  }

  @Get('watchlist')
  getWatchList() {
    return this.moviesRepository.getWatchList();
  }
}
