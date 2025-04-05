import React, { useEffect, useState } from 'react';
import { FileText, Plus, Loader2 } from 'lucide-react';
import { useNoteStore, type Note } from '../store/noteStore';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Editor from '../components/Editor';
import NoteSummaryPanel from '../components/NoteSummaryPanel';

function Notes() {
  const { 
    notes, 
    loading, 
    error,
    fetchNotes, 
    createNote, 
    updateNote, 
    deleteNote,
    fetchFolderNotes
  } = useNoteStore();
  
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const noteId = searchParams.get('id');
  const folderId = searchParams.get('folderId');

  useEffect(() => {
    console.log('Notes component mounted/updated with:', { noteId, folderId });
    console.log('Current notes:', notes);
    if (folderId) {
      console.log('Fetching notes for folder:', folderId);
      fetchFolderNotes(folderId);
    } else {
      console.log('Fetching all notes');
      fetchNotes();
    }
  }, [fetchNotes, fetchFolderNotes, folderId]);

  useEffect(() => {
    console.log('Note ID changed:', noteId);
    console.log('Folder ID changed:', folderId);
    if (!noteId) {
      console.log('Resetting form state for new note');
      setEditingNote(null);
      setEditedContent('');
      setEditedTitle('');
      setNewNoteTitle('');
      setNewNoteContent('');
      setHasChanges(false);
    }
  }, [noteId, folderId]);

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
    }
  }, [noteId, notes, editingNote?.id]);

  const handleTitleChange = (title: string) => {
    if (editingNote) {
      setEditedTitle(title);
    } else {
      setNewNoteTitle(title);
    }
    setHasChanges(true);
  };

  const handleContentChange = (content: string) => {
    if (editingNote) {
      setEditedContent(content);
    } else {
      setNewNoteContent(content);
    }
    setHasChanges(true);
  };

  const handleCreateNote = async () => {
    if (!newNoteTitle.trim()) return;
    
    try {
      await createNote(newNoteTitle, newNoteContent, folderId || undefined);
      setNewNoteTitle('');
      setNewNoteContent('');
      setHasChanges(false);
      if (folderId) {
        navigate(`/folders?id=${folderId}`);
      }
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
    } else {
      if (folderId) {
        navigate(`/folders?id=${folderId}`);
      } else {
        navigate('/notes');
      }
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await deleteNote(id);
    }
  };

  const renderMainContent = () => {
    console.log('Rendering main content with:', { noteId, editingNote, folderId });
    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      );
    }

    if (!noteId || editingNote) {
      console.log('Showing editor for:', editingNote ? 'editing note' : 'new note');
      return (
        <div className="absolute inset-0 flex flex-col">
          <div className="flex-1">
            <Editor
              content={editingNote ? editedContent : newNoteContent}
              title={editingNote ? editedTitle : newNoteTitle}
              onChangeContent={handleContentChange}
              onChangeTitle={handleTitleChange}
              placeholder="Write your note here..."
            />
          </div>
          <div className="sticky bottom-8 right-8 flex items-center justify-end gap-4 z-30 px-8">
            <button
              onClick={handleCancelEdit}
              className="px-6 py-2 text-gray-700 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={editingNote ? handleSaveNote : handleCreateNote}
              disabled={!(editingNote ? editedTitle : newNoteTitle).trim() || !hasChanges}
              className="px-6 py-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingNote ? 'Save Changes' : 'Save Note'}
            </button>
          </div>
        </div>
      );
    }

    console.log('Showing notes list');
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
          <button
            onClick={() => {
              console.log('Creating new note from list view');
              navigate('/notes?folderId=' + (folderId || ''));
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => navigate(`/notes?id=${note.id}`)}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{note.title}</h3>
              <div
                className="prose prose-sm max-w-none line-clamp-3"
                dangerouslySetInnerHTML={{ __html: note.content }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex">
      <div className="flex-1 overflow-y-auto">
        {renderMainContent()}
      </div>
      
      {editingNote && noteId && (
        <NoteSummaryPanel
          noteId={editingNote.id}
          noteContent={editingNote.content}
        />
      )}
    </div>
  );
}

export default Notes;