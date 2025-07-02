import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PromptsRepository } from './repositories/prompts.repository';

@Injectable()
export class PromptsService {
  constructor(private readonly promptsRepository: PromptsRepository) {}

  async analyzePrompt(prompt: string) {
    const promptTemplate = `
    User will send prompt,
    I want you to generate this prompt as a best practise into better and more readable prompt for LLM

    Generate **ONLY** imporved version of prompt

    Prompt: "${prompt}"
    `.trim();

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: promptTemplate }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    try {
      const prompt = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log(typeof prompt);

      return this.promptsRepository.createPrompt(prompt);
    } catch (error) {
      throw new Error(`Failed to parse Gemini response: ${error.message}`);
    }
  }
}
