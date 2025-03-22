import React, { useEffect, useState } from 'react';
import { FileText, Plus, Loader2 } from 'lucide-react';
import { useNoteStore } from '../store/noteStore';
import { Note } from '../types';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Editor from '../components/Editor';

function Notes() {
  const { 
    notes, 
    loading, 
    error,
    fetchNotes, 
    createNote, 
    updateNote, 
    deleteNote,
  } = useNoteStore();
  
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const noteId = searchParams.get('id');

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    if (noteId) {
      const note = notes.find(n => n.id === noteId);
      if (note) {
        if (editingNote?.id !== note.id) {
          setEditingNote(note);
          setEditedContent(note.content);
          setEditedTitle(note.title);
          setHasChanges(false);
        }
      }
    } else {
      setEditingNote(null);
      setEditedContent('');
      setEditedTitle('');
      setHasChanges(false);
    }
  }, [noteId, notes, editingNote?.id]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTitle(e.target.value);
    setHasChanges(true);
  };

  const handleContentChange = (content: string) => {
    setEditedContent(content);
    setHasChanges(true);
  };

  const handleCreateNote = async () => {
    if (!newNoteTitle.trim()) return;
    
    try {
      await createNote(newNoteTitle, newNoteContent);
      setIsCreatingNote(false);
      setNewNoteTitle('');
      setNewNoteContent('');
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleSaveNote = async () => {
    if (editingNote) {
      try {
        await updateNote(editingNote.id, editedTitle, editedContent);
        setHasChanges(false);
      } catch (error) {
        console.error('Error updating note:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    if (editingNote) {
      setEditedContent(editingNote.content);
      setEditedTitle(editingNote.title);
      setHasChanges(false);
      navigate('/notes');
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await deleteNote(id);
    }
  };

  const renderMainContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      );
    }

    if (isCreatingNote) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">New Note</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="noteTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Note Title <span className="text-red-500">*</span>
              </label>
              <input
                id="noteTitle"
                type="text"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="Enter a title for your note"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="noteContent" className="block text-sm font-medium text-gray-700 mb-1">
                Note Content
              </label>
              <Editor
                content={newNoteContent}
                onChange={setNewNoteContent}
                placeholder="Write your note here..."
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setIsCreatingNote(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNote}
                disabled={!newNoteTitle.trim()}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
                type="button"
              >
                Create Note
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (editingNote) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="mb-4">
            <label htmlFor="editNoteTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Note Title
            </label>
            <input
              id="editNoteTitle"
              type="text"
              value={editedTitle}
              onChange={handleTitleChange}
              className="w-full px-3 py-2 text-2xl font-bold text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Enter note title"
            />
          </div>
          <Editor
            content={editedContent}
            onChange={handleContentChange}
            placeholder="Write your note here..."
          />
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveNote}
              disabled={!editedTitle.trim() || !hasChanges}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
              type="button"
            >
              Save Changes
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-2">Welcome to Notes</h2>
            <p className="text-gray-600">
              Select a note from the sidebar to view its contents, or create a new note to get started.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
          <p className="text-gray-600 mt-2">
            Manage your notes and automatically extract tasks
          </p>
        </div>
        <button
          onClick={() => setIsCreatingNote(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Note
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded mb-6">{error}</div>
      )}

      {renderMainContent()}
    </div>
  );
}

export default Notes;