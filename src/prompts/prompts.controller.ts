import { Body, Controller, Post } from '@nestjs/common';
import { PromptsService } from './prompts.service';

@Controller('prompts')
export class PromptsController {
  constructor(private readonly promptsService: PromptsService) { }

  @Post()
  async analyzePrompt(@Body() body: { prompt: string }) {
    return this.promptsService.analyzePrompt(body.prompt)
  }
}
