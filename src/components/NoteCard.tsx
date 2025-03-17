import React, { useState } from 'react';
import { format } from 'date-fns';
import { FileText, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { Note } from '../types';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export default function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Function to extract plain text from HTML content
  const extractPlainText = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  // Get a preview of the content (max 5 lines or 120 characters)
  const getContentPreview = () => {
    const plainText = extractPlainText(note.content);
    const lines = plainText.split('\n').slice(0, 5);
    const preview = lines.join('\n');
    
    if (preview.length > 120) {
      return preview.substring(0, 120) + '...';
    }
    
    return preview;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="p-3 bg-primary/10 rounded">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            {/* Note title */}
            <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
            
            {/* Note preview - only shown when not expanded */}
            {!expanded && (
              <div className="mt-2 text-gray-600 whitespace-pre-line">
                {getContentPreview()}
              </div>
            )}
            
            {/* Full content - only shown when expanded */}
            {expanded && (
              <div
                className="mt-2 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: note.content }}
              />
            )}
            
            {/* Show more/less button */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 flex items-center text-sm text-primary hover:text-primary/80"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Show more
                </>
              )}
            </button>
            
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
              <span>{format(new Date(note.created_at), 'MMM d, yyyy')}</span>
              {note.client_id && <span>Client Project</span>}
              {note.project_id && <span>Project Note</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(note)}
            className="p-2 text-gray-500 hover:text-primary transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}