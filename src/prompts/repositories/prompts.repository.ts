import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prompt } from '../entities/prompt.entity';
import { Injectable } from '@nestjs/common';
import { CreatePromptDto } from '../dto/create-prompt.dto';

@Injectable()
export class PromptsRepository {
  constructor(
    @InjectRepository(Prompt) private promptRepository: Repository<Prompt>,
  ) {}

  async createPrompt(createPromptDto: CreatePromptDto) {
    const newPrompt = new Prompt();

    newPrompt.prompt = createPromptDto.prompt;

    console.log(newPrompt);
    
    return await this.promptRepository.save(newPrompt);
  }
}
