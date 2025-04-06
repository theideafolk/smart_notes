import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader2, Bot, User, FileText } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { useNoteStore } from '../store/noteStore';
import { format } from 'date-fns';
import { useSearchParams, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const MessageBubble = ({ message }: { message: any }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
        ${isUser ? 'bg-blue-500' : 'bg-gray-200'}
      `}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-gray-700" />
        )}
      </div>

      {/* Message Content */}
      <div className={`
        group relative flex-1 max-w-[80%]
        ${isUser ? 'items-end' : 'items-start'}
      `}>
        <div className={`
          rounded-2xl px-4 py-2 shadow-sm
          ${isUser 
            ? 'bg-blue-500 text-white rounded-tr-none' 
            : 'bg-white border border-gray-200 rounded-tl-none'
          }
        `}>
          {message.pending ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Thinking...</span>
            </div>
          ) : (
            <div className={`
              prose prose-sm max-w-none
              ${isUser 
                ? 'prose-invert' 
                : 'prose-blue'
              }
            `}>
              <ReactMarkdown>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        <div className={`
          text-xs text-gray-500 mt-1
          ${isUser ? 'text-right' : 'text-left'}
        `}>
          {format(new Date(message.created_at), 'HH:mm')}
        </div>
      </div>
    </div>
  );
};

export default function Chatbot() {
  const {
    messages,
    loading,
    sendMessage,
    clearSession,
    currentSession,
    setCurrentSession
  } = useChatStore();
  const { notes } = useNoteStore();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [input, setInput] = useState('');
  const [showNoteDropdown, setShowNoteDropdown] = useState(false);
  const [selectedNote, setSelectedNote] = useState<{ id: string; title: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNoteDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle session changes and initial load
  useEffect(() => {
    const sessionId = searchParams.get('session');
    const query = searchParams.get('q');

    if (sessionId) {
      setCurrentSession(sessionId);
    } else if (query && !loading && messages.length === 0) {
      // If there's a query parameter but no session, create a new session with the query
      sendMessage(query);
    } else if (location.pathname === '/chatbot' && !location.search) {
      clearSession();
    }
  }, [location.pathname, location.search, clearSession, setCurrentSession, searchParams, loading, messages.length, sendMessage]);

  useEffect(() => {
    // Scroll to bottom of messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    
    // Get the cursor position
    const cursorPosition = e.target.selectionStart || 0;
    
    // Find the word being typed at cursor position
    const textBeforeCursor = value.slice(0, cursorPosition);
    const atSignIndex = textBeforeCursor.lastIndexOf('@');
    
    // Show dropdown when:
    // 1. There's an @ character
    // 2. No note is selected yet
    // 3. The @ is the last special character (no space after it)
    if (
      atSignIndex !== -1 && 
      !selectedNote &&
      !textBeforeCursor.slice(atSignIndex).includes(' ')
    ) {
      setShowNoteDropdown(true);
    } else {
      setShowNoteDropdown(false);
    }
  };

  const handleNoteSelect = (note: { id: string; title: string }) => {
    setSelectedNote(note);
    setShowNoteDropdown(false);

    // Get the text before and after the @
    const cursorPosition = input.indexOf('@');
    const beforeAt = input.slice(0, cursorPosition);
    const afterAt = input.slice(cursorPosition).replace(/@[^@\s]*/, '');

    // Replace the @ and any partial text after it with the note title
    setInput(`${beforeAt}@${note.title}${afterAt}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const message = input;
    setInput('');
    setSelectedNote(null);
    await sendMessage(message, selectedNote?.id);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <Bot className="w-6 h-6 text-blue-500" />
          <div>
            <h1 className="text-lg font-semibold text-gray-900">AI Assistant</h1>
            <p className="text-sm text-gray-500">Ask me anything about your notes</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-blue-500/50" />
              <p className="text-lg font-medium">Start a New Chat</p>
              <p className="text-sm mt-2">
                Type your message below to begin a conversation.<br />
                Use @ to mention and search within specific notes.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message... (Use @ to mention notes)"
                className="w-full px-4 py-3 pr-24 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
                autoFocus
              />
              
              {/* Note Dropdown */}
              {showNoteDropdown && (
                <div 
                  ref={dropdownRef}
                  className="absolute bottom-full left-0 mb-2 w-full max-h-60 overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-200"
                >
                  {notes.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500">
                      No notes found
                    </div>
                  ) : (
                    notes.map((note) => (
                      <button
                        key={note.id}
                        onClick={() => handleNoteSelect(note)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                        type="button"
                      >
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{note.title}</span>
                      </button>
                    ))
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 