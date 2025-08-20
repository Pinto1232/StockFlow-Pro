import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface EmployeeData {
  id: string | number;
  fullName: string;
  jobTitle?: string;
}

interface CustomAnimatedDropdownProps {
  employees: EmployeeData[];
  onSelect: (employee: EmployeeData) => void;
  disabled?: boolean;
  assignedIds: string[];
}

const CustomAnimatedDropdown: React.FC<CustomAnimatedDropdownProps> = ({ employees, onSelect, disabled, assignedIds }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Keyboard accessibility
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const availableEmployees = employees.filter(
    (emp) => !assignedIds.includes(String(emp.id))
  );

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md disabled:bg-gray-100 disabled:cursor-not-allowed ${open ? "ring-2 ring-blue-400" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-gray-700 font-medium">
          Select an employee to assign...
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 ml-2 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        ref={menuRef}
        className={`absolute left-0 mt-2 w-full z-50 bg-white border border-gray-200 rounded-lg shadow-2xl overflow-hidden transition-all duration-300 max-h-64 overflow-y-auto ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}
        style={{ minWidth: "100%" }}
        role="listbox"
      >
        {availableEmployees.length === 0 ? (
          <div className="px-4 py-3 text-gray-400 text-sm">No employees available</div>
        ) : (
          availableEmployees.map((employee) => (
            <button
              key={employee.id}
              type="button"
              onClick={() => {
                onSelect(employee);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-3 bg-white hover:bg-blue-50 focus:bg-blue-100 transition-colors duration-150 text-gray-700 font-medium flex items-center gap-2 border-b last:border-b-0"
              role="option"
            >
              <span className="flex-1">{employee.fullName}</span>
              <span className="text-xs text-gray-500">ID: {employee.id}</span>
              {employee.jobTitle && (
                <span className="text-xs text-gray-400">{employee.jobTitle}</span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default CustomAnimatedDropdown;
