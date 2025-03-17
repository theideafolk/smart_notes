import React, { useEffect, useState } from 'react';
import { Briefcase, Plus, Loader2, Filter, Search } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import ProjectCard from '../components/ProjectCard';
import CreateProjectDialog from '../components/CreateProjectDialog';
import type { Project } from '../types';

function Projects() {
  const { 
    projects, 
    loading, 
    error, 
    fetchProjects, 
    createProject, 
    updateProject, 
    deleteProject,
    updateProjectStatus 
  } = useProjectStore();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (name: string, description: string, clientId?: string) => {
    await createProject(name, description, clientId);
    setIsCreateDialogOpen(false);
  };

  const handleUpdateProject = async (
    name: string, 
    description: string, 
    clientId?: string
  ) => {
    if (editingProject) {
      await updateProject(editingProject.id, {
        name,
        description,
        client_id: clientId || null,
      });
      setEditingProject(null);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      await deleteProject(id);
    }
  };
  
  // Filter projects based on search query and status
  const filteredProjects = projects
    .filter(project => {
      // First filter by status
      if (filterStatus !== 'all' && project.status !== filterStatus) {
        return false;
      }
      
      // Then by search query
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return (
          project.name.toLowerCase().includes(searchLower) ||
          (project.description && project.description.toLowerCase().includes(searchLower)) ||
          (project.clients && project.clients.name.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-2">Track and manage your projects</p>
        </div>
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </div>

      {/* Search and Filter controls */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter Status:</span>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">All Projects</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded mb-6">{error}</div>
      )}

      <div className="grid gap-6">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">
                  {searchQuery || filterStatus !== 'all' 
                    ? 'No projects match your search/filter criteria' 
                    : 'No projects yet'
                  }
                </p>
                <p className="text-gray-600 mt-1">
                  {searchQuery || filterStatus !== 'all' 
                    ? 'Try changing your search term or filter' 
                    : 'Create your first project to get started'
                  }
                </p>
              </div>
            </div>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={setEditingProject}
              onDelete={handleDeleteProject}
              onUpdateStatus={updateProjectStatus}
            />
          ))
        )}
      </div>

      <CreateProjectDialog
        isOpen={isCreateDialogOpen || !!editingProject}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setEditingProject(null);
        }}
        onSave={editingProject ? handleUpdateProject : handleCreateProject}
        initialData={
          editingProject
            ? {
                name: editingProject.name,
                description: editingProject.description,
                clientId: editingProject.client_id,
              }
            : undefined
        }
      />
    </div>
  );
}

export default Projects;