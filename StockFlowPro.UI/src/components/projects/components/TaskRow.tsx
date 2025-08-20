import React from 'react';
import { createPortal } from 'react-dom';
import { GripVertical, MessageSquare, MoreHorizontal } from 'lucide-react';
import { Task } from '../types/task';
import { formatDateLong } from '../utils/dates';

export type TaskRowProps = {
  task: Task;
  expanded: boolean;
  isChild?: boolean;
  isLast?: boolean;
  parentId?: number | null;
  onToggleExpand: (taskId: number) => void;
  getPriorityColor: (p?: string) => string;
  getProgressColor: (n?: number) => string;
  deletingTaskId: number | null;
  onStartAddSubtask: (parentId: number) => void;
  onEditTask: (id: number) => void;
  onDeleteTask: (id: number) => void;
  onDeleteSubtask: (id: number, parentId: number) => void;
  openMenuForTaskId: number | null;
  setOpenMenuForTaskId: (id: number | null) => void;
};

const TaskRow: React.FC<TaskRowProps> = ({
  task,
  expanded,
  isChild = false,
  isLast = false,
  parentId = null,
  onToggleExpand,
  getPriorityColor,
  getProgressColor,
  deletingTaskId,
  onStartAddSubtask,
  onEditTask,
  onDeleteTask,
  onDeleteSubtask,
  openMenuForTaskId,
  setOpenMenuForTaskId,
}) => {
  const [localMenuPos, setLocalMenuPos] = React.useState<{ top: number; left: number } | null>(null);
  return (
    <>
      <tr key={task.id} className={`group hover:bg-blue-50/30 transition-colors transform-gpu hover:shadow-sm hover:scale-[1.001] ${isChild ? 'bg-gray-50/30' : ''}`}>
        <td className="px-6 py-3 whitespace-nowrap">
          <div className="flex items-center gap-3 transition-transform duration-200 ease-out group-hover:translate-x-2">
            {isChild && (
              <div className="flex items-center mr-1">
                <div className="w-6 h-6 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute -top-3 left-3 w-px h-5 bg-gray-300"></div>
                    <div className="w-3 h-px bg-gray-300"></div>
                    {!isLast && <div className="absolute top-2 left-3 w-px h-5 bg-gray-300"></div>}
                  </div>
                </div>
              </div>
            )}
            {task.type === 'parent' && (
              <button 
                onClick={() => onToggleExpand(task.id)}
                className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className={`transform transition-transform text-xs ${expanded ? 'rotate-90' : ''}`}>
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
                if (openMenuForTaskId === task.id) {
                  setOpenMenuForTaskId(null);
                  setLocalMenuPos(null);
                } else {
                  const btn = e.currentTarget as HTMLElement;
                  const rect = btn.getBoundingClientRect();
                  const position = { 
                    top: rect.bottom + window.scrollY + 8, 
                    left: rect.right + window.scrollX - 176 
                  };
                  setLocalMenuPos(position);
                  setOpenMenuForTaskId(task.id);
                }
              }}
              className="text-gray-300 hover:text-gray-500 transition-all opacity-0 group-hover:opacity-100 translate-y-0 group-hover:translate-y-0 p-1"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>

      {openMenuForTaskId === task.id && localMenuPos && createPortal(
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed bg-white border border-gray-200 rounded-md shadow-xl w-44"
          style={{ 
            zIndex: 9998,
            top: `${localMenuPos.top}px`,
            left: `${localMenuPos.left}px`
          }}
        >
          <ul className="py-1">
            {!isChild && (
              <li>
                <button
                  onClick={() => { setOpenMenuForTaskId(null); onStartAddSubtask(task.id); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  + Add subtask
                </button>
              </li>
            )}
            <li>
              <button
                onClick={() => onEditTask(task.id)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
            </li>
            <li>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isChild && parentId !== null) {
                    onDeleteSubtask(task.id, parentId);
                  } else {
                    onDeleteTask(task.id);
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
        </div>,
        document.body
      )}
    </>
  );
};

export default TaskRow;
