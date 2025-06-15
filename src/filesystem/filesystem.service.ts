import { Injectable, OnModuleInit } from '@nestjs/common';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  TextContent,
} from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';
import { TOOLS } from 'src/tools/file-tool';
import axios from 'axios';

@Injectable()
export class FilesystemService implements OnModuleInit {
  server: Server;

  async onModuleInit() {
    this.server = new Server(
      {
        name: 'file-system-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: TOOLS,
    }));

    this.server.setRequestHandler(
      CallToolRequestSchema,
      this.handleCall.bind(this),
    );

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('File System MCP Server running on stdio');
  }

  async handleCall(request: any) {
    console.log(
      'handleCall received request:',
      JSON.stringify(request, null, 2),
    );

    if (!request || !request.params) {
      throw new Error('Invalid request format: missing params');
    }

    const { name, arguments: args } = request.params;
    console.log('Extracted name:', name);
    console.log('Extracted args:', args);

    if (!name) {
      throw new Error('Invalid request format: missing name in params');
    }

    if (!args) {
      throw new Error('Invalid request format: missing arguments in params');
    }

    try {
      switch (name) {
        case 'read_file': {
          try {
            if (!args || typeof args.file_path !== 'string') {
              throw new Error('Invalid or missing "filepath" argument');
            }

            const { file_path } = args;
            const absolutePath = path.resolve(file_path);
            const content = await fs.readFile(absolutePath, 'utf-8');

            return {
              success: true,
              message: `content: ${content}`,
            };
          } catch (error) {
            return {
              success: false,
              message: `Error reading file: ${error.message}`,
            };
          }
        }

        case 'write_file': {
          try {
            if (
              !args ||
              typeof args.file_path !== 'string' ||
              typeof args.content !== 'string'
            ) {
              throw new Error(
                'Invalid or missing "file_path" or "content" argument',
              );
            }

            const { file_path, content: text } = args;
            const absolutePath = path.resolve(file_path);

            await fs.mkdir(path.dirname(absolutePath), { recursive: true });
            await fs.writeFile(absolutePath, text, 'utf-8');

            return {
              success: true,
              message: `Successfully wrote to file: ${file_path}`,
            };
          } catch (error) {
            return {
              success: false,
              message: `Error writing to file: ${error.message}`,
            };
          }
        }

        case 'list_files': {
          try {
            if (!args || typeof args.directory !== 'string') {
              throw new Error('Invalid or missing "directory" argument');
            }

            const { directory, pattern } = args;
            const absolutePath = path.resolve(directory);

            const globPattern = pattern || '*';

            const files = await glob(globPattern, {
              dot: true,
              absolute: false,
              cwd: absolutePath,
              windowsPathsNoEscape: true,
            });

            const fileList = files.map((file) =>
              path.relative(absolutePath, path.join(absolutePath, file)),
            );

            return {
              success: true,
              message: `Files: ${fileList.join(', ')}`,
              files: files,
            };
          } catch (error) {
            return {
              success: false,
              message: `Error listing files: ${error.message}`,
            };
          }
        }

        case 'search_files': {
          try {
            if (
              !args ||
              typeof args.directory !== 'string' ||
              typeof args.pattern !== 'string'
            ) {
              throw new Error(
                'Invalid or missing "directory" or "pattern" argument',
              );
            }

            const { directory, pattern, recursive = true } = args;
            const absolutePath = path.resolve(directory);

            const searchPattern = recursive ? `**/${pattern}` : pattern;

            const files = await glob(searchPattern, {
              dot: true,
              absolute: false,
              cwd: absolutePath,
              windowsPathsNoEscape: true,
            });

            const fileList = files;

            return {
              success: true,
              message: `Found ${files.length} files matching "${pattern}" in ${directory}:\n${fileList.join('\n')}`,
              files: fileList,
            };
          } catch (error) {
            return {
              success: false,
              message: `Error searching files: ${error.message}`,
            };
          }
        }

        case 'create_directory': {
          const { directory } = args;
          await fs.mkdir(path.resolve(directory), { recursive: true });
          return this.ok(`Successfully created directory: ${directory}`);
        }

        case 'file_stats': {
          const { filepath } = args;
          const stats = await fs.stat(path.resolve(filepath));
          const statsInfo = {
            path: filepath,
            size: stats.size,
            isFile: stats.isFile(),
            isDirectory: stats.isDirectory(),
            created: stats.birthtime.toISOString(),
            modified: stats.mtime.toISOString(),
            accessed: stats.atime.toISOString(),
          };
          return this.ok(
            `File Stats for ${filepath}:\n${JSON.stringify(statsInfo, null, 2)}`,
          );
        }

        default:
          return this.error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return this.error(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  private ok(text: string) {
    return {
      content: [
        {
          type: 'text',
          text,
        } as TextContent,
      ],
    };
  }

  private error(text: string) {
    return {
      content: [
        {
          type: 'text',
          text,
        } as TextContent,
      ],
      isError: true,
    };
  }

  async analyzePrompt(prompt: string) {
    try {
      console.log('Starting analyzePrompt with prompt:', prompt);
      const geminiApiKey = 'AIzaSyD7Rul-NrOtsb_8qAakJHK4s640nHCmQuo';
      if (!geminiApiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not set');
      }

      const promptTemplate = `
      You are a file system tool agent. Based on the user's prompt, determine which file system tool to use and its arguments.
      Available tools: read_file, write_file, list_files, search_files, create_directory, file_stats.
      
      Respond in this exact format:
      Tool: [tool_name]
      Args: {
        "arg1": "value1",
        "arg2": "value2"
      }
      
      User prompt: ${prompt}`;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
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
      if (!text) {
        throw new Error('No response received from Gemini API');
      }

      const toolMatch = text.match(/Tool:\s*(\w+)/i);
      console.log('toolMatch', toolMatch);
      const argsMatch = text.match(/Args:\s*({[\s\S]*?})/i);
      if (!toolMatch || !argsMatch) {
        throw new Error(
          'Failed to parse LLM response. Invalid format received.',
        );
      }

      const toolName = toolMatch[1];
      console.log(toolMatch[1]);

      let args;
      try {
        args = JSON.parse(argsMatch[1]);
      } catch (e) {
        throw new Error('Failed to parse arguments JSON from LLM response');
      }

      // Validate that the tool exists
      const toolExists = TOOLS.some((tool) => tool.name === toolName);
      if (!toolExists) {
        throw new Error(`Invalid tool name: ${toolName}`);
      }
      const result = await this.handleCall({
        params: {
          name: toolName,
          arguments: args,
        },
      });
      return result;
    } catch (error) {
      return this.error(
        error instanceof Error
          ? error.message
          : 'Unknown error occurred while processing prompt',
      );
    }
  }
}
