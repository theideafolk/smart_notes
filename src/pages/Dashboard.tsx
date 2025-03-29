import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, ChevronDown, ChevronUp, MessageSquare, Send } from 'lucide-react';
import { useState } from 'react';
import { useNoteStore } from '../store/noteStore';
import { useSidebarStore } from '../store/sidebarStore';

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

function Dashboard() {
  const navigate = useNavigate();
  const { notes, loading: notesLoading } = useNoteStore();
  const { isOpen } = useSidebarStore();
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Get notes based on expanded state
  const displayedNotes = isExpanded 
    ? notes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    : notes
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

  const handleBrainStorm = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/chatbot', { state: { query } });
  };

  const renderContent = (content: string) => {
    return (
      <div 
        className="text-sm text-gray-600 line-clamp-6 flex-grow overflow-hidden"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Recent Notes Board */}
      <div className="relative">
        {/* Board Background */}
        <div 
          className="absolute inset-0 bg-blue-900 rounded-lg shadow-xl"
          style={{
            backgroundImage: `
              radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.2) 1px, transparent 0),
              linear-gradient(45deg, rgb(30, 58, 138), rgb(30, 64, 175))
            `,
            backgroundSize: '20px 20px, 100% 100%',
          }}
        />
        
        {/* Board Frame */}
        <div className="relative rounded-lg p-8 shadow-inner">
          <h2 className="text-white text-xl font-semibold mb-6 text-center">
            {isExpanded ? 'Your Notes' : 'Recent Notes'}
          </h2>
          
          {/* Notes Grid */}
          <div className={`grid gap-6 transition-all duration-300 ${
            isExpanded ? 'grid-cols-4' : 'grid-cols-5'
          }`}>
            {notesLoading ? (
              <div className="col-span-full text-center py-8 text-white">Loading notes...</div>
            ) : displayedNotes.length === 0 ? (
              <div className="col-span-full text-center py-8 text-white">No notes yet</div>
            ) : (
              displayedNotes.map((note: Note) => (
                <Link
                  key={note.id}
                  to={`/notes/${note.id}`}
                  className={`
                    block p-4 
                    bg-white 
                    rounded-md
                    shadow-lg
                    hover:shadow-xl
                    transition-all 
                    duration-300 
                    ease-in-out 
                    hover:-translate-y-1 
                    min-h-[200px]
                    max-h-[250px]
                    relative
                    flex 
                    flex-col
                    overflow-hidden
                    border border-blue-100
                  `}
                  style={{
                    backgroundImage: 'linear-gradient(to bottom, transparent 95%, rgba(59, 130, 246, 0.05))'
                  }}
                >
                  <h3 className="font-medium text-base mb-2 line-clamp-1 text-blue-900">{note.title}</h3>
                  {renderContent(note.content)}
                  <span className="text-xs text-blue-400 mt-auto pt-2">
                    {new Date(note.created_at).toLocaleDateString()}
                  </span>
                </Link>
              ))
            )}
          </div>

          {/* Expand/Collapse Arrow - Moved below the grid */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white hover:bg-blue-800/50 rounded-full p-2 transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-6 h-6" />
              ) : (
                <ChevronDown className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Brain Storm Section or Ask your Notes Button */}
      {isExpanded ? (
        <div className={`fixed bottom-8 transition-all duration-300 ${isOpen ? 'left-[270px]' : 'left-8'}`}>
          <button
            onClick={() => navigate('/chatbot')}
            className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors shadow-lg text-lg font-medium"
          >
            <MessageSquare className="w-6 h-6" />
            Ask your Notes
          </button>
        </div>
      ) : (
        <div className="bg-transparent px-4 mb-8 mt-8 max-w-5xl mx-auto w-full">
          <h2 className="text-xl font-semibold mb-6 text-blue-900 text-center">Ask your Notes</h2>
          <form onSubmit={handleBrainStorm} className="relative flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Brain Storm with your notes"
              className="w-full px-10 py-4 rounded-full bg-white/95 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm text-gray-600 placeholder-gray-400 text-lg"
            />
            <button
              type="submit"
              disabled={!query.trim()}
              className="absolute right-3 flex items-center justify-center bg-blue-400 hover:bg-blue-500 text-white p-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
        </div>
      )}

      {/* New Notes Button */}
      <div className="fixed bottom-8 right-8">
        <Link
          to="/notes"
          className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors shadow-lg text-lg font-medium"
        >
          <Plus className="w-6 h-6" />
          Notes
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;