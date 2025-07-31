// Domain Entity: User
// This represents the core business concept of a User in our domain

import { UserApiResponse } from '../../types/ApiTypes';

// UserRole enum values from backend
export enum UserRole {
  Admin = 1,
  User = 2,
  Manager = 3
}

export interface UserRoleInfo {
  id: number;
  name: string;
  permissions: string[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber: string;
  dateOfBirth: Date;
  age: number;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
  profilePhotoUrl?: string;
}

export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly email: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly fullName: string,
    public readonly phoneNumber: string,
    public readonly dateOfBirth: Date,
    public readonly age: number,
    public readonly role: UserRole,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt?: Date,
    public readonly lastLoginAt?: Date,
    public readonly profilePhotoUrl?: string
  ) {}

  get displayName(): string {
    return this.fullName || this.username;
  }

  get roleInfo(): UserRoleInfo {
    const roleMap: Record<UserRole, UserRoleInfo> = {
      [UserRole.Admin]: {
        id: UserRole.Admin,
        name: 'Admin',
        permissions: ['users.view', 'users.create', 'users.edit', 'users.delete', 'reports.view', 'products.manage']
      },
      [UserRole.Manager]: {
        id: UserRole.Manager,
        name: 'Manager',
        permissions: ['users.view', 'reports.view', 'products.manage']
      },
      [UserRole.User]: {
        id: UserRole.User,
        name: 'User',
        permissions: ['products.view']
      }
    };
    return roleMap[this.role];
  }

  hasPermission(permission: string): boolean {
    return this.roleInfo.permissions.includes(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  isInRole(roleName: string): boolean {
    return this.roleInfo.name.toLowerCase() === roleName.toLowerCase();
  }

  static fromApiResponse(data: UserApiResponse): UserEntity {
    return new UserEntity(
      data.id,
      data.username,
      data.email,
      data.firstName,
      data.lastName,
      data.fullName,
      data.phoneNumber,
      new Date(data.dateOfBirth),
      data.age,
      data.role as UserRole,
      data.isActive,
      new Date(data.createdAt),
      data.updatedAt ? new Date(data.updatedAt) : undefined,
      data.lastLoginAt ? new Date(data.lastLoginAt) : undefined,
      data.profilePhotoUrl
    );
  }
}