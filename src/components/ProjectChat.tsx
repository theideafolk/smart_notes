import React, { useState, useRef, useEffect } from 'react';
import { Send, X, User, Bot, ExternalLink, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useProjectStore } from '../store/projectStore';
import type { ChatMessage } from '../types';

interface ProjectChatProps {
  projectId: string;
  onClose?: () => void;
}

export default function ProjectChat({ projectId, onClose }: ProjectChatProps) {
  const [message, setMessage] = useState('');
  const { chatMessages, chatLoading, chatError, sendChatMessage } = useProjectStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const projectMessages = chatMessages[projectId] || [];
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [projectMessages]);
  
  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || chatLoading) return;
    
    await sendChatMessage(projectId, message.trim());
    setMessage('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };
  
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Project Assistant</h2>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {projectMessages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Bot className="w-12 h-12 mx-auto mb-3 text-primary/50" />
            <p className="text-lg font-medium">How can I help with your project?</p>
            <p className="text-sm mt-2">
              Ask me about your project files, notes, or any questions you have.
            </p>
          </div>
        ) : (
          projectMessages.map((msg) => (
            <ChatMessageItem key={msg.id} message={msg} />
          ))
        )}
        
        {chatLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Thinking...</span>
          </div>
        )}
        
        {chatError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            Error: {chatError}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled={chatLoading}
          />
          <button
            type="submit"
            disabled={!message.trim() || chatLoading}
            className="p-2 bg-primary text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </>
  );
}

interface ChatMessageItemProps {
  message: ChatMessage;
}

function ChatMessageItem({ message }: ChatMessageItemProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Bot className="w-5 h-5 text-primary" />
        </div>
      )}
      
      <div className={`max-w-[80%] ${isUser ? 'order-1' : 'order-2'}`}>
        <div
          className={`p-3 rounded-lg ${
            isUser
              ? 'bg-primary text-white rounded-tr-none'
              : 'bg-gray-100 text-gray-800 rounded-tl-none'
          }`}
        >
          {message.content}
          
          {message.source && (
            <div className="mt-2 text-xs flex items-center gap-1">
              <span className={isUser ? 'text-primary-50' : 'text-gray-500'}>
                Source: {message.source}
              </span>
              {message.source === 'web_search' && (
                <ExternalLink className="w-3 h-3" />
              )}
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-500 mt-1">
          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
        </div>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-gray-600" />
        </div>
      )}
    </div>
  );
} 