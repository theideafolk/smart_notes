import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Brain,
  Home,
  FileText,
  Calendar as CalendarIcon,
  Users,
  Briefcase,
  BarChart2,
  Settings as SettingsIcon,
} from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/notes', icon: FileText, label: 'Notes' },
  { path: '/calendar', icon: CalendarIcon, label: 'Calendar' },
  { path: '/clients', icon: Users, label: 'Clients' },
  { path: '/projects', icon: Briefcase, label: 'Projects' },
  { path: '/analytics', icon: BarChart2, label: 'Analytics' },
  { path: '/settings', icon: SettingsIcon, label: 'Settings' },
];

function Layout() {
  const location = useLocation();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-primary">SmartNotes</span>
          </div>
        </div>
        <nav className="mt-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
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
            );
          })}
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