import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Package, DollarSign, Hash, FileText, Tag, ToggleLeft, ToggleRight } from 'lucide-react';
import { ProductEntity, ProductCategory } from '../../architecture/domain/entities/Product';
import { CreateProductRequest, UpdateProductRequest } from '../../architecture/ports/primary/ProductManagementPort';

interface ProductFormProps {
  product?: ProductEntity;
  categories: ProductCategory[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductRequest | UpdateProductRequest) => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

interface FormData {
  name: string;
  description: string;
  sku: string;
  price: number;
  cost: number;
  quantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  categoryId: number;
  isActive: boolean;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  categories,
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  mode
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    sku: '',
    price: 0,
    cost: 0,
    quantity: 0,
    minStockLevel: 0,
    maxStockLevel: 100,
    categoryId: 1,
    isActive: true
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Initialize form data when product changes
  useEffect(() => {
    if (product && mode === 'edit') {
      setFormData({
        name: product.name,
        description: product.description || '',
        sku: product.sku,
        price: product.price,
        cost: product.cost,
        quantity: product.quantity,
        minStockLevel: product.minStockLevel,
        maxStockLevel: product.maxStockLevel,
        categoryId: product.category?.id || (categories.length > 0 ? categories[0].id : 1),
        isActive: product.isActive
      });
    } else if (mode === 'create' && categories.length > 0) {
      setFormData(prev => ({
        ...prev,
        categoryId: categories[0].id
      }));
    }
  }, [product?.id, mode, categories.length, categories, product]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    }

    if (formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }

    if (formData.cost < 0) {
      newErrors.cost = 'Cost cannot be negative';
    }

    if (formData.quantity < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    }

    if (formData.minStockLevel < 0) {
      newErrors.minStockLevel = 'Minimum stock level cannot be negative';
    }

    if (formData.maxStockLevel < 0) {
      newErrors.maxStockLevel = 'Maximum stock level cannot be negative';
    }

    if (formData.minStockLevel >= formData.maxStockLevel) {
      newErrors.minStockLevel = 'Minimum stock must be less than maximum stock';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (mode === 'create') {
      const createRequest: CreateProductRequest = {
        name: formData.name,
        description: formData.description || undefined,
        sku: formData.sku,
        price: formData.price,
        cost: formData.cost,
        quantity: formData.quantity,
        minStockLevel: formData.minStockLevel,
        maxStockLevel: formData.maxStockLevel,
        categoryId: formData.categoryId
      };
      onSubmit(createRequest);
    } else {
      const updateRequest: UpdateProductRequest = {
        id: product!.id,
        name: formData.name,
        description: formData.description || undefined,
        sku: formData.sku,
        price: formData.price,
        cost: formData.cost,
        quantity: formData.quantity,
        minStockLevel: formData.minStockLevel,
        maxStockLevel: formData.maxStockLevel,
        categoryId: formData.categoryId,
        isActive: formData.isActive
      };
      onSubmit(updateRequest);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6" />
            <h2 className="text-xl font-bold">
              {mode === 'create' ? 'Add New Product' : 'Edit Product'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Basic Information
              </h3>

              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter product name"
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter product description"
                  disabled={isLoading}
                />
              </div>

              {/* SKU */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU *
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.sku ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter SKU"
                    disabled={isLoading}
                  />
                </div>
                {errors.sku && (
                  <p className="text-red-500 text-sm mt-1">{errors.sku}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    value={formData.categoryId}
                    onChange={(e) => handleInputChange('categoryId', parseInt(e.target.value))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none"
                    disabled={isLoading || categories.length === 0}
                  >
                    {categories.length === 0 ? (
                      <option value="">No categories available</option>
                    ) : (
                      categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Status (only for edit mode) */}
              {mode === 'edit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <button
                    type="button"
                    onClick={() => handleInputChange('isActive', !formData.isActive)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      formData.isActive
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    disabled={isLoading}
                  >
                    {formData.isActive ? (
                      <ToggleRight className="h-5 w-5" />
                    ) : (
                      <ToggleLeft className="h-5 w-5" />
                    )}
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
              )}
            </div>

            {/* Pricing and Inventory */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                Pricing & Inventory
              </h3>

              {/* Price and Cost */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (ZAR) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.price ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost (ZAR) *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.cost}
                      onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.cost ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.cost && (
                    <p className="text-red-500 text-sm mt-1">{errors.cost}</p>
                  )}
                </div>
              </div>

              {/* Profit Margin Display */}
              {formData.price > 0 && formData.cost > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">
                    Profit Margin: 
                    <span className={`ml-2 font-semibold ${
                      ((formData.price - formData.cost) / formData.cost) * 100 > 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {(((formData.price - formData.cost) / formData.cost) * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.quantity ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                  disabled={isLoading}
                />
                {errors.quantity && (
                  <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
                )}
              </div>

              {/* Stock Levels */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Stock Level *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minStockLevel}
                    onChange={(e) => handleInputChange('minStockLevel', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.minStockLevel ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                    disabled={isLoading}
                  />
                  {errors.minStockLevel && (
                    <p className="text-red-500 text-sm mt-1">{errors.minStockLevel}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Stock Level *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxStockLevel}
                    onChange={(e) => handleInputChange('maxStockLevel', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.maxStockLevel ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="100"
                    disabled={isLoading}
                  />
                  {errors.maxStockLevel && (
                    <p className="text-red-500 text-sm mt-1">{errors.maxStockLevel}</p>
                  )}
                </div>
              </div>

              {/* Total Value Display */}
              {formData.quantity > 0 && formData.cost > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">
                    Total Inventory Value: 
                    <span className="ml-2 font-semibold text-blue-600">
                      R {(formData.quantity * formData.cost).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
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
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || categories.length === 0}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isLoading ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;