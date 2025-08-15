import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Home,
  Briefcase,
  Users,
  Mail,
  Phone,
  BadgeCheck,
  ArrowLeft,
  Building2,
  IdCard,
  Upload,
  Search as SearchIcon,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Package,
  Trash2,
  Archive,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import {
  useEmployee,
  useEmployees,
  useUploadEmployeeImage,
  useUpdateEmployee,
  useAddEmployeeDocument,
  useArchiveEmployeeDocument,
  useUnarchiveEmployeeDocument,
  useDeleteEmployeeDocument,
  useStartOnboarding,
  useCompleteOnboardingTask,
  useInitiateOffboarding,
  useCompleteOffboardingTask,
  EmployeeDto,
  EmployeeDocumentDto,
} from '../../hooks/employees';

import { queryClient } from '../../services/queryClient';
import { employeeKeys } from '../../services/queryKeys';
import MessagingPanel from '../../components/MessagingPanel';
import { useToast } from '../../hooks/useToast';

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
  if (!origin) return url;
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

// Guess a document category from content-type or filename
function categorize(contentType?: string, fileName?: string): 'video' | 'image' | 'document' | 'install' | 'other' {
  const name = (fileName || '').toLowerCase();
  const ct = (contentType || '').toLowerCase();
  if (ct.startsWith('image/') || /(png|jpe?g|gif|bmp|webp|svg)$/.test(name)) return 'image';
  if (ct.startsWith('video/') || /(mp4|mov|avi|mkv|webm)$/.test(name)) return 'video';
  if (/(msi|exe|dmg|pkg|apk)$/.test(name)) return 'install';
  if (/(pdf|docx?|xlsx?|pptx?)$/.test(name) || /text\//.test(ct) || ct === 'application/pdf') return 'document';
  return 'other';
}

function bytesToHuman(bytes?: number): string {
  const b = bytes ?? 0;
  if (b < 1024) return `${b} B`;
  const kb = b / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
}

// A dashboard-like documents UI that mirrors the provided design
const DocumentsDashboard: React.FC<{
  employee: EmployeeDto;
  addDoc: ReturnType<typeof useAddEmployeeDocument>;
  archiveDoc: ReturnType<typeof useArchiveEmployeeDocument>;
  unarchiveDoc: ReturnType<typeof useUnarchiveEmployeeDocument>;
  deleteDoc: ReturnType<typeof useDeleteEmployeeDocument>;
}> = ({ employee, addDoc, archiveDoc, unarchiveDoc, deleteDoc }) => {
  const { toast, hideToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<EmployeeDocumentDto | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const itemsPerPage = 4;
  const docs = useMemo(() => employee.documents || [], [employee.documents]);

  // Helpers: delete/archive with confirmation and selection fallback
  const handleDelete = (doc: EmployeeDocumentDto) => {
    if (!confirm(`Are you sure you want to delete "${doc.fileName}"? This action cannot be undone.`)) return;
    deleteDoc.mutate(doc.id, {
      onSuccess: () => {
        // Show warning toast for deletion (destructive action)
        toast.warning(`"${doc.fileName}" has been deleted successfully`, {
          title: 'File Deleted',
          duration: 4000,
        });
        
        // Update selection
        if (selected?.id === doc.id) {
          const idx = paginatedDocs.findIndex((x) => x.id === doc.id);
          const next = paginatedDocs[idx + 1] || paginatedDocs[idx - 1] || null;
          setSelected(next);
        }
        // Refresh the employee data to get updated documents list
        queryClient.invalidateQueries({ queryKey: employeeKeys.detail(employee.id) });
      },
      onError: () => {
        // Show error toast
        toast.error(`Failed to delete "${doc.fileName}". Please try again.`, {
          title: 'Delete Failed',
          duration: 6000,
          actions: [
            {
              label: 'Retry',
              onClick: () => handleDelete(doc),
              variant: 'primary',
            },
          ],
        });
      },
    });
  };

  const handleArchive = (doc: EmployeeDocumentDto) => {
    const reason = prompt(`Archive "${doc.fileName}"? Enter reason (optional):`) || 'Archived by user';
    archiveDoc.mutate({ documentId: doc.id, reason }, {
      onSuccess: () => {
        // Show info toast for archiving (informational action) with undo option
        toast.info(`"${doc.fileName}" has been archived successfully`, {
          title: 'File Archived',
          duration: 6000, // Longer duration to give time for undo
          actions: [
            {
              label: 'Undo',
              onClick: () => {
                unarchiveDoc.mutate(doc.id, {
                  onSuccess: () => {
                    toast.success(`"${doc.fileName}" has been restored successfully`, {
                      title: 'File Restored',
                      duration: 3000,
                    });
                    // Refresh the employee data
                    queryClient.invalidateQueries({ queryKey: employeeKeys.detail(employee.id) });
                  },
                  onError: () => {
                    toast.error(`Failed to restore "${doc.fileName}". Please try again.`, {
                      title: 'Restore Failed',
                      duration: 5000,
                    });
                  },
                });
              },
              variant: 'primary',
            },
          ],
        });
        
        // Update selection
        if (selected?.id === doc.id) {
          const idx = paginatedDocs.findIndex((x) => x.id === doc.id);
          let next: EmployeeDocumentDto | null = null;
          for (let i = idx + 1; i < paginatedDocs.length; i++) {
            if (!paginatedDocs[i].isArchived) { next = paginatedDocs[i]; break; }
          }
          if (!next) {
            for (let i = idx - 1; i >= 0; i--) {
              if (!paginatedDocs[i].isArchived) { next = paginatedDocs[i]; break; }
            }
          }
          setSelected(next);
        }
        // Refresh the employee data to get updated documents list
        queryClient.invalidateQueries({ queryKey: employeeKeys.detail(employee.id) });
      },
      onError: () => {
        // Show error toast
        toast.error(`Failed to archive "${doc.fileName}". Please try again.`, {
          title: 'Archive Failed',
          duration: 6000,
          actions: [
            {
              label: 'Retry',
              onClick: () => handleArchive(doc),
              variant: 'primary',
            },
          ],
        });
      },
    });
  };

  // Auto-refresh mechanism for documents
  useEffect(() => {
    if (!employee?.id) return;

    // Comprehensive refresh function
    const refreshDocs = async () => {
      try {
        await queryClient.invalidateQueries({ queryKey: employeeKeys.detail(employee.id) });
        await queryClient.refetchQueries({ queryKey: employeeKeys.detail(employee.id) });
      } catch (error) {
        console.error('Failed to refresh documents:', error);
      }
    };

    // Listen to successful document uploads
    const handleDocumentAdded = (evt: Event) => {
      const detail = (evt as CustomEvent).detail as { type: string; employeeId: string; document: EmployeeDocumentDto };
      if (detail?.type === 'EmployeeDocumentAdded' && detail.employeeId === employee.id) {
        // Optimistically update the cache first
        queryClient.setQueryData<EmployeeDto>(employeeKeys.detail(employee.id), (prev) =>
          prev ? { ...prev, documents: [detail.document, ...(prev.documents || [])] } : prev
        );
        // Then refresh to ensure consistency
        setTimeout(refreshDocs, 200);
      }
    };

    // Listen to document deletion/archival
    const handleDocumentUpdated = (evt: Event) => {
      const detail = (evt as CustomEvent).detail as { type: string; employeeId: string };
      if ((detail?.type === 'EmployeeDocumentDeleted' || detail?.type === 'EmployeeDocumentArchived') && detail.employeeId === employee.id) {
        refreshDocs();
      }
    };

    // Set up event listeners
    window.addEventListener('signalr-employee-event', handleDocumentAdded as EventListener);
    window.addEventListener('signalr-employee-event', handleDocumentUpdated as EventListener);

    return () => {
      window.removeEventListener('signalr-employee-event', handleDocumentAdded as EventListener);
      window.removeEventListener('signalr-employee-event', handleDocumentUpdated as EventListener);
    };
  }, [employee?.id]);

  // Auto-select the first document when the list first appears (but don't override a user selection)
  useEffect(() => {
    if (!selected && docs.length > 0) {
      setSelected(docs[0]);
    }
  }, [docs, selected]);

  const totals = useMemo(() => {
    const byCat: Record<string, number> = { video: 0, image: 0, document: 0, install: 0, other: 0 };
    let size = 0;
    docs.forEach((d) => {
      const cat = categorize(d.contentType, d.fileName);
      byCat[cat] = (byCat[cat] || 0) + 1;
      size += d.sizeBytes || 0;
    });
    return { count: docs.length, size, byCat };
  }, [docs]);

  // Assume a soft quota so the bar has context (adjust easily later)
  const SOFT_QUOTA = 150 * 1024 * 1024 * 1024; // 150 GB

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return docs;
    return docs.filter((d) =>
      d.fileName.toLowerCase().includes(term) ||
      (d.contentType || '').toLowerCase().includes(term)
    );
  }, [docs, search]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Calculate pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const showPagination = filtered.length > itemsPerPage;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDocs = filtered.slice(startIndex, endIndex);

  const onFilesChosen = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const fileCount = files.length;
    const fileNames = Array.from(files).map(f => f.name);
    
    // Show initial upload toast
    const uploadToastId = toast.loading(
      fileCount === 1 
        ? `Uploading "${fileNames[0]}"...` 
        : `Uploading ${fileCount} files...`, 
      {
        title: 'Upload in Progress',
        persistent: true,
      }
    );
    
    // Iterate reversed because our cache update prepends; this preserves the user's selection order
    const ordered = Array.from(files).reverse();
    
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    
    // Process files concurrently for better UX (optimistic updates will show immediately)
    const uploadPromises = ordered.map(async (file) => {
      // map to backend numeric type; default to 99 (Other)
      const type = (() => {
        const cat = categorize(file.type, file.name);
        if (cat === 'document') return 1; // Contract/Doc
        if (cat === 'image') return 3; // Certification/Image-ish
        return 99; // Other
      })();
      
      try {
        await addDoc.mutateAsync({ file, type });
        successCount++;
      } catch (error) {
        errorCount++;
        errors.push(file.name);
        console.error(`Failed to upload ${file.name}:`, error);
      }
    });
    
    // Wait for all uploads to complete
    await Promise.allSettled(uploadPromises);
    
    // Hide the loading toast
    hideToast(uploadToastId);
    
    // Show result toasts
    if (successCount > 0) {
      toast.success(
        successCount === 1 
          ? `"${fileNames.find(name => !errors.includes(name))}" uploaded successfully`
          : `${successCount} file${successCount > 1 ? 's' : ''} uploaded successfully`,
        {
          title: 'Upload Complete',
          duration: 4000,
        }
      );
    }
    
    if (errorCount > 0) {
      toast.error(
        errorCount === 1 
          ? `Failed to upload "${errors[0]}"`
          : `Failed to upload ${errorCount} file${errorCount > 1 ? 's' : ''}`,
        {
          title: 'Upload Failed',
          duration: 6000,
          actions: [
            {
              label: 'Retry Failed',
              onClick: () => {
                // Create a new FileList with only the failed files
                const failedFiles = Array.from(files).filter(file => errors.includes(file.name));
                if (failedFiles.length > 0) {
                  const dataTransfer = new DataTransfer();
                  failedFiles.forEach(file => dataTransfer.items.add(file));
                  onFilesChosen(dataTransfer.files);
                }
              },
              variant: 'primary',
            },
          ],
        }
      );
    }
    
    // Force refresh after all uploads
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(employee.id) });
    }, 500);
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Manual refresh function with visual feedback
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Clear the current cache to force fresh data
      await queryClient.invalidateQueries({ queryKey: employeeKeys.detail(employee.id) });
      
      // Also refetch immediately to ensure we get the latest data
      await queryClient.refetchQueries({ queryKey: employeeKeys.detail(employee.id) });
      
      // Reset pagination to first page to show newest data
      setCurrentPage(1);
      
      // Clear search to show all documents
      setSearch('');
      
      // Show notification toast for refresh action
      toast.notification('Documents refreshed successfully', {
        title: 'Refresh Complete',
        duration: 3000,
      });
      
    } catch (error) {
      console.error('Failed to refresh documents:', error);
      
      // Show error toast
      toast.error('Failed to refresh documents. Please try again.', {
        title: 'Refresh Failed',
        duration: 5000,
        actions: [
          {
            label: 'Retry',
            onClick: () => handleRefresh(),
            variant: 'primary',
          },
        ],
      });
    } finally {
      // Add a small delay to show the loading state
      setTimeout(() => setIsRefreshing(false), 300);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Documents</h3>
          <p className="text-sm text-gray-500">Effortlessly upload and manage files for this employee</p>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()} 
          className={`inline-flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg text-sm ${addDoc.isPending ? 'opacity-75 cursor-not-allowed' : 'hover:bg-gray-800'}`}
          disabled={addDoc.isPending}
        >
          {addDoc.isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" /> Quick Upload
            </>
          )}
        </button>
      </div>

      {/* Upload area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 mb-6 text-center transition-all duration-200 cursor-pointer ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50 scale-[1.02]' 
            : addDoc.isPending 
              ? 'border-blue-300 bg-blue-50' 
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
        }`}
        onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={(e) => { 
          e.preventDefault(); 
          e.stopPropagation(); 
          setIsDragOver(false); 
          onFilesChosen(e.dataTransfer?.files || null); 
        }}
        onClick={() => !addDoc.isPending && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <input ref={fileInputRef} className="hidden" type="file" multiple onChange={(e) => onFilesChosen(e.currentTarget.files)} />
        <div className={`mx-auto inline-flex items-center justify-center w-12 h-12 rounded-full shadow-sm mb-3 transition-all duration-200 ${
          isDragOver ? 'bg-blue-100 scale-110' : addDoc.isPending ? 'bg-blue-100' : 'bg-white'
        }`}>
          {addDoc.isPending ? (
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Upload className={`w-5 h-5 transition-colors ${isDragOver ? 'text-blue-600' : 'text-gray-700'}`} />
          )}
        </div>
        <div className={`font-medium transition-colors ${
          isDragOver ? 'text-blue-700' : addDoc.isPending ? 'text-blue-600' : 'text-gray-700'
        }`}>
          {addDoc.isPending ? 'Processing files...' : isDragOver ? 'Drop files here' : 'Click to upload or drag and drop'}
        </div>
        <div className={`text-xs mt-1 transition-colors ${
          isDragOver ? 'text-blue-600' : addDoc.isPending ? 'text-blue-500' : 'text-gray-500'
        }`}>
          {addDoc.isPending ? 'Please wait while files are being uploaded' : 'PDF, images, videos or installers'}
        </div>
        
        {/* Upload progress indicator */}
        {addDoc.isPending && (
          <div className="absolute inset-0 bg-blue-50 bg-opacity-90 rounded-xl flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-blue-700 font-medium">Uploading documents...</div>
            </div>
          </div>
        )}
      </div>

      {/* Usage bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <div>{bytesToHuman(SOFT_QUOTA - totals.size)} available from 150GB</div>
          <div>{bytesToHuman(totals.size)} used</div>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex">
          {/* Video files segment */}
          {totals.byCat.video > 0 && (
            <div 
              className="h-full bg-blue-500" 
              style={{ 
                width: `${Math.max(0.5, (docs.filter(d => categorize(d.contentType, d.fileName) === 'video').reduce((sum, d) => sum + (d.sizeBytes || 0), 0) / totals.size) * 100)}%` 
              }} 
            />
          )}
          {/* Image files segment */}
          {totals.byCat.image > 0 && (
            <div 
              className="h-full bg-green-500" 
              style={{ 
                width: `${Math.max(0.5, (docs.filter(d => categorize(d.contentType, d.fileName) === 'image').reduce((sum, d) => sum + (d.sizeBytes || 0), 0) / totals.size) * 100)}%` 
              }} 
            />
          )}
          {/* Document files segment */}
          {totals.byCat.document > 0 && (
            <div 
              className="h-full bg-indigo-500" 
              style={{ 
                width: `${Math.max(0.5, (docs.filter(d => categorize(d.contentType, d.fileName) === 'document').reduce((sum, d) => sum + (d.sizeBytes || 0), 0) / totals.size) * 100)}%` 
              }} 
            />
          )}
          {/* Installation files segment */}
          {totals.byCat.install > 0 && (
            <div 
              className="h-full bg-sky-300" 
              style={{ 
                width: `${Math.max(0.5, (docs.filter(d => categorize(d.contentType, d.fileName) === 'install').reduce((sum, d) => sum + (d.sizeBytes || 0), 0) / totals.size) * 100)}%` 
              }} 
            />
          )}
          {/* Other files segment */}
          {totals.byCat.other > 0 && (
            <div 
              className="h-full bg-gray-400" 
              style={{ 
                width: `${Math.max(0.5, (docs.filter(d => categorize(d.contentType, d.fileName) === 'other').reduce((sum, d) => sum + (d.sizeBytes || 0), 0) / totals.size) * 100)}%` 
              }} 
            />
          )}
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"/> Video</span>
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"/> Image</span>
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"/> Document</span>
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-300 inline-block"/> Installation</span>
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="border rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3"><VideoIcon className="w-5 h-5 text-blue-600"/><div className="text-sm"><div className="font-medium">Video</div><div className="text-gray-500 text-xs">{totals.byCat.video || 0} Files</div></div></div>
        </div>
        <div className="border rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3"><ImageIcon className="w-5 h-5 text-green-600"/><div className="text-sm"><div className="font-medium">Image</div><div className="text-gray-500 text-xs">{totals.byCat.image || 0} Files</div></div></div>
        </div>
        <div className="border rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3"><FileText className="w-5 h-5 text-indigo-600"/><div className="text-sm"><div className="font-medium">Document</div><div className="text-gray-500 text-xs">{totals.byCat.document || 0} Files</div></div></div>
        </div>
        <div className="border rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3"><Package className="w-5 h-5 text-sky-500"/><div className="text-sm"><div className="font-medium">Installation Files</div><div className="text-gray-500 text-xs">{totals.byCat.install || 0} Files</div></div></div>
        </div>
      </div>

      {/* List + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="relative w-72 max-w-full">
              <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
              <input value={search} onChange={(e)=>setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm" placeholder="Search"/>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors ${
                isRefreshing ? 'opacity-75 cursor-not-allowed' : ''
              }`}
              title="Refresh documents"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
            <div className="overflow-auto border rounded-xl max-h-96">
              <table className="min-w-full text-sm table-fixed">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs text-gray-500">
                    <th className="p-3 whitespace-nowrap">File name</th>
                    <th className="p-3 whitespace-nowrap">Date uploaded</th>
                    <th className="p-3 whitespace-nowrap">File size</th>
                    <th className="p-3 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-white">
                  {paginatedDocs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-gray-500">No files found.</td>
                    </tr>
                  )}
                  {paginatedDocs.map((doc) => {
                    const isSel = selected?.id === doc.id;
                    const category = categorize(doc.contentType, doc.fileName);
                    const displayDate = doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '-';
                    return (
                      <tr
                        key={doc.id}
                        onClick={() => setSelected(doc)}
                        className={`cursor-pointer ${isSel ? 'bg-gray-50' : 'hover:bg-gray-50'} ${doc.isArchived ? 'opacity-60 bg-gray-25' : ''}`}
                      >
                        <td className="p-3 align-top">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 flex-shrink-0 rounded-md bg-gray-100 flex items-center justify-center">
                              {category === 'image' ? (
                                <ImageIcon className="w-5 h-5 text-green-600" />
                              ) : category === 'video' ? (
                                <VideoIcon className="w-5 h-5 text-blue-600" />
                              ) : category === 'document' ? (
                                <FileText className="w-5 h-5 text-indigo-600" />
                              ) : category === 'install' ? (
                                <Package className="w-5 h-5 text-sky-500" />
                              ) : (
                                <FileText className="w-5 h-5 text-gray-500" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <div className="font-medium text-gray-900 truncate">{doc.fileName}</div>
                                {doc.isArchived && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                    Archived
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 truncate">{doc.contentType || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 align-top text-sm text-gray-600">{displayDate}</td>
                        <td className="p-3 align-top text-sm text-gray-600">{bytesToHuman(doc.sizeBytes)}</td>
                        <td className="p-3 align-top text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!doc.isArchived ? (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleArchive(doc); }} 
                                className="p-2 rounded transition-colors hover:bg-gray-100"
                                title="Archive"
                              >
                                <Archive className="w-4 h-4 text-orange-600" />
                              </button>
                            ) : (
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  unarchiveDoc.mutate(doc.id, {
                                    onSuccess: () => {
                                      toast.success(`"${doc.fileName}" has been restored successfully`, {
                                        title: 'File Restored',
                                        duration: 3000,
                                      });
                                    },
                                    onError: () => {
                                      toast.error(`Failed to restore "${doc.fileName}". Please try again.`, {
                                        title: 'Restore Failed',
                                        duration: 5000,
                                      });
                                    },
                                  });
                                }} 
                                className="p-2 rounded transition-colors hover:bg-gray-100"
                                title="Restore from Archive"
                                disabled={unarchiveDoc.isPending}
                              >
                                <Archive className="w-4 h-4 text-blue-600" />
                              </button>
                            )}
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDelete(doc); }} 
                              className="p-2 rounded transition-colors hover:bg-gray-100"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {showPagination && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(endIndex, filtered.length)} of {filtered.length} files
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
        </div>

        {/* Details sidebar */}
        <div className="border rounded-xl p-4 h-full">
          <div className="text-sm font-semibold text-gray-900 mb-3">Details File</div>
          {!selected ? (
            <div className="text-sm text-gray-500">Select a file to see details.</div>
          ) : (
            <div className="space-y-3">
              <div className="w-full h-32 bg-gray-50 border rounded-lg flex items-center justify-center">
                <FileText className="w-10 h-10 text-red-500" />
              </div>
              <div className="text-sm text-gray-700">
                <div className="text-gray-500">File Name</div>
                <div className="font-medium break-words">{selected.fileName}</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-500">Date Uploaded</div>
                  <div className="font-medium">{selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : '—'}</div>
                </div>
                <div>
                  <div className="text-gray-500">File size</div>
                  <div className="font-medium">{bytesToHuman(selected.sizeBytes)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Content Type</div>
                  <div className="font-medium">{selected.contentType || '—'}</div>
                </div>
                <div>
                  <div className="text-gray-500">Version</div>
                  <div className="font-medium">v{selected.version ?? 1}</div>
                </div>
              </div>
              {selected.isArchived && (
                <div className="flex items-center justify-between">
                  <div className="text-xs text-red-600">Archived {selected.archivedAt ? new Date(selected.archivedAt).toLocaleDateString() : ''}</div>
                  <button
                    onClick={() => {
                      unarchiveDoc.mutate(selected.id, {
                        onSuccess: () => {
                          toast.success(`"${selected.fileName}" has been restored successfully`, {
                            title: 'File Restored',
                            duration: 3000,
                          });
                          // Update selection to reflect the change
                          setSelected({ ...selected, isArchived: false, archivedAt: null });
                        },
                        onError: () => {
                          toast.error(`Failed to restore "${selected.fileName}". Please try again.`, {
                            title: 'Restore Failed',
                            duration: 5000,
                          });
                        },
                      });
                    }}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    disabled={unarchiveDoc.isPending}
                  >
                    {unarchiveDoc.isPending ? 'Restoring...' : 'Restore'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EmployeeProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: employee, isLoading, isError } = useEmployee(id);
  const { toast } = useToast();

  // Listen to real-time document events and update query cache
  useEffect(() => {
    if (!id) return;

    const handler = (evt: Event) => {
      const detail = (evt as CustomEvent).detail as { type: string; employeeId: string; document: EmployeeDocumentDto };
      if (detail?.type === 'EmployeeDocumentAdded' && detail.employeeId === id) {
        // Prepend to detail cache
        queryClient.setQueryData<EmployeeDto>(employeeKeys.detail(id), (prev) =>
          prev ? { ...prev, documents: [detail.document, ...(prev.documents || [])] } : prev
        );
      }
    };

    window.addEventListener('signalr-employee-event', handler as EventListener);
    return () => window.removeEventListener('signalr-employee-event', handler as EventListener);
  }, [id]);
  const { data: allEmployees } = useEmployees();
  const { mutateAsync: uploadImage, isPending: isUploading } = useUploadEmployeeImage(id ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addDoc = useAddEmployeeDocument(id ?? "");
  const archiveDoc = useArchiveEmployeeDocument(id ?? "");
  const unarchiveDoc = useUnarchiveEmployeeDocument(id ?? "");
  const deleteDoc = useDeleteEmployeeDocument(id ?? "");
  const startOnboarding = useStartOnboarding(id ?? "");
  const completeOnboardingTask = useCompleteOnboardingTask(id ?? "");
  const initiateOffboarding = useInitiateOffboarding(id ?? "");
  const completeOffboardingTask = useCompleteOffboardingTask(id ?? "");

  // Edit mode state and form
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<{ firstName?: string; lastName?: string; phoneNumber?: string; jobTitle?: string; departmentName?: string; dateOfBirth?: string | null }>();
  const { mutateAsync: updateEmployee, isPending: isSaving } = useUpdateEmployee(id ?? "");

  // Lifecycle filter state - tracks which lifecycle stage is selected for display (single selection)
  const [selectedLifecycleStage, setSelectedLifecycleStage] = useState<number | null>(null); // null means show all stages

  // Lifecycle stage definitions
  const lifecycleStages = [
    { value: 0, label: 'Onboarding', bgColor: 'bg-blue-100', textColor: 'text-blue-800', selectedBg: 'bg-blue-200' },
    { value: 1, label: 'Active', bgColor: 'bg-green-100', textColor: 'text-green-800', selectedBg: 'bg-green-200' },
    { value: 2, label: 'Suspended', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', selectedBg: 'bg-yellow-200' },
    { value: 3, label: 'Offboarding', bgColor: 'bg-purple-100', textColor: 'text-purple-800', selectedBg: 'bg-purple-200' },
    { value: 4, label: 'Terminated', bgColor: 'bg-red-100', textColor: 'text-red-800', selectedBg: 'bg-red-200' }
  ];

  // Toggle lifecycle stage selection (single selection)
  const toggleLifecycleStage = (stageId: number) => {
    setSelectedLifecycleStage(prev => prev === stageId ? null : stageId);
  };

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
      
      // Show success toast
      toast.success('Employee profile updated successfully', {
        title: 'Profile Updated',
        duration: 4000,
      });
    } catch {
      // Show error toast
      toast.error('Failed to update employee profile. Please try again.', {
        title: 'Update Failed',
        duration: 6000,
        actions: [
          {
            label: 'Retry',
            onClick: () => saveEdit(),
            variant: 'primary',
          },
        ],
      });
      // errors surfaced by global handlers; keep in edit mode
    }
  };

  const departmentPeers = useMemo(() => {
    if (!employee || !allEmployees) return [] as EmployeeDto[];
    return allEmployees.filter(e => {
      const isSameDepartment = e.departmentName === employee.departmentName && e.id !== employee.id;
      if (!isSameDepartment) return false;
      
      // If no lifecycle stage is selected, show all department peers
      if (selectedLifecycleStage === null) return true;
      
      const employeeLifecycleStage = typeof e.status === 'number' ? e.status : 1; // Default to Active if string
      return employeeLifecycleStage === selectedLifecycleStage;
    });
  }, [employee, allEmployees, selectedLifecycleStage]);

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
                        try {
                          await uploadImage(file);
                          toast.success('Profile image updated successfully', {
                            title: 'Image Updated',
                            duration: 4000,
                          });
                        } catch {
                          toast.error('Failed to upload image. Please try again.', {
                            title: 'Upload Failed',
                            duration: 5000,
                            actions: [
                              {
                                label: 'Try Again',
                                onClick: () => fileInputRef.current?.click(),
                                variant: 'primary',
                              },
                            ],
                          });
                        }
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

              {/* Documents Dashboard */}
              <DocumentsDashboard employee={employee} addDoc={addDoc} archiveDoc={archiveDoc} unarchiveDoc={unarchiveDoc} deleteDoc={deleteDoc} />
            </div>

            {/* Right: Department Overview + Lifecycle + Messaging */}
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
                
                {/* Lifecycle Stage Filters */}
                <div className="mb-6">
                  <div className="text-sm font-medium text-gray-700 mb-3">
                    Filter Department by Lifecycle Stage 
                    <span className="text-xs text-gray-500 ml-1">
                      ({selectedLifecycleStage !== null ? '1 selected' : 'All stages'})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {lifecycleStages.map((stage) => {
                      const isSelected = selectedLifecycleStage === stage.value;
                      return (
                        <button
                          key={stage.value}
                          onClick={() => toggleLifecycleStage(stage.value)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                            isSelected 
                              ? `${stage.selectedBg} ${stage.textColor} border-transparent` 
                              : `${stage.bgColor} ${stage.textColor} border-gray-200 hover:border-gray-300`
                          }`}
                        >
                          {stage.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Showing {departmentPeers.length} of {allEmployees?.filter(e => e.departmentName === employee?.departmentName && e.id !== employee?.id).length || 0} department colleagues
                    {selectedLifecycleStage !== null && (
                      <span className="ml-1">
                        • Filtered by {lifecycleStages.find(s => s.value === selectedLifecycleStage)?.label}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
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

              {/* Messaging Panel */}
              <div className="h-[500px]">
                <MessagingPanel />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeProfile;
