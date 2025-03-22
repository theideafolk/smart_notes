import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Brain,
  Home,
  FileText,
  Calendar as CalendarIcon,
  Users,
  Briefcase,
  BarChart2,
  Settings as SettingsIcon,
  Trash2,
  MessageSquare
} from 'lucide-react';
import { useNoteStore } from '../store/noteStore';
import { useEffect } from 'react';

const navItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/notes', icon: FileText, label: 'Notes' },
  { path: '/chatbot', icon: MessageSquare, label: 'Chatbot' },
  { path: '/calendar', icon: CalendarIcon, label: 'Calendar' },
  { path: '/clients', icon: Users, label: 'Clients' },
  { path: '/projects', icon: Briefcase, label: 'Projects' },
  { path: '/analytics', icon: BarChart2, label: 'Analytics' },
  { path: '/settings', icon: SettingsIcon, label: 'Settings' },
];

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { notes, fetchNotes, deleteNote } = useNoteStore();

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

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

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Fixed header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-primary">SmartNotes</span>
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
                </div>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;