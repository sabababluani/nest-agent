import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { FilesystemService } from './filesystem.service';

@Controller('filesystem')
export class FilesystemController {
  constructor(private readonly fsService: FilesystemService) {}

  @Get('read')
  async readFile(@Query('filepath') filepath: string) {
    return this.fsService.handleCall({
      params: {
        name: 'read_file',
        arguments: { filepath },
      },
    });
  }

  @Post('write')
  async writeFile(@Body() body: { filepath: string; content: string }) {
    return this.fsService.handleCall({
      params: {
        name: 'write_file',
        arguments: body,
      },
    });
  }

  @Get('list')
  async listFiles(
    @Query('directory') directory: string,
    @Query('pattern') pattern?: string,
  ) {
    return this.fsService.handleCall({
      params: {
        name: 'list_files',
        arguments: { directory, pattern },
      },
    });
  }

  @Get('search')
  async searchFiles(
    @Query('directory') directory: string,
    @Query('pattern') pattern: string,
    @Query('recursive') recursive: string = 'true',
  ) {
    return this.fsService.handleCall({
      params: {
        name: 'search_files',
        arguments: {
          directory,
          pattern,
          recursive: recursive === 'true',
        },
      },
    });
  }

  @Post('mkdir')
  async createDirectory(@Body() body: { directory: string }) {
    return this.fsService.handleCall({
      params: {
        name: 'create_directory',
        arguments: body,
      },
    });
  }

  @Get('stats')
  async fileStats(@Query('filepath') filepath: string) {
    return this.fsService.handleCall({
      params: {
        name: 'file_stats',
        arguments: { filepath },
      },
    });
  }

  @Post('analyze')
  async analyzePrompt(@Body() body: { prompt: string }) {
    return this.fsService.analyzePrompt(body.prompt);
  }

}
