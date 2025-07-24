// Dependency Injection Container
// Manages the creation and lifecycle of dependencies

import { ApiClientPort } from '../ports/secondary/ApiClientPort';
import { StoragePort } from '../ports/secondary/StoragePort';
import { NotificationPort } from '../ports/secondary/NotificationPort';

import { AxiosApiClientAdapter } from '../adapters/secondary/AxiosApiClientAdapter';
import { LocalStorageAdapter, SessionStorageAdapter } from '../adapters/secondary/LocalStorageAdapter';
import { SignalRNotificationAdapter } from '../adapters/secondary/SignalRNotificationAdapter';

import { UserManagementService } from '../application/UserManagementService';
import { ProductManagementService } from '../application/ProductManagementService';

export interface Dependencies {
  // Ports
  apiClient: ApiClientPort;
  localStorage: StoragePort;
  sessionStorage: StoragePort;
  notificationService: NotificationPort;

  // Application Services
  userManagementService: UserManagementService;
  productManagementService: ProductManagementService;
}

export class DependencyContainer {
  private static instance: DependencyContainer;
  private dependencies: Dependencies;

  private constructor() {
    this.dependencies = this.createDependencies();
  }

  public static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }

  public getDependencies(): Dependencies {
    return this.dependencies;
  }

  public getApiClient(): ApiClientPort {
    return this.dependencies.apiClient;
  }

  public getLocalStorage(): StoragePort {
    return this.dependencies.localStorage;
  }

  public getSessionStorage(): StoragePort {
    return this.dependencies.sessionStorage;
  }

  public getNotificationService(): NotificationPort {
    return this.dependencies.notificationService;
  }

  public getUserManagementService(): UserManagementService {
    return this.dependencies.userManagementService;
  }

  public getProductManagementService(): ProductManagementService {
    return this.dependencies.productManagementService;
  }

  private createDependencies(): Dependencies {
    // Create secondary adapters (infrastructure)
    const apiClient = new AxiosApiClientAdapter();
    const localStorage = new LocalStorageAdapter();
    const sessionStorage = new SessionStorageAdapter();
    const notificationService = new SignalRNotificationAdapter();

    // Create application services
    const userManagementService = new UserManagementService(apiClient, localStorage);
    const productManagementService = new ProductManagementService(apiClient, localStorage);

    return {
      apiClient,
      localStorage,
      sessionStorage,
      notificationService,
      userManagementService,
      productManagementService,
    };
  }

  // Method to reconfigure dependencies (useful for testing)
  public reconfigure(overrides: Partial<Dependencies>): void {
    this.dependencies = {
      ...this.dependencies,
      ...overrides,
    };
  }

  // Method to reset to default configuration
  public reset(): void {
    this.dependencies = this.createDependencies();
  }
}

// Convenience function to get dependencies
export const getDependencies = (): Dependencies => {
  return DependencyContainer.getInstance().getDependencies();
};

// Individual getters for convenience
export const getApiClient = (): ApiClientPort => {
  return DependencyContainer.getInstance().getApiClient();
};

export const getLocalStorage = (): StoragePort => {
  return DependencyContainer.getInstance().getLocalStorage();
};

export const getSessionStorage = (): StoragePort => {
  return DependencyContainer.getInstance().getSessionStorage();
};

export const getNotificationService = (): NotificationPort => {
  return DependencyContainer.getInstance().getNotificationService();
};

export const getUserManagementService = (): UserManagementService => {
  return DependencyContainer.getInstance().getUserManagementService();
};

export const getProductManagementService = (): ProductManagementService => {
  return DependencyContainer.getInstance().getProductManagementService();
};