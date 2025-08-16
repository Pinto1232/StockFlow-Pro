import React, { useState } from 'react';
import { X, Edit3, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from '../../hooks/departments';

interface DepartmentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DepartmentManagementModal: React.FC<DepartmentManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Department CRUD state/hooks
  const { data: departments = [], isLoading: isLoadingDepartments } = useDepartments(false);
  const createDepartmentMutation = useCreateDepartment();
  const updateDepartmentMutation = useUpdateDepartment();
  const deleteDepartmentMutation = useDeleteDepartment();
  
  const [newDept, setNewDept] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleCreateDepartment: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const name = newDept.trim();
    if (!name) return;
    createDepartmentMutation.mutate(
      { name },
      { onSuccess: () => setNewDept("") },
    );
  };

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const saveEdit = (id: string, currentIsActive: boolean) => {
    const name = editName.trim();
    if (!name) return;
    updateDepartmentMutation.mutate(
      { id, dto: { name, isActive: currentIsActive } },
      { onSuccess: () => cancelEdit() },
    );
  };

  const toggleActive = (id: string, name: string, isActive: boolean) => {
    updateDepartmentMutation.mutate({ id, dto: { name, isActive: !isActive } });
  };

  const removeDepartment = (id: string) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      deleteDepartmentMutation.mutate(id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="relative inline-block w-full max-w-4xl p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Department Management</h2>
              <p className="text-gray-600">Create, rename, activate/deactivate, and delete departments.</p>
            </div>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center w-8 h-8 text-gray-400 bg-transparent rounded-md hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Create new department form */}
          <form onSubmit={handleCreateDepartment} className="mb-8 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newDept}
              onChange={(e) => setNewDept(e.target.value)}
              placeholder="New department name"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={createDepartmentMutation.isPending}
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {createDepartmentMutation.isPending ? 'Adding…' : 'Add Department'}
            </button>
          </form>

          {/* Departments list */}
          <div className="max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoadingDepartments ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="p-5 rounded-xl border border-gray-200 bg-gray-50 animate-pulse h-24" />
                ))
              ) : departments.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500 text-lg">No departments found.</p>
                  <p className="text-gray-400 text-sm mt-2">Create your first department using the form above.</p>
                </div>
              ) : (
                departments.map((d) => (
                  <div key={d.id} className="p-5 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      {editingId === d.id ? (
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={() => saveEdit(d.id, d.isActive)}
                            disabled={updateDepartmentMutation.isPending}
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-semibold text-gray-900">{d.name}</h3>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEdit(d.id, d.name)}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Edit department"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeDepartment(d.id)}
                              disabled={deleteDepartmentMutation.isPending}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                              title="Delete department"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    {editingId !== d.id && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            d.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {d.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => toggleActive(d.id, d.name, d.isActive)}
                          disabled={updateDepartmentMutation.isPending}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50 ${
                            d.isActive
                              ? 'bg-red-50 text-red-700 hover:bg-red-100'
                              : 'bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                          title={d.isActive ? 'Deactivate department' : 'Activate department'}
                        >
                          {d.isActive ? (
                            <>
                              <ToggleRight className="w-4 h-4" />
                              <span>Deactivate</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4" />
                              <span>Activate</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentManagementModal;