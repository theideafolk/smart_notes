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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <UserProfileForm />
        </div>
      </div>
    </div>
  );
}

export default Settings;