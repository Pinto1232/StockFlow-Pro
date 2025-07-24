// Domain Service: Stock Management
// Contains business logic that doesn't naturally fit in a single entity

import { ProductEntity } from '../entities/Product';

export interface StockAlert {
  productId: number;
  productName: string;
  currentStock: number;
  threshold: number;
  alertType: 'low' | 'out' | 'over';
  severity: 'warning' | 'critical';
}

export class StockService {
  static generateStockAlerts(products: ProductEntity[]): StockAlert[] {
    const alerts: StockAlert[] = [];

    for (const product of products) {
      if (product.isOutOfStock) {
        alerts.push({
          productId: product.id,
          productName: product.name,
          currentStock: product.quantity,
          threshold: 0,
          alertType: 'out',
          severity: 'critical'
        });
      } else if (product.isLowStock) {
        alerts.push({
          productId: product.id,
          productName: product.name,
          currentStock: product.quantity,
          threshold: product.minStockLevel,
          alertType: 'low',
          severity: 'warning'
        });
      } else if (product.isOverStock) {
        alerts.push({
          productId: product.id,
          productName: product.name,
          currentStock: product.quantity,
          threshold: product.maxStockLevel,
          alertType: 'over',
          severity: 'warning'
        });
      }
    }

    return alerts.sort((a, b) => {
      // Sort by severity first (critical before warning)
      if (a.severity !== b.severity) {
        return a.severity === 'critical' ? -1 : 1;
      }
      // Then by alert type (out, low, over)
      const typeOrder = { 'out': 0, 'low': 1, 'over': 2 };
      return typeOrder[a.alertType] - typeOrder[b.alertType];
    });
  }

  static calculateReorderQuantity(product: ProductEntity): number {
    if (!product.isLowStock) {
      return 0;
    }

    // Simple reorder calculation: bring stock to max level
    return product.maxStockLevel - product.quantity;
  }

  static calculateStockTurnover(
    product: ProductEntity,
    soldQuantityInPeriod: number,
    periodInDays: number
  ): number {
    if (product.quantity === 0 || periodInDays === 0) {
      return 0;
    }

    const averageInventory = product.quantity;
    const annualizedSales = (soldQuantityInPeriod / periodInDays) * 365;
    
    return annualizedSales / averageInventory;
  }

  static estimateDaysOfStock(
    product: ProductEntity,
    averageDailySales: number
  ): number {
    if (averageDailySales <= 0) {
      return Infinity;
    }

    return product.quantity / averageDailySales;
  }

  static validateStockAdjustment(
    product: ProductEntity,
    adjustment: number
  ): { isValid: boolean; reason?: string } {
    const newQuantity = product.quantity + adjustment;

    if (newQuantity < 0) {
      return {
        isValid: false,
        reason: 'Stock adjustment would result in negative inventory'
      };
    }

    if (adjustment < 0 && Math.abs(adjustment) > product.quantity) {
      return {
        isValid: false,
        reason: 'Cannot remove more stock than available'
      };
    }

    return { isValid: true };
  }
}