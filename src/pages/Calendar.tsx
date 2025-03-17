import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

function Calendar() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-2">View and manage your schedule</p>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded">
              <CalendarIcon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Calendar integration coming soon</p>
              <p className="text-gray-600 mt-1">Connect your Google Calendar to manage your schedule</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Calendar;