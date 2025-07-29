import React, { useState, useEffect } from 'react';
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
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const hasStock = product.quantity > 0;
  const isActive = product.isActive;

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-300 ${
        isAnimating ? 'bg-black bg-opacity-60' : 'bg-black bg-opacity-0'
      }`}
      style={{ backdropFilter: isAnimating ? 'blur(4px)' : 'blur(0px)' }}
    >
      <div 
        className={`bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col transform transition-all duration-300 ${
          isAnimating 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4'
        }`}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* Animated Header */}
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-red-200 border-b rounded-t-3xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="p-3 rounded-2xl border-2 text-red-600 bg-red-50 border-red-200 transform transition-all duration-500 hover:scale-110"
                style={{
                  animation: isAnimating ? 'pulse 2s infinite' : 'none'
                }}
              >
                <Trash2 className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Delete Product</h2>
                <div className="h-1 bg-gradient-to-r from-red-400 to-red-600 rounded-full w-16 opacity-60"></div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
              disabled={isLoading}
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Enhanced Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0 scrollbar-hide">
          <div className="bg-gray-50 rounded-2xl p-4 border-l-4 border-red-400 mb-4">
            <p className="text-gray-800 leading-relaxed font-medium">
              Are you sure you want to delete this product? This action will permanently remove it from your inventory system.
            </p>
          </div>

          {/* Product Info */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Product Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Product Name:</span>
                <span className="font-medium text-gray-900">{product.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">SKU:</span>
                <span className="font-medium text-gray-900">{product.sku}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Stock:</span>
                <span className={`font-medium ${hasStock ? 'text-yellow-600' : 'text-gray-900'}`}>
                  {product.quantity}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`font-medium ${isActive ? 'text-green-600' : 'text-gray-600'}`}>
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {(hasStock || isActive) && (
            <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-2xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <div className="font-medium mb-2">Warning:</div>
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

          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span className="font-medium">This action cannot be undone!</span>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 rounded-b-3xl border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-white hover:border-gray-400 transition-all duration-200 font-medium transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-3 rounded-xl transition-all duration-200 font-medium bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            <span className="flex items-center gap-2">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {isLoading ? 'Deleting...' : 'Delete Product'}
            </span>
          </button>
        </div>
      </div>

      {/* Custom CSS for animations and scrollbar hiding */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;  /* Internet Explorer 10+ */
          scrollbar-width: none;  /* Firefox */
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;  /* Safari and Chrome */
        }
      `}</style>
    </div>
  );
};

export default DeleteProductModal;