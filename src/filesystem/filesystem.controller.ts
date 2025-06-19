import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { FilesystemService } from './filesystem.service';

@Controller('filesystem')
export class FilesystemController {
  constructor(private readonly fsService: FilesystemService) {}

  @Post('analyze')
  async analyzePrompt(@Body() body: { prompt: string }) {
    return this.fsService.analyzePrompt(body.prompt);
  }

  @Get(':id')
  getFilesystem(@Param('id') id: string) {
    return this.fsService.getFilesystem(+id);
  }

  @Get()
  getAllFile() {
    return this.fsService.getAllFile();
  }
}