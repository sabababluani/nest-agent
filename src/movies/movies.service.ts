import { BadGatewayException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { MOVIE_PROMPT } from './utils/movie-prompt.util';
import { MoviesRepository } from './repositories/movies.repository';
import { MOVIE_TOOLS } from 'src/tools/movie-tool';
import { ToolCall } from './interfaces/tool-call.interface';

@Injectable()
export class MoviesService {
  constructor(private readonly moviesRepository: MoviesRepository) { }

  async analyzePrompt(prompt: string) {
    try {
      console.log('Starting analyzePrompt with prompt:', prompt);

      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY environment variable is not set');
      }

      const promptTemplate = `Here is your system prompt: ${MOVIE_PROMPT}

      Available tools: ${JSON.stringify(MOVIE_TOOLS, null, 2)}

      You can use multiple tools if needed. Respond in this exact format for each tool:
      Tool: [tool_name]
      Args: {
        "arg1": "value1",
        "arg2": "value2"
      }

      If multiple tools are needed, separate them with "---" like this:
      Tool: search_movie
      Args: {"title": "Inception"}
      ---
      Tool: add_to_watchlist
      Args: {"title": "Inception", "year": 2010, "plot": "A thief who steals corporate secrets..."}

      User prompt: ${prompt}`.trim();

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
      console.log('Gemini response:', text);

      if (!text) throw new Error('No response from Gemini API');

      const toolCalls = this.parseMultipleToolCalls(text);
      console.log('Parsed tool calls:', toolCalls);

      if (!toolCalls || toolCalls.length === 0) {
        console.log('No tool calls found, returning plain text response');
        return { message: text, toolUsed: false };
      }

      const results: any = [];
      let searchResult: any = null;

      for (const toolCall of toolCalls) {
        console.log('Executing tool:', toolCall);

        if (toolCall.tool === 'add_to_watchlist' && searchResult) {
          toolCall.args = {
            title: toolCall.args.title || searchResult.title,
            year: toolCall.args.year || searchResult.year,
            plot: toolCall.args.plot || searchResult.plot,
            ...toolCall.args
          };
        }

        const toolResult = await this.executeTool(toolCall);
        console.log('Tool result:', toolResult);

        if (toolCall.tool === 'search_movie') {
          searchResult = toolResult;
        }

        results.push({
          toolCall,
          result: toolResult,
          formattedResponse: this.formatToolResponse(toolCall, toolResult)
        });
      }

      const combinedMessage = results
        .map(r => r.formattedResponse)
        .join('\n\n');

      return {
        message: combinedMessage,
        toolUsed: true,
        toolCalls: toolCalls,
        toolResults: results,
      };
    } catch (error) {
      throw new Error(`Failed to analyze prompt: ${error.message}`);
    }
  }

  parseMultipleToolCalls(text: string): ToolCall[] {
    try {
      console.log('Parsing multiple tool calls from text:', text);

      const sections = text.includes('---') ? text.split('---') : [text];
      const toolCalls: ToolCall[] = [];

      for (const section of sections) {
        const toolCall = this.parseSingleToolCall(section.trim());
        if (toolCall) {
          toolCalls.push(toolCall);
        }
      }

      console.log('Successfully parsed tool calls:', toolCalls);
      return toolCalls;
    } catch (error) {
      console.error('Error parsing multiple tool calls:', error);
      return [];
    }
  }

  parseSingleToolCall(text: string): ToolCall | null {
    try {
      const toolMatch = text.match(/Tool:\s*([^\n\r]+)/i);
      const argsMatch = text.match(/Args:\s*(\{[\s\S]*?\})/i);

      if (!toolMatch) {
        return null;
      }

      const tool = toolMatch[1].trim();
      let args = {};

      if (argsMatch) {
        try {
          const argsText = argsMatch[1].trim();
          console.log('Parsing args:', argsText);
          args = JSON.parse(argsText);
        } catch (parseError) {
          console.error('Failed to parse args JSON:', parseError);
          console.error('Args text was:', argsMatch[1]);
          args = {};
        }
      }

      return { tool, args };
    } catch (error) {
      console.error('Error parsing single tool call:', error);
      return null;
    }
  }

  parseToolCall(text: string) {
    const toolCalls = this.parseMultipleToolCalls(text);
    return toolCalls.length > 0 ? toolCalls[0] : null;
  }

  formatToolResponse(toolCall: ToolCall, result: any) {
    console.log('Formatting tool response for:', toolCall.tool);

    switch (toolCall.tool) {
      case 'search_movie':
        if (!result) return 'Movie not found';

        const movie = result;

        return (
          `Found "${movie.title}" (${movie.year})\n` +
          `Director: ${movie.director || 'N/A'}\n` +
          `Genre: ${movie.genre || 'N/A'}\n` +
          `IMDB Rating: ${movie.imdbRating || 'N/A'}\n` +
          `Plot: ${movie.plot || 'N/A'}`
        );

      case 'add_to_watchlist':
        return result?.message || 'Added to watchlist successfully';

      default:
        return JSON.stringify(result, null, 2);
    }
  }

  async executeTool(toolCall: ToolCall) {
    const { tool, args } = toolCall;
    console.log('Executing tool:', tool, 'with args:', args);

    switch (tool) {
      case 'search_movie':
        const title = args.title || args.name;
        const year = args.year ? parseInt(args.year.toString()) : undefined;

        if (!title) {
          throw new Error('Movie title is required for search_movie tool');
        }

        return await this.searchMovie(title, year);

      case 'add_to_watchlist':
        return await this.addToWatchlist(args.title, args.year, args.plot);

      default:
        throw new Error(`Unknown tool: ${tool}`);
    }
  }

  async searchMovie(title: string, year?: number) {
    try {
      console.log(`Searching for movie: "${title}"${year ? ` (${year})` : ''}`);

      const apiKey = process.env.OMDB_API_KEY;
      if (!apiKey) {
        throw new Error('OMDB_API_KEY environment variable is not set');
      }

      const params = new URLSearchParams({
        apikey: apiKey,
        t: title,
        type: 'movie',
        plot: 'short',
      });

      if (year) {
        params.append('y', year.toString());
      }

      console.log(
        'Making OMDB API request with params:',
        params.toString(),
        `endpoint https://www.omdbapi.com/?${params}`,
      );

      const response = await axios.get(`https://www.omdbapi.com/?${params}`);

      console.log('OMDB API response status:', response.status);
      console.log('OMDB API response data:', response.data);

      if (response.data.Response === 'False') {
        const errorMessage = response.data.Error || 'Movie not found';
        throw new Error(errorMessage);
      }

      const movie = response.data;

      const result = {
        title: movie.Title,
        year: parseInt(movie.Year) || null,
        plot: movie.Plot,
        director: movie.Director,
        actors: movie.Actors,
        imdbRating: movie.imdbRating,
        genre: movie.Genre,
        poster: movie.Poster,
        runtime: movie.Runtime,
        released: movie.Released,
      };

      console.log('Successfully parsed movie data:', result);
      return result;
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - OMDB API is not responding');
      }

      throw new Error(`Failed to search movie: ${error.message}`);
    }
  }

  async addToWatchlist(title: string, year: number, plot: string) {
    try {
      await this.moviesRepository.addToWatchList({ title, year, plot });
      return { message: `Successfully added "${title}" to watchlist` };
    } catch (err) {
      throw new BadGatewayException('Failed to add to watchlist');
    }
  }
}