import React from 'react';
import { Calendar, CheckSquare, Clock, Filter, MoreHorizontal, Plus, Search, Table } from 'lucide-react';

export interface ProjectsTabsProps {
  activeView: string;
  onChange: (name: string) => void;
}

const tabs = [
  { name: 'Spreadsheet', icon: Table },
  { name: 'Timeline', icon: Clock },
  { name: 'Calendar', icon: Calendar },
  { name: 'Board', icon: CheckSquare }
];

const ProjectsTabs: React.FC<ProjectsTabsProps> = ({ activeView, onChange }) => {
  return (
    <div className="px-6 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => onChange(tab.name)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium transition-colors ${
                activeView === tab.name 
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded ml-2">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search task..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded border border-gray-300 text-sm">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="text-gray-400 hover:text-gray-600 p-1">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectsTabs;
