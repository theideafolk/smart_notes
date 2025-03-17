import React from 'react';
import { Brain, Lightbulb } from 'lucide-react';
import { Note } from '../types';

interface AiAnswerProps {
  query: string;
  answer: string;
  relatedNotes: Note[];
}

export default function AiAnswer({ query, answer, relatedNotes }: AiAnswerProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 bg-primary/5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <p className="font-medium text-gray-900">{query}</p>
        </div>
      </div>
      <div className="p-4">
        <div className="prose prose-sm max-w-none">
          {answer.split('\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>
      {relatedNotes.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <p className="text-sm font-medium text-gray-700">Based on these notes:</p>
          </div>
          <div className="space-y-2">
            {relatedNotes.map((note) => (
              <div key={note.id} className="text-sm text-gray-600 bg-white p-2 rounded border border-gray-200">
                <p className="font-medium">{note.title}</p>
                <div 
                  className="prose prose-sm max-w-none prose-p:my-1 mt-1" 
                  dangerouslySetInnerHTML={{ 
                    __html: note.content.length > 150 
                      ? note.content.substring(0, 150) + '...' 
                      : note.content 
                  }} 
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}