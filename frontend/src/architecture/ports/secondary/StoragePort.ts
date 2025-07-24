// Secondary Port: Storage
// Defines the interface for local storage operations

export interface StoragePort {
  // Basic operations
  setItem(key: string, value: string): void;
  getItem(key: string): string | null;
  removeItem(key: string): void;
  clear(): void;
  
  // Object operations (with JSON serialization)
  setObject<T>(key: string, value: T): void;
  getObject<T>(key: string): T | null;
  
  // Existence check
  hasItem(key: string): boolean;
  
  // Get all keys
  getAllKeys(): string[];
  
  // Storage info
  getStorageSize(): number;
  getRemainingSpace(): number;
}