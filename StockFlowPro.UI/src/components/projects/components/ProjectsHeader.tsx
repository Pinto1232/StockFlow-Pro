import React from 'react';
import { BarChart3, MoreHorizontal } from 'lucide-react';

export interface ProjectsHeaderProps {
  title: string;
  tasksCount: number;
}

const ProjectsHeader: React.FC<ProjectsHeaderProps> = ({ title, tasksCount }) => {
  return (
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">Projects</span>
            <span className="text-gray-400">›</span>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center">
                <BarChart3 className="w-3 h-3 text-gray-600" />
              </div>
              <span className="font-medium text-gray-900">{title}</span>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600 p-1">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-semibold">{tasksCount}</span>
            </div>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:bg-gray-50 rounded text-sm">
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectsHeader;
