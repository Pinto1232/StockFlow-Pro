// Secondary Adapter: Local Storage
// Implements StoragePort using browser localStorage

import { StoragePort } from '../../ports/secondary/StoragePort';

export class LocalStorageAdapter implements StoragePort {
  private storage: Storage;

  constructor() {
    this.storage = window.localStorage;
  }

  setItem(key: string, value: string): void {
    try {
      this.storage.setItem(key, value);
    } catch (error) {
      console.error('Failed to set item in localStorage:', error);
      throw new Error(`Failed to store item with key: ${key}`);
    }
  }

  getItem(key: string): string | null {
    try {
      return this.storage.getItem(key);
    } catch (error) {
      console.error('Failed to get item from localStorage:', error);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove item from localStorage:', error);
    }
  }

  clear(): void {
    try {
      this.storage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }

  setObject<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      this.setItem(key, serialized);
    } catch (error) {
      console.error('Failed to serialize and store object:', error);
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
    } catch (error) {
      console.error('Failed to parse object from localStorage:', error);
      return null;
    }
  }

  hasItem(key: string): boolean {
    return this.getItem(key) !== null;
  }

  getAllKeys(): string[] {
    try {
      const keys: string[] = [];
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key !== null) {
          keys.push(key);
        }
      }
      return keys;
    } catch (error) {
      console.error('Failed to get all keys from localStorage:', error);
      return [];
    }
  }

  getStorageSize(): number {
    try {
      let totalSize = 0;
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key !== null) {
          const value = this.storage.getItem(key);
          if (value !== null) {
            totalSize += key.length + value.length;
          }
        }
      }
      return totalSize;
    } catch (error) {
      console.error('Failed to calculate storage size:', error);
      return 0;
    }
  }

  getRemainingSpace(): number {
    // This is an approximation as there's no direct way to get localStorage quota
    const maxSize = 5 * 1024 * 1024; // Assume 5MB limit (common for localStorage)
    const currentSize = this.getStorageSize();
    return Math.max(0, maxSize - currentSize);
  }
}

// Session Storage Adapter (alternative implementation)
export class SessionStorageAdapter implements StoragePort {
  private storage: Storage;

  constructor() {
    this.storage = window.sessionStorage;
  }

  setItem(key: string, value: string): void {
    try {
      this.storage.setItem(key, value);
    } catch (error) {
      console.error('Failed to set item in sessionStorage:', error);
      throw new Error(`Failed to store item with key: ${key}`);
    }
  }

  getItem(key: string): string | null {
    try {
      return this.storage.getItem(key);
    } catch (error) {
      console.error('Failed to get item from sessionStorage:', error);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove item from sessionStorage:', error);
    }
  }

  clear(): void {
    try {
      this.storage.clear();
    } catch (error) {
      console.error('Failed to clear sessionStorage:', error);
    }
  }

  setObject<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      this.setItem(key, serialized);
    } catch (error) {
      console.error('Failed to serialize and store object:', error);
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
    } catch (error) {
      console.error('Failed to parse object from sessionStorage:', error);
      return null;
    }
  }

  hasItem(key: string): boolean {
    return this.getItem(key) !== null;
  }

  getAllKeys(): string[] {
    try {
      const keys: string[] = [];
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key !== null) {
          keys.push(key);
        }
      }
      return keys;
    } catch (error) {
      console.error('Failed to get all keys from sessionStorage:', error);
      return [];
    }
  }

  getStorageSize(): number {
    try {
      let totalSize = 0;
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key !== null) {
          const value = this.storage.getItem(key);
          if (value !== null) {
            totalSize += key.length + value.length;
          }
        }
      }
      return totalSize;
    } catch (error) {
      console.error('Failed to calculate storage size:', error);
      return 0;
    }
  }

  getRemainingSpace(): number {
    // This is an approximation as there's no direct way to get sessionStorage quota
    const maxSize = 5 * 1024 * 1024; // Assume 5MB limit (common for sessionStorage)
    const currentSize = this.getStorageSize();
    return Math.max(0, maxSize - currentSize);
  }
}