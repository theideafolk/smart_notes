import React, { useState } from 'react';
import { format } from 'date-fns';
import { Briefcase, Pencil, Trash2, Users, Clock, ChevronDown, ChevronUp, Paperclip, FileText, MessageSquare } from 'lucide-react';
import type { Project } from '../types';
import ProjectFilesSection from './ProjectFilesSection';
import ProjectNotesSection from './ProjectNotesSection';
import ProjectChat from './ProjectChat';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: Project['status']) => void;
}

export default function ProjectCard({ 
  project, 
  onEdit, 
  onDelete,
  onUpdateStatus
}: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'notes'>('files');
  const [showChat, setShowChat] = useState(false);
  
  const statusColors = {
    not_started: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    on_hold: 'bg-amber-100 text-amber-800',
    completed: 'bg-green-100 text-green-800',
  };

  const statusLabels = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    on_hold: 'On Hold',
    completed: 'Completed',
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as Project['status'];
    onUpdateStatus(project.id, newStatus);
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const fileCount = project.files?.length || 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="p-3 bg-primary/10 rounded">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowChat(true)}
                    className="p-2 text-gray-500 hover:text-primary transition-colors"
                    title="Chat with project assistant"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(project)}
                    className="p-2 text-gray-500 hover:text-primary transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(project.id)}
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {project.description && (
                <p className="text-gray-600 mt-2">{project.description}</p>
              )}
              
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{format(new Date(project.created_at), 'MMM d, yyyy')}</span>
                </div>
                
                {project.clients && (
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>{project.clients.name}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4" />
                  <span>{fileCount} {fileCount === 1 ? 'file' : 'files'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <select
              value={project.status}
              onChange={handleStatusChange}
              className={`text-sm font-medium px-3 py-1 rounded-full ${statusColors[project.status]}`}
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={toggleExpanded}
            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Hide details
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show details
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-100">
          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('files')}
              className={`py-2 px-4 font-medium text-sm border-b-2 ${
                activeTab === 'files'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Paperclip className="w-4 h-4" />
                Files
              </div>
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`py-2 px-4 font-medium text-sm border-b-2 ${
                activeTab === 'notes'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                Notes
              </div>
            </button>
          </div>
          
          {/* Tab content */}
          {activeTab === 'files' ? (
            <ProjectFilesSection 
              projectId={project.id} 
              files={project.files || []}
            />
          ) : (
            <ProjectNotesSection 
              projectId={project.id}
            />
          )}
        </div>
      )}
      
      {/* Chat dialog */}
      {showChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl h-[80vh] flex flex-col">
            <ProjectChat 
              projectId={project.id} 
              onClose={() => setShowChat(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}