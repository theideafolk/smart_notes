import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, User, Moon, Bell, Clock, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import UserProfileForm from '../components/UserProfileForm';

function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const { signOut, userProfile } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut();
      navigate('/login');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{userProfile?.full_name || 'User'}</p>
                <p className="text-sm text-gray-500">{userProfile?.email}</p>
              </div>
            </div>
          </div>
          
          <div className="p-3">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'profile'
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <User className="w-5 h-5" />
              Profile Settings
            </button>
            
            <button
              onClick={() => setActiveTab('appearance')}
              className={`flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'appearance'
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Moon className="w-5 h-5" />
              Appearance
            </button>
            
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'notifications'
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Bell className="w-5 h-5" />
              Notifications
            </button>
            
            <button
              onClick={() => setActiveTab('workHours')}
              className={`flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'workHours'
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Clock className="w-5 h-5" />
              Work Hours
            </button>
            
            <hr className="my-3 border-gray-100" />
            
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-lg font-semibold mb-6">Profile Settings</h2>
              <UserProfileForm />
            </div>
          )}
          
          {activeTab === 'appearance' && (
            <div>
              <h2 className="text-lg font-semibold mb-6">Appearance</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-gray-600" />
                  <div>
                    <h3 className="font-medium">Dark Mode</h3>
                    <p className="text-sm text-gray-600">Toggle dark mode theme</p>
                  </div>
                </div>
                <button className="w-12 h-6 bg-gray-200 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-lg font-semibold mb-6">Notifications</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <div>
                    <h3 className="font-medium">Task Reminders</h3>
                    <p className="text-sm text-gray-600">Receive notifications for upcoming tasks</p>
                  </div>
                </div>
                <button className="w-12 h-6 bg-primary rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'workHours' && (
            <div>
              <h2 className="text-lg font-semibold mb-6">Work Hours</h2>
              <p className="text-gray-600 mb-6">
                Configure your working hours to schedule tasks more effectively
              </p>
              <UserProfileForm />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;