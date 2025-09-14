import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';
import { TOOLS } from 'src/tools/file-tool';
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Action } from './enums/action.enum';
import { FileSystemRepository } from './repositories/filesystem.repository';
import * as dotenv from 'dotenv';
import { Request } from './interfaces/request.interface';

const execAsync = promisify(exec);
dotenv.config();

@Injectable()
export class FilesystemService {
  constructor(private readonly fileSystemRepository: FileSystemRepository) { }

  async handleCall(request: Request, prompt: string) {
    console.log(
      'handleCall received request:',
      JSON.stringify(request, null, 2),
    );

    if (!request || !request.params) {
      throw new Error('Invalid request format: missing params');
    }

    const { name, arguments: args } = request.params;

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

            await this.fileSystemRepository.createFilesystem({
              name: prompt,
              path: file_path,
              action: Action.READ,
            });

            return {
              success: true,
              message: `content: ${content}`,
            };
          } catch (error: any) {
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

            await this.fileSystemRepository.createFilesystem({
              name: prompt,
              path: file_path,
              action: Action.WRITE,
            });

            return {
              success: true,
              message: `Successfully wrote to file: ${file_path}`,
            };
          } catch (error: any) {
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

            const fileList = files.map((file: any) =>
              path.relative(absolutePath, path.join(absolutePath, file)),
            );

            await this.fileSystemRepository.createFilesystem({
              name: prompt,
              path: directory,
              action: Action.LIST,
            });

            return {
              success: true,
              message: `Files: ${fileList.join(', ')}`,
              files: files,
            };
          } catch (error: any) {
            return {
              success: false,
              message: `Error listing files: ${error.message}`,
            };
          }
        }

        case 'search_files': {
          try {
            const { directory, query, recursive = true } = args;

            const absolutePath = path.resolve(directory);
            const searchPattern = recursive ? `**/*${query}*` : `*${query}*`;

            const files = await glob(searchPattern, {
              dot: true,
              absolute: false,
              cwd: absolutePath,
              windowsPathsNoEscape: true,
            });

            const fileList = files;

            await this.fileSystemRepository.createFilesystem({
              name: prompt,
              path: directory,
              action: Action.SEARCH,
            });

            return {
              success: true,
              message: `Found ${files.length} files matching "${query}" in ${directory}`,
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
          try {
            const { path: dirPath } = args;

            await fs.mkdir(path.resolve(dirPath));

            await this.fileSystemRepository.createFilesystem({
              name: prompt,
              path: dirPath,
              action: Action.CREATE,
            });

            return {
              success: true,
              message: `Successfully created directory: ${dirPath}`,
            };
          } catch (error) {
            return {
              success: false,
              message: `Error creating directory: ${error.message}`,
            };
          }
        }

        case 'show_wifi_password': {
          try {
            const { wifi_name } = args;

            const command = wifi_name
              ? `netsh wlan show profile name="${wifi_name}" key=clear`
              : 'netsh wlan show profiles';

            const { stdout } = await execAsync(command);

            if (!wifi_name) {
              return {
                success: true,
                message: 'Available WiFi networks:',
                networks: stdout
                  .split('\n')
                  .filter((line) => line.includes('All User Profile'))
                  .map((line) => line.split(':')[1].trim()),
              };
            }

            const passwordMatch = stdout.match(/Key Content\s*:\s*(.*)/);
            if (passwordMatch) {
              return {
                success: true,
                message: `Network: ${wifi_name}, password: ${passwordMatch[1].trim()}`,
                password: passwordMatch[1].trim(),
              };
            }

            await this.fileSystemRepository.createFilesystem({
              name: prompt,
              action: Action.WIFI,
            });

            return {
              success: true,
              message: `Network information for ${wifi_name} ${passwordMatch![1].trim()}`,
              info: stdout,
            };
          } catch (error) {
            return {
              success: false,
              message: `Error retrieving WiFi information: ${error.message}`,
            };
          }
        }

        default:
          return `Unknown tool: ${name} `;
      }
    } catch (error) {
      return error instanceof Error ? error.message : 'Unknown error';
    }
  }

  async analyzePrompt(prompt: string) {
    try {
      console.log('Starting analyzePrompt with prompt:', prompt);

      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY environment variable is not set');
      }

      const promptTemplate = `
      You are a file system tool agent.Based on the user's prompt, determine which file system tool to use and its arguments.
      Available tools: ${TOOLS.map((tool) => tool.name).join(', ')}.

          Respond in this exact format:
          Tool: [tool_name]
          Args: {
            "arg1": "value1",
            "arg2": "value2"
          }
      
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

      let args;
      try {
        args = JSON.parse(argsMatch[1]);
      } catch (error) {
        throw new Error('Failed to parse arguments JSON from LLM response');
      }

      const toolExists = TOOLS.some((tool) => tool.name === toolName);
      if (!toolExists) {
        throw new Error(`Invalid tool name: ${toolName}`);
      }

      const result = await this.handleCall(
        {
          params: {
            name: toolName,
            arguments: args,
          },
        },
        prompt,
      );
      return result;
    } catch (error: any) {
      return error instanceof Error
        ? error.message
        : 'Unknown error occurred while processing prompt';
    }
  }

  async getFilesystem(id: number) {
    return this.fileSystemRepository.getFilesystem(id);
  }

  async getAllFile() {
    return this.fileSystemRepository.getAllFile();
  }

  async getReadFile() {
    return this.fileSystemRepository.getReadFile();
  }

  async getWriteFile() {
    return this.fileSystemRepository.getWriteFile();
  }
}
