import React, { useEffect } from 'react';
import { Briefcase, FileText, Users } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { useNoteStore } from '../store/noteStore';
import { useClientStore } from '../store/clientStore';
import ProjectStatusBadge from '../components/ProjectStatusBadge';
import { format } from 'date-fns';

function Dashboard() {
  const { projects, loading: projectsLoading, fetchProjects } = useProjectStore();
  const { notes, loading: notesLoading, fetchNotes } = useNoteStore();
  const { clients, loading: clientsLoading, fetchClients } = useClientStore();
  
  useEffect(() => {
    fetchProjects();
    fetchNotes();
    fetchClients();
  }, [fetchProjects, fetchNotes, fetchClients]);
  
  const activeProjects = projects.filter(p => p.status === 'in_progress');
  const recentNotes = notes.slice(0, 3);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
        <p className="text-gray-600 mt-2">Here's your productivity overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Active Projects</h3>
              <p className="text-2xl font-semibold">{activeProjects.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Notes</h3>
              <p className="text-2xl font-semibold">{notes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Clients</h3>
              <p className="text-2xl font-semibold">{clients.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Recent Notes</h2>
          <div className="space-y-4">
            {notesLoading ? (
              <p className="text-gray-600">Loading notes...</p>
            ) : recentNotes.length === 0 ? (
              <p className="text-gray-600">No notes yet</p>
            ) : (
              recentNotes.map(note => (
                <div key={note.id} className="flex items-start gap-3 p-3 border border-gray-100 rounded-md">
                  <div className="p-2 bg-primary/10 rounded">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{note.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {format(new Date(note.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Active Projects</h2>
          <div className="space-y-4">
            {projectsLoading ? (
              <p className="text-gray-600">Loading projects...</p>
            ) : activeProjects.length === 0 ? (
              <p className="text-gray-600">No active projects</p>
            ) : (
              activeProjects.slice(0, 3).map(project => (
                <div key={project.id} className="flex items-start gap-3 p-3 border border-gray-100 rounded-md">
                  <div className="p-2 bg-primary/10 rounded">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{project.name}</h3>
                      <ProjectStatusBadge status={project.status} />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {format(new Date(project.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;