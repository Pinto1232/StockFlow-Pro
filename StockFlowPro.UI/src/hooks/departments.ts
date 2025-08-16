import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createDepartment, deleteDepartment, getDepartments, updateDepartment, type CreateDepartmentDto, type UpdateDepartmentDto } from "../services/departmentService";
import { departmentKeys } from "../services/queryKeys";

export function useDepartments(activeOnly?: boolean) {
  return useQuery({ queryKey: departmentKeys.list({ activeOnly }), queryFn: () => getDepartments(activeOnly) });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateDepartmentDto) => createDepartment(dto),
  onSuccess: () => qc.invalidateQueries({ queryKey: departmentKeys.all }),
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateDepartmentDto }) => updateDepartment(id, dto),
  onSuccess: () => qc.invalidateQueries({ queryKey: departmentKeys.all }),
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDepartment(id),
  onSuccess: () => qc.invalidateQueries({ queryKey: departmentKeys.all }),
  });
}
