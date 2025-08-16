import { apiService } from "./api";

export interface DepartmentDto {
  id: string;
  name: string;
  isActive: boolean;
}

export interface CreateDepartmentDto { name: string }
export interface UpdateDepartmentDto { name: string; isActive?: boolean }

export async function getDepartments(activeOnly?: boolean): Promise<DepartmentDto[]> {
  return apiService.get<DepartmentDto[]>(`/Departments`, { activeOnly });
}

export async function createDepartment(dto: CreateDepartmentDto): Promise<DepartmentDto> {
  return apiService.post<DepartmentDto>(`/Departments`, dto);
}

export async function updateDepartment(id: string, dto: UpdateDepartmentDto): Promise<DepartmentDto> {
  return apiService.put<DepartmentDto>(`/Departments/${id}`, dto);
}

export async function deleteDepartment(id: string): Promise<void> {
  await apiService.delete<unknown>(`/Departments/${id}`);
}
