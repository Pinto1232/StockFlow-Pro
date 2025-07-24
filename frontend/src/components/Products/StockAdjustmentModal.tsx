import React, { useState } from 'react';
import { X, Package, Plus, Minus, Save, Loader2, AlertTriangle } from 'lucide-react';
import { ProductEntity } from '../../architecture/domain/entities/Product';
import { StockAdjustmentRequest } from '../../architecture/ports/primary/ProductManagementPort';

interface StockAdjustmentModalProps {
  product: ProductEntity;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: StockAdjustmentRequest) => void;
  isLoading?: boolean;
}

const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  product,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [adjustment, setAdjustment] = useState<number>(0);
  const [reason, setReason] = useState<string>('');
  const [adjustmentType, setAdjustmentType] = useState<'increase' | 'decrease'>('increase');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      return;
    }

    const finalAdjustment = adjustmentType === 'decrease' ? -Math.abs(adjustment) : Math.abs(adjustment);
    
    onSubmit({
      productId: product.id,
      adjustment: finalAdjustment,
      reason: reason.trim()
    });
  };

  const handleAdjustmentChange = (value: number) => {
    setAdjustment(Math.abs(value));
  };

  const newQuantity = product.quantity + (adjustmentType === 'decrease' ? -Math.abs(adjustment) : Math.abs(adjustment));
  const isValidAdjustment = newQuantity >= 0 && reason.trim().length > 0;

  const getStockStatusColor = (quantity: number) => {
    if (quantity <= 0) return 'text-red-600';
    if (quantity <= product.minStockLevel) return 'text-yellow-600';
    if (quantity >= product.maxStockLevel) return 'text-blue-600';
    return 'text-green-600';
  };

  const getStockStatusText = (quantity: number) => {
    if (quantity <= 0) return 'Out of Stock';
    if (quantity <= product.minStockLevel) return 'Low Stock';
    if (quantity >= product.maxStockLevel) return 'Overstock';
    return 'Normal Stock';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 flex justify-between items-center rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-bold">Adjust Stock</h2>
              <p className="text-yellow-100 text-sm">{product.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Stock Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Current Stock</div>
              <div className="text-2xl font-bold text-gray-900">{product.quantity}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Min Level</div>
              <div className="text-lg font-semibold text-yellow-600">{product.minStockLevel}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Max Level</div>
              <div className="text-lg font-semibold text-blue-600">{product.maxStockLevel}</div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Adjustment Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Adjustment Type
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAdjustmentType('increase')}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  adjustmentType === 'increase'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4" />
                Increase Stock
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType('decrease')}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  adjustmentType === 'decrease'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
                disabled={isLoading}
              >
                <Minus className="h-4 w-4" />
                Decrease Stock
              </button>
            </div>
          </div>

          {/* Adjustment Amount */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adjustment Amount
            </label>
            <input
              type="number"
              min="1"
              value={adjustment}
              onChange={(e) => handleAdjustmentChange(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
              placeholder="Enter quantity to adjust"
              disabled={isLoading}
              required
            />
          </div>

          {/* Reason */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Adjustment *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
              placeholder="Enter reason for stock adjustment (e.g., damaged goods, inventory count correction, etc.)"
              disabled={isLoading}
              required
            />
          </div>

          {/* Preview */}
          {adjustment > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Adjustment Preview</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Current Quantity</div>
                  <div className="font-semibold">{product.quantity}</div>
                </div>
                <div>
                  <div className="text-gray-600">Adjustment</div>
                  <div className={`font-semibold ${
                    adjustmentType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {adjustmentType === 'increase' ? '+' : '-'}{adjustment}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">New Quantity</div>
                  <div className={`font-semibold ${getStockStatusColor(newQuantity)}`}>
                    {newQuantity}
                  </div>
                </div>
              </div>
              
              {/* Stock Status Warning */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    newQuantity <= 0 ? 'bg-red-500' :
                    newQuantity <= product.minStockLevel ? 'bg-yellow-500' :
                    newQuantity >= product.maxStockLevel ? 'bg-blue-500' :
                    'bg-green-500'
                  }`}></div>
                  <span className={`text-sm font-medium ${getStockStatusColor(newQuantity)}`}>
                    {getStockStatusText(newQuantity)}
                  </span>
                </div>
                
                {newQuantity < 0 && (
                  <div className="flex items-center gap-2 mt-2 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">Warning: This adjustment would result in negative stock!</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !isValidAdjustment}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isLoading ? 'Adjusting...' : 'Apply Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustmentModal;