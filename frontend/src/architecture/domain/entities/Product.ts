// Domain Entity: Product
// This represents the core business concept of a Product in our domain

import { ProductApiResponse } from '../../types/ApiTypes';

export interface ProductCategory {
  id: number;
  name: string;
  description?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  sku: string;
  price: number;
  cost: number;
  quantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  category: ProductCategory;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ProductEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly sku: string,
    public readonly price: number,
    public readonly cost: number,
    public readonly quantity: number,
    public readonly minStockLevel: number,
    public readonly maxStockLevel: number,
    public readonly category: ProductCategory | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly description?: string,
    public readonly totalValue?: number,
    public readonly _isInStock?: boolean,
    public readonly _isLowStock?: boolean,
    public readonly imageUrl?: string
  ) {}

  get isLowStock(): boolean {
    // Use API value if available, otherwise calculate
    return this._isLowStock ?? (this.quantity <= this.minStockLevel);
  }

  get isOutOfStock(): boolean {
    // Use API value if available, otherwise calculate
    return this._isInStock === false || this.quantity <= 0;
  }

  get isInStock(): boolean {
    // Use API value if available, otherwise calculate
    return this._isInStock ?? (this.quantity > 0);
  }

  get isOverStock(): boolean {
    return this.quantity >= this.maxStockLevel;
  }

  get stockStatus(): 'low' | 'out' | 'over' | 'normal' {
    if (this.isOutOfStock) return 'out';
    if (this.isLowStock) return 'low';
    if (this.isOverStock) return 'over';
    return 'normal';
  }

  get profitMargin(): number {
    if (this.cost === 0) return 0;
    return ((this.price - this.cost) / this.cost) * 100;
  }

  get calculatedTotalValue(): number {
    return this.quantity * this.cost;
  }

  canFulfillOrder(requestedQuantity: number): boolean {
    return this.quantity >= requestedQuantity && this.isActive;
  }

  static fromApiResponse(data: ProductApiResponse): ProductEntity {
    return new ProductEntity(
      data.id,
      data.name,
      data.sku || '',
      data.price || data.costPerItem, // Use costPerItem as price if price not available
      data.costPerItem,
      data.numberInStock,
      data.minStockLevel || 0,
      data.maxStockLevel || 100,
      data.category || null,
      data.isActive,
      new Date(data.createdAt),
      new Date(data.updatedAt || data.createdAt),
      data.description,
      data.totalValue,
      data.isInStock,
      data.isLowStock,
      data.imageUrl
    );
  }
}