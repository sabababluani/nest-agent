import { BadGatewayException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { MOVIE_PROMPT } from './utils/movie-prompt.util';
import { MoviesRepository } from './repositories/movies.repository';
import { MOVIE_TOOLS } from 'src/tools/movie-tool';
import { ToolCall } from './interfaces/tool-call.interface';

@Injectable()
export class MoviesService {
  constructor(private readonly moviesRepository: MoviesRepository) {}

  async analyzePrompt(prompt: string) {
    try {
      console.log('Starting analyzePrompt with prompt:', prompt);

      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY environment variable is not set');
      }

      const promptTemplate = `${MOVIE_PROMPT}

        Available tools: ${JSON.stringify(MOVIE_TOOLS, null, 2)}

        IMPORTANT: When user asks to search and add to watchlist, you MUST use BOTH tools:
        1. First use search_movie to get movie details
        2. Then use add_to_watchlist with the found details

        Respond with tool calls in this exact format:
        TOOL_CALL_START
        Tool: tool_name
        Args: {"arg1": "value1"}
        TOOL_CALL_END

        For multiple tools, use multiple TOOL_CALL blocks.

        User request: ${prompt}`;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: promptTemplate }] }],
        },
        { headers: { 'Content-Type': 'application/json' } },
      );

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log('Gemini response:', text);

      if (!text) throw new Error('No response from Gemini API');

      const isSearchAndAdd =
        prompt.toLowerCase().includes('search') &&
        (prompt.toLowerCase().includes('add') ||
          prompt.toLowerCase().includes('watchlist'));

      const toolCalls = this.parseToolCalls(text);
      console.log('Initial parsed tool calls:', toolCalls);

      if (
        isSearchAndAdd &&
        toolCalls.length === 1 &&
        toolCalls[0].tool === 'search_movie'
      ) {
        console.log(
          'Detected search+add request, forcing add_to_watchlist tool',
        );
        toolCalls.push({
          tool: 'add_to_watchlist',
          args: { title: toolCalls[0].args.title },
        });
      }

      if (!toolCalls || toolCalls.length === 0) {
        console.log('No tool calls found, returning plain text response');
        return { message: text, toolUsed: false };
      }

<<<<<<< HEAD
      const results: any = [];
=======
      // Execute tools sequentially
      const results: any[] = [];
>>>>>>> a66f1a3e45cb63ee0d3d311c3ba565598b3ce316
      let movieData: any = null;

      for (const toolCall of toolCalls) {
        console.log(
          'Executing tool:',
          toolCall.tool,
          'with args:',
          toolCall.args,
        );

        try {
          let toolResult;

          if (toolCall.tool === 'search_movie') {
            toolResult = await this.searchMovie(
              toolCall.args.title,
              toolCall.args.year,
            );
            movieData = toolResult;
          } else if (toolCall.tool === 'add_to_watchlist') {
            const title = toolCall.args.title || movieData?.title;
            const year = toolCall.args.year || movieData?.year;
            const plot = toolCall.args.plot || movieData?.plot;

            if (!title) {
              throw new Error(
                'No movie title available for watchlist addition',
              );
            }

            toolResult = await this.addToWatchlist(title, year, plot);
          } else {
            throw new Error(`Unknown tool: ${toolCall.tool}`);
          }

          results.push({
            toolCall,
            result: toolResult,
            formattedResponse: this.formatToolResponse(toolCall, toolResult),
          });

          console.log(
            `Tool ${toolCall.tool} executed successfully:`,
            toolResult,
          );
        } catch (error: any) {
          console.error(`Error executing tool ${toolCall.tool}:`, error);
          results.push({
            toolCall,
            result: { error: error.message },
            formattedResponse: `Error with ${toolCall.tool}: ${error.message}`,
          });
        }
      }

      const combinedMessage = results
        .map((r: any) => r.formattedResponse)
        .join('\n\n');

      return {
        message: combinedMessage,
        toolUsed: true,
        toolCalls: toolCalls,
        toolResults: results,
      };
    } catch (error: any) {
      console.error('Error in analyzePrompt:', error);
      throw new Error(`Failed to analyze prompt: ${error.message}`);
    }
  }

  parseToolCalls(text: string): ToolCall[] {
    const toolCalls: ToolCall[] = [];
    console.log('Parsing tool calls from text:', text);

    const toolCallBlocks = text.match(
      /TOOL_CALL_START([\s\S]*?)TOOL_CALL_END/g,
    );

    if (toolCallBlocks) {
      for (const block of toolCallBlocks) {
        const toolCall = this.parseSingleToolCall(block);
        if (toolCall) {
          toolCalls.push(toolCall);
        }
      }
    } else {
      const sections = text.includes('---') ? text.split('---') : [text];
      for (const section of sections) {
        const toolCall = this.parseSingleToolCall(section.trim());
        if (toolCall) {
          toolCalls.push(toolCall);
        }
      }
    }

    console.log('Parsed tool calls:', toolCalls);
    return toolCalls;
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
          args = JSON.parse(argsText);
        } catch (parseError) {
          console.error('Failed to parse args JSON:', parseError);
          // Try to extract at least the title if JSON parsing fails
          const titleMatch = text.match(/"title":\s*"([^"]+)"/i);
          if (titleMatch) {
            args = { title: titleMatch[1] };
          }
        }
      }

      return { tool, args };
    } catch (error) {
      console.error('Error parsing single tool call:', error);
      return null;
    }
  }

  formatToolResponse(toolCall: ToolCall, result: any) {
    switch (toolCall.tool) {
      case 'search_movie':
        if (!result || result.error) {
          return `Movie search failed: ${result?.error || 'Movie not found'}`;
        }

        return (
          `🎬 Found "${result.title}" (${result.year})\n` +
          `📽️ Director: ${result.director || 'N/A'}\n` +
          `🎭 Genre: ${result.genre || 'N/A'}\n` +
          `⭐ IMDB Rating: ${result.imdbRating || 'N/A'}\n` +
          `📖 Plot: ${result.plot || 'N/A'}`
        );

      case 'add_to_watchlist':
        if (result?.error) {
          return `❌ Failed to add to watchlist: ${result.error}`;
        }
        return `✅ ${result?.message || 'Successfully added to watchlist!'}`;

      default:
        return JSON.stringify(result, null, 2);
    }
  }

  async searchMovie(title: string, year?: number) {
    try {
      console.log(
        `🔍 Searching for movie: "${title}"${year ? ` (${year})` : ''}`,
      );

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

      const response = await axios.get(`https://www.omdbapi.com/?${params}`, {
        timeout: 10000, // 10 second timeout
      });

      if (response.data.Response === 'False') {
        throw new Error(response.data.Error || 'Movie not found');
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

      console.log('✅ Movie found:', result.title, result.year);
      return result;
    } catch (error: any) {
      console.error('❌ Movie search failed:', error.message);
      throw error;
    }
  }

  async addToWatchlist(title: string, year: number, plot: string) {
    try {
      if (!title) {
        throw new Error('Movie title is required');
      }

      console.log(
        `📝 Adding to watchlist: "${title}" (${year || 'unknown year'})`,
      );

      await this.moviesRepository.addToWatchList({
        title,
        year,
        plot,
      });

      console.log('✅ Successfully added to watchlist');
      return { message: `Successfully added "${title}" to your watchlist!` };
    } catch (error: any) {
      console.error('❌ Failed to add to watchlist:', error.message);
      throw new BadGatewayException(
        `Failed to add "${title}" to watchlist: ${error.message}`,
      );
    }
  }
}
