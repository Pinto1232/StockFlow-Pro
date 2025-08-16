import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, Plus, Calendar, BarChart3, Table, Clock, CheckSquare, MessageSquare, GripVertical } from 'lucide-react';
import { useEmployees } from '../hooks/employees';

const Projects = () => {
  const [activeView, setActiveView] = useState('Spreadsheet');
  const [expandedTasks, setExpandedTasks] = useState({ 1: true, 5: true });

  // Fetch employee data from backend API
  const { data: employees, isLoading, error, isError } = useEmployees();

  // Console log the employee data whenever it changes
  useEffect(() => {
    if (employees) {
      console.log('📊 Employee data from backend API:', employees);
      console.log('📈 Total employees found:', employees.length);
      
      // Log additional details for debugging
      employees.forEach((employee, index) => {
        console.log(`👤 Employee ${index + 1}:`, {
          id: employee.id,
          name: employee.fullName,
          email: employee.email,
          jobTitle: employee.jobTitle,
          department: employee.departmentName,
          status: employee.status,
          isActive: employee.isActive,
          documentsCount: employee.documents?.length || 0
        });
      });
    }
    
    if (isError && error) {
      console.error('❌ Error fetching employees:', error);
    }
    
    if (isLoading) {
      console.log('⏳ Loading employees...');
    }
  }, [employees, isLoading, error, isError]);

  const toggleExpand = (taskId) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Mock data matching the image
  const tasks = [
    {
      id: 1,
      type: 'parent',
      task: 'Wireframing',
      description: '-',
      assignee: [
        { initials: 'GT', color: 'bg-purple-500' },
        { initials: 'HG', color: 'bg-blue-500' },
        { initials: 'TR', color: 'bg-gray-500' }
      ],
      dueDate: 'February 12, 2024',
      priority: 'Urgent',
      progress: 85,
      subtaskCount: 3,
      children: [
        {
          id: 2,
          task: 'Dashboard',
          description: 'Create wireframe for Dashboard page',
          assignee: [
            { initials: 'AN', color: 'bg-yellow-500' },
            { initials: 'HG', color: 'bg-blue-500' }
          ],
          dueDate: 'February 12, 2024',
          priority: 'Urgent',
          progress: 95,
          completed: true
        },
        {
          id: 3,
          task: 'Analytics',
          description: 'Create wireframe for analytics page',
          assignee: [
            { initials: 'GT', color: 'bg-purple-500' },
            { initials: 'HG', color: 'bg-blue-500' },
            { initials: 'TR', color: 'bg-gray-500' }
          ],
          dueDate: 'February 12, 2024',
          priority: 'Urgent',
          progress: 100,
          completed: true
        },
        {
          id: 4,
          task: 'Messages',
          description: 'Create wireframe for messages page',
          assignee: [
            { initials: 'AN', color: 'bg-yellow-500' },
            { initials: 'HG', color: 'bg-blue-500' }
          ],
          dueDate: 'February 12, 2024',
          priority: 'Normal',
          progress: 34,
          completed: false
        }
      ]
    },
    {
      id: 5,
      type: 'parent',
      task: 'Hi-Fi Design',
      description: 'Create hi-fi design 3 main screen',
      assignee: [
        { initials: 'NG', color: 'bg-pink-500' },
        { initials: 'AN', color: 'bg-yellow-500' },
        { initials: 'FG', color: 'bg-purple-500' },
        { initials: 'RO', color: 'bg-blue-500' }
      ],
      dueDate: 'February 14, 2024',
      priority: 'Low',
      progress: 20,
      subtaskCount: 3,
      children: [
        {
          id: 6,
          task: 'Dashboard',
          description: 'Create hi-fi a design Onboarding step by step.',
          assignee: [
            { initials: 'GT', color: 'bg-purple-500' },
            { initials: 'HG', color: 'bg-blue-500' },
            { initials: 'TR', color: 'bg-gray-500' }
          ],
          dueDate: 'February 14, 2024',
          priority: 'Low',
          progress: 20,
          completed: false,
          commentCount: 2
        },
        {
          id: 7,
          task: 'Analytics',
          description: 'Create hi-fi a design a login screen step by step.',
          assignee: [
            { initials: 'AN', color: 'bg-yellow-500' },
            { initials: 'HG', color: 'bg-blue-500' }
          ],
          dueDate: 'February 14, 2024',
          priority: 'Low',
          progress: 20,
          completed: false,
          commentCount: 6
        },
        {
          id: 8,
          task: 'Messages',
          description: 'Create hi-fi a design a sign up screen step by step.',
          assignee: [
            { initials: 'AN', color: 'bg-yellow-500' },
            { initials: 'HG', color: 'bg-blue-500' }
          ],
          dueDate: 'February 14, 2024',
          priority: 'Low',
          progress: 20,
          completed: false,
          commentCount: 1
        }
      ]
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-50 text-red-700 border-red-200';
      case 'Normal': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Low': return 'bg-gray-50 text-gray-600 border-gray-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getProgressColor = (progress) => {
    if (progress === 100) return 'bg-blue-500';
    if (progress >= 90) return 'bg-blue-500';
    if (progress >= 70) return 'bg-blue-500';
    return 'bg-blue-400';
  };

  const renderTaskRow = (task, isChild = false, isLast = false) => (
    <tr key={task.id} className={`group hover:bg-blue-50/30 transition-colors ${isChild ? 'bg-gray-50/30' : ''}`}>
      <td className="px-6 py-3 whitespace-nowrap">
        <div className="flex items-center gap-3">
          {/* Cascade line for child tasks */}
          {isChild && (
            <div className="flex items-center mr-1">
              <div className="w-6 h-6 flex items-center justify-center">
                <div className="relative">
                  {/* Vertical line from parent */}
                  <div className="absolute -top-3 left-3 w-px h-5 bg-gray-300"></div>
                  {/* Horizontal line to task */}
                  <div className="w-3 h-px bg-gray-300"></div>
                  {/* Continue vertical line if not last child */}
                  {!isLast && <div className="absolute top-2 left-3 w-px h-5 bg-gray-300"></div>}
                </div>
              </div>
            </div>
          )}
          
          {/* Expand/Collapse button for parent tasks */}
          {task.type === 'parent' && (
            <button 
              onClick={() => toggleExpand(task.id)}
              className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className={`transform transition-transform text-xs ${expandedTasks[task.id] ? 'rotate-90' : ''}`}>
                ▶
              </span>
            </button>
          )}
          {!task.type && <div className="w-4"></div>}
          
          <GripVertical className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
          <input 
            type="checkbox" 
            checked={task.completed || false}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
            readOnly
          />
          <span className={`font-medium text-gray-900 ${isChild ? 'text-sm' : 'text-sm'}`}>
            {task.task}
          </span>
          {task.subtaskCount && (
            <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full ml-2 font-medium">
              {task.subtaskCount}
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-3">
        <span className="text-gray-600 text-sm">
          {task.description}
        </span>
      </td>
      <td className="px-6 py-3">
        <div className="flex -space-x-1">
          {task.assignee.map((person, index) => (
            <div 
              key={index}
              className={`w-7 h-7 rounded-full ${person.color} flex items-center justify-center text-white text-xs font-semibold border-2 border-white shadow-sm`}
              title={person.initials}
            >
              {person.initials}
            </div>
          ))}
        </div>
      </td>
      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
        {task.dueDate}
      </td>
      <td className="px-6 py-3 whitespace-nowrap">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      </td>
      <td className="px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 max-w-[120px]">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(task.progress)}`}
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-right">
            {task.progress}%
          </span>
        </div>
      </td>
      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-semibold">K</span>
          </div>
          {task.commentCount && (
            <div className="flex items-center gap-1 text-gray-400">
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs font-medium">{task.commentCount}</span>
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-3 whitespace-nowrap text-right">
        <button className="text-gray-300 hover:text-gray-500 transition-colors group-hover:text-gray-400 p-1">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Loading indicator for API call */}
      {isLoading && (
        <div className="px-6 py-2 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center gap-2 text-blue-600 text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Loading employee data...</span>
          </div>
        </div>
      )}

      {/* Error indicator for API call */}
      {isError && (
        <div className="px-6 py-2 bg-red-50 border-b border-red-200">
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <span>❌ Error loading employee data. Check console for details.</span>
          </div>
        </div>
      )}

      {/* Header */}
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
                <span className="font-medium text-gray-900">Adrian Bert - CRM Dashboard</span>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600 p-1">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-semibold">1</span>
              </div>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:bg-gray-50 rounded text-sm">
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {[
              { name: 'Spreadsheet', icon: Table },
              { name: 'Timeline', icon: Clock },
              { name: 'Calendar', icon: Calendar },
              { name: 'Board', icon: CheckSquare }
            ].map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveView(tab.name)}
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

      {/* Status Section */}
      <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm font-medium">In Progress</span>
            <span className="text-xs bg-yellow-200 px-1.5 py-0.5 rounded font-medium">2</span>
          </div>
          <button className="text-gray-400 hover:text-gray-600 p-1">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Task
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Assignee
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Created
              </th>
              <th className="px-6 py-3 text-right">
                <Plus className="w-4 h-4 text-gray-400 ml-auto" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {tasks.map((task) => (
              <React.Fragment key={task.id}>
                {renderTaskRow(task)}
                {task.children && expandedTasks[task.id] && task.children.map((child, index) => 
                  renderTaskRow(child, true, index === task.children.length - 1)
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Add Task Button */}
      <div className="px-6 py-4 border-t border-gray-200">
        <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Add task</span>
        </button>
      </div>
    </div>
  );
};

export default Projects;