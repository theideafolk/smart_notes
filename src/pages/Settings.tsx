import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, User, Moon, Bell, Clock, LogOut, Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import UserProfileForm from '../components/UserProfileForm';

function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const { signOut, userProfile, deleteAccount } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut();
      navigate('/login');
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently deleted.')) {
      try {
        await deleteAccount();
        navigate('/login');
      } catch (error) {
        alert('Failed to delete account. Please try again or contact support.');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <UserProfileForm />
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h2>
            
            <div className="space-y-4">
              <button
                onClick={handleSignOut}
                className="flex items-center w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign Out
              </button>
              
              <button
                onClick={handleDeleteAccount}
                className="flex items-center w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 className="w-5 h-5 mr-3" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;