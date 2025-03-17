import React, { useEffect, useState } from 'react';
import { FileText, Plus, Loader2, X } from 'lucide-react';
import { useNoteStore } from '../store/noteStore';
import NoteCard from '../components/NoteCard';
import CreateNoteDialog from '../components/CreateNoteDialog';
import NoteSearch from '../components/NoteSearch';
import AiAnswer from '../components/AiAnswer';
import { Note } from '../types';

function Notes() {
  const { 
    notes, 
    loading, 
    error, 
    searching, 
    searchResult, 
    fetchNotes, 
    createNote, 
    updateNote, 
    deleteNote,
    searchNotes,
    clearSearchResult
  } = useNoteStore();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCreateNote = async (title: string, content: string) => {
    await createNote(title, content);
    setIsCreateDialogOpen(false);
  };

  const handleEditNote = async (title: string, content: string) => {
    if (editingNote) {
      await updateNote(editingNote.id, title, content);
      setEditingNote(null);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await deleteNote(id);
    }
  };

  const handleSearch = async (query: string) => {
    await searchNotes(query);
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
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Note
        </button>
      </div>

      <div className="mb-8">
        <NoteSearch onSearch={handleSearch} isSearching={searching} />
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded mb-6">{error}</div>
      )}

      {searchResult && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Search Results</h2>
            <button 
              onClick={clearSearchResult}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <AiAnswer 
            query={searchResult.query}
            answer={searchResult.answer}
            relatedNotes={searchResult.relatedNotes}
          />
        </div>
      )}

      <div className="grid gap-6">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : notes.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">No notes yet</p>
                <p className="text-gray-600 mt-1">
                  Create your first note to get started
                </p>
              </div>
            </div>
          </div>
        ) : (
          notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={setEditingNote}
              onDelete={handleDeleteNote}
            />
          ))
        )}
      </div>

      <CreateNoteDialog
        isOpen={isCreateDialogOpen || !!editingNote}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setEditingNote(null);
        }}
        onSave={editingNote ? handleEditNote : handleCreateNote}
        initialTitle={editingNote?.title || ''}
        initialContent={editingNote?.content || ''}
      />
    </div>
  );
}

export default Notes;