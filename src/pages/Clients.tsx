import React, { useEffect, useState } from 'react';
import { Users, Plus, Loader2, Search } from 'lucide-react';
import { useClientStore } from '../store/clientStore';
import ClientCard from '../components/ClientCard';
import CreateClientDialog from '../components/CreateClientDialog';
import type { Client } from '../types';

function Clients() {
  const { 
    clients, 
    loading, 
    error, 
    fetchClients, 
    createClient, 
    updateClient, 
    deleteClient 
  } = useClientStore();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleCreateClient = async (name: string, company: string, email: string, phone: string) => {
    await createClient(name, company, email, phone);
    setIsCreateDialogOpen(false);
  };

  const handleUpdateClient = async (name: string, company: string, email: string, phone: string) => {
    if (editingClient) {
      await updateClient(editingClient.id, {
        name,
        company,
        email,
        phone
      });
      setEditingClient(null);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      await deleteClient(id);
    }
  };
  
  // Filter clients based on search query
  const filteredClients = searchQuery
    ? clients.filter(client => 
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (client.company && client.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : clients;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-2">Manage your client relationships</p>
        </div>
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Client
        </button>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
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
        ) : filteredClients.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">
                  {searchQuery ? 'No clients match your search' : 'No clients yet'}
                </p>
                <p className="text-gray-600 mt-1">
                  {searchQuery 
                    ? 'Try a different search term' 
                    : 'Add your first client to get started'
                  }
                </p>
              </div>
            </div>
          </div>
        ) : (
          filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={setEditingClient}
              onDelete={handleDeleteClient}
            />
          ))
        )}
      </div>

      <CreateClientDialog
        isOpen={isCreateDialogOpen || !!editingClient}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setEditingClient(null);
        }}
        onSave={editingClient ? handleUpdateClient : handleCreateClient}
        initialData={
          editingClient
            ? {
                name: editingClient.name,
                company: editingClient.company || '',
                email: editingClient.email || '',
                phone: editingClient.phone || '',
              }
            : undefined
        }
      />
    </div>
  );
}

export default Clients;