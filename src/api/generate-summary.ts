import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

interface NoteContent {
  id: string;
  content: string;
}

export async function generateSummary(note: NoteContent) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that creates concise summaries of notes. Focus on the main points and key takeaways."
        },
        {
          role: "user",
          content: `Please provide a concise summary of this note:\n\n${note.content}`
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const summary = completion.choices[0].message.content;

    // Store the summary in Supabase for future reference
    await supabase
      .from('note_summaries')
      .upsert({
        note_id: note.id,
        summary: summary,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    return { summary };
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error('Failed to generate summary');
  }
} 