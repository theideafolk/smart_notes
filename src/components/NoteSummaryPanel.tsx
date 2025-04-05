import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { openai } from '../lib/openai';

interface NoteSummaryPanelProps {
  noteId: string;
  noteContent: string;
}

interface OutletContextType {
  isRightPanelOpen: boolean;
  setIsRightPanelOpen: (isOpen: boolean) => void;
}

// Function to generate and store a note summary
export async function generateAndStoreSummary(noteId: string, noteContent: string, forceUpdate: boolean = false): Promise<string> {
  try {
    // First, try to fetch existing summary from the database
    if (!forceUpdate) {
      const { data: existingSummary } = await supabase
        .from('note_summaries')
        .select('summary')
        .eq('note_id', noteId)
        .single();

      if (existingSummary?.summary) {
        return existingSummary.summary;
      }
    }

    // Generate the structured summary
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: noteContent.length > 500 
            ? `You are a helpful assistant that creates well-organized summaries of product notes. Format your response in two parts:

1. **TL;DR (up to 5 bullet points)**  
Highlight only the most critical, high-level takeaways from the note — such as the app's core purpose, main features, and key technologies. Avoid detail or repetition. Include only the most important points, even if that means fewer than 5 bullet points.

2. **Full Summary (as many points as needed)**  
List only the valuable and distinct insights that help the reader understand the project. Do not repeat content from the TL;DR unless you're adding new context or detail. Include specific UX interactions or structural elements (e.g., how customization works, user flows, or tech stack). Keep each bullet short and focused — prefer brief, scannable points over long paragraphs.

Format your output like this:

**TL;DR**
• ...
• ...
• ...

**Full Summary**
• ...
• ...
• ...`
            : `You are a helpful assistant that creates concise summaries of product notes. Format your response as a TL;DR with up to 5 bullet points.

**TL;DR (up to 5 bullet points)**  
Highlight only the most critical, high-level takeaways from the note — such as the app's core purpose, main features, and key technologies. Avoid detail or repetition. Include only the most important points, even if that means fewer than 5 bullet points.

Format your output like this:

**TL;DR**
• ...
• ...
• ...`
        },
        {
          role: "user",
          content: `Please provide a well-organized summary of this note following the format above:\n\n${noteContent}`
        }
      ],
      max_tokens: noteContent.length > 500 ? 800 : 400,
      temperature: 0.7,
    });

    const generatedSummary = completion.choices[0].message.content || 'No summary generated.';

    // Upsert the summary in Supabase
    const { error } = await supabase
      .from('note_summaries')
      .upsert({
        note_id: noteId,
        summary: generatedSummary,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'note_id'
      });

    if (error) {
      console.error('Error upserting summary:', error);
      throw error;
    }

    return generatedSummary;
  } catch (error) {
    console.error('Error generating/storing summary:', error);
    throw error;
  }
}

const NoteSummaryPanel: React.FC<NoteSummaryPanelProps> = ({ noteId, noteContent }) => {
  const { isRightPanelOpen } = useOutletContext<OutletContextType>();
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastContent, setLastContent] = useState<string>('');

  useEffect(() => {
    const fetchOrGenerateSummary = async () => {
      if (!noteContent) return;
      
      // Only fetch/generate if content has changed
      if (noteContent !== lastContent) {
        setIsLoading(true);
        try {
          const generatedSummary = await generateAndStoreSummary(noteId, noteContent, true); // Force update since content changed
          setSummary(generatedSummary);
          setLastContent(noteContent); // Update last content after successful fetch
        } catch (error) {
          console.error('Error handling summary:', error);
          setSummary('Failed to generate summary. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchOrGenerateSummary();
  }, [noteId, noteContent, lastContent]);

  if (!isRightPanelOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-lg overflow-y-auto z-10">
      <div className="p-6 pt-16">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Note Summary</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : (
          <div className="prose prose-sm max-w-none space-y-4">
            {summary.split('\n').map((point, index) => {
              // Skip empty lines
              if (!point.trim()) return null;
              
              const text = point.trim();
              
              // Check if it's a main section header (starts with ** and ends with ** or **:)
              if (text.startsWith('**') && (text.endsWith('**') || text.endsWith('**:'))) {
                return (
                  <div key={index} className="mt-6 first:mt-0">
                    <h3 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      {text.replace(/\*\*/g, '').replace(/:$/, '')}
                    </h3>
                  </div>
                );
              }

              // Check if it's a sub-heading (text contains ** around it)
              const subHeadingMatch = text.match(/\*\*(.*?)\*\*/);
              if (subHeadingMatch) {
                return (
                  <div key={index} className="mt-4 first:mt-0">
                    <h4 className="text-sm font-medium text-gray-800">
                      {subHeadingMatch[1].replace(/:$/, '')}
                    </h4>
                  </div>
                );
              }
              
              // Clean up the text by removing any existing bullet points or dashes
              let cleanText = text;
              if (cleanText.startsWith('•') || cleanText.startsWith('-')) {
                cleanText = cleanText.substring(1).trim();
              }
              
              // If it's a regular line (not a header), show bullet point
              return (
                <div key={index} className="flex items-start gap-2 pl-4">
                  <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <div className="prose prose-sm max-w-none text-gray-700">{cleanText}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteSummaryPanel; 