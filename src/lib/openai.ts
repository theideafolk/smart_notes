import OpenAI from 'openai';
import { getConfig } from '../utils/config';

const { openaiApiKey } = getConfig();

let openai: OpenAI | null = null;

try {
  if (openaiApiKey) {
    openai = new OpenAI({
      apiKey: openaiApiKey,
      dangerouslyAllowBrowser: true
    });
  }
} catch (error) {
  console.error('Failed to initialize OpenAI client:', error);
}

export const generateSummary = async (text: string): Promise<string> => {
  if (!openai) {
    return 'Summary generation is not available (OpenAI API key not configured)';
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates concise summaries.'
        },
        {
          role: 'user',
          content: `Please summarize the following text:\n\n${text}`
        }
      ],
      temperature: 0.5,
      max_tokens: 150
    });

    return response.choices[0]?.message?.content || 'Failed to generate summary';
  } catch (error) {
    console.error('Error generating summary:', error);
    return 'Failed to generate summary';
  }
};