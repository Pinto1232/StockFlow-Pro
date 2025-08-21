import React, { useState, useEffect } from 'react';
import { MoreHorizontal, Plus } from 'lucide-react';
import { useEmployees } from '../../hooks/employees';
import { http } from '../../services/api/client';
import { queryClient } from '../../services/queryClient';
import { employeeKeys } from '../../services/queryKeys';
// Modularized types and components
import { EmployeeData, NewTaskForm, Task, TaskDto } from './types/task';
import { getRandomColor } from './utils/assignees';
import AddTaskForm from './components/AddTaskForm';
import TaskRow from './components/TaskRow';
import ProjectsHeader from './components/ProjectsHeader';
import ProjectsTabs from './components/ProjectsTabs';
import InlineSubtaskForm from './components/InlineSubtaskForm';
import SubtaskPopoverForm from './components/SubtaskPopoverForm';
import LoadingState from '../ui/LoadingState';
import { useToast } from '../../hooks/useToast';

interface ProjectsProps { externalEmployees?: unknown[] }
import styles from './styles.module.css';


export const Projects: React.FC<ProjectsProps> = ({ externalEmployees }) => {
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
  const { toast } = useToast();

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

  // getRandomColor and formatDateLong moved to utils

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
          if (/^\d{4}-\d{2}-\d{2}$/.test(taskData.dueDate)) {
            formattedDueDate = taskData.dueDate;
          } else {
            const date = new Date(taskData.dueDate);
            if (!isNaN(date.getTime())) {
              formattedDueDate = date.toISOString().split('T')[0];
            }
          }
        } catch (err) {
          console.warn('Invalid date format, using empty string:', taskData.dueDate, err);
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

    let updatedSuccessfully = false;
  const wasEdit = editingTaskId !== null;
    let originalAssigneeIds: string[] = [];
    if (wasEdit && editingTaskId !== null) {
      // Capture original assignees (for parent or child)
      const findInTree = () => {
        const top = (tasksFromApi || []).find(t => t.id === editingTaskId);
        if (top) return top;
        for (const p of (tasksFromApi || [])) {
          const c = p.children?.find(ch => ch.id === editingTaskId);
          if (c) return c;
        }
        return undefined;
      };
      const originalTask = findInTree();
      if (originalTask?.assignee) {
        originalAssigneeIds = originalTask.assignee.map(a => String(a.id));
      }
    }
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
            setTasksFromApi(prev => {
              if (!prev) return prev;
              return prev.map(t => {
                if (t.id === editingTaskId) {
                  return { ...t, task: newTask.task, description: newTask.description || '', dueDate: newTask.dueDate || '', priority: newTask.priority, progress: newTask.progress };
                }
                if (t.children && t.children.length) {
                  const updatedChildren = t.children.map(c => c.id === editingTaskId ? ({ ...c, task: newTask.task, description: newTask.description || '', dueDate: newTask.dueDate || '', priority: newTask.priority, progress: newTask.progress }) : c);
                  return { ...t, children: updatedChildren };
                }
                return t;
              });
            });
          }
          updatedSuccessfully = true;
        } catch (updateErr) {
          console.error('❌ Failed to update task via API, applying local update fallback:', updateErr);
          setTasksFromApi(prev => {
            if (!prev) return prev;
            return prev.map(t => {
              if (t.id === editingTaskId) {
                return { ...t, task: newTask.task, description: newTask.description || '', dueDate: newTask.dueDate || '', priority: newTask.priority, progress: newTask.progress };
              }
              if (t.children && t.children.length) {
                const updatedChildren = t.children.map(c => c.id === editingTaskId ? ({ ...c, task: newTask.task, description: newTask.description || '', dueDate: newTask.dueDate || '', priority: newTask.priority, progress: newTask.progress }) : c);
                return { ...t, children: updatedChildren };
              }
              return t;
            });
          });
          setNewTask({ task: '', description: '', priority: 'Normal', progress: 0, dueDate: '', assignee: [] });
          setShowAddTaskForm(false);
          setEditingTaskId(null);
          updatedSuccessfully = true; // treat fallback as success for closing
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
      if (updatedSuccessfully) {
        // Provide toast feedback
        if (wasEdit) {
          const newIds = (newTask.assignee || []).map(a => String(a.id));
            const origSet = new Set(originalAssigneeIds);
            const newSet = new Set(newIds);
            let changed = false;
            if (origSet.size !== newSet.size) changed = true; else for (const id of newSet) { if (!origSet.has(id)) { changed = true; break; } }
            if (changed && newSet.size > 0) {
              toast.success(`Task updated. Assigned to ${newSet.size} ${newSet.size === 1 ? 'person' : 'people'}.`);
            } else if (changed && newSet.size === 0) {
              toast.warning('Task updated. All assignees removed.');
            } else {
              toast.info('Task updated.');
            }
        } else {
          toast.success('Task created.');
        }
        // Reset and close modal after successful update/create
        setNewTask({ task: '', description: '', priority: 'Normal', progress: 0, dueDate: '', assignee: [] });
        setShowAddTaskForm(false);
        setEditingTaskId(null);
      } else if (addTaskError) {
        toast.error(addTaskError);
      }
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
  const [subtaskAnchorEl, setSubtaskAnchorEl] = useState<HTMLElement | null>(null);

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
    // Menu closes when openMenuForTaskId changes to null
  }, [openMenuForTaskId]);

  // Editing state for tasks (supports parent or child by locating in data set)
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  const handleEditTask = (taskId: number) => {
    let found: Task | undefined = (tasksFromApi || []).find(t => t.id === taskId);
    if (!found) {
      for (const parent of (tasksFromApi || [])) {
        const child = parent.children?.find(c => c.id === taskId);
        if (child) { found = child; break; }
      }
    }
    if (!found) return;
    setNewTask({
      task: found.task || '',
      description: found.description || '',
      priority: found.priority || 'Normal',
      progress: found.progress || 0,
      dueDate: found.dueDate || '',
      assignee: found.assignee || []
    });
    setEditingTaskId(taskId);
  // parentId captured if needed later for specialized subtask editing UI
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
          console.log(`⚠️ Task ${taskId} removed locally as fallback`);
          return updatedTasks;
        });
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

  const handleStartAddSubtask = (parentId: number, anchorEl?: HTMLElement | null) => {
    setSubtaskParentId(parentId);
    setSubtaskName('');
    setSubtaskError(null);
    setSubtaskAssignees([]);
    setExpandedTasks(prev => ({ ...prev, [parentId]: true }));
    setSubtaskAnchorEl(anchorEl || null);
  };

  const handleCancelAddSubtask = () => {
    setSubtaskParentId(null);
    setSubtaskName('');
    setSubtaskError(null);
    setSubtaskAssignees([]);
    setSubtaskAnchorEl(null);
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

  // Task row moved to TaskRow component

  // Portal menu moved inside TaskRow dropdown

  return (
    <div className={`${styles.root} bg-white rounded-lg shadow-sm border border-gray-200`}>
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
  <ProjectsHeader title="Adrian Bert - CRM Dashboard" tasksCount={tasks.length} />

  {/* Navigation Tabs */}
  <ProjectsTabs activeView={activeView} onChange={setActiveView} />

  {/* Content wrapper: disable interactions when modal is open */}
  <div className={showAddTaskForm ? 'pointer-events-none' : ''} aria-hidden={showAddTaskForm ? true : undefined}>
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
            {tasksLoading ? (
              <tr>
                <td colSpan={8} className="p-0">
                  <div className="flex items-center justify-center w-full h-64 min-h-[16rem]">
                    <LoadingState variant="spinner" size="lg" message="Loading tasks..." />
                  </div>
                </td>
              </tr>
            ) : tasks.length > 0 ? (
              tasks.map((task) => (
                <React.Fragment key={task.id}>
                  <TaskRow
                    task={task}
                    expanded={!!expandedTasks[task.id]}
                    isChild={false}
                    onToggleExpand={toggleExpand}
                    getPriorityColor={getPriorityColor}
                    getProgressColor={getProgressColor}
                    deletingTaskId={deletingTaskId}
                    onStartAddSubtask={handleStartAddSubtask}
                    onEditTask={handleEditTask}
                    onDeleteTask={handleDeleteTask}
                    onDeleteSubtask={handleDeleteSubtask}
                    openMenuForTaskId={openMenuForTaskId}
                    setOpenMenuForTaskId={setOpenMenuForTaskId}
                  />
                  {task.children && expandedTasks[task.id] && task.children.map((child, index) => (
                    <TaskRow
                      key={child.id}
                      task={child}
                      expanded={false}
                      isChild
                      isLast={index === task.children.length - 1}
                      parentId={task.id}
                      onToggleExpand={toggleExpand}
                      getPriorityColor={getPriorityColor}
                      getProgressColor={getProgressColor}
                      deletingTaskId={deletingTaskId}
                      onStartAddSubtask={handleStartAddSubtask}
                      onEditTask={handleEditTask}
                      onDeleteTask={handleDeleteTask}
                      onDeleteSubtask={handleDeleteSubtask}
                      openMenuForTaskId={openMenuForTaskId}
                      setOpenMenuForTaskId={setOpenMenuForTaskId}
                    />
                  ))}

                  {subtaskParentId === task.id && !subtaskAnchorEl && (
                    <InlineSubtaskForm
                      parentId={task.id}
                      subtaskName={subtaskName}
                      setSubtaskName={setSubtaskName}
                      isAddingSubtask={isAddingSubtask}
                      subtaskError={subtaskError}
                      employees={employees}
                      subtaskAssignees={subtaskAssignees}
                      setSubtaskAssignees={setSubtaskAssignees}
                      onAdd={handleAddSubtask}
                      onCancel={handleCancelAddSubtask}
                    />
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
    {subtaskParentId !== null && (
        <SubtaskPopoverForm
          parentId={subtaskParentId}
          subtaskName={subtaskName}
          setSubtaskName={setSubtaskName}
          isAddingSubtask={isAddingSubtask}
          subtaskError={subtaskError}
          employees={employees}
          subtaskAssignees={subtaskAssignees}
          setSubtaskAssignees={setSubtaskAssignees}
      onAdd={(pid) => { handleAddSubtask(pid); setSubtaskAnchorEl(null); }}
          onCancel={handleCancelAddSubtask}
          onRequestClose={handleCancelAddSubtask}
        />
      )}
    </div>
  );
};
