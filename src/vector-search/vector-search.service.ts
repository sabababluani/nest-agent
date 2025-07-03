import { Injectable } from '@nestjs/common';
import { MoviesRepository } from 'src/movies/repositories/movies.repository';
import axios from 'axios';

@Injectable()
export class VectorSearchService {
  constructor(private readonly moviesRepository: MoviesRepository) { }

  private async getEmbedding(text: string): Promise<number[]> {
    const response = await axios.post(
      'https://api.cohere.ai/v1/embed',
      {
        texts: [text],
        model: 'embed-english-v3.0',
        input_type: 'search_document',
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data.embeddings[0];
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
    const magA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
    const magB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
    return dotProduct / (magA * magB);
  }

  async search(query: string) {
    const movies = await this.moviesRepository.getWatchList();
    const queryEmbedding = await this.getEmbedding(query);

    const movieEmbeddings = await Promise.all(
      movies.map(async (movie) => {
        const movieText = `${movie.title} ${movie.plot} ${movie.year}`;
        const embedding = await this.getEmbedding(movieText);
        return { movie, embedding };
      }),
    );

    const similarities = movieEmbeddings.map(({ movie, embedding }) => ({
      movie,
      similarity: this.cosineSimilarity(queryEmbedding, embedding),
    }));

    return similarities.sort((a, b) => b.similarity - a.similarity);
  }
}
