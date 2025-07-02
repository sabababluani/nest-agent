import { Body, Controller, Post } from '@nestjs/common';
import { PromptsService } from './prompts.service';
import { CreatePromptDto } from './dto/create-prompt.dto';

@Controller('prompts')
export class PromptsController {
  constructor(private readonly promptsService: PromptsService) {}

  @Post()
  async analyzePrompt(@Body() body: CreatePromptDto) {
    console.log(body.prompt);
    
    return this.promptsService.analyzePrompt(body.prompt);
  }
}
