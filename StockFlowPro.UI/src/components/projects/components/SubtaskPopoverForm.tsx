import React, { useEffect, useRef } from 'react';
import { EmployeeData } from '../types/task';
import { generateInitials, getRandomAssigneeColor } from '../utils/assignees';

export interface SubtaskPopoverFormProps {
  parentId: number;
  subtaskName: string;
  setSubtaskName: (v: string) => void;
  isAddingSubtask: boolean;
  subtaskError: string | null;
  employees: EmployeeData[] | null;
  subtaskAssignees: { id?: string | number; initials: string; color: string }[];
  setSubtaskAssignees: React.Dispatch<React.SetStateAction<{ id?: string | number; initials: string; color: string }[]>>;
  onAdd: (parentId: number) => void;
  onCancel: () => void;
  onRequestClose: () => void;
}

// Centered modal no longer needs dynamic width calculation beyond tailwind classes

const SubtaskPopoverForm: React.FC<SubtaskPopoverFormProps> = ({
  parentId,
  subtaskName,
  setSubtaskName,
  isAddingSubtask,
  subtaskError,
  employees,
  subtaskAssignees,
  setSubtaskAssignees,
  onAdd,
  onCancel,
  onRequestClose,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // focus when opening
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  // Outside click to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onRequestClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onRequestClose]);

  // Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onRequestClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onRequestClose]);

  return (
    <div
      ref={ref}
  className="fixed z-[10000] w-[480px] max-w-[95vw] bg-white shadow-2xl border border-gray-200 rounded-xl p-5 animate-fadeIn"
  style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-800">Add Subtask</h3>
        <p className="text-xs text-gray-500 mt-0.5">Parent task #{parentId}</p>
      </div>
      <div className="space-y-3">
        <div>
          <input
            ref={inputRef}
            type="text"
            value={subtaskName}
            onChange={(e) => setSubtaskName(e.target.value)}
            placeholder="Subtask name"
            disabled={isAddingSubtask}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {employees && employees.length > 0 && (
          <select
            value=""
            onChange={(e) => {
              const emp = employees.find(emp => String(emp.id) === e.target.value);
              if (emp) {
                const initials = generateInitials(emp.fullName);
                if (!subtaskAssignees.some(s => String(s.id) === String(emp.id))) {
                  setSubtaskAssignees(prev => [...prev, { id: emp.id, initials, color: getRandomAssigneeColor() }]);
                }
              }
            }}
            disabled={isAddingSubtask}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Assign employee...</option>
            {employees.filter(emp => emp.isActive).map(emp => (
              <option key={String(emp.id)} value={String(emp.id)}>
                {emp.fullName}
              </option>
            ))}
          </select>
        )}
        {subtaskAssignees.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {subtaskAssignees.map((a, i) => (
              <div key={i} className={`flex items-center gap-2 px-2 py-1 rounded-full text-white text-xs ${a.color}`}>
                <span>{a.initials}</span>
                <button type="button" onClick={() => setSubtaskAssignees(prev => prev.filter((_, idx) => idx !== i))} className="ml-1 text-white">×</button>
              </div>
            ))}
          </div>
        )}
        {subtaskError && <div className="text-sm text-red-600">{subtaskError}</div>}
      </div>
      <div className="mt-5 flex items-center justify-end gap-2">
        <button
          onClick={() => { onCancel(); onRequestClose(); }}
          disabled={isAddingSubtask}
          className="px-3 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={() => onAdd(parentId)}
          disabled={isAddingSubtask}
          className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isAddingSubtask ? 'Adding...' : 'Add Subtask'}
        </button>
      </div>
    </div>
  );
};

export default SubtaskPopoverForm;
