import React, { useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Home, Briefcase, Users, Mail, Phone, BadgeCheck, ArrowLeft, Building2, IdCard } from "lucide-react";
import { useEmployee, useEmployees, useUploadEmployeeImage, useUpdateEmployee, useAddEmployeeDocument, useArchiveEmployeeDocument, useStartOnboarding, useCompleteOnboardingTask, useInitiateOffboarding, useCompleteOffboardingTask, type EmployeeDto } from "../../hooks/employees";

function buildFullName(first?: string | null, last?: string | null) {
  return `${first ?? ""} ${last ?? ""}`.trim();
}

function initials(first?: string | null, last?: string | null) {
  const f = (first ?? "").trim();
  const l = (last ?? "").trim();
  const fi = f ? f[0]! : "";
  const li = l ? l[0]! : "";
  return (fi + li || "??").toUpperCase();
}

function resolveImageUrl(url?: string | null, cacheBusting: boolean = false) {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) {
    if (cacheBusting) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}t=${Date.now()}`;
    }
    return url;
  }
  const base = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');
  const origin = base.endsWith('/api') ? base.slice(0, -4) : base;
  if (!origin) return url; // same-origin fallback in dev proxy setups
  const fullUrl = url.startsWith('/') ? `${origin}${url}` : `${origin}/${url}`;
  
  if (cacheBusting) {
    const separator = fullUrl.includes('?') ? '&' : '?';
    return `${fullUrl}${separator}t=${Date.now()}`;
  }
  return fullUrl;
}

function statusToLabel(status: EmployeeDto['status'] | number): string {
  if (typeof status === 'number') {
    switch (status) {
      case 0: return 'Onboarding';
      case 1: return 'Active';
      case 2: return 'Suspended';
      case 3: return 'Offboarding';
      case 4: return 'Terminated';
      default: return String(status);
    }
  }
  if (typeof status === 'string') return status;
  return 'Unknown';
}

function statusClasses(label: string): string {
  switch (label) {
    case 'Active': return 'bg-green-100 text-green-800';
    case 'Onboarding': return 'bg-blue-100 text-blue-800';
    case 'Suspended': return 'bg-yellow-100 text-yellow-800';
    case 'Offboarding': return 'bg-purple-100 text-purple-800';
    case 'Terminated': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

const EmployeeProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: employee, isLoading, isError } = useEmployee(id);
  const { data: allEmployees } = useEmployees();
  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadEmployeeImage(id ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addDoc = useAddEmployeeDocument(id ?? "");
  const archiveDoc = useArchiveEmployeeDocument(id ?? "");
  const startOnboarding = useStartOnboarding(id ?? "");
  const completeOnboardingTask = useCompleteOnboardingTask(id ?? "");
  const initiateOffboarding = useInitiateOffboarding(id ?? "");
  const completeOffboardingTask = useCompleteOffboardingTask(id ?? "");

  // Edit mode state and form
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<{ firstName?: string; lastName?: string; phoneNumber?: string; jobTitle?: string; departmentName?: string; dateOfBirth?: string | null }>();
  const { mutateAsync: updateEmployee, isPending: isSaving } = useUpdateEmployee(id ?? "");

  const beginEdit = () => {
    if (!employee) return;
    setForm({
      firstName: employee.firstName ?? "",
      lastName: employee.lastName ?? "",
      phoneNumber: employee.phoneNumber ?? "",
      jobTitle: employee.jobTitle ?? "",
      departmentName: employee.departmentName ?? "",
      dateOfBirth: employee?.dateOfBirth ? new Date(employee.dateOfBirth as unknown as string).toISOString().split("T")[0] : null,
    });
    setIsEditing(true);
  };
  const cancelEdit = () => {
    setIsEditing(false);
  };
  const saveEdit = async () => {
    if (!id || !form) return;
  const payload: Partial<EmployeeDto> = {
      firstName: (form.firstName ?? "").trim() || undefined,
      lastName: (form.lastName ?? "").trim() || undefined,
      phoneNumber: (form.phoneNumber ?? "").trim() || undefined,
      jobTitle: (form.jobTitle ?? "").trim() || undefined,
      departmentName: (form.departmentName ?? "").trim() || undefined,
      // Date as ISO date string; backend accepts DateTime
  dateOfBirth: form.dateOfBirth && form.dateOfBirth.length > 0 ? new Date(form.dateOfBirth).toISOString() : undefined,
    };
    try {
      await updateEmployee(payload);
      setIsEditing(false);
    } catch {
      // errors surfaced by global handlers; keep in edit mode
    }
  };

  const departmentPeers = useMemo(() => {
    if (!employee || !allEmployees) return [] as EmployeeDto[];
    return allEmployees.filter(e => e.departmentName === employee.departmentName && e.id !== employee.id);
  }, [employee, allEmployees]);

  const deptCount = departmentPeers.length + (employee ? 1 : 0);

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
            <span>Employee Profile</span>
          </li>
        </ol>
      </nav>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/app/hr/employee-directory" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" /> Back to Employee Directory
          </Link>
        </div>

        {/* Loading / Error */}
        {isLoading && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
            <div className="flex items-center gap-3 text-gray-600"><BadgeCheck className="w-5 h-5 animate-pulse" /> Loading employee…</div>
          </div>
        )}
        {isError && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
            <div className="text-red-600">Failed to load employee.</div>
          </div>
        )}
        {!isLoading && !isError && !employee && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="text-gray-700">Employee not found.</div>
          </div>
        )}
        {employee && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Profile Summary + Documents */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="flex items-start gap-6">
                  {employee.imageUrl ? (
                    <img src={resolveImageUrl(employee.imageUrl, true)} alt={employee.fullName ?? buildFullName(employee.firstName, employee.lastName)} className="w-24 h-24 rounded-full object-cover" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center text-2xl font-bold">
                      {initials(employee.firstName, employee.lastName)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      {!isEditing ? (
                        <>
                          <h1 className="text-2xl font-bold text-gray-900 truncate">{employee.fullName ?? buildFullName(employee.firstName, employee.lastName)}</h1>
                          <span className={`inline-block ${statusClasses(statusToLabel(employee.status))} text-xs font-semibold px-3 py-1 rounded-full`}>
                            {statusToLabel(employee.status)}
                          </span>
                        </>
                      ) : (
                        <div className="flex flex-wrap gap-3 w-full">
                          <input
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={form?.firstName ?? ""}
                            onChange={(e)=>setForm(s=>({...(s||{}), firstName:e.target.value}))}
                            placeholder="First name"
                          />
                          <input
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={form?.lastName ?? ""}
                            onChange={(e)=>setForm(s=>({...(s||{}), lastName:e.target.value}))}
                            placeholder="Last name"
                          />
                        </div>
                      )}
                    </div>
                    {!isEditing ? (
                      <>
                        <div className="mt-1 text-gray-600">{employee.jobTitle ?? '—'}</div>
                        <div className="mt-1 inline-flex items-center gap-2 text-blue-800 bg-blue-100 px-3 py-1 rounded-full text-xs font-medium">
                          <Building2 className="w-4 h-4" />
                          {employee.departmentName ?? 'Unassigned'}
                        </div>
                      </>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-3">
                        <input
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={form?.jobTitle ?? ""}
                          onChange={(e)=>setForm(s=>({...(s||{}), jobTitle:e.target.value}))}
                          placeholder="Job title"
                        />
                        <input
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={form?.departmentName ?? ""}
                          onChange={(e)=>setForm(s=>({...(s||{}), departmentName:e.target.value}))}
                          placeholder="Department"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <input
                    ref={fileInputRef}
                    id="employee-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async () => {
                      const file = fileInputRef.current?.files?.[0] ?? null;
                      if (file && id) {
                        await uploadImage(file).catch(() => {});
                      }
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  />
                  <label htmlFor="employee-image-upload" className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer text-sm">
                    {isUploading ? 'Uploading…' : 'Upload Image'}
                  </label>
                </div>

                {!isEditing ? (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {employee.email && (
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{employee.email}</span>
                      </div>
                    )}
                    {employee.phoneNumber && (
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{employee.phoneNumber}</span>
                      </div>
                    )}
                    {employee.hireDate && (
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <IdCard className="w-4 h-4 text-gray-500" />
                        <span>Hired: {new Date(employee.hireDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-500">{employee.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={form?.phoneNumber ?? ""}
                        onChange={(e)=>setForm(s=>({...(s||{}), phoneNumber:e.target.value}))}
                        placeholder="Phone number"
                      />
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <IdCard className="w-4 h-4 text-gray-500" />
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={form?.dateOfBirth ?? ""}
                        onChange={(e)=>setForm(s=>({...(s||{}), dateOfBirth:e.target.value }))}
                        placeholder="Date of Birth"
                      />
                    </div>
                  </div>
                )}

                {/* Edit actions */}
                <div className="mt-6 flex items-center gap-3">
                  {!isEditing ? (
                    <button
                      onClick={beginEdit}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >Edit Profile</button>
                  ) : (
                    <>
                      <button
                        onClick={saveEdit}
                        disabled={isSaving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >{isSaving ? 'Saving…' : 'Save'}</button>
                      <button
                        onClick={cancelEdit}
                        disabled={isSaving}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                      >Cancel</button>
                    </>
                  )}
                </div>
              </div>

              {/* Documents */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
                  <button
                    onClick={async () => {
                      const fileName = prompt('File name?');
                      if (!fileName) return;
                      const typeStr = prompt('Type (1=Contract,2=Identification,3=Certification,99=Other)?', '1');
                      const type = Number(typeStr ?? '1') || 1;
                      const storagePath = prompt('Storage path (e.g., /uploads/employees/docs/file.pdf)?', `/uploads/employees/${employee.id}/${Date.now()}_${fileName}`);
                      if (!storagePath) return;
                      await addDoc.mutateAsync({ fileName, type, storagePath, sizeBytes: 1, contentType: 'application/octet-stream' }).catch(()=>{});
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >Add Document</button>
                </div>
                <div className="divide-y divide-gray-100">
                  {(employee.documents || []).map((d) => (
                    <div key={d.id} className="py-3 flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{d.fileName}</div>
                        <div className="text-xs text-gray-500">Type {d.type} • v{d.version} • {d.isArchived ? 'Archived' : 'Active'}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!d.isArchived && (
                          <button
                            onClick={() => {
                              const reason = prompt('Archive reason?') || 'Archived by user';
                              archiveDoc.mutate({ documentId: d.id, reason });
                            }}
                            className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                          >Archive</button>
                        )}
                      </div>
                    </div>
                  ))}
                  {(employee.documents || []).length === 0 && (
                    <div className="text-sm text-gray-500">No documents uploaded.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Department Overview for this employee */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Department Overview</h3>
                <div className="text-sm text-gray-600 mb-4">{employee.departmentName ?? 'Unassigned'} • {deptCount} total</div>
                <div className="space-y-3">
                  {departmentPeers.slice(0, 6).map((peer) => (
                    <div key={peer.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-xs font-semibold">
                          {initials(peer.firstName, peer.lastName)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{buildFullName(peer.firstName, peer.lastName)}</div>
                          <div className="text-xs text-gray-600">{peer.jobTitle ?? '—'}</div>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusClasses(statusToLabel(peer.status))}`}>{statusToLabel(peer.status)}</span>
                    </div>
                  ))}
                  {departmentPeers.length === 0 && (
                    <div className="text-sm text-gray-500">No other team members listed for this department.</div>
                  )}
                </div>
              </div>

              {/* Lifecycle controls */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lifecycle</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => startOnboarding.mutate()}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >Start Onboarding</button>
                  <button
                    onClick={() => {
                      const code = prompt('Complete onboarding task code (e.g., CONTRACT, TRAINING)?');
                      if (!code) return;
                      completeOnboardingTask.mutate(code);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >Complete Onboarding Task</button>
                  <button
                    onClick={() => {
                      const reason = prompt('Offboarding reason?') || 'Initiated by admin';
                      initiateOffboarding.mutate(reason);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >Initiate Offboarding</button>
                  <button
                    onClick={() => {
                      const code = prompt('Complete offboarding task code (e.g., DISABLE_ACCESS)?');
                      if (!code) return;
                      completeOffboardingTask.mutate(code);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >Complete Offboarding Task</button>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Status: <span className="font-medium">{statusToLabel(employee.status)}</span></div>
                  {employee.hireDate && (<div>Hired: {new Date(employee.hireDate).toLocaleDateString()}</div>)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeProfile;
