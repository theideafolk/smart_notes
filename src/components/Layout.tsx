import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Brain,
  FileText,
  Calendar as CalendarIcon,
  Users,
  Briefcase,
  BarChart2,
  Settings as SettingsIcon,
  Trash2,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useNoteStore } from '../store/noteStore';
import { useChatStore } from '../store/chatStore';
import { useSidebarStore } from '../store/sidebarStore';
import { useEffect } from 'react';

const navItems = [
  { path: '/notes', icon: FileText, label: 'Notes' },
  { path: '/chatbot', icon: MessageSquare, label: 'Chatbot' },
];

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { notes, fetchNotes, deleteNote } = useNoteStore();
  const { sessions, fetchSessions, setCurrentSession } = useChatStore();
  const { isOpen, toggle } = useSidebarStore();

  useEffect(() => {
    fetchNotes();
    fetchSessions();
  }, [fetchNotes, fetchSessions]);

  const handleDeleteNote = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(id);
        // After successful deletion, navigate to /notes if we're viewing the deleted note
        const currentNoteId = new URLSearchParams(location.search).get('id');
        if (currentNoteId === id) {
          navigate('/notes');
        }
      } catch (error) {
        console.error('Error deleting note:', error);
        alert('Failed to delete note. Please try again.');
      }
    }
  };

  const handleChatbotClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate('/chatbot');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className={`
        bg-white border-r border-gray-200 flex flex-col transition-all duration-300
        ${isOpen ? 'w-64' : 'w-0 overflow-hidden'}
      `}>
        {/* Fixed header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <button 
              onClick={handleLogoClick}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Brain className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-primary">SmartNotes</span>
            </button>
            <button
              onClick={toggle}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <PanelLeftClose className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Scrollable navigation */}
        <nav className="flex-1 overflow-y-auto">
          <div className="py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <div key={item.path}>
                  <Link
                    to={item.path}
                    onClick={item.label === 'Chatbot' ? handleChatbotClick : undefined}
                    className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-primary bg-primary/5'
                        : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                  
                  {/* Display notes under Notes menu item */}
                  {item.label === 'Notes' && isActive && (
                    <div className="ml-6 mt-2 border-l-2 border-gray-100 pl-3">
                      {notes.map((note) => (
                        <div
                          key={note.id}
                          className="group relative py-2 px-4 hover:bg-gray-50"
                        >
                          <Link
                            to={`/notes?id=${note.id}`}
                            className="block text-sm text-gray-600 hover:text-primary truncate pr-16"
                          >
                            {note.title}
                          </Link>
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-2">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleDeleteNote(note.id);
                              }}
                              className="p-1 text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Display chat sessions under Chatbot menu item */}
                  {item.label === 'Chatbot' && isActive && (
                    <div className="ml-6 mt-2 border-l-2 border-gray-100 pl-3">
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className="group relative py-2 px-4 hover:bg-gray-50"
                        >
                          <Link
                            to={`/chatbot?session=${session.id}`}
                            className="block w-full text-left text-sm text-gray-600 hover:text-primary truncate pr-4"
                          >
                            {session.title}
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto relative">
        {/* Small toggle button that's only visible when sidebar is closed */}
        {!isOpen && (
          <button
            onClick={toggle}
            className="absolute top-4 left-4 z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
          >
            <PanelLeftOpen className="w-5 h-5 text-gray-600" />
          </button>
        )}
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;