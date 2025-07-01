import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PromptsRepository } from './repositories/prompts.repository';

@Injectable()
export class PromptsService {
  constructor(private readonly promptsRepository: PromptsRepository) {}

  async analyzePrompt(prompt: string) {
    const promptTemplate = `
    You are an expert AI agent trained to analyze user instructions and determine:
    
    1. The best tool (e.g., calculator, web-search, file-reader, etc.) to accomplish the task.
    2. The arguments (args) required by that tool.
    
    Instructions:
    - Return a JSON object with two fields: "tool" and "args".
    - Be concise and accurate.
    
    Example 1:
    Prompt: "Find the weather in Paris"
    Output: { "tool": "weather", "args": { "location": "Paris" } }
    
    Example 2:
    Prompt: "Summarize the contents of file notes.txt"
    Output: { "tool": "file-reader", "args": { "fileName": "notes.txt" } }
    
    Now analyze the following prompt and return the correct tool and args:
    
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
      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log(text);
      
      if (!text) throw new Error('No response from Gemini API');

      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      const jsonString = text.slice(jsonStart, jsonEnd + 1);

      const result = JSON.parse(jsonString);
      console.log(result);

      return result;
    } catch (error) {
      throw new Error(`Failed to parse Gemini response: ${error.message}`);
    }
  }
}
