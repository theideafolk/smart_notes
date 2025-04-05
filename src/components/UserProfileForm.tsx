import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import SplitPhoneInput from './SplitPhoneInput';
import { Edit2, Save, X } from 'lucide-react';

const UserProfileForm = () => {
  const { userProfile, updateUserProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobileNumber: '',
    dateOfBirth: '',
  });

  // Initialize form data when userProfile changes
  useEffect(() => {
    if (userProfile) {
      // Format date for input field (YYYY-MM-DD)
      const formattedDate = userProfile.date_of_birth 
        ? new Date(userProfile.date_of_birth).toISOString().split('T')[0]
        : '';

      setFormData({
        firstName: userProfile.first_name || '',
        lastName: userProfile.last_name || '',
        mobileNumber: userProfile.mobile_number || '',
        dateOfBirth: formattedDate,
      });
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Convert date string to ISO format for the database
      const dateOfBirth = formData.dateOfBirth 
        ? new Date(formData.dateOfBirth).toISOString()
        : null;

      await updateUserProfile({
        first_name: formData.firstName,
        last_name: formData.lastName,
        mobile_number: formData.mobileNumber,
        date_of_birth: dateOfBirth,
      });
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (userProfile) {
      const formattedDate = userProfile.date_of_birth 
        ? new Date(userProfile.date_of_birth).toISOString().split('T')[0]
        : '';

      setFormData({
        firstName: userProfile.first_name || '',
        lastName: userProfile.last_name || '',
        mobileNumber: userProfile.mobile_number || '',
        dateOfBirth: formattedDate,
      });
    }
    setIsEditing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Profile Settings</h2>
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-500 hover:text-primary rounded-full hover:bg-gray-100"
            title="Edit Profile"
          >
            <Edit2 className="w-5 h-5" />
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <div className="mt-1 relative">
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              disabled={!isEditing}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
              required
            />
          </div>
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <div className="mt-1 relative">
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              disabled={!isEditing}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
              required
            />
          </div>
        </div>

        {/* Mobile Number */}
        <div>
          <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">
            Mobile Number
          </label>
          <div className="mt-1">
            <SplitPhoneInput
              value={formData.mobileNumber}
              onChange={(value) => setFormData(prev => ({ ...prev, mobileNumber: value }))}
              className="w-full"
              disabled={!isEditing}
            />
          </div>
        </div>

        {/* Date of Birth */}
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
            Date of Birth
          </label>
          <div className="mt-1 relative">
            <input
              type="date"
              id="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              disabled={!isEditing}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
        </div>
      </div>
    </form>
  );
};

export default UserProfileForm;