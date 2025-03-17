import React from 'react';
import type { Project } from '../types';

interface ProjectStatusBadgeProps {
  status: Project['status'];
}

export default function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  const statusConfig = {
    not_started: {
      label: 'Not Started',
      className: 'bg-gray-100 text-gray-800',
    },
    in_progress: {
      label: 'In Progress',
      className: 'bg-blue-100 text-blue-800',
    },
    on_hold: {
      label: 'On Hold',
      className: 'bg-amber-100 text-amber-800',
    },
    completed: {
      label: 'Completed',
      className: 'bg-green-100 text-green-800',
    },
  };

  const { label, className } = statusConfig[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}