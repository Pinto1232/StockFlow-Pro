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

export interface EmployeeDto {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
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
    onSuccess: ({ imageUrl }) => {
      // Update detail cache
      queryClient.setQueryData<EmployeeDto>(employeeKeys.detail(id), (prev) => (prev ? { ...prev, imageUrl } : prev));
      // Update list caches
      const lists = queryClient.getQueriesData<EmployeeDto[]>({ queryKey: employeeKeys.lists() });
      lists.forEach(([key, data]) => {
        if (!data) return;
        const updated = data.map((e) => (e.id === id ? { ...e, imageUrl } : e));
        queryClient.setQueryData<EmployeeDto[]>(key, updated as EmployeeDto[]);
      });
    },
    onSettled: () => {
      // Ensure fresh data (e.g., updatedAt, other fields) is pulled from server
      queryClient.invalidateQueries({ queryKey: employeeKeys.details() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
    },
  });
}
