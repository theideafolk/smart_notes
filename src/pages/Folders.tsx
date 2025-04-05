import { useState, useEffect } from 'react';
import { useFolderStore, Folder } from '../store/folderStore';
import { useNoteStore } from '../store/noteStore';
import { FolderIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { Search } from 'lucide-react';
import type { Note } from '../types';
import { searchSimilarNotes } from '../services/searchService';

export default function Folders() {
  const { folders, loading: foldersLoading, error: foldersError, fetchFolders } = useFolderStore();
  const { notes, fetchNotes } = useNoteStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchFolders();
    fetchNotes();
  }, [fetchFolders, fetchNotes]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // First ensure we have all notes loaded
      await fetchNotes();
      
      // Search only within our existing notes
      const results = await searchSimilarNotes(searchQuery);
      
      // Filter results to only include notes that exist in our notes array
      const validResults = results.filter(result => 
        notes.some(note => note.id === result.id)
      );
      
      setSearchResults(validResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  if (foldersLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (foldersError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">Error: {foldersError}</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 p-6">
      <div className="w-full max-w-2xl mx-auto mb-8">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in folders..."
            className="w-full h-14 px-6 pr-12 text-lg bg-white border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <button 
              type="submit"
              className="p-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
              disabled={isSearching}
            >
              <Search className={`w-5 h-5 ${isSearching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </form>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="w-full max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">Search Results</h2>
          <div className="space-y-4">
            {searchResults.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-2">{note.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">{note.content}</p>
                {note.folder_id && folders.find(f => f.id === note.folder_id) && (
                  <div className="mt-2 flex items-center gap-2">
                    <FolderIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {folders.find(f => f.id === note.folder_id)?.name}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {searchQuery && !isSearching && searchResults.length === 0 && (
        <div className="w-full max-w-2xl mx-auto">
          <div className="text-center text-gray-500">
            No relevant notes found for "{searchQuery}". Your search term appears to be about topics not covered in your notes.
          </div>
        </div>
      )}
    </div>
  );
} 