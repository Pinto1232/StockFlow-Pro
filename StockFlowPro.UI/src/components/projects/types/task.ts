// Shared Task-related interfaces for Projects module
export interface Task {
  id: number;
  guidId?: string; // GUID primary key for backend operations
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

export interface NewTaskForm {
  task: string;
  description?: string;
  priority: string;
  progress: number;
  dueDate?: string;
  assignee: { id?: string | number; initials: string; color: string }[];
}

export interface EmployeeData {
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

export interface TaskDto {
  id: number;
  guidId: string; // GUID primary key for backend operations
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
