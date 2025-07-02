import { Body, Controller, Post } from '@nestjs/common';
import { PromptsService } from './prompts.service';
import { CreatePromptDto } from './dto/create-prompt.dto';

@Controller('prompts')
export class PromptsController {
  constructor(private readonly promptsService: PromptsService) {}

  @Post()
  async analyzePrompt(@Body() createPromptDto: CreatePromptDto) {
    return this.promptsService.analyzePrompt(createPromptDto);
  }
}
