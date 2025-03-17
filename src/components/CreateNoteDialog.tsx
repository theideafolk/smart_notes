import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import Editor from './Editor';

interface CreateNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, content: string) => Promise<void>;
  initialTitle?: string;
  initialContent?: string;
}

export default function CreateNoteDialog({
  isOpen,
  onClose,
  onSave,
  initialTitle = '',
  initialContent = '',
}: CreateNoteDialogProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [showTitleError, setShowTitleError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setContent(initialContent);
      setShowTitleError(false);
    }
  }, [isOpen, initialTitle, initialContent]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!title.trim()) {
      setShowTitleError(true);
      return;
    }
    
    try {
      setIsSaving(true);
      await onSave(title, content);
      setTitle('');
      setContent('');
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (showTitleError && e.target.value.trim()) {
      setShowTitleError(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{initialTitle ? 'Edit Note' : 'New Note'}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-auto flex flex-col gap-4">
          {/* Title input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="noteTitle" className="block text-sm font-medium text-gray-700">
                Note Title <span className="text-red-500">*</span>
              </label>
              {showTitleError && (
                <div className="flex items-center text-red-500 text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Title is required
                </div>
              )}
            </div>
            <input
              id="noteTitle"
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Enter a title for your note"
              className={`w-full px-3 py-2 border ${
                showTitleError ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary`}
              required
              autoFocus
            />
          </div>

          {/* Content editor */}
          <div>
            <label htmlFor="noteContent" className="block text-sm font-medium text-gray-700 mb-1">
              Note Content
            </label>
            <Editor
              content={content}
              onChange={handleContentChange}
              placeholder="Write your note here..."
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 p-4 border-t">
          <div className="text-sm text-gray-500 italic">
            {!title.trim() && 'A title is required to save your note'}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim() || isSaving}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              type="button"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSaving ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}