import React from 'react';
import { Search } from 'lucide-react';

function Folders() {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl px-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search in folders..."
            className="w-full h-14 px-6 pr-12 text-lg bg-white border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <button className="p-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Folders; 