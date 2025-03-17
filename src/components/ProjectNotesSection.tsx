import React, { useState, useEffect } from 'react';
import { FileText, Pencil, Trash2, Loader2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import type { Note } from '../types';
import { useNoteStore } from '../store/noteStore';
import CreateNoteDialog from './CreateNoteDialog';

interface ProjectNotesSectionProps {
  projectId: string;
}

export default function ProjectNotesSection({ projectId }: ProjectNotesSectionProps) {
  const { notes, loading, error, fetchProjectNotes, createProjectNote, updateNote, deleteNote } = useNoteStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  useEffect(() => {
    fetchProjectNotes(projectId);
  }, [projectId, fetchProjectNotes]);

  const handleCreateNote = async (title: string, content: string) => {
    try {
      await createProjectNote(title, content, projectId);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating note:', error);
    }
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

  const projectNotes = notes.filter(note => note.project_id === projectId);

  return (
    <div className="space-y-4 mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Project Notes</h3>
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2 text-sm bg-primary text-white px-3 py-1.5 rounded hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Note
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          {error}
        </div>
      )}
      
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </div>
        ) : projectNotes.length === 0 ? (
          <div className="bg-gray-50 p-4 rounded-md text-center">
            <p className="text-sm text-gray-500">No notes for this project yet</p>
          </div>
        ) : (
          projectNotes.map((note) => (
            <div key={note.id} className="bg-white p-4 rounded-md border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-primary/10 rounded mt-0.5">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{note.title}</h4>
                    <div
                      className="prose prose-sm max-w-none mt-1 line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: note.content }}
                    />
                    <div className="mt-2 text-xs text-gray-500">
                      {format(new Date(note.created_at), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingNote(note)}
                    className="p-1.5 text-gray-500 hover:text-primary transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1.5 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
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