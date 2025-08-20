import React from 'react';
import { EmployeeData } from '../types/task';
import { generateInitials, getRandomAssigneeColor } from '../utils/assignees';

export interface InlineSubtaskFormProps {
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
}

const InlineSubtaskForm: React.FC<InlineSubtaskFormProps> = ({
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
}) => {
  return (
    <tr className="bg-gray-50 relative z-20">
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

            {employees && employees.length > 0 && (
              <div className="mt-2">
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
                  <option value="">Assign employee to subtask...</option>
                  {employees.map(emp => (
                    <option key={String(emp.id)} value={String(emp.id)}>
                      {emp.fullName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAdd(parentId)}
              disabled={isAddingSubtask}
              className="px-3 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
            >
              {isAddingSubtask ? 'Adding...' : 'Add'}
            </button>
            <button
              onClick={onCancel}
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
  );
};

export default InlineSubtaskForm;
