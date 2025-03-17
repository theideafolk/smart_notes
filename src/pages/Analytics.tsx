import React from 'react';
import { BarChart2, TrendingUp, Clock, CheckCircle } from 'lucide-react';

function Analytics() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">Track your productivity metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Productivity Score</h3>
              <p className="text-2xl font-semibold">85%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary/10 rounded">
              <Clock className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Hours Tracked</h3>
              <p className="text-2xl font-semibold">24h</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Tasks Completed</h3>
              <p className="text-2xl font-semibold">12</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded">
              <BarChart2 className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Active Projects</h3>
              <p className="text-2xl font-semibold">3</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Productivity Insights</h2>
        <p className="text-gray-600">Start tracking your tasks to see productivity insights</p>
      </div>
    </div>
  );
}

export default Analytics;