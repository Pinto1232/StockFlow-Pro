import React from 'react';
import { X, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { ProductEntity } from '../../architecture/domain/entities/Product';

interface DeleteProductModalProps {
  product: ProductEntity;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const DeleteProductModal: React.FC<DeleteProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false
}) => {
  if (!isOpen) return null;

  const hasStock = product.quantity > 0;
  const isActive = product.isActive;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 flex justify-between items-center rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Trash2 className="h-6 w-6" />
            <h2 className="text-xl font-bold">Delete Product</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          {/* Product Info */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Are you sure you want to delete this product?
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg text-left">
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Product Name:</span>
                  <span className="ml-2 font-medium text-gray-900">{product.name}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">SKU:</span>
                  <span className="ml-2 font-medium text-gray-900">{product.sku}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Current Stock:</span>
                  <span className={`ml-2 font-medium ${hasStock ? 'text-yellow-600' : 'text-gray-900'}`}>
                    {product.quantity}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`ml-2 font-medium ${isActive ? 'text-green-600' : 'text-gray-600'}`}>
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {(hasStock || isActive) && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <div className="font-medium mb-1">Warning:</div>
                  <ul className="space-y-1">
                    {hasStock && (
                      <li>• This product has {product.quantity} units in stock</li>
                    )}
                    {isActive && (
                      <li>• This product is currently active</li>
                    )}
                    <li>• This action cannot be undone</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <p className="text-gray-600 text-center mb-6">
            This action will permanently remove the product from your inventory system.
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {isLoading ? 'Deleting...' : 'Delete Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteProductModal;