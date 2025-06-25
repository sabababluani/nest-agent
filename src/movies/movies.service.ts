import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { MOVIE_PROMPT } from './utils/movie-prompt.util';
import { MoviesRepository } from './repositories/movies.repository';

export interface ToolCall {
  tool: string;
  args: Record<string, any>;
}

@Injectable()
export class MoviesService {
  constructor(private readonly moviesRepository: MoviesRepository) { }

  async analyzePrompt(prompt: string) {
    try {
      console.log('Starting analyzePrompt with prompt:', prompt);

      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY environment variable is not set');
      }

      const promptTemplate = `Here is you system prompt: ${MOVIE_PROMPT}
      
      Respond in this exact format:
      Tool: [tool_name]
      Args: {
        "arg1": "value1",
        "arg2": "value2"
      }

      User prompt: ${prompt}
      `.trim();

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [{ text: promptTemplate }],
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) throw new Error('No response from Gemini API');

      const toolCall = this.parseToolCall(text);
      if (!toolCall) return { message: text, toolUsed: false };

      const toolResult = await this.executeTool(toolCall);

      return {
        message: this.formatToolResponse(toolCall, toolResult),
        toolUsed: true,
        toolCall,
        toolResult,
      };
    } catch (error) { }
  }

  parseToolCall(text: string): ToolCall | null {
    try {
      const toolMatch = text.match(/Tool:\s*(\w+)/);
      const argsMatch = text.match(/Args:\s*({[\s\S]*?})/);

      if (!toolMatch) return null;

      const tool = toolMatch[1];
      let args = {};

      if (argsMatch) {
        try {
          args = JSON.parse(argsMatch[1]);
        } catch (parseError) {
          throw new Error('Failed to parse args JSON:', parseError);
        }
      }

      return { tool, args };
    } catch (error) {
      return null;
    }
  }

  formatToolResponse(toolCall: ToolCall, result: any): string {
    switch (toolCall.tool) {
      case 'search_movie':
        const movie = result;
        return (
          `Found "${movie.title}" (${movie.year})\n` +
          `Director: ${movie.director || 'N/A'}\n` +
          `Genre: ${movie.genre || 'N/A'}\n` +
          `IMDB Rating: ${movie.imdbRating || 'N/A'}\n` +
          `Plot: ${movie.plot || 'N/A'}`
        );

      case 'add_to_watchlist':
        return result.message;

      default:
        return JSON.stringify(result);
    }
  }

  async executeTool(toolCall: ToolCall): Promise<any> {
    const { tool, args } = toolCall;

    switch (tool) {
      case 'search_movie':
        return await this.searchMovie(args.title, args.year);

      // case 'add_to_watchlist':
      //   return await this.addToWatchlist(args.title, args.year);

      default:
        throw new Error(`Unknown tool: ${tool}`);
    }
  }

  async searchMovie(title: string, year: number) {
    try {
      const apiKey = process.env.OMDB_API_KEY;
      if (!apiKey)
        throw new Error('OMDB_API_KEY environment variable is not set');

      const params = new URLSearchParams({
        apikey: apiKey,
        t: title,
        type: 'movie',
        plot: 'short',
      });

      if (year) params.append('y', year.toString());

      const response = await axios.get(`http://www.omdbapi.com/?${params}`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.data.Response === 'False') {
        throw new Error(response.data.Error || 'Movie not found');
      }

      const movie = response.data;

      return {
        title: movie.Title,
        year: parseInt(movie.Year),
        plot: movie.Plot,
        director: movie.Director,
        actors: movie.Actors,
        imdbRating: movie.imdbRating,
        genre: movie.Genre
      }
    } catch (error) {
      throw new Error(`Failed to search movie: ${error.message}`)
    }
  }
}
