import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import { useCreateEmployee, useEmployees, useUploadEmployeeImage, type EmployeeDto } from "../../hooks/employees";

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

    // Disable page scroll while dropdown is open
    useEffect(() => {
        if (!isOpen) return;

        const html = document.documentElement;
        const body = document.body;

        const previous = {
            htmlOverflow: html.style.overflow,
            bodyOverflow: body.style.overflow,
            htmlPaddingRight: html.style.paddingRight,
            bodyPaddingRight: body.style.paddingRight,
            bodyPosition: body.style.position,
            bodyTop: body.style.top,
            htmlOverscroll: html.style.overscrollBehavior as string | undefined,
            bodyOverscroll: body.style.overscrollBehavior as string | undefined,
        };

        const scrollY = window.scrollY;
        const scrollbarWidth = window.innerWidth - html.clientWidth;

        // Hide scrollbars and prevent scroll chaining
        html.style.overflow = "hidden";
        body.style.overflow = "hidden";
        html.style.overscrollBehavior = "contain";
        body.style.overscrollBehavior = "contain";

        // Compensate layout shift when hiding scrollbar
        if (scrollbarWidth > 0) {
            html.style.paddingRight = `${scrollbarWidth}px`;
            body.style.paddingRight = `${scrollbarWidth}px`;
        }

        // Lock scroll position (prevents wheel/keyboard scroll)
        body.style.position = "fixed";
        body.style.top = `-${scrollY}px`;
        
        return () => {
            // Restore styles
            html.style.overflow = previous.htmlOverflow;
            body.style.overflow = previous.bodyOverflow;
            html.style.paddingRight = previous.htmlPaddingRight;
            body.style.paddingRight = previous.bodyPaddingRight;
            html.style.overscrollBehavior = previous.htmlOverscroll ?? "";
            body.style.overscrollBehavior = previous.bodyOverscroll ?? "";

            // Restore scroll position
            const y = parseInt(previous.bodyTop || body.style.top || "0", 10);
            body.style.position = previous.bodyPosition;
            body.style.top = previous.bodyTop;
            if (!Number.isNaN(y)) {
                window.scrollTo(0, Math.abs(y));
            }
        };
    }, [isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div className={`relative ${className}`} onKeyDown={handleKeyDown}>
            <button
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
            
            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-auto ring-1 ring-black ring-opacity-5">
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
                </>
            )}
        </div>
    );
};

const EmployeeDirectory: React.FC = () => {
    const { data: employees, isLoading, isError } = useEmployees();

    const [search, setSearch] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState<string>("All");
    const [positionFilter, setPositionFilter] = useState<string>("All");
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        if (employees) {
            console.log('[EmployeeDirectory] employees:', employees);
        }
    }, [employees]);

    const departments = useMemo(() => {
        const set = new Set<string>();
        (employees ?? []).forEach(e => {
            if (e.departmentName) set.add(e.departmentName);
        });
        return ["All", ...Array.from(set.values()).sort()];
    }, [employees]);

    const filtered = useMemo(() => {
        const term = normalize(search);
        return (employees ?? []).filter(e => {
            const matchesSearch = !term
                || normalize(e.fullName).includes(term)
                || normalize(buildFullName(e.firstName, e.lastName)).includes(term)
                || normalize(e.firstName).includes(term)
                || normalize(e.lastName).includes(term)
                || normalize(e.email).includes(term)
                || normalize(e.jobTitle).includes(term)
                || normalize(e.departmentName).includes(term);

            const matchesDept = departmentFilter === "All" || e.departmentName === departmentFilter;

            const matchesPos = positionFilter === "All" ||
                (positionFilter === "Manager" && /manager/i.test(e.jobTitle ?? "")) ||
                (positionFilter === "Senior" && /senior|sr\.?/i.test(e.jobTitle ?? "")) ||
                (positionFilter === "Junior" && /junior|jr\.?/i.test(e.jobTitle ?? "")) ||
                (positionFilter === "Intern" && /intern/i.test(e.jobTitle ?? ""));

            return matchesSearch && matchesDept && matchesPos;
        });
    }, [employees, search, departmentFilter, positionFilter]);

    const departmentCounts = useMemo(() => {
        const counts = new Map<string, number>();
        (employees ?? []).forEach(e => {
            const key = e.departmentName ?? "Unassigned";
            counts.set(key, (counts.get(key) ?? 0) + 1);
        });
        return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    }, [employees]);

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
                        <Link to="/dashboard" className="hover:text-gray-700">Dashboard</Link>
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

                {/* Search and Filters */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
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
                                options={departments.map((d) => ({
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
                    {(filtered ?? []).map((e) => {
                        const label = statusToLabel(e.status);
                        return (
                            <div key={e.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
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
                                    <h3 className="text-lg font-bold text-gray-900">{e.fullName ?? buildFullName(e.firstName, e.lastName)}</h3>
                                    <p className="text-sm text-gray-600">{e.jobTitle ?? "—"}</p>
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
                                        {e.email && (
                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <Mail className="w-4 h-4" />
                                                <span>{e.email}</span>
                                            </div>
                                        )}
                                        {e.phoneNumber && (
                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <Phone className="w-4 h-4" />
                                                <span>{e.phoneNumber}</span>
                                            </div>
                                        )}
                                        {e.hireDate && (
                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <Calendar className="w-4 h-4" />
                                                <span>Hired: {new Date(e.hireDate).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                    <Link
                                        to={`/hr/employees/${e.id}`}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {departmentCounts.length === 0 && (
                            <div className="col-span-full text-gray-500">No departments to display.</div>
                        )}
                        {departmentCounts.map(([dept, count], idx) => {
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
                                <div key={dept} className={`text-center p-4 bg-gradient-to-r ${color} rounded-xl`}>
                                    <div className={`text-2xl font-bold mb-1 ${numberColor}`}>{count}</div>
                                    <div className="text-sm font-medium">{dept}</div>
                                </div>
                            );
                        })}
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
