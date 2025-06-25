import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from '../entities/movie.entity';
import { CreateMovieDto } from '../dto/create-movie.dto';

@Injectable()
export class MoviesRepository {
  constructor(
    @InjectRepository(Movie) private movieRepository: Repository<Movie>,
  ) {}

  async addToWatchList(movie: CreateMovieDto) {
    const newMovie = new Movie();

    newMovie.title = movie.title;
    newMovie.year = movie.year;
    newMovie.plot = movie.plot;

    return await this.movieRepository.save(newMovie);
  }

  async getWatchList() {
    return await this.movieRepository.find()
  }
  
}
