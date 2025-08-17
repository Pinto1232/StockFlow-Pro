import { useQuery, useMutation, keepPreviousData } from '@tanstack/react-query';
import { http } from '../services/api/client';
import { employeeKeys } from '../services/queryKeys';
import { queryClient } from '../services/queryClient';

// Define the DTO shape expected from the backend
export interface EmployeeDocumentDto {
  id: string;
  fileName: string;
  type: number; // DocumentType numeric value from backend
  storagePath: string;
  sizeBytes: number;
  contentType: string;
  version: number;
  isArchived: boolean;
  createdAt: string;
  archivedAt?: string | null;
  issuedAt?: string | null;
  expiresAt?: string | null;
}

// TaskDto interface for tasks included in EmployeeDto
export interface TaskDto {
  id: number;
  guidId: string;
  type?: string;
  task: string;
  description: string;
  assignee: Array<{ initials: string; color: string }>;
  dueDate: string;
  priority: string;
  progress: number;
  subtaskCount?: number;
  completed: boolean;
  commentCount?: number;
  children?: TaskDto[];
}

export interface EmployeeDto {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth?: string | null;
  jobTitle: string;
  departmentId?: string | null;
  departmentName?: string | null;
  managerId?: string | null;
  status: number | 'Onboarding' | 'Active' | 'Suspended' | 'Offboarding' | 'Terminated';
  isActive: boolean;
  imageUrl?: string | null;
  hireDate?: string | null;
  terminationDate?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
  documents: EmployeeDocumentDto[];
  tasks?: TaskDto[]; // Include tasks from backend
}

export function useEmployees(filters?: { activeOnly?: boolean; departmentId?: string; search?: string; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: employeeKeys.list(filters ?? {}),
    queryFn: ({ signal }) => http.get<EmployeeDto[]>('/api/employees', { params: filters, signal }),
    placeholderData: keepPreviousData,
  });
}

export function useEmployee(id?: string) {
  return useQuery({
    queryKey: id ? employeeKeys.detail(id) : employeeKeys.details(),
    queryFn: ({ signal }) => {
      if (!id) throw new Error('id is required');
      return http.get<EmployeeDto>(`/api/employees/${id}`, { signal });
    },
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  return useMutation({
    mutationFn: (payload: Partial<EmployeeDto>) => http.post<EmployeeDto>('/api/employees', payload),
    onSuccess: (created) => {
      queryClient.setQueryData<EmployeeDto[]>(employeeKeys.list({}), (prev) => (prev ? [created, ...prev] : [created]));
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}

export function useUpdateEmployee(id: string) {
  return useMutation({
    mutationFn: (payload: Partial<EmployeeDto>) => http.put<EmployeeDto>(`/api/employees/${id}`, payload),
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: employeeKeys.detail(id) });
      const previous = queryClient.getQueryData<EmployeeDto>(employeeKeys.detail(id));
      if (previous) {
        queryClient.setQueryData<EmployeeDto>(employeeKeys.detail(id), { ...previous, ...updates });
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(employeeKeys.detail(id), ctx.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.details() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}

export function useDeleteEmployee(id: string) {
  return useMutation({
    mutationFn: () => http.delete<void>(`/api/employees/${id}`),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: employeeKeys.lists() });
      const previous = queryClient.getQueriesData<EmployeeDto[]>({ queryKey: employeeKeys.lists() });
      previous.forEach(([key, data]) => {
        if (!data) return;
        queryClient.setQueryData<EmployeeDto[]>(key, data.filter((e) => e.id !== id));
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.previous?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}

export function useUploadEmployeeImage(id: string) {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return http.post<{ imageUrl: string }>(`/api/employees/${id}/image`, formData);
    },
    onMutate: async (file: File) => {
      // Optimistic update with a temporary URL
      const tempImageUrl = URL.createObjectURL(file);
      
      // Cancel ongoing queries to prevent them from overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: employeeKeys.details() });
      await queryClient.cancelQueries({ queryKey: employeeKeys.lists() });
      
      // Store previous data for rollback
      const previousDetail = queryClient.getQueryData<EmployeeDto>(employeeKeys.detail(id));
      const previousLists = queryClient.getQueriesData<EmployeeDto[]>({ queryKey: employeeKeys.lists() });
      
      // Optimistically update detail cache
      queryClient.setQueryData<EmployeeDto>(employeeKeys.detail(id), (prev) => 
        prev ? { ...prev, imageUrl: tempImageUrl } : prev
      );
      
      // Optimistically update list caches
      previousLists.forEach(([key, data]) => {
        if (!data) return;
        const updated = data.map((e) => (e.id === id ? { ...e, imageUrl: tempImageUrl } : e));
        queryClient.setQueryData<EmployeeDto[]>(key, updated);
      });
      
      return { previousDetail, previousLists, tempImageUrl };
    },
    onSuccess: ({ imageUrl }, file, context) => {
      // Clean up the temporary URL
      if (context?.tempImageUrl) {
        URL.revokeObjectURL(context.tempImageUrl);
      }
      
      // Update detail cache with real image URL
      queryClient.setQueryData<EmployeeDto>(employeeKeys.detail(id), (prev) => 
        prev ? { ...prev, imageUrl, updatedAt: new Date().toISOString() } : prev
      );
      
      // Update list caches with real image URL
      const lists = queryClient.getQueriesData<EmployeeDto[]>({ queryKey: employeeKeys.lists() });
      lists.forEach(([key, data]) => {
        if (!data) return;
        const updated = data.map((e) => 
          e.id === id ? { ...e, imageUrl, updatedAt: new Date().toISOString() } : e
        );
        queryClient.setQueryData<EmployeeDto[]>(key, updated);
      });
    },
    onError: (error, file, context) => {
      // Clean up the temporary URL
      if (context?.tempImageUrl) {
        URL.revokeObjectURL(context.tempImageUrl);
      }
      
      // Rollback optimistic updates
      if (context?.previousDetail) {
        queryClient.setQueryData(employeeKeys.detail(id), context.previousDetail);
      }
      
      context?.previousLists?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      // Force fresh data fetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: employeeKeys.details() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}

// Documents
export function useAddEmployeeDocument(id: string) {
  return useMutation<EmployeeDocumentDto, Error, { file: File; type: number; issuedAt?: string | null; expiresAt?: string | null }, { previousDetail?: EmployeeDto; optimisticDoc?: EmployeeDocumentDto }>({
    mutationFn: async (payload) => {
      // Build form data and upload
      const formData = new FormData();
      formData.append('file', payload.file);
      formData.append('type', payload.type.toString());
      if (payload.issuedAt) formData.append('issuedAt', payload.issuedAt);
      if (payload.expiresAt) formData.append('expiresAt', payload.expiresAt as string);

      const result = await http.post<EmployeeDocumentDto>(`/api/employees/${id}/documents`, formData);
      return result;
    },
    onMutate: async (payload) => {
      // Cancel ongoing queries to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: employeeKeys.detail(id) });
      
      // Create optimistic document with temporary ID
      const optimisticDoc: EmployeeDocumentDto = {
        id: `temp-${Date.now()}-${Math.random()}`, // Temporary ID
        fileName: payload.file.name,
        type: payload.type,
        storagePath: `/uploads/employees/${id}/${Date.now()}_${payload.file.name}`, // Temporary path
        sizeBytes: payload.file.size,
        contentType: payload.file.type || 'application/octet-stream',
        version: 1,
        isArchived: false,
        createdAt: new Date().toISOString(),
        archivedAt: null,
        issuedAt: payload.issuedAt || null,
        expiresAt: payload.expiresAt || null,
      };
      
      // Store previous data for rollback
      const previousDetail = queryClient.getQueryData<EmployeeDto>(employeeKeys.detail(id));
      
      // Optimistically update detail cache
      queryClient.setQueryData<EmployeeDto>(employeeKeys.detail(id), (prev) => 
        prev ? { ...prev, documents: [optimisticDoc, ...(prev.documents || [])] } : prev
      );
      
      return { previousDetail, optimisticDoc };
    },
    onSuccess: (doc, _vars, context) => {
      // Replace optimistic document with real one in detail cache
      queryClient.setQueryData<EmployeeDto>(employeeKeys.detail(id), (prev) => {
        if (!prev) return prev;
        const updatedDocs = (prev.documents || []).map(d => d.id === context?.optimisticDoc?.id ? doc : d);
        return { ...prev, documents: updatedDocs };
      });

      // Update any list caches that may include this employee's documents
      const lists = queryClient.getQueriesData<EmployeeDto[]>({ queryKey: employeeKeys.lists() });
      lists.forEach(([key, data]) => {
        if (!data) return;
        const updated = data.map((e) => {
          if (e.id !== id) return e;
          const updatedDocs = (e.documents || []).map(d => d.id === context?.optimisticDoc?.id ? doc : d);
          return { ...e, documents: updatedDocs };
        });
        queryClient.setQueryData<EmployeeDto[]>(key, updated);
      });

      // Ensure fresh detail is fetched
      queryClient.refetchQueries({ queryKey: employeeKeys.detail(id) });
    },
    onError: (error, vars, context) => {
      // Rollback optimistic update on error
      if (context?.previousDetail) {
        queryClient.setQueryData(employeeKeys.detail(id), context.previousDetail);
      }

      // Notify user
      try {
        alert(`Failed to upload ${vars.file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } catch {
        // ignore alert failures in non-browser test envs
      }
    },
    onSettled: () => {
      // Force refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey: employeeKeys.details() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      
      // Also refetch the specific employee to ensure fresh data
      queryClient.refetchQueries({ queryKey: employeeKeys.detail(id) });
    },
  });
}

export function useArchiveEmployeeDocument(id: string) {
  return useMutation({
    mutationFn: (vars: { documentId: string; reason: string }) => http.post<void>(`/api/employees/${id}/documents/${vars.documentId}/archive`, { reason: vars.reason }),
    onMutate: async ({ documentId }) => {
      await queryClient.cancelQueries({ queryKey: employeeKeys.details() });
      const prevDetail = queryClient.getQueryData<EmployeeDto>(employeeKeys.detail(id));
      if (prevDetail) {
        queryClient.setQueryData<EmployeeDto>(employeeKeys.detail(id), {
          ...prevDetail,
          documents: (prevDetail.documents || []).map((d) => d.id === documentId ? { ...d, isArchived: true, archivedAt: new Date().toISOString() } : d),
        });
      }
      return { prevDetail };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevDetail) {
        queryClient.setQueryData(employeeKeys.detail(id), ctx.prevDetail);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.details() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}

export function useDeleteEmployeeDocument(id: string) {
  return useMutation({
    mutationFn: (documentId: string) => http.delete<void>(`/api/employees/${id}/documents/${documentId}`),
    onMutate: async (documentId) => {
      await queryClient.cancelQueries({ queryKey: employeeKeys.details() });
      const prevDetail = queryClient.getQueryData<EmployeeDto>(employeeKeys.detail(id));
      if (prevDetail) {
        queryClient.setQueryData<EmployeeDto>(employeeKeys.detail(id), {
          ...prevDetail,
          documents: (prevDetail.documents || []).filter((d) => d.id !== documentId),
        });
      }
      return { prevDetail };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevDetail) {
        queryClient.setQueryData(employeeKeys.detail(id), ctx.prevDetail);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.details() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}

// Onboarding / Offboarding
export function useStartOnboarding(id: string) {
  return useMutation({
    mutationFn: () => http.post<EmployeeDto>(`/api/employees/${id}/onboarding/start`, {}),
    onSuccess: (updated) => {
      queryClient.setQueryData<EmployeeDto>(employeeKeys.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}

export function useUnarchiveEmployeeDocument(id: string) {
  return useMutation({
    mutationFn: (documentId: string) => http.post<void>(`/api/employees/${id}/documents/${documentId}/unarchive`),
    onMutate: async (documentId) => {
      await queryClient.cancelQueries({ queryKey: employeeKeys.details() });
      const prevDetail = queryClient.getQueryData<EmployeeDto>(employeeKeys.detail(id));
      if (prevDetail) {
        queryClient.setQueryData<EmployeeDto>(employeeKeys.detail(id), {
          ...prevDetail,
          documents: (prevDetail.documents || []).map((d) => d.id === documentId ? { ...d, isArchived: false, archivedAt: null } : d),
        });
      }
      return { prevDetail };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevDetail) {
        queryClient.setQueryData(employeeKeys.detail(id), ctx.prevDetail);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.details() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      
      // Also refetch the specific employee to ensure fresh data
      queryClient.refetchQueries({ queryKey: employeeKeys.detail(id) });
    },
  });
}

export function useCompleteOnboardingTask(id: string) {
  return useMutation({
    mutationFn: (code: string) => http.post<EmployeeDto>(`/api/employees/${id}/onboarding/complete`, { code }),
    onSuccess: (updated) => {
      queryClient.setQueryData<EmployeeDto>(employeeKeys.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}

export function useInitiateOffboarding(id: string) {
  return useMutation({
    mutationFn: (reason: string) => http.post<EmployeeDto>(`/api/employees/${id}/offboarding/initiate`, { reason }),
    onSuccess: (updated) => {
      queryClient.setQueryData<EmployeeDto>(employeeKeys.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}

export function useCompleteOffboardingTask(id: string) {
  return useMutation({
    mutationFn: (code: string) => http.post<EmployeeDto>(`/api/employees/${id}/offboarding/complete`, { code }),
    onSuccess: (updated) => {
      queryClient.setQueryData<EmployeeDto>(employeeKeys.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}
