import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface NoteSearchProps {
  onSearch: (query: string) => Promise<void>;
  isSearching: boolean;
}

export default function NoteSearch({ onSearch, isSearching }: NoteSearchProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      await onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question about your notes..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <button
          type="submit"
          disabled={!query.trim() || isSearching}
          className="absolute inset-y-0 right-0 flex items-center px-4 text-sm font-medium text-white bg-primary rounded-r-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          ) : (
            'Ask'
          )}
        </button>
      </div>
    </form>
  );
}