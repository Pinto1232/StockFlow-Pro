import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createPortal } from "react-dom";
import {
    Home,
    Briefcase,
    Users,
    Search,
    Filter,
    Plus,
    Mail,
    Phone,
    Edit,
    BadgeCheck,
    Calendar,
    Camera,
    ChevronDown,
    Building2,
    UserCheck,
    GripVertical,
    Bookmark,
    Trash2,
    ToggleLeft,
    ToggleRight,
} from "lucide-react";
import { useCreateEmployee, useEmployees, useUploadEmployeeImage, type EmployeeDto } from "../../hooks/employees";
import { useCreateDepartment, useDeleteDepartment, useDepartments, useUpdateDepartment } from "../../hooks/departments";

// Modern, accessible checkbox for selection
interface ModernCheckboxProps {
    checked: boolean;
    onChange: () => void;
    ariaLabel?: string;
    title?: string;
    colorizeBackground?: boolean; // if false, do not fill blue when checked
}

const ModernCheckbox: React.FC<ModernCheckboxProps> = ({ checked, onChange, ariaLabel, title, colorizeBackground = true }) => (
    <label className="group relative inline-flex items-center cursor-pointer select-none" title={title}>
        <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            aria-label={ariaLabel}
            className="peer sr-only"
        />
        <span
            className={
                "h-6 w-6 rounded-md border bg-white shadow-sm transition-all duration-200 " +
                "flex items-center justify-center " +
                "group-hover:shadow-md group-active:scale-95 " +
                "peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2 " +
                "peer-checked:border-blue-600 " +
                (colorizeBackground ? "peer-checked:bg-blue-600 " : "") +
                "peer-checked:[&>svg]:opacity-100 peer-checked:[&>svg]:scale-100"
            }
        >
            <svg
                className={
                    "h-4 w-4 transition-all duration-200 opacity-0 scale-75 " +
                    (colorizeBackground ? "text-white" : "text-blue-600")
                }
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M6 10l2 2 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </span>
    </label>
);

// Saved views types
type DirectoryView = {
    id: string;
    name: string;
    search: string;
    department: string;
    position: string;
    settings: FieldSettings;
};

type FieldSettings = {
    showEmail: boolean;
    showPhone: boolean;
    showJobTitle: boolean;
    showHireDate: boolean;
};

function initials(first?: string | null, last?: string | null) {
    const f = (first ?? "").trim();
    const l = (last ?? "").trim();
    const fi = f ? f[0]! : "";
    const li = l ? l[0]! : "";
    return (fi + li || "??").toUpperCase();
}

function buildFullName(first?: string | null, last?: string | null) {
    return `${first ?? ""} ${last ?? ""}`.trim();
}

function resolveImageUrl(url?: string | null, cacheBusting: boolean = false) {
    if (!url) return undefined;
    if (/^https?:\/\//i.test(url)) {
        // For absolute URLs, add cache busting if needed
        if (cacheBusting) {
            const separator = url.includes('?') ? '&' : '?';
            return `${url}${separator}t=${Date.now()}`;
        }
        return url;
    }
    const base = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');
    const origin = base.endsWith('/api') ? base.slice(0, -4) : base;
    if (!origin) return url;
    const fullUrl = url.startsWith('/') ? `${origin}${url}` : `${origin}/${url}`;
    
    // Add cache busting for relative URLs if needed
    if (cacheBusting) {
        const separator = fullUrl.includes('?') ? '&' : '?';
        return `${fullUrl}${separator}t=${Date.now()}`;
    }
    return fullUrl;
}

function statusToLabel(status: EmployeeDto['status'] | number): string {
    // Backend example shows numeric codes: 0 Onboarding, 1 Active, 2 Suspended, 3 Offboarding, 4 Terminated
    if (typeof status === "number") {
        switch (status) {
            case 0: return "Onboarding";
            case 1: return "Active";
            case 2: return "Suspended";
            case 3: return "Offboarding";
            case 4: return "Terminated";
            default: return String(status);
        }
    }
    if (typeof status === "string") return status;
    return "Unknown";
}

function statusClasses(label: string): string {
    switch (label) {
        case "Active": return "bg-green-100 text-green-800";
        case "Onboarding": return "bg-blue-100 text-blue-800";
        case "Suspended": return "bg-yellow-100 text-yellow-800";
        case "Offboarding": return "bg-purple-100 text-purple-800";
        case "Terminated": return "bg-red-100 text-red-800";
        default: return "bg-gray-100 text-gray-800";
    }
}

function normalize(str?: string | null) {
    return (str ?? "").toLowerCase();
}

function fuzzyMatch(needle: string, haystack: string): boolean {
    // Basic fuzzy: direct include or all chars in order (subsequence)
    const n = normalize(needle);
    const h = normalize(haystack);
    if (!n) return true;
    if (h.includes(n)) return true;
    // subsequence
    let i = 0;
    for (const c of h) {
        if (c === n[i]) i++;
        if (i === n.length) return true;
    }
    return false;
}

// Custom Dropdown Component
interface CustomDropdownProps {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder: string;
    icon: React.ReactNode;
    className?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
    value,
    onChange,
    options,
    placeholder,
    icon,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = options.find(opt => opt.value === value);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    // Positioning for portal menu
    const triggerRef = React.useRef<HTMLButtonElement | null>(null);
    const [menuPos, setMenuPos] = useState<{ left: number; top: number; width: number }>({ left: 0, top: 0, width: 0 });
    const updateMenuPos = () => {
        const el = triggerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        // For fixed positioning, use viewport coordinates directly
        setMenuPos({ left: rect.left, top: rect.bottom + 8, width: rect.width });
    };
    useEffect(() => {
        if (!isOpen) return;
        updateMenuPos();
        const onScroll = () => updateMenuPos();
        const onResize = () => updateMenuPos();
        window.addEventListener('scroll', onScroll, true);
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('scroll', onScroll, true);
            window.removeEventListener('resize', onResize);
        };
    }, [isOpen]);

    return (
        <div className={`relative ${className}`} onKeyDown={handleKeyDown}>
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
            >
                <div className="flex-shrink-0 text-gray-500">
                    {icon}
                </div>
                <span className="flex-1 text-left text-gray-700 font-medium whitespace-nowrap">
                    {selectedOption?.label || placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
            </button>
            
            {isOpen && createPortal(
                <>
                    <div
                        className="fixed inset-0 z-[1000]"
                        onClick={() => setIsOpen(false)}
                    />
                    <div
                        className="fixed z-[1001] bg-white border border-gray-200 rounded-lg shadow-2xl max-h-60 overflow-auto ring-1 ring-black ring-opacity-5"
                        style={{ left: menuPos.left, top: menuPos.top, minWidth: menuPos.width }}
                    >
                        {options.map((option, index) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 ${
                                    value === option.value 
                                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                                        : 'text-gray-700 hover:text-gray-900'
                                } ${
                                    index === 0 ? 'rounded-t-lg' : ''
                                } ${
                                    index === options.length - 1 ? 'rounded-b-lg' : ''
                                }`}
                                role="option"
                                aria-selected={value === option.value}
                            >
                                <div className={`flex-shrink-0 ${value === option.value ? 'text-blue-500' : 'text-gray-400'}`}>
                                    {icon}
                                </div>
                                <span className="font-medium whitespace-nowrap">{option.label}</span>
                                {value === option.value && (
                                    <UserCheck className="w-4 h-4 text-blue-600 ml-auto" />
                                )}
                            </button>
                        ))}
                    </div>
                </>,
                document.body
            )}
        </div>
    );
};

const EmployeeDirectory: React.FC = () => {
    const { data: employees, isLoading, isError } = useEmployees();
    // Departments data + CRUD hooks for Department Overview
    const { data: deptList } = useDepartments(true);
    const { mutateAsync: createDepartment, isPending: isCreatingDept } = useCreateDepartment();
    const { mutateAsync: updateDepartment, isPending: isUpdatingDept } = useUpdateDepartment();
    const { mutateAsync: deleteDepartment, isPending: isDeletingDept } = useDeleteDepartment();
    const [newDeptName, setNewDeptName] = useState("");

    const [search, setSearch] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState<string>("All");
    const [positionFilter, setPositionFilter] = useState<string>("All");
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Field visibility settings (persisted)
    const [settings, setSettings] = useState<FieldSettings>(() => {
        const raw = localStorage.getItem("sf_dir_settings");
        return raw ? JSON.parse(raw) as FieldSettings : {
            showEmail: true,
            showPhone: true,
            showJobTitle: true,
            showHireDate: true,
        };
    });

    useEffect(() => {
        localStorage.setItem("sf_dir_settings", JSON.stringify(settings));
    }, [settings]);

    // Saved views (persisted)
    const [views, setViews] = useState<DirectoryView[]>(() => {
        const raw = localStorage.getItem("sf_dir_views");
        return raw ? JSON.parse(raw) as DirectoryView[] : [];
    });
    const [activeViewId, setActiveViewId] = useState<string | null>(() => localStorage.getItem("sf_dir_active_view") || null);

    // Reorder mode toggle (persisted)
    const [reorderMode, setReorderMode] = useState<boolean>(() => (localStorage.getItem("sf_dir_reorder") === "1"));
    useEffect(() => { localStorage.setItem("sf_dir_reorder", reorderMode ? "1" : "0"); }, [reorderMode]);

    // Per-view order persistence
    const orderStorageKey = React.useMemo(() => `sf_dir_order_${activeViewId ?? "default"}`, [activeViewId]);
    const [orderedIds, setOrderedIds] = useState<string[]>([]);
    useEffect(() => {
        const raw = localStorage.getItem(orderStorageKey);
        setOrderedIds(raw ? (JSON.parse(raw) as string[]) : []);
    }, [orderStorageKey]);
    useEffect(() => {
        localStorage.setItem(orderStorageKey, JSON.stringify(orderedIds));
    }, [orderStorageKey, orderedIds]);

    // DnD helpers
    const dragFromId = React.useRef<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);

    function reorderIds(list: string[], fromId: string, toId: string): string[] {
        const arr = list.slice();
        if (!arr.includes(fromId)) arr.push(fromId);
        if (!arr.includes(toId)) arr.push(toId);
        const fromIndex = arr.indexOf(fromId);
        arr.splice(fromIndex, 1);
        const toIndex = arr.indexOf(toId);
        arr.splice(toIndex, 0, fromId);
        return arr;
    }

    useEffect(() => {
        localStorage.setItem("sf_dir_views", JSON.stringify(views));
    }, [views]);
    useEffect(() => {
        if (activeViewId) localStorage.setItem("sf_dir_active_view", activeViewId);
        else localStorage.removeItem("sf_dir_active_view");
    }, [activeViewId]);

    // Apply active view
    useEffect(() => {
        if (!activeViewId) return;
        const v = views.find(x => x.id === activeViewId);
        if (!v) return;
        setSearch(v.search);
        setDepartmentFilter(v.department);
        setPositionFilter(v.position);
        setSettings(v.settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeViewId]);

    // Selection state for bulk actions
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const clearSelection = () => setSelectedIds(new Set());

    const toggleSelected = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    // CSV Export of current filtered set or selection
    function exportCsv(rows: EmployeeDto[]) {
        const headers = ["Id","First Name","Last Name","Full Name","Email","Phone","Job Title","Department","Status","Hire Date"];
        const lines = rows.map(r => [
            r.id,
            r.firstName ?? "",
            r.lastName ?? "",
            r.fullName ?? "",
            r.email ?? "",
            r.phoneNumber ?? "",
            r.jobTitle ?? "",
            r.departmentName ?? "",
            statusToLabel(r.status),
            r.hireDate ? new Date(r.hireDate).toISOString().split("T")[0] : ""
        ].map(v => `"${String(v).replaceAll('"','""')}"`).join(","));
        const csv = [headers.join(","), ...lines].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `employees_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Saved view helpers
    function saveCurrentView(name: string) {
        const v: DirectoryView = {
            id: crypto.randomUUID(),
            name,
            search,
            department: departmentFilter,
            position: positionFilter,
            settings,
        };
        setViews(prev => [...prev, v]);
        setActiveViewId(v.id);
    }
    function updateActiveView(name?: string) {
        if (!activeViewId) return;
        setViews(prev => prev.map(v => v.id === activeViewId ? {
            ...v,
            name: name ?? v.name,
            search,
            department: departmentFilter,
            position: positionFilter,
            settings,
        } : v));
    }
    function deleteActiveView() {
        if (!activeViewId) return;
        setViews(prev => prev.filter(v => v.id !== activeViewId));
        setActiveViewId(null);
    }

    useEffect(() => {
        if (employees) {
            console.log('[EmployeeDirectory] employees:', employees);
        }
    }, [employees]);

    // Department filter options: union of API departments and any names present on employees
    const departmentOptions = useMemo(() => {
        const set = new Set<string>();
        (deptList ?? []).forEach(d => { if (d.name?.trim()) set.add(d.name.trim()); });
        (employees ?? []).forEach(e => { const n = (e.departmentName ?? "").trim(); if (n) set.add(n); });
        return ["All", ...Array.from(set.values()).sort()];
    }, [deptList, employees]);

    const filtered = useMemo(() => {
        const term = normalize(search);
        return (employees ?? []).filter(e => {
            const name = e.fullName || buildFullName(e.firstName, e.lastName);
            const matchesSearch = !term
                || fuzzyMatch(term, name)
                || fuzzyMatch(term, e.firstName ?? "")
                || fuzzyMatch(term, e.lastName ?? "")
                || fuzzyMatch(term, e.email ?? "")
                || fuzzyMatch(term, e.jobTitle ?? "")
                || fuzzyMatch(term, e.departmentName ?? "");

            const matchesDept = departmentFilter === "All" || e.departmentName === departmentFilter;

            const matchesPos = positionFilter === "All" ||
                (positionFilter === "Manager" && /manager/i.test(e.jobTitle ?? "")) ||
                (positionFilter === "Senior" && /senior|sr\.?/i.test(e.jobTitle ?? "")) ||
                (positionFilter === "Junior" && /junior|jr\.?/i.test(e.jobTitle ?? "")) ||
                (positionFilter === "Intern" && /intern/i.test(e.jobTitle ?? ""));

            return matchesSearch && matchesDept && matchesPos;
        });
    }, [employees, search, departmentFilter, positionFilter]);

    // Apply card ordering
    const orderedFiltered = useMemo(() => {
        const index = new Map<string, number>();
        orderedIds.forEach((id, i) => index.set(id, i));
        return (filtered ?? []).slice().sort((a, b) => {
            const ai = index.has(a.id) ? index.get(a.id)! : Number.MAX_SAFE_INTEGER;
            const bi = index.has(b.id) ? index.get(b.id)! : Number.MAX_SAFE_INTEGER;
            if (ai !== bi) return ai - bi;
            const an = a.fullName ?? buildFullName(a.firstName, a.lastName);
            const bn = b.fullName ?? buildFullName(b.firstName, b.lastName);
            return an.localeCompare(bn);
        });
    }, [filtered, orderedIds]);

    // Join employees with active departments for counts; also compute "Unassigned/Other"
    const departmentTiles = useMemo(() => {
        const depts = deptList ?? [];
        const activeNameSet = new Set(
            depts.map(d => (d.name ?? "").trim().toLowerCase()).filter(n => n !== "")
        );
        const norm = (s?: string | null) => (s ?? "").trim().toLowerCase();
        const employeesList = employees ?? [];
        const tiles = depts.map(d => {
            const n = norm(d.name);
            const count = employeesList.filter(e => norm(e.departmentName) === n).length;
            return { dept: d, count };
        });
        const unassigned = employeesList.filter(e => {
            const n = norm(e.departmentName);
            return n === "" || !activeNameSet.has(n);
        }).length;
        return { tiles, unassigned };
    }, [deptList, employees]);

    // Department actions
    const handleAddDepartment = async () => {
        const name = newDeptName.trim();
        if (!name) return;
        await createDepartment({ name });
        setNewDeptName("");
    };

    const handleRenameDepartment = async (id: string, currentName: string) => {
        const next = window.prompt("Rename department", currentName)?.trim();
        if (!next || next === currentName) return;
        await updateDepartment({ id, dto: { name: next } });
    };

    const handleToggleDepartment = async (id: string, name: string, isActive: boolean) => {
        await updateDepartment({ id, dto: { name, isActive: !isActive } });
    };

    const handleDeleteDepartment = async (id: string, name: string) => {
        if (!window.confirm(`Delete department "${name}"?`)) return;
        await deleteDepartment(id);
    };

    // Create a component for individual employee image upload
    const EmployeeImageUpload: React.FC<{ employee: EmployeeDto }> = ({ employee }) => {
        const { mutateAsync: uploadImage, isPending: isUploading } = useUploadEmployeeImage(employee.id);

        const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (file) {
                try {
                    await uploadImage(file);
                } catch (error) {
                    console.error('Failed to upload image:', error);
                } finally {
                    event.target.value = "";
                }
            }
        };

        return (
            <>
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id={`employee-image-${employee.id}`}
                    onChange={handleFileChange}
                />
                <label
                    htmlFor={`employee-image-${employee.id}`}
                    className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer ${
                        isUploading ? "opacity-100" : ""
                    }`}
                >
                    {isUploading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Camera className="w-5 h-5" />
                    )}
                </label>
            </>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 w-full">
            {/* Navigation Breadcrumb */}
            <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-16 z-30 w-full px-4 sm:px-6 lg:px-8 py-4">
                <ol className="flex items-center gap-2 text-sm">
                    <li className="flex items-center gap-2 text-gray-500">
                        <Home className="h-4 w-4" />
                        <Link to="/app/dashboard" className="hover:text-gray-700">Dashboard</Link>
                    </li>
                    <li className="text-gray-400">/</li>
                    <li className="flex items-center gap-2 text-gray-500">
                        <Briefcase className="h-4 w-4" />
                        <Link to="/hr" className="hover:text-gray-700">Human Resources</Link>
                    </li>
                    <li className="text-gray-400">/</li>
                    <li className="flex items-center gap-2 text-gray-900 font-semibold">
                        <Users className="h-4 w-4" />
                        <span>Employee Directory</span>
                    </li>
                </ol>
            </nav>

            <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-6 mb-3">
                                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Employee Directory
                                </h1>
                            </div>
                            <p className="text-lg text-gray-600">
                                View and manage employee information, contacts, and organizational structure
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-400 text-gray-600 rounded-lg hover:bg-gray-400 hover:text-white transition-all duration-200 font-medium">
                                <Filter className="w-4 h-4" />
                                <span>Filter</span>
                            </button>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Employee</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Views and Settings Bar */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <div className="flex items-center gap-3 flex-nowrap whitespace-nowrap">
                        <span className="text-sm text-gray-600 whitespace-nowrap">Saved View</span>
                        <CustomDropdown
                            value={activeViewId ?? ""}
                            onChange={(v) => setActiveViewId(v || null)}
                            options={[{ value: "", label: "None" }, ...views.map(v => ({ value: v.id, label: v.name }))]}
                            placeholder="None"
                            icon={<Bookmark className="w-4 h-4" />}
                            className="w-56"
                        />
                        <button
                            onClick={() => {
                                const name = prompt("View name?");
                                if (name && name.trim()) saveCurrentView(name.trim());
                            }}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
                        >Save current</button>
                        <button
                            disabled={!activeViewId}
                            onClick={() => {
                                const name = prompt("Rename view? Leave empty to keep.");
                                updateActiveView(name || undefined);
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 whitespace-nowrap"
                        >Update</button>
                        <button
                            disabled={!activeViewId}
                            onClick={deleteActiveView}
                            className="px-3 py-2 border border-red-300 text-red-600 rounded-lg disabled:opacity-50 whitespace-nowrap"
                        >Delete</button>
                    </div>

                    <div className="flex items-center gap-4 flex-nowrap whitespace-nowrap">
                        <div className="flex items-center gap-3 text-sm flex-nowrap">
                            {/* toggles container already nowrap */}
                            <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all whitespace-nowrap">
                                <ModernCheckbox
                                    checked={settings.showEmail}
                                    onChange={() => setSettings(s => ({ ...s, showEmail: !s.showEmail }))}
                                    ariaLabel="Toggle Email field"
                                    title="Show Email"
                                    colorizeBackground={false}
                                />
                                <span className="text-gray-700 whitespace-nowrap">Email</span>
                            </div>
                            <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all whitespace-nowrap">
                                <ModernCheckbox
                                    checked={settings.showPhone}
                                    onChange={() => setSettings(s => ({ ...s, showPhone: !s.showPhone }))}
                                    ariaLabel="Toggle Phone field"
                                    title="Show Phone"
                                    colorizeBackground={false}
                                />
                                <span className="text-gray-700 whitespace-nowrap">Phone</span>
                            </div>
                            <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all whitespace-nowrap">
                                <ModernCheckbox
                                    checked={settings.showJobTitle}
                                    onChange={() => setSettings(s => ({ ...s, showJobTitle: !s.showJobTitle }))}
                                    ariaLabel="Toggle Job Title field"
                                    title="Show Job Title"
                                    colorizeBackground={false}
                                />
                                <span className="text-gray-700 whitespace-nowrap">Job Title</span>
                            </div>
                            <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all whitespace-nowrap">
                                <ModernCheckbox
                                    checked={settings.showHireDate}
                                    onChange={() => setSettings(s => ({ ...s, showHireDate: !s.showHireDate }))}
                                    ariaLabel="Toggle Hire Date field"
                                    title="Show Hire Date"
                                    colorizeBackground={false}
                                />
                                <span className="text-gray-700 whitespace-nowrap">Hire Date</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-nowrap whitespace-nowrap">
                            <button
                                onClick={() => exportCsv((selectedIds.size>0 ? (employees ?? []).filter(e=>selectedIds.has(e.id)) : (filtered ?? [])))}
                                className="px-3 py-2 border border-gray-300 rounded-lg whitespace-nowrap"
                            >Export CSV</button>
                            <button
                                disabled={selectedIds.size===0}
                                onClick={clearSelection}
                                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 whitespace-nowrap"
                            >Clear Selection</button>
                            <button
                                onClick={() => setReorderMode(v=>!v)}
                                className={`px-3 py-2 rounded-lg border whitespace-nowrap ${reorderMode ? 'border-blue-300 text-blue-700 bg-blue-50' : 'border-gray-300 text-gray-700'}`}
                                title="Toggle reorder mode"
                            >{reorderMode ? 'Reorder: On' : 'Reorder: Off'}</button>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-2">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search employees by name, department, or position..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 lg:w-auto lg:flex-shrink-0">
                            <CustomDropdown
                                value={departmentFilter}
                                onChange={setDepartmentFilter}
                                options={departmentOptions.map((d) => ({
                                    value: d,
                                    label: d === "All" ? "All Departments" : d
                                }))}
                                placeholder="Select Department"
                                icon={<Building2 className="w-4 h-4" />}
                                className="w-full sm:w-48"
                            />
                            <CustomDropdown
                                value={positionFilter}
                                onChange={setPositionFilter}
                                options={[
                                    { value: "All", label: "All Positions" },
                                    { value: "Manager", label: "Manager" },
                                    { value: "Senior", label: "Senior" },
                                    { value: "Junior", label: "Junior" },
                                    { value: "Intern", label: "Intern" },
                                ]}
                                placeholder="Select Position"
                                icon={<UserCheck className="w-4 h-4" />}
                                className="w-full sm:w-48"
                            />
                        </div>
                    </div>
                </div>

                {/* Active filter chips */}
                {(search || departmentFilter !== "All" || positionFilter !== "All") && (
                    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 mb-8 flex items-center gap-2 flex-wrap">
                        {search && (
                            <span className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                                Search: "{search}"
                                <button className="text-blue-600" onClick={()=>setSearch("")}>✕</button>
                            </span>
                        )}
                        {departmentFilter !== "All" && (
                            <span className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-purple-50 text-purple-700 rounded-full border border-purple-200">
                                Dept: {departmentFilter}
                                <button className="text-purple-600" onClick={()=>setDepartmentFilter("All")}>✕</button>
                            </span>
                        )}
                        {positionFilter !== "All" && (
                            <span className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-teal-50 text-teal-700 rounded-full border border-teal-200">
                                Position: {positionFilter}
                                <button className="text-teal-600" onClick={()=>setPositionFilter("All")}>✕</button>
                            </span>
                        )}
                        <button className="ml-auto text-sm text-gray-600 hover:text-gray-800" onClick={()=>{ setSearch(""); setDepartmentFilter("All"); setPositionFilter("All"); }}>Clear all</button>
                    </div>
                )}

                {/* Loading / Error states */}
                {isLoading && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
                        <div className="flex items-center gap-3 text-gray-600"><BadgeCheck className="w-5 h-5 animate-pulse" /> Loading employees…</div>
                    </div>
                )}
                {isError && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
                        <div className="text-red-600">Failed to load employees.</div>
                    </div>
                )}

                {/* Employee Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                    {(orderedFiltered ?? []).map((e) => {
                        const label = statusToLabel(e.status);
                        const checked = selectedIds.has(e.id);
                        const isDragOver = dragOverId === e.id;
                        return (
                            <div
                                key={e.id}
                                className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 ${isDragOver ? 'ring-2 ring-blue-400' : ''}`}
                                onDragOver={reorderMode ? (ev) => { ev.preventDefault(); setDragOverId(e.id); } : undefined}
                                onDragLeave={reorderMode ? () => setDragOverId(prev => (prev === e.id ? null : prev)) : undefined}
                                onDrop={reorderMode ? () => { if (dragFromId.current && dragFromId.current !== e.id) { setOrderedIds(prev => reorderIds(prev, dragFromId.current!, e.id)); } setDragOverId(null); dragFromId.current=null; } : undefined}
                            >
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 text-center">
                                    <div className="relative w-20 h-20 mx-auto mb-4 group">
                                        {e.imageUrl ? (
                                            <img 
                                                src={resolveImageUrl(e.imageUrl, true)} 
                                                alt={e.fullName ?? buildFullName(e.firstName, e.lastName)} 
                                                className="w-20 h-20 rounded-full object-cover" 
                                            />
                                        ) : (
                                            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                                <span className="text-white font-bold text-xl">{initials(e.firstName, e.lastName)}</span>
                                            </div>
                                        )}
                                        <EmployeeImageUpload employee={e} />
                                    </div>
                                    <div className="flex items-center justify-center gap-3 mb-1">
                                        {reorderMode && (
                                            <span
                                                draggable
                                                onDragStart={() => { dragFromId.current = e.id; }}
                                                className="inline-flex items-center justify-center h-6 w-6 rounded-md text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                                                title="Drag to reorder"
                                                aria-label="Drag to reorder"
                                            >
                                                <GripVertical className="w-4 h-4" />
                                            </span>
                                        )}
                                        <ModernCheckbox
                                            checked={checked}
                                            onChange={() => toggleSelected(e.id)}
                                            ariaLabel="Select employee"
                                            title="Select employee"
                                        />
                                        <h3 className="text-lg font-bold text-gray-900">{e.fullName ?? buildFullName(e.firstName, e.lastName)}</h3>
                                    </div>
                                    {settings.showJobTitle && <p className="text-sm text-gray-600">{e.jobTitle ?? "—"}</p>}
                                    <div className="mt-2 flex items-center justify-center gap-2">
                                        {e.isActive && <span className="inline-block w-2 h-2 rounded-full bg-green-500" title="Active"></span>}
                                        <span className={`inline-block ${statusClasses(label)} text-xs font-semibold px-3 py-1 rounded-full`}>{label}</span>
                                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                                            {e.departmentName ?? "Unassigned"}
                                        </span>
                                        <span className="inline-block bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
                                            Docs: {(e.documents?.length ?? 0)}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-3">
                                        {settings.showEmail && e.email && (
                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <Mail className="w-4 h-4" />
                                                <span>{e.email}</span>
                                            </div>
                                        )}
                                        {settings.showPhone && e.phoneNumber && (
                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <Phone className="w-4 h-4" />
                                                <span>{e.phoneNumber}</span>
                                            </div>
                                        )}
                                        {settings.showHireDate && e.hireDate && (
                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <Calendar className="w-4 h-4" />
                                                <span>Hired: {new Date(e.hireDate).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                    <Link
                                        to={`/app/hr/employees/${e.id}`}
                                        className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
                                    >
                                        <Edit className="w-4 h-4" />
                                        <span>View Profile</span>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Department Summary */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Department Overview</h3>
                    {/* Add Department */}
                    <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:items-center">
                        <div className="flex-1 flex gap-2">
                            <input
                                type="text"
                                value={newDeptName}
                                onChange={e => setNewDeptName(e.target.value)}
                                placeholder="New department name"
                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={handleAddDepartment}
                                disabled={!newDeptName.trim() || isCreatingDept}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700"
                                title="Add Department"
                            >
                                <Plus className="w-4 h-4" /> Add
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {departmentTiles.tiles.length === 0 && (
                            <div className="col-span-full text-gray-500">No departments to display.</div>
                        )}
                        {departmentTiles.tiles.map(({ dept, count }, idx) => {
                            const palette = [
                                "from-blue-50 to-blue-100 text-blue-700",
                                "from-green-50 to-green-100 text-green-700",
                                "from-purple-50 to-purple-100 text-purple-700",
                                "from-orange-50 to-orange-100 text-orange-700",
                                "from-teal-50 to-teal-100 text-teal-700",
                            ];
                            const color = palette[idx % palette.length];
                            const numberColor = color.includes("blue") ? "text-blue-600" :
                                color.includes("green") ? "text-green-600" :
                                color.includes("purple") ? "text-purple-600" :
                                color.includes("orange") ? "text-orange-600" : "text-teal-600";
                            return (
                                <div key={dept.id} className={`relative text-center p-4 bg-gradient-to-r ${color} rounded-xl group`}>
                                    <div className={`text-2xl font-bold mb-1 ${numberColor}`}>{count}</div>
                                    <div className="text-sm font-medium break-words">{dept.name}</div>
                                    <div className="absolute top-2 right-2 flex gap-2 opacity-100">
                                        <button
                                            className="p-1 rounded bg-white/80 hover:bg-white"
                                            title={dept.isActive ? "Deactivate" : "Activate"}
                                            onClick={() => handleToggleDepartment(dept.id, dept.name, dept.isActive)}
                                            disabled={isUpdatingDept}
                                        >
                                            {dept.isActive ? <ToggleLeft className="w-4 h-4 text-gray-700" /> : <ToggleRight className="w-4 h-4 text-green-600" />}
                                        </button>
                                        <button
                                            className="p-1 rounded bg-white/80 hover:bg-white"
                                            title="Rename"
                                            onClick={() => handleRenameDepartment(dept.id, dept.name)}
                                            disabled={isUpdatingDept}
                                        >
                                            <Edit className="w-4 h-4 text-gray-700" />
                                        </button>
                                        <button
                                            className="p-1 rounded bg-white/80 hover:bg-white"
                                            title="Delete"
                                            onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                                            disabled={isDeletingDept}
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        {departmentTiles.unassigned > 0 && (
                            <div className={`text-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-xl`}>
                                <div className={`text-2xl font-bold mb-1 text-gray-600`}>{departmentTiles.unassigned}</div>
                                <div className="text-sm font-medium">Unassigned</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showCreateModal && (
                <CreateEmployeeModal
                    onClose={() => setShowCreateModal(false)}
                />
            )}
        </div>
    );
};

export default EmployeeDirectory;

// Create Employee Modal (inline component for simplicity)
const CreateEmployeeModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { mutateAsync: createEmployee, isPending } = useCreateEmployee();
    const [form, setForm] = useState<Partial<EmployeeDto>>({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        jobTitle: "",
        departmentName: "",
    });
    const [error, setError] = useState<string | null>(null);

    const canSubmit = (form.firstName ?? "").trim() !== "" && (form.lastName ?? "").trim() !== "" && (form.email ?? "").trim() !== "";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!canSubmit) return;
        try {
            // Let backend set defaults for status/isActive/hireDate
            await createEmployee({
                firstName: form.firstName?.trim(),
                lastName: form.lastName?.trim(),
                email: form.email?.trim(),
                phoneNumber: form.phoneNumber?.trim(),
                jobTitle: form.jobTitle?.trim(),
                departmentName: form.departmentName?.trim(),
            });
            onClose();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : (typeof err === 'string' ? err : 'Failed to create employee');
            setError(message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Add New Employee</h3>
                    <button
                        onClick={onClose}
                        className="px-3 py-1 text-gray-500 hover:text-gray-700"
                        aria-label="Close"
                    >✕</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={form.firstName ?? ""}
                                onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={form.lastName ?? ""}
                                onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={form.email ?? ""}
                                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={form.phoneNumber ?? ""}
                                onChange={(e) => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                            <input
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={form.jobTitle ?? ""}
                                onChange={(e) => setForm(f => ({ ...f, jobTitle: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                            <input
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={form.departmentName ?? ""}
                                onChange={(e) => setForm(f => ({ ...f, departmentName: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >Cancel</button>
                        <button
                            type="submit"
                            disabled={!canSubmit || isPending}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >{isPending ? 'Creating…' : 'Create Employee'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
