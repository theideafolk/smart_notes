import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Save, Loader2 } from 'lucide-react';

export default function UserProfileForm() {
  const { userProfile, updateUserProfile } = useAuthStore();
  const [fullName, setFullName] = useState(userProfile?.full_name || '');
  const [workHoursStart, setWorkHoursStart] = useState(userProfile?.work_hours_start || '09:00');
  const [workHoursEnd, setWorkHoursEnd] = useState(userProfile?.work_hours_end || '17:00');
  const [workDays, setWorkDays] = useState<string[]>(userProfile?.work_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Update form when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || '');
      setWorkHoursStart(userProfile.work_hours_start || '09:00');
      setWorkHoursEnd(userProfile.work_hours_end || '17:00');
      setWorkDays(userProfile.work_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    }
  }, [userProfile]);

  const availableDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleWorkDayToggle = (day: string) => {
    setWorkDays(current => 
      current.includes(day)
        ? current.filter(d => d !== day)
        : [...current, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      await updateUserProfile({
        full_name: fullName,
        work_hours_start: workHoursStart,
        work_hours_end: workHoursEnd,
        work_days: workDays,
      });
      
      setMessage({ 
        text: 'Profile updated successfully!', 
        type: 'success' 
      });
    } catch (error: any) {
      console.error('Profile update error:', error);
      setMessage({ 
        text: error.message || 'Failed to update profile', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message.text && (
        <div 
          className={`p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}
      
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Work Days
        </label>
        <div className="flex flex-wrap gap-2">
          {availableDays.map(day => (
            <button
              key={day}
              type="button"
              onClick={() => handleWorkDayToggle(day)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                workDays.includes(day)
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="workHoursStart" className="block text-sm font-medium text-gray-700 mb-1">
            Work Hours Start
          </label>
          <input
            id="workHoursStart"
            type="time"
            value={workHoursStart}
            onChange={(e) => setWorkHoursStart(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        
        <div>
          <label htmlFor="workHoursEnd" className="block text-sm font-medium text-gray-700 mb-1">
            Work Hours End
          </label>
          <input
            id="workHoursEnd"
            type="time"
            value={workHoursEnd}
            onChange={(e) => setWorkHoursEnd(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className="flex items-center justify-center w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Save className="w-5 h-5 mr-2" />
            Save Profile
          </>
        )}
      </button>
    </form>
  );
}