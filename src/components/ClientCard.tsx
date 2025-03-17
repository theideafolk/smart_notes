import React from 'react';
import { format } from 'date-fns';
import { Users, Briefcase, Pencil, Trash2, Mail, Phone } from 'lucide-react';
import type { Client } from '../types';

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
}

export default function ClientCard({ 
  client, 
  onEdit, 
  onDelete
}: ClientCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="p-3 bg-primary/10 rounded">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(client)}
                  className="p-2 text-gray-500 hover:text-primary transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(client.id)}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {client.company && (
              <p className="text-gray-600 mt-2">{client.company}</p>
            )}
            
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
              {client.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${client.email}`} className="text-gray-600 hover:text-primary">
                    {client.email}
                  </a>
                </div>
              )}
              
              {client.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a href={`tel:${client.phone}`} className="text-gray-600 hover:text-primary">
                    {client.phone}
                  </a>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  {format(new Date(client.created_at), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}