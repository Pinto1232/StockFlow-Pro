import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown } from 'lucide-react';
import { EmployeeData, NewTaskForm } from '../types/task';
import { generateInitials, getRandomAssigneeColor } from '../utils/assignees';


export const AddTaskForm = ({ 
  newTask, 
  setNewTask, 
  isAddingTask, 
  addTaskError, 
  setAddTaskError, 
  handleAddTask, 
  handleCancelAdd,
  employees,
  isEditing
}: {
  newTask: NewTaskForm;
  setNewTask: React.Dispatch<React.SetStateAction<NewTaskForm>>;
  isAddingTask: boolean;
  addTaskError: string | null;
  setAddTaskError: React.Dispatch<React.SetStateAction<string | null>>;
  handleAddTask: () => void;
  handleCancelAdd: () => void;
  employees: EmployeeData[] | null;
  isEditing?: boolean;
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  return createPortal(
  <div 
  className="fixed inset-0 bg-black/50 flex items-center justify-center"
  style={{ zIndex: 9999 }}
  onClick={!isAddingTask ? handleCancelAdd : undefined}
  >
    <div 
      className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
      style={{ zIndex: 10000 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{isEditing ? 'Edit Task' : 'Add New Task'}</h3>
        <button 
          onClick={handleCancelAdd}
          disabled={isAddingTask}
          className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {addTaskError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <span>❌ {addTaskError}</span>
          </div>
        </div>
      )}

      {isAddingTask && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center gap-2 text-blue-600 text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Creating task...</span>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
          <input
            type="text"
            value={newTask.task}
            onChange={(e) => setNewTask(prev => ({ ...prev, task: e.target.value }))}
            disabled={isAddingTask}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Enter task name"
            onFocus={() => setAddTaskError(null)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={newTask.description}
            onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
            disabled={isAddingTask}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            rows={3}
            placeholder="Enter task description"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
              disabled={isAddingTask}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="Low">Low</option>
              <option value="Normal">Normal</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Progress %
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={newTask.progress}
              onChange={(e) => setNewTask(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
              disabled={isAddingTask}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <input
            type="date"
            value={newTask.dueDate}
            onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
            disabled={isAddingTask}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
        
        
        {/* Assignee selection is only enabled for editing or subtask creation, not for main task creation */}
        {isEditing ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assignee
            </label>
            {employees && employees.length > 0 ? (
              <div className="space-y-2">
                {newTask.assignee.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-md">
                    {newTask.assignee.map((assignee, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs ${assignee.color}`}
                      >
                        <span>{assignee.initials}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setNewTask(prev => ({
                              ...prev,
                              assignee: prev.assignee.filter((_, i) => i !== index)
                            }));
                          }}
                          disabled={isAddingTask}
                          className="ml-1 text-white hover:text-gray-200 disabled:opacity-50"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    disabled={isAddingTask}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white shadow-sm hover:border-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out disabled:bg-gray-100 disabled:cursor-not-allowed text-left flex items-center justify-between"
                  >
                    <span className="text-gray-500">Assign employee...</span>
                    <ChevronDown 
                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                        isDropdownOpen ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  
                  <div
                    className={`absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 transition-all duration-200 ease-in-out origin-top ${
                      isDropdownOpen 
                        ? 'opacity-100 scale-y-100 translate-y-0' 
                        : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'
                    }`}
                  >
                    <div className="max-h-48 overflow-y-auto">
                      {employees.map(emp => (
                        <button
                          key={String(emp.id)}
                          type="button"
                          onClick={() => {
                            const employeeInitials = generateInitials(emp.fullName);
                            if (!newTask.assignee.some(a => String(a.id) === String(emp.id))) {
                              setNewTask(prev => ({
                                ...prev,
                                assignee: [...prev.assignee, {
                                  id: emp.id,
                                  initials: employeeInitials,
                                  color: getRandomAssigneeColor()
                                }]
                              }));
                            }
                            setIsDropdownOpen(false);
                          }}
                          disabled={isAddingTask || newTask.assignee.some(a => String(a.id) === String(emp.id))}
                          className="w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed first:rounded-t-lg last:rounded-b-lg"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-gray-900">{emp.fullName}</span>
                            <span className="text-sm text-gray-500">({emp.departmentName})</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 border border-gray-300 rounded-md">
                No employees available for assignment
              </div>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Select one or more employees to assign to this task
            </p>
          </div>
        ) : null}
      </div>
      
      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={handleAddTask}
          disabled={isAddingTask || !newTask.task.trim()}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isAddingTask ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Creating...
            </>
          ) : (
            'Add Task'
          )}
        </button>
        <button
          onClick={handleCancelAdd}
          disabled={isAddingTask}
          className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>, document.body
  );
};

export default AddTaskForm;
