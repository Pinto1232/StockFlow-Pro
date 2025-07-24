// Integration Tests
// Tests to verify the hexagonal architecture integration

import { describe, it, expect, beforeEach } from 'vitest';
import { UserManagementService } from '../application/UserManagementService';
import { ProductManagementService } from '../application/ProductManagementService';
import { AxiosApiClientAdapter } from '../adapters/secondary/AxiosApiClientAdapter';
import { StoragePort } from '../ports/secondary/StoragePort';
import { UserEntity } from '../domain/entities/User';
import { ProductEntity } from '../domain/entities/Product';
import { StockService } from '../domain/services/StockService';
import { Email } from '../domain/valueObjects/Email';
import { Money } from '../domain/valueObjects/Money';
import { DependencyContainer } from '../shared/DependencyContainer';

// Mock implementations for testing
class MockApiClient extends AxiosApiClientAdapter {
  private mockData: Record<string, unknown> = {};

  constructor() {
    super('http://localhost:5131/api');
  }

  setMockData(endpoint: string, data: unknown) {
    this.mockData[endpoint] = data;
  }

  async get<T>(_url: string): Promise<T> {
    const data = this.mockData[_url];
    if (data) {
      return data as T;
    }
    throw new Error(`No mock data for ${_url}`);
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    // Check if we have mock data for this URL
    const mockData = this.mockData[url];
    if (mockData) {
      return mockData as T;
    }
    // Fallback: simulate successful creation
    return { id: Date.now(), ...(data as object) } as T;
  }

  async put<T>(_url: string, data?: unknown): Promise<T> {
    return data as T;
  }

  async delete<T>(): Promise<T> {
    return {} as T;
  }

  async patch<T>(_url: string, data?: unknown): Promise<T> {
    return data as T;
  }

  async uploadFile<T>(): Promise<T> {
    return {} as T;
  }

  async downloadFile(): Promise<void> {
    return;
  }

  setBaseUrl(): void {}
  setDefaultHeaders(): void {}
  setAuthToken(): void {}
  clearAuthToken(): void {}
  addRequestInterceptor(): void {}
  addResponseInterceptor(): void {}
}

class MockStorage implements StoragePort {
  private mockStorage: Map<string, string> = new Map();

  setItem(key: string, value: string): void {
    this.mockStorage.set(key, value);
  }

  getItem(key: string): string | null {
    return this.mockStorage.get(key) || null;
  }

  removeItem(key: string): void {
    this.mockStorage.delete(key);
  }

  clear(): void {
    this.mockStorage.clear();
  }

  setObject<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      this.setItem(key, serialized);
    } catch {
      throw new Error(`Failed to store object with key: ${key}`);
    }
  }

  getObject<T>(key: string): T | null {
    try {
      const item = this.getItem(key);
      if (item === null) {
        return null;
      }
      return JSON.parse(item) as T;
    } catch {
      return null;
    }
  }

  hasItem(key: string): boolean {
    return this.mockStorage.has(key);
  }

  getAllKeys(): string[] {
    return Array.from(this.mockStorage.keys());
  }

  getStorageSize(): number {
    return Array.from(this.mockStorage.values()).join('').length;
  }

  getRemainingSpace(): number {
    return 1000000; // Mock 1MB remaining
  }
}

describe('Hexagonal Architecture Integration', () => {
  let mockApiClient: MockApiClient;
  let mockStorage: MockStorage;
  let userService: UserManagementService;
  let productService: ProductManagementService;

  beforeEach(() => {
    mockApiClient = new MockApiClient();
    mockStorage = new MockStorage();
    userService = new UserManagementService(mockApiClient, mockStorage);
    productService = new ProductManagementService(mockApiClient, mockStorage);
  });

  describe('User Management Service', () => {
    it('should create a user successfully', async () => {
      const createRequest = {
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123',
        roleId: 1,
      };

      const mockResponse = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: { id: 1, name: 'User', permissions: [] },
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      mockApiClient.setMockData('/users', mockResponse);

      const result = await userService.createUser(createRequest);

      expect(result).toBeInstanceOf(UserEntity);
      expect(result.username).toBe('testuser');
      expect(result.email).toBe('test@example.com');
    });

    it('should handle login and store user data', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: { id: 1, name: 'User', permissions: [] },
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      const mockLoginResponse = {
        user: mockUser,
        token: 'mock-jwt-token',
      };

      // Set up mock for the POST request to /auth/login
      mockApiClient.setMockData('/auth/login', mockLoginResponse);

      const result = await userService.login('testuser', 'password123');

      expect(result).toBeInstanceOf(UserEntity);
      expect(mockStorage.hasItem('currentUser')).toBe(true);
      expect(mockStorage.hasItem('authToken')).toBe(true);
    });

    it('should clear storage on logout', async () => {
      // Setup some stored data
      mockStorage.setItem('currentUser', JSON.stringify({ id: 1 }));
      mockStorage.setItem('authToken', 'token');

      await userService.logout();

      expect(mockStorage.hasItem('currentUser')).toBe(false);
      expect(mockStorage.hasItem('authToken')).toBe(false);
    });
  });

  describe('Product Management Service', () => {
    it('should create a product successfully', async () => {
      const createRequest = {
        name: 'Test Product',
        sku: 'TEST-001',
        price: 99.99,
        cost: 50.00,
        quantity: 100,
        minStockLevel: 10,
        maxStockLevel: 500,
        categoryId: 1,
      };

      const mockResponse = {
        id: 1,
        name: 'Test Product',
        sku: 'TEST-001',
        price: 99.99,
        cost: 50.00,
        quantity: 100,
        minStockLevel: 10,
        maxStockLevel: 500,
        category: { id: 1, name: 'Electronics' },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockApiClient.setMockData('/products', mockResponse);

      const result = await productService.createProduct(createRequest);

      expect(result).toBeInstanceOf(ProductEntity);
      expect(result.name).toBe('Test Product');
      expect(result.sku).toBe('TEST-001');
    });

    it('should validate stock adjustment', async () => {
      const mockProduct = {
        id: 1,
        name: 'Test Product',
        sku: 'TEST-001',
        price: 99.99,
        cost: 50.00,
        quantity: 10,
        minStockLevel: 5,
        maxStockLevel: 100,
        category: { id: 1, name: 'Electronics' },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockApiClient.setMockData('/products/1', mockProduct);

      // Test valid adjustment
      const validAdjustment = {
        productId: 1,
        adjustment: 5,
        reason: 'Restock',
      };

      await expect(productService.adjustStock(validAdjustment)).resolves.not.toThrow();

      // Test invalid adjustment (would result in negative stock)
      const invalidAdjustment = {
        productId: 1,
        adjustment: -20,
        reason: 'Sale',
      };

      await expect(productService.adjustStock(invalidAdjustment)).rejects.toThrow();
    });
  });

  describe('Domain Services', () => {
    it('should generate stock alerts correctly', () => {
      const products = [
        new ProductEntity(
          1, 'Product 1', 'SKU-001', 10, 5, 0, 5, 50, // Out of stock
          { id: 1, name: 'Category' }, true, new Date(), new Date()
        ),
        new ProductEntity(
          2, 'Product 2', 'SKU-002', 10, 5, 3, 5, 50, // Low stock
          { id: 1, name: 'Category' }, true, new Date(), new Date()
        ),
        new ProductEntity(
          3, 'Product 3', 'SKU-003', 10, 5, 60, 5, 50, // Over stock
          { id: 1, name: 'Category' }, true, new Date(), new Date()
        ),
        new ProductEntity(
          4, 'Product 4', 'SKU-004', 10, 5, 25, 5, 50, // Normal stock
          { id: 1, name: 'Category' }, true, new Date(), new Date()
        ),
      ];

      const alerts = StockService.generateStockAlerts(products);

      expect(alerts).toHaveLength(3); // Out, low, and over stock alerts
      expect(alerts[0].alertType).toBe('out');
      expect(alerts[0].severity).toBe('critical');
      expect(alerts[1].alertType).toBe('low');
      expect(alerts[1].severity).toBe('warning');
      expect(alerts[2].alertType).toBe('over');
      expect(alerts[2].severity).toBe('warning');
    });

    it('should calculate reorder quantity correctly', () => {
      const lowStockProduct = new ProductEntity(
        1, 'Product 1', 'SKU-001', 10, 5, 3, 5, 50,
        { id: 1, name: 'Category' }, true, new Date(), new Date()
      );

      const reorderQuantity = StockService.calculateReorderQuantity(lowStockProduct);
      expect(reorderQuantity).toBe(47); // 50 (max) - 3 (current) = 47

      const normalStockProduct = new ProductEntity(
        2, 'Product 2', 'SKU-002', 10, 5, 25, 5, 50,
        { id: 1, name: 'Category' }, true, new Date(), new Date()
      );

      const noReorderNeeded = StockService.calculateReorderQuantity(normalStockProduct);
      expect(noReorderNeeded).toBe(0);
    });
  });

  describe('Value Objects', () => {
    it('should validate email addresses', () => {
      expect(() => new Email('valid@example.com')).not.toThrow();
      expect(() => new Email('invalid-email')).toThrow();
      expect(() => new Email('')).toThrow();
    });

    it('should handle money calculations', () => {
      const price1 = new Money(10.50, 'USD');
      const price2 = new Money(5.25, 'USD');

      const total = price1.add(price2);
      expect(total.amount).toBe(15.75);

      const difference = price1.subtract(price2);
      expect(difference.amount).toBe(5.25);

      expect(() => new Money(-10, 'USD')).toThrow();
      expect(() => price1.add(new Money(10, 'EUR'))).toThrow();
    });
  });
});

describe('Dependency Container', () => {
  it('should provide all required dependencies', () => {
    const container = DependencyContainer.getInstance();
    const dependencies = container.getDependencies();

    expect(dependencies.apiClient).toBeDefined();
    expect(dependencies.localStorage).toBeDefined();
    expect(dependencies.sessionStorage).toBeDefined();
    expect(dependencies.notificationService).toBeDefined();
    expect(dependencies.userManagementService).toBeDefined();
    expect(dependencies.productManagementService).toBeDefined();
  });

  it('should allow dependency reconfiguration', () => {
    const container = DependencyContainer.getInstance();
    const mockApiClient = new MockApiClient();

    container.reconfigure({ apiClient: mockApiClient });
    
    const dependencies = container.getDependencies();
    expect(dependencies.apiClient).toBe(mockApiClient);

    // Reset to default
    container.reset();
  });
});