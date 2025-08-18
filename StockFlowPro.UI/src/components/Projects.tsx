import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Filter, MoreHorizontal, Plus, Calendar, BarChart3, Table, Clock, CheckSquare, MessageSquare, GripVertical, X } from 'lucide-react';
import { useEmployees } from '../hooks/employees';
import { http } from '../services/api/client';
import { queryClient } from '../services/queryClient';
import { employeeKeys } from '../services/queryKeys';

// Minimal Task type to match the mocked tasks used in this component and the
// shape expected from the backend. Extend as needed when the API contract is
// finalized.
interface Task {
  id: number;
  guidId?: string; // The actual GUID primary key for backend operations
  type?: string;
  task: string;
  description?: string;
  assignee?: { id?: string | number; initials: string; color: string }[];
  dueDate?: string;
  priority?: string;
  progress?: number;
  subtaskCount?: number;
  children?: Task[];
  completed?: boolean;
  commentCount?: number;
}

// Form state used by the Add / Edit task modal
interface NewTaskForm {
  task: string;
  description?: string;
  priority: string;
  progress: number;
  dueDate?: string;
  assignee: { id?: string | number; initials: string; color: string }[];
}

// Minimal shape for the Employee DTO we receive from the backend.
// Keep this conservative — expand when the API contract is finalized.
interface EmployeeData {
  id: string | number;
  firstName?: string;
  lastName?: string;
  fullName: string;
  email?: string;
  jobTitle?: string;
  departmentName?: string;
  isActive?: boolean;
  status?: number | string;
  documents?: unknown[];
  tasks?: Task[];
}

// TaskDto interface matching the backend response structure
interface TaskDto {
  id: number;
  guidId: string; // The actual GUID primary key for backend operations
  type?: string; // "parent" or null for child tasks
  task: string;
  description: string;
  assignee: Array<{ initials: string; color: string }>;
  dueDate: string;
  priority: string; // "Urgent", "Normal", "Low"
  progress: number;
  subtaskCount?: number;
  completed: boolean;
  commentCount?: number;
  children?: TaskDto[];
}

// Utility: derive initials from a full name (module-scoped so all components can use it)
const generateInitials = (fullName: string) => {
  if (!fullName) return 'NA';
  return fullName
    .split(' ')
    .map(name => name.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

// Reusable color picker for assignees
const getRandomAssigneeColor = () => {
  const colors = [
    'bg-purple-500', 'bg-blue-500', 'bg-green-500',
    'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500',
    'bg-red-500', 'bg-teal-500', 'bg-orange-500'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

/* Portal menu will be rendered below (outside stacking contexts) */
const AddTaskForm = ({ 
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
  // Use module-scoped helpers `generateInitials` and `getRandomAssigneeColor`

  // Handle assignee selection
  const handleAssigneeToggle = (employee: EmployeeData) => {
    const employeeInitials = generateInitials(employee.fullName);
    const isAlreadyAssigned = newTask.assignee.some(
      assignee => String(assignee.id) === String(employee.id) || assignee.initials === employeeInitials
    );

    if (isAlreadyAssigned) {
      // Remove assignee
      setNewTask(prev => ({
        ...prev,
        assignee: prev.assignee.filter(assignee => String(assignee.id) !== String(employee.id))
      }));
    } else {
      // Add assignee
      setNewTask(prev => ({
        ...prev,
        assignee: [...prev.assignee, {
          id: employee.id,
          initials: employeeInitials,
          color: getRandomAssigneeColor()
        }]
      }));
    }
  };

  return (
  <div 
  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  style={{ zIndex: 99999 }}
  onClick={!isAddingTask ? handleCancelAdd : undefined}
  >
    <div 
      className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
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

      {/* Error Message */}
      {addTaskError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <span>❌ {addTaskError}</span>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task Name *
          </label>
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
        
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assignee
          </label>
          {employees && employees.length > 0 ? (
            <div className="space-y-2">
              {/* Selected assignees display */}
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
              
              {/* Employee selection dropdown */}
              <div className="relative">
                <select
                  value=""
                  onChange={(e) => {
                    const employee = employees.find(emp => String(emp.id) === e.target.value);
                    if (employee) {
                      handleAssigneeToggle(employee);
                    }
                  }}
                  disabled={isAddingTask}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select an employee to assign...</option>
                  {employees
                    .filter(emp => emp.isActive && !newTask.assignee.some(
                      assignee => String(assignee.id) === String(emp.id) || assignee.initials === generateInitials(emp.fullName)
                    ))
                    .map(employee => (
                      <option key={employee.id} value={String(employee.id)}>
                        {employee.fullName} - {employee.jobTitle || 'No Title'}
                      </option>
                    ))
                  }
                </select>
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
  </div>
  );
};

const Projects = ({ externalEmployees }: { externalEmployees?: unknown[] }) => {
  const [activeView, setActiveView] = useState('Spreadsheet');
  const [expandedTasks, setExpandedTasks] = useState({ 1: true, 5: true });
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [newTask, setNewTask] = useState<NewTaskForm>({
    task: '',
    description: '',
    priority: 'Normal',
    progress: 0,
    dueDate: '',
    assignee: []
  });
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [addTaskError, setAddTaskError] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);

  // Fetch employee data from backend API
  const { data: employees, isLoading, error, isError } = useEmployees();

  // Log any employees passed in from a parent component
  useEffect(() => {
    if (externalEmployees) {
      console.log('📥 Received employees prop in Projects:', externalEmployees);
    }
  }, [externalEmployees]);

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

  // Fetch task data from backend API and log it for debugging
  const [tasksFromApi, setTasksFromApi] = useState<Task[] | null>(null);
  const [tasksLoading, setTasksLoading] = useState<boolean>(false);
  const [tasksError, setTasksError] = useState<Error | null>(null);

  // Derive tasks from the employees API response instead of calling a
  // non-existent /api/tasks endpoint. The backend maps ProjectTask -> TaskDto
  // and includes tasks on the Employee DTO, so we can flatten them here.
  useEffect(() => {
    setTasksLoading(isLoading);

    if (employees && Array.isArray(employees)) {
      // employees' task lists are expected on the `tasks` property (camelCase)
      const allTasks: Task[] = (employees as unknown as EmployeeData[]).flatMap(emp => emp.tasks ?? []);
      setTasksFromApi(allTasks);
      console.log('📥 Task data derived from employees API:', allTasks);
      console.log('📈 Total tasks found (derived):', allTasks.length);
      setTasksError(null);
    } else {
      setTasksFromApi(null);
    }

    if (isError && error) {
      const e = error instanceof Error ? error : new Error(String(error));
      setTasksError(e);
      console.error('❌ Error fetching employees (derived tasks):', e);
    }
  }, [employees, isLoading, error, isError]);

  const toggleExpand = (taskId) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Helper function to generate random colors for assignees that don't have colors
  const getRandomColor = () => {
    const colors = [
      'bg-purple-500',
      'bg-blue-500',
      'bg-gray-500',
      'bg-yellow-500',
      'bg-pink-500',
      'bg-green-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-teal-500'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Format a date string into 'MonthName DD, YYYY' (e.g. February 14, 2024)
  const formatDateLong = (dateStr?: string): string => {
    if (!dateStr) return '';

    // Handle plain YYYY-MM-DD safely to avoid timezone shifts
    const simpleDateMatch = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
    let d: Date;
    if (simpleDateMatch) {
      const [y, m, day] = dateStr.split('-').map(s => parseInt(s, 10));
      d = new Date(y, m - 1, day);
    } else {
      d = new Date(dateStr);
    }

    if (Number.isNaN(d.getTime())) return dateStr;

    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Helper function to process API tasks and add missing properties
  const processApiTasks = (apiTasks: Task[]) => {
    if (!apiTasks || !Array.isArray(apiTasks)) {
      return [];
    }
    // Build sets of child ids/guidIds so we can remove top-level duplicates
    const childGuidSet = new Set<string>();
    const childIdSet = new Set<number>();
    for (const t of apiTasks) {
      if (Array.isArray(t.children)) {
        for (const c of t.children) {
          if (c.guidId) childGuidSet.add(c.guidId);
          if (typeof c.id === 'number') childIdSet.add(c.id);
        }
      }
    }

    // Map and filter: remove any top-level task that also appears as a child elsewhere
    return apiTasks
      .map(task => ({
        ...task,
        // Ensure assignee array has proper structure with colors
        assignee: task.assignee?.map(assignee => ({
          ...assignee,
          color: assignee.color || getRandomColor(),
          initials: assignee.initials || 'NA'
        })) || [],
        // Set default values for missing properties
        type: task.type || undefined,
        subtaskCount: task.children?.length || undefined,
        commentCount: task.commentCount || undefined
      }))
      .filter(t => {
        // If this task appears as a child elsewhere, don't show it as a top-level row
        if (t.guidId && childGuidSet.has(t.guidId)) return false;
        if (typeof t.id === 'number' && childIdSet.has(t.id)) return false;
        return true;
      });
  };

  // Use API data if available, otherwise fall back to empty array
  const tasks = processApiTasks(tasksFromApi || []);

  // Keep track of subtasks we created locally so we can dedupe after refetch
  const [pendingSubtasks, setPendingSubtasks] = useState<Record<string, { child: Task; parentId: number }>>({});

  // After tasks list updates (for example after refetch), ensure any pending subtasks
  // are not duplicated at top-level. If a pending subtask appears at top-level, move
  // it under its recorded parent and clear it from pendingSubtasks.
  useEffect(() => {
    if (!tasksFromApi || Object.keys(pendingSubtasks).length === 0) return;

    // Use the fresh tasksFromApi as the authoritative source returned by the backend
    setTasksFromApi(() => {
      const source = Array.isArray(tasksFromApi) ? [...tasksFromApi] : [];
      let updated = [...source];

      Object.keys(pendingSubtasks).forEach(key => {
        const { child, parentId } = pendingSubtasks[key];

        // Remove any top-level entry matching the child (by guidId or numeric id)
        updated = updated.filter(t => !((child.guidId && t.guidId === child.guidId) || t.id === child.id));

        // Find the parent entry in the updated list by numeric id or guid
        const parentIndex = updated.findIndex(t => t.id === parentId || (t.guidId && t.guidId === (updated.find(p => p.id === parentId)?.guidId)));

        if (parentIndex !== -1) {
          const parent = updated[parentIndex];
          // If parent already contains this child, skip attaching
          const alreadyHas = Array.isArray(parent.children) && parent.children.some(c => (child.guidId && c.guidId === child.guidId) || c.id === child.id);
          if (!alreadyHas) {
            const children = Array.isArray(parent.children) ? [...parent.children, child] : [child];
            updated[parentIndex] = { ...parent, children, subtaskCount: (parent.subtaskCount || 0) + 1 };
          }
        }
      });

      return updated;
    });

    // Clear pending entries we've processed
    setPendingSubtasks({});
  }, [tasksFromApi, pendingSubtasks, setPendingSubtasks]);

  // API function to create a new task
  const createTaskAPI = async (taskData: Omit<Task, 'id'>) => {
    try {
      // Get the first active employee to assign the task to (for now)
      // TODO: Allow user to select which employee should own the task
      const activeEmployee = employees?.find(emp => emp.isActive);
      if (!activeEmployee) {
        throw new Error('No active employee found to assign the task to');
      }

      // Convert assignee IDs to GUIDs and filter out invalid ones
      const assigneeIds: string[] = [];
      if (taskData.assignee && taskData.assignee.length > 0) {
        for (const assignee of taskData.assignee) {
          if (assignee.id && String(assignee.id) !== 'undefined') {
            assigneeIds.push(String(assignee.id));
          }
        }
      }

      // Format date properly for backend (ensure it's in ISO format or empty)
      let formattedDueDate = '';
      if (taskData.dueDate) {
        try {
          // If it's already in YYYY-MM-DD format, keep it
          if (/^\d{4}-\d{2}-\d{2}$/.test(taskData.dueDate)) {
            formattedDueDate = taskData.dueDate;
          } else {
            // Try to parse and format
            const date = new Date(taskData.dueDate);
            if (!isNaN(date.getTime())) {
              formattedDueDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
            }
          }
        } catch {
          // Ignore parse errors — fall back to empty due date
          console.warn('Invalid date format, using empty string:', taskData.dueDate);
          formattedDueDate = '';
        }
      }

      // Prepare payload matching CreateTaskRequest structure
      const payload = {
        task: taskData.task,
        description: taskData.description || '',
        dueDate: formattedDueDate,
        priority: taskData.priority || 'Normal',
        progress: taskData.progress || 0,
        assigneeIds: assigneeIds,
        employeeId: String(activeEmployee.id) // The employee who will own this task
      };

      console.log('📤 Sending task creation payload:', payload);

      try {
        // Call the real backend API
        const created = await http.post<TaskDto>('/api/tasks', payload);
        
        console.log('📥 Received task creation response:', created);
        
  const createdTask: Task = {
          id: created.id || Date.now(),
          guidId: created.guidId, // Store the GUID ID from backend response
          task: created.task || taskData.task,
          description: created.description || '',
          priority: created.priority || 'Normal',
          progress: created.progress || 0,
          dueDate: created.dueDate || '',
          assignee: (created.assignee || []).map(a => ({ 
            id: a.initials, // Use initials as fallback ID since backend doesn't return assignee IDs
            initials: a.initials || 'NA', 
            color: a.color || getRandomColor() 
          })),
          completed: created.completed || false,
          type: created.type || 'parent', // Main tasks are parent tasks
          subtaskCount: created.subtaskCount || 0,
          commentCount: created.commentCount || 0,
          children: created.children || []
        };

  // Update local task list immediately so the UI shows the new task
  setTasksFromApi(prev => [createdTask, ...(prev || [])]);

  console.log('✅ Task created via API:', createdTask);
  return createdTask;
      } catch (apiErr) {
        // If backend API fails, fall back to simulation
        console.warn('Task API failed, falling back to simulated creation', apiErr);
        // Log server error body/status to help debugging
        try {
          const ae = apiErr as unknown;
          if (typeof ae === 'object' && ae !== null) {
            const resp = (ae as Record<string, unknown>)['response'];
            if (typeof resp === 'object' && resp !== null) {
              const status = (resp as Record<string, unknown>)['status'];
              const data = (resp as Record<string, unknown>)['data'];
              console.error('📡 Task API error status:', status);
              console.error('📡 Task API error response:', data ?? apiErr);
            } else {
              console.error('📡 Task API error:', apiErr);
            }
          } else {
            console.error('📡 Task API error:', apiErr);
          }
        } catch (logErr) {
          console.error('📡 Failed to read Task API error details', logErr);
        }

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
  // Create a mock response that matches our Task interface
  const mockCreatedTask: Task = {
          id: Date.now(), // Use timestamp as mock ID until backend provides real ID
          task: taskData.task,
          description: taskData.description || '',
          priority: taskData.priority || 'Normal',
          progress: taskData.progress || 0,
          dueDate: taskData.dueDate || '',
          assignee: taskData.assignee || [],
          completed: false,
          type: 'parent',
          subtaskCount: 0,
          commentCount: 0,
          children: []
        };

  // Insert mock into local state so the user sees it immediately
  setTasksFromApi(prev => [mockCreatedTask, ...(prev || [])]);

  console.log('✅ Mock task created:', mockCreatedTask);
  return mockCreatedTask;
      }
    } catch (error) {
      console.error('❌ Task creation error:', error);
      // Re-throw with more context
      if (error instanceof Error) {
        throw new Error(`Task Creation Failed: ${error.message}`);
      } else {
        throw new Error('Unknown error occurred while creating task');
      }
    }
  };

  // Function to handle adding a new task
  const handleAddTask = async () => {
    // Validation
    if (!newTask.task.trim()) {
      setAddTaskError('Task name is required');
      return;
    }

    // Clear any previous errors
    setAddTaskError(null);
    setIsAddingTask(true);

    try {
      if (editingTaskId !== null) {
        // Editing existing task
        const original = (tasksFromApi || []).find(t => t.id === editingTaskId);
        const guid = original?.guidId;

        const payload = {
          task: newTask.task,
          description: newTask.description || '',
          dueDate: newTask.dueDate || '',
          priority: newTask.priority || 'Normal',
          progress: newTask.progress || 0,
          assigneeIds: (newTask.assignee || []).map(a => String(a.id)).filter(id => id && id !== 'undefined')
        };

        console.log('📤 Sending task update payload:', { id: guid ?? editingTaskId, payload });

        try {
          if (guid) {
            const updated = await http.put<TaskDto>(`/api/tasks/${guid}`, payload);
            console.log('📥 Received task update response:', updated);
            await queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
          } else {
            // local mock update
            setTasksFromApi(prev => (prev || []).map(t => t.id === editingTaskId ? ({ ...t, task: newTask.task, description: newTask.description || '', dueDate: newTask.dueDate || '', priority: newTask.priority, progress: newTask.progress }) : t));
          }

          setNewTask({ task: '', description: '', priority: 'Normal', progress: 0, dueDate: '', assignee: [] });
          setShowAddTaskForm(false);
          setEditingTaskId(null);
        } catch (updateErr) {
          console.error('❌ Failed to update task via API, applying local update fallback:', updateErr);
          setTasksFromApi(prev => (prev || []).map(t => t.id === editingTaskId ? ({ ...t, task: newTask.task, description: newTask.description || '', dueDate: newTask.dueDate || '', priority: newTask.priority, progress: newTask.progress }) : t));
          setNewTask({ task: '', description: '', priority: 'Normal', progress: 0, dueDate: '', assignee: [] });
          setShowAddTaskForm(false);
          setEditingTaskId(null);
        }
      } else {
        // Prepare task data for API (create)
        const taskData: Omit<Task, 'id'> = {
          task: newTask.task,
          description: newTask.description || '',
          priority: newTask.priority,
          progress: newTask.progress,
          dueDate: newTask.dueDate,
          assignee: newTask.assignee,
          completed: false,
          type: undefined,
          subtaskCount: undefined,
          commentCount: undefined,
          children: []
        };

        // Call API to create the task
        const createdTask = await createTaskAPI(taskData);

        // Invalidate and refetch employee data to get the updated tasks from backend
        await queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
        
        console.log('✅ Task created successfully:', createdTask);
        console.log('🔄 Refreshing employee data to show new task...');
        
        // Reset form and close modal on success
        setNewTask({
          task: '',
          description: '',
          priority: 'Normal',
          progress: 0,
          dueDate: '',
          assignee: []
        });
        setShowAddTaskForm(false);
        setEditingTaskId(null);
      }

    } catch (error) {
      console.error('❌ Failed to create task:', error);
      
      // Set user-friendly error message
      if (error instanceof Error) {
        setAddTaskError(error.message);
      } else {
        setAddTaskError('Failed to create task. Please try again.');
      }
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleCancelAdd = () => {
    setNewTask({
      task: '',
      description: '',
      priority: 'Normal',
      progress: 0,
      dueDate: '',
      assignee: []
    });
    setAddTaskError(null);
    setShowAddTaskForm(false);
  setEditingTaskId(null);
  };

  // Subtask creation state and handlers
  const [subtaskParentId, setSubtaskParentId] = useState<number | null>(null);
  const [subtaskName, setSubtaskName] = useState<string>('');
  const [isAddingSubtask, setIsAddingSubtask] = useState<boolean>(false);
  const [subtaskError, setSubtaskError] = useState<string | null>(null);
  const [subtaskAssignees, setSubtaskAssignees] = useState<{ id?: string | number; initials: string; color: string }[]>([]);
  // Menu state for per-task dropdown (opened by the MoreHorizontal button)
  const [openMenuForTaskId, setOpenMenuForTaskId] = useState<number | null>(null);
  // Absolute position for portal menu (so it escapes stacking contexts)
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

  // Close menu on outside click
  useEffect(() => {
    if (openMenuForTaskId === null) return;
    const handleDocClick = () => setOpenMenuForTaskId(null);
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, [openMenuForTaskId]);

  // Close menu with Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenuForTaskId(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Keep menuPosition in sync with open state
  useEffect(() => {
    if (openMenuForTaskId === null) setMenuPosition(null);
  }, [openMenuForTaskId]);

  // Editing state for tasks
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  const handleEditTask = (taskId: number) => {
    const t = tasks.find(x => x.id === taskId);
    if (!t) return;
    setNewTask({
      task: t.task || '',
      description: t.description || '',
      priority: t.priority || 'Normal',
      progress: t.progress || 0,
      dueDate: t.dueDate || '',
      assignee: t.assignee || []
    });
    setEditingTaskId(taskId);
    setShowAddTaskForm(true);
    setOpenMenuForTaskId(null);
  };

  const handleDeleteTask = (taskId: number) => {
    // Confirm permanent deletion
    const ok = typeof window !== 'undefined' ? window.confirm('Delete this task permanently? This cannot be undone.') : true;
    if (!ok) {
      setOpenMenuForTaskId(null);
      return;
    }

    // Set loading state
    setDeletingTaskId(taskId);
    setOpenMenuForTaskId(null);

    // Resolve the task to get its GUID if available
    const resolveTaskById = () => {
      const top = (tasksFromApi || []).find(t => t.id === taskId);
      if (top) return { task: top, isChild: false, parentId: null as number | null };
      // try to find as child
      for (const p of (tasksFromApi || [])) {
        if (Array.isArray(p.children)) {
          const c = p.children.find(ch => ch.id === taskId);
          if (c) return { task: c, isChild: true, parentId: p.id };
        }
      }
      return { task: undefined, isChild: false, parentId: null as number | null };
    };

    const resolved = resolveTaskById();

    // Call backend delete endpoint using GUID when possible, fallback to TaskId endpoint
    (async () => {
      try {
        console.log(`🗑️ Attempting to delete task`, {
          taskId,
          guidId: resolved.task?.guidId,
          isChild: resolved.isChild,
          parentId: resolved.parentId
        });

        const response = resolved.task?.guidId
          ? await http.delete<void>(`/api/tasks/${resolved.task.guidId}`)
          : await http.delete<void>(`/api/tasks/by-task-id/${taskId}`);
        console.log(`✅ Task ${taskId} deleted successfully from backend`, response);
        
        // If backend deletion succeeded, remove locally
        setTasksFromApi(prev => {
          if (!prev) return prev;
          console.log(`🔍 Removing task ${taskId} from local state...`);
          console.log('📋 Current tasks before removal:', prev.map(t => ({ id: t.id, task: t.task, children: t.children?.length || 0 })));
          
          // Remove from top-level tasks
          let updatedTasks = prev.filter(t => t.id !== taskId);
          
          // Also check and remove from any parent's children array
          updatedTasks = updatedTasks.map(task => {
            if (task.children && task.children.length > 0) {
              const originalChildCount = task.children.length;
              const updatedChildren = task.children.filter(child => child.id !== taskId);
              const removedChildCount = originalChildCount - updatedChildren.length;
              
              if (removedChildCount > 0) {
                console.log(`🔄 Removed ${removedChildCount} child(ren) from parent task ${task.id}`);
                return { 
                  ...task, 
                  children: updatedChildren, 
                  subtaskCount: Math.max(0, (task.subtaskCount || 0) - removedChildCount)
                };
              }
            }
            return task;
          });
          
          console.log('📋 Tasks after removal:', updatedTasks.map(t => ({ id: t.id, task: t.task, children: t.children?.length || 0 })));
          return updatedTasks;
        });
        
        // Also invalidate queries to refresh from server
        await queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
        console.log(`✅ Task ${taskId} removed from local state and queries invalidated`);
      } catch (err) {
        console.error('❌ Failed to delete task from backend:', err);
        console.error('Error details:', {
          message: err?.message,
          status: err?.response?.status,
          statusText: err?.response?.statusText,
          data: err?.response?.data
        });
        
        // Show detailed error to user
        if (typeof window !== 'undefined') {
          const errorMsg = err?.response?.data?.message || err?.message || 'Unknown error occurred';
          window.alert(`Failed to delete task: ${errorMsg}\n\nThe task will be removed locally but may reappear on page refresh.`);
        }
        
        // Still remove locally as fallback
        setTasksFromApi(prev => {
          if (!prev) return prev;
          
          console.log(`⚠️ Fallback removal of task ${taskId}`);
          let updatedTasks = prev.filter(t => t.id !== taskId);
          
          updatedTasks = updatedTasks.map(task => {
            if (task.children && task.children.length > 0) {
              const originalChildCount = task.children.length;
              const updatedChildren = task.children.filter(child => child.id !== taskId);
              const removedChildCount = originalChildCount - updatedChildren.length;
              
              if (removedChildCount > 0) {
                return { 
                  ...task, 
                  children: updatedChildren, 
                  subtaskCount: Math.max(0, (task.subtaskCount || 0) - removedChildCount)
                };
              }
            }
            return task;
          });
          
          return updatedTasks;
        });
        console.log(`⚠️ Task ${taskId} removed locally as fallback`);
      } finally {
        setDeletingTaskId(null);
      }
    })();
  };

  const handleDeleteSubtask = (subtaskId: number, parentId: number) => {
    // Confirm permanent deletion
    const ok = typeof window !== 'undefined' ? window.confirm('Delete this subtask permanently? This cannot be undone.') : true;
    if (!ok) {
      setOpenMenuForTaskId(null);
      return;
    }

    // Set loading state
    setDeletingTaskId(subtaskId);
    setOpenMenuForTaskId(null);

    // Resolve the subtask to get its GUID if available
    const parent = (tasksFromApi || []).find(t => t.id === parentId);
    const child = parent?.children?.find(c => c.id === subtaskId);

    // Call backend delete endpoint using GUID when possible, fallback to TaskId endpoint
    (async () => {
      try {
        console.log(`🗑️ Attempting to delete subtask`, {
          subtaskId,
          parentId,
          subtaskGuidId: child?.guidId
        });

        const response = child?.guidId
          ? await http.delete<void>(`/api/tasks/${child.guidId}`)
          : await http.delete<void>(`/api/tasks/by-task-id/${subtaskId}`);
        console.log(`✅ Subtask ${subtaskId} deleted successfully from backend`, response);
        
        // If backend deletion succeeded, remove locally from parent's children
        setTasksFromApi(prev => {
          if (!prev) return prev;
          console.log(`🔍 Removing subtask ${subtaskId} from parent ${parentId}...`);
          
          let updatedTasks = prev.map(task => {
            if (task.id === parentId && task.children) {
              const originalChildCount = task.children.length;
              const updatedChildren = task.children.filter(child => child.id !== subtaskId);
              const newChildCount = updatedChildren.length;
              
              console.log(`🔄 Parent task ${parentId}: ${originalChildCount} → ${newChildCount} children`);
              
              return { 
                ...task, 
                children: updatedChildren, 
                subtaskCount: Math.max(0, newChildCount)
              };
            }
            return task;
          });

          // As extra safety, remove the subtask if it exists as top-level entry
          updatedTasks = updatedTasks.filter(t => t.id !== subtaskId);
          
          console.log('📋 Tasks after subtask removal:', updatedTasks.map(t => ({ 
            id: t.id, 
            task: t.task, 
            children: t.children?.length || 0 
          })));
          
          return updatedTasks;
        });
        
        // Also invalidate queries to refresh from server
        await queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
        console.log(`✅ Subtask ${subtaskId} removed from local state and queries invalidated`);
      } catch (err) {
        console.error('❌ Failed to delete subtask from backend:', err);
        console.error('Error details:', {
          message: err?.message,
          status: err?.response?.status,
          statusText: err?.response?.statusText,
          data: err?.response?.data
        });
        
        // Show detailed error to user
        if (typeof window !== 'undefined') {
          const errorMsg = err?.response?.data?.message || err?.message || 'Unknown error occurred';
          window.alert(`Failed to delete subtask: ${errorMsg}\n\nThe subtask will be removed locally but may reappear on page refresh.`);
        }
        
        // Local removal as fallback
        setTasksFromApi(prev => {
          if (!prev) return prev;
          console.log(`⚠️ Fallback removal of subtask ${subtaskId} from parent ${parentId}`);
          
          let updated = prev.map(task => {
            if (task.id === parentId && task.children) {
              const updatedChildren = task.children.filter(child => child.id !== subtaskId);
              return { 
                ...task, 
                children: updatedChildren, 
                subtaskCount: Math.max(0, updatedChildren.length)
              };
            }
            return task;
          });
          // And remove any accidental top-level duplicate
          updated = updated.filter(t => t.id !== subtaskId);
          return updated;
        });
        console.log(`⚠️ Subtask ${subtaskId} removed locally as fallback`);
      } finally {
        setDeletingTaskId(null);
      }
    })();
  };

  const handleStartAddSubtask = (parentId: number) => {
    setSubtaskParentId(parentId);
    setSubtaskName('');
    setSubtaskError(null);
  setSubtaskAssignees([]);
    // expand parent so new subtask is visible
    setExpandedTasks(prev => ({ ...prev, [parentId]: true }));
  };

  const handleCancelAddSubtask = () => {
    setSubtaskParentId(null);
    setSubtaskName('');
    setSubtaskError(null);
  setSubtaskAssignees([]);
  };

  const handleAddSubtask = async (parentId: number) => {
    if (!subtaskName.trim()) {
      setSubtaskError('Subtask name is required');
      return;
    }

    setIsAddingSubtask(true);
    setSubtaskError(null);

    try {
      // Find the parent task to get its GUID ID
      const parentTask = tasksFromApi?.find(t => t.id === parentId);
      if (!parentTask?.guidId) {
        throw new Error('Parent task GUID ID not found');
      }

      // Try backend endpoint first. Expecting POST /api/tasks/{parentGuidId}/subtasks
      // Ensure required fields (Description, DueDate) are non-empty and DueDate is YYYY-MM-DD
      const formatToIsoDate = (d?: string) => {
        if (!d) return new Date().toISOString().split('T')[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
        const parsed = new Date(d);
        if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
        return new Date().toISOString().split('T')[0];
      };

      const descriptionValue = (parentTask?.description && parentTask.description.trim()) ? parentTask.description : subtaskName.trim();
      const dueDateValue = parentTask?.dueDate ? formatToIsoDate(parentTask.dueDate) : formatToIsoDate();

      const payload = {
        task: subtaskName.trim(), // Backend expects 'task' field, not 'name'
        description: descriptionValue || '-',
        priority: 'Normal',
        progress: 0,
        dueDate: dueDateValue,
        assigneeIds: subtaskAssignees.map(a => String(a.id)).filter(id => id && id !== 'undefined'),
      };

      let newChild: Task | null = null;

      try {
        // Log payload so backend validation errors can be diagnosed when requests fail
        console.log('📤 Sending subtask creation payload:', payload);
        const created = await http.post<TaskDto>(`/api/tasks/${parentTask.guidId}/subtasks`, payload);

        console.log('📥 Received subtask creation response:', created);
        
        newChild = {
          id: created.id || Date.now() + Math.floor(Math.random() * 1000),
          guidId: created.guidId, // Store the GUID ID from backend response
          task: created.task || subtaskName.trim(),
          description: created.description || '',
          priority: created.priority || 'Normal',
          progress: created.progress || 0,
          dueDate: created.dueDate || '',
          assignee: (created.assignee || []).map(a => ({ 
            id: a.initials, // Use initials as fallback ID since backend doesn't return assignee IDs
            initials: a.initials || 'NA', 
            color: a.color || getRandomColor() 
          })),
          completed: created.completed || false,
          type: created.type,
          subtaskCount: created.subtaskCount || 0,
          commentCount: created.commentCount || 0,
          children: created.children || []
        };
      } catch (apiErr) {
        // If backend not available or returns error, fallback to simulated creation
        console.warn('Subtask API failed, falling back to simulated creation', apiErr);
        // Print any server validation/body response (axios-like shape) to help debugging
        try {
          const ae = apiErr as unknown;
          if (typeof ae === 'object' && ae !== null) {
            const resp = (ae as Record<string, unknown>)['response'];
            if (typeof resp === 'object' && resp !== null) {
              const data = (resp as Record<string, unknown>)['data'];
              console.error('📡 Subtask API error response:', data ?? apiErr);
            } else {
              console.error('📡 Subtask API error:', apiErr);
            }
          } else {
            console.error('📡 Subtask API error:', apiErr);
          }
        } catch (logErr) {
          console.error('📡 Failed to read API error details', logErr);
        }
        await new Promise(resolve => setTimeout(resolve, 700));
        newChild = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          task: subtaskName.trim(),
          description: '',
          priority: 'Normal',
          progress: 0,
          dueDate: '',
          assignee: subtaskAssignees.map(a => ({ id: a.id, initials: a.initials, color: a.color })),
          completed: false,
          type: undefined,
          subtaskCount: 0,
          commentCount: 0,
          children: []
        };
      }

      // Invalidate and refetch employee data to get the updated tasks from backend
      await queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      
        console.log('✅ Subtask created successfully:', newChild);
        console.log('🔄 Refreshing employee data to show new subtask...');

        // Attach newChild to the parent task locally so UI shows the subtask immediately
        if (newChild) {
            // Immediate local attach (for instant UX)
            setTasksFromApi(prev => {
              if (!prev) return prev;

              // Remove any top-level duplicate for the new child (match by id or guidId)
              const withoutDuplicate = prev.filter(t => !((newChild!.guidId && t.guidId === newChild!.guidId) || t.id === newChild!.id));

              // Attach child to the parent entry
              return withoutDuplicate.map(t => {
                if (t.guidId === parentTask.guidId || t.id === parentId) {
                  const children = Array.isArray(t.children) ? [...t.children, newChild!] : [newChild!];
                  return { ...t, children, subtaskCount: (t.subtaskCount || 0) + 1 };
                }
                return t;
              });
            });

            // Record pending subtask so we can dedupe top-level entries after any refetch
            if (newChild.guidId) {
              setPendingSubtasks(prev => ({ ...prev, [String(newChild.guidId)]: { child: newChild!, parentId } }));
            }
        }

      // reset local state
      setSubtaskParentId(null);
      setSubtaskName('');
      setSubtaskAssignees([]);
    } catch (err) {
      console.error('❌ Failed to create subtask:', err);
      setSubtaskError(err instanceof Error ? err.message : 'Failed to create subtask');
    } finally {
      setIsAddingSubtask(false);
    }
  };

  // Handle keyboard events for modal
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAddTaskForm && !isAddingTask) {
        handleCancelAdd();
      }
    };

    if (showAddTaskForm) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [showAddTaskForm, isAddingTask]);

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

  const renderTaskRow = (task, isChild = false, isLast = false, parentId = null) => (
    <tr key={task.id} className={`group hover:bg-blue-50/30 transition-colors transform-gpu hover:shadow-sm hover:scale-[1.001] ${isChild ? 'bg-gray-50/30' : ''}`}>
      <td className="px-6 py-3 whitespace-nowrap">
        <div className="flex items-center gap-3 transition-transform duration-200 ease-out group-hover:translate-x-2">
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
        <div className="flex -space-x-1 transition-transform duration-200 group-hover:scale-105 items-center">
          {task.assignee && task.assignee.length > 0 ? (
            task.assignee.map((person, index) => (
              <div 
                key={index}
                className={`w-7 h-7 rounded-full ${person.color} flex items-center justify-center text-white text-xs font-semibold border-2 border-white shadow-sm transform transition-transform duration-200 group-hover:scale-110`}
                title={person.initials}
              >
                {person.initials}
              </div>
            ))
          ) : (
            // Placeholder faint dots when no assignees — matches reference UI
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-gray-100 border border-gray-200"></div>
              <div className="w-3 h-3 rounded-full bg-gray-100 border border-gray-200"></div>
              <div className="w-3 h-3 rounded-full bg-gray-100 border border-gray-200"></div>
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
        {formatDateLong(task.dueDate)}
      </td>
      <td className="px-6 py-3 whitespace-nowrap">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      </td>
      <td className="px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 max-w-[120px]">
            <div className="w-full bg-gray-200 rounded-full h-2 group-hover:h-3 transition-all duration-200">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(task.progress)}`}
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
      <td className="px-6 py-3 whitespace-nowrap text-right relative">
        <div className="inline-block">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const btn = e.currentTarget as HTMLElement;
              const rect = btn.getBoundingClientRect();
              setMenuPosition({ top: rect.bottom + window.scrollY + 8, left: rect.right + window.scrollX - 176 });
              setOpenMenuForTaskId(openMenuForTaskId === task.id ? null : task.id);
            }}
            className="text-gray-300 hover:text-gray-500 transition-all opacity-0 group-hover:opacity-100 translate-y-0 group-hover:translate-y-0 p-1"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* Dropdown menu opened from the More (...) button */}
          {openMenuForTaskId === task.id && (
            <div
              onClick={(e) => e.stopPropagation()} // prevent immediate close when interacting with menu
              className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-lg"
              style={{ zIndex: 200000 }}
            >
              <ul className="py-1">
                {/* Only show "Add subtask" for main tasks (non-children) */}
                {!isChild && (
                  <li>
                    <button
                      onClick={() => { setOpenMenuForTaskId(null); handleStartAddSubtask(task.id); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      + Add subtask
                    </button>
                  </li>
                )}
                <li>
                  <button
                    onClick={() => handleEditTask(task.id)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </button>
                </li>
                <li>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log(`🖱️ Delete button clicked for task ${task.id}`, {
                        taskId: task.id,
                        isChild,
                        parentId,
                        task: task.task
                      });
                      
                      if (isChild && parentId !== null) {
                        console.log(`🏗️ Calling handleDeleteSubtask(${task.id}, ${parentId})`);
                        handleDeleteSubtask(task.id, parentId);
                      } else {
                        console.log(`🏗️ Calling handleDeleteTask(${task.id})`);
                        handleDeleteTask(task.id);
                      }
                    }}
                    disabled={deletingTaskId === task.id}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {deletingTaskId === task.id ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </td>
    </tr>
  );

  // Render portal menu outside main stacking contexts
  const portalMenu = (taskId: number, isChild = false, parentId = null) => {
    if (openMenuForTaskId !== taskId || !menuPosition) return null;

    return createPortal(
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'absolute', top: menuPosition.top, left: menuPosition.left, zIndex: 300000 }}
      >
        <div className="w-44 bg-white border border-gray-200 rounded-md shadow-lg">
          <ul className="py-1">
            {/* Only show "Add subtask" for main tasks (non-children) */}
            {!isChild && (
              <li>
                <button
                  onClick={() => { setOpenMenuForTaskId(null); handleStartAddSubtask(taskId); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  + Add subtask
                </button>
              </li>
            )}
            <li>
              <button
                onClick={() => handleEditTask(taskId)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
            </li>
            <li>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log(`🖱️ Portal delete button clicked for task ${taskId}`, {
                    taskId,
                    isChild,
                    parentId
                  });
                  
                  if (isChild && parentId !== null) {
                    console.log(`🏗️ Portal calling handleDeleteSubtask(${taskId}, ${parentId})`);
                    handleDeleteSubtask(taskId, parentId);
                  } else {
                    console.log(`🏗️ Portal calling handleDeleteTask(${taskId})`);
                    handleDeleteTask(taskId);
                  }
                }}
                disabled={deletingTaskId === taskId}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deletingTaskId === taskId ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </li>
          </ul>
        </div>
      </div>,
      document.body
    );
  };

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

      {/* Tasks loading / error banners */}
      {tasksLoading && (
        <div className="px-6 py-2 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center gap-2 text-blue-600 text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Loading task data...</span>
          </div>
        </div>
      )}

      {tasksError && (
        <div className="px-6 py-2 bg-red-50 border-b border-red-200">
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <span>❌ Error loading task data. Check console for details.</span>
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
                <span className="text-white text-xs font-semibold">{tasks.length}</span>
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
            <span className="text-xs bg-yellow-200 px-1.5 py-0.5 rounded font-medium">
              {tasks.filter(task => !task.completed && task.progress > 0).length}
            </span>
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
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <React.Fragment key={task.id}>
                  {renderTaskRow(task)}
                  {portalMenu(task.id)}
                      {task.children && expandedTasks[task.id] && task.children.map((child, index) => (
                        <React.Fragment key={child.id}>
                          {renderTaskRow(child, true, index === task.children.length - 1, task.id)}
                          {portalMenu(child.id, true, task.id)}
                        </React.Fragment>
                      ))}

                      {/* Inline subtask form for this parent */}
                      {subtaskParentId === task.id && (
                        <tr className="bg-gray-50 relative" style={{ zIndex: 99999, position: 'relative' }}>
                          <td colSpan={8} className="px-6 py-3">
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={subtaskName}
                                  onChange={(e) => setSubtaskName(e.target.value)}
                                  placeholder="Subtask name"
                                  disabled={isAddingSubtask}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                />

                                {/* Selected assignees */}
                                {subtaskAssignees.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {subtaskAssignees.map((a, i) => (
                                      <div key={i} className={`flex items-center gap-2 px-2 py-1 rounded-full text-white text-xs ${a.color}`}>
                                        <span>{a.initials}</span>
                                        <button type="button" onClick={() => setSubtaskAssignees(prev => prev.filter((_, idx) => idx !== i))} className="ml-1 text-white">×</button>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Employee select for subtask assignees */}
                                {employees && employees.length > 0 && (
                                  <div className="mt-2">
                                    <select
                                      value=""
                                      onChange={(e) => {
                                        const emp = employees.find(emp => String(emp.id) === e.target.value);
                                        if (emp) {
                                          const initials = generateInitials(emp.fullName);
                                          // avoid duplicates
                                          if (!subtaskAssignees.some(s => String(s.id) === String(emp.id))) {
                                            setSubtaskAssignees(prev => [...prev, { id: emp.id, initials, color: getRandomAssigneeColor() }]);
                                          }
                                        }
                                      }}
                                      disabled={isAddingSubtask}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                      <option value="">Assign employee to subtask...</option>
                                      {employees.filter(emp => emp.isActive).map(emp => (
                                        <option key={String(emp.id)} value={String(emp.id)}>{emp.fullName} - {emp.jobTitle || 'No Title'}</option>
                                      ))}
                                    </select>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleAddSubtask(task.id)}
                                  disabled={isAddingSubtask}
                                  className="px-3 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
                                >
                                  {isAddingSubtask ? 'Adding...' : 'Add'}
                                </button>
                                <button
                                  onClick={handleCancelAddSubtask}
                                  disabled={isAddingSubtask}
                                  className="px-3 py-2 bg-gray-100 rounded-md"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                            {subtaskError && <div className="text-sm text-red-600 mt-2">{subtaskError}</div>}
                          </td>
                        </tr>
                      )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-lg font-medium">No tasks found</div>
                    <div className="text-sm">
                      {tasksLoading 
                        ? "Loading tasks from API..." 
                        : tasksError 
                          ? "Failed to load tasks from API"
                          : "No tasks are currently available for this project"
                      }
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Add Task Button */}
      <div className="px-6 py-4 border-t border-gray-200">
        <button 
          onClick={() => setShowAddTaskForm(true)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Add task</span>
        </button>
      </div>

      {/* Add Task Form Modal */}
      {showAddTaskForm && (
        <AddTaskForm 
          newTask={newTask}
          setNewTask={setNewTask}
          isAddingTask={isAddingTask}
          addTaskError={addTaskError}
          setAddTaskError={setAddTaskError}
          handleAddTask={handleAddTask}
          handleCancelAdd={handleCancelAdd}
          employees={employees}
          isEditing={!!editingTaskId}
        />
      )}
    </div>
  );
};

export default Projects;