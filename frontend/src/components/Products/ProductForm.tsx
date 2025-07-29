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
  // Add CSS for hiding scrollbar
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .product-form-scroll::-webkit-scrollbar {
        display: none;
      }
      .product-form-scroll {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
    setErrors({});
  }, [product?.id, mode, categories.length, categories, product, isOpen]);

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
    <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full h-[95vh] flex flex-col overflow-hidden border border-gray-100">
        {/* Enhanced Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-700/90"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">
                  {mode === 'create' ? 'Add New Product' : 'Edit Product'}
                </h2>
                <p className="text-blue-100 mt-1">
                  {mode === 'create' ? 'Fill in the details to create a new product' : 'Update product details and information'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
              disabled={isLoading}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>

        {/* Enhanced Form */}
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto product-form-scroll">
            <div className="p-8 space-y-8">
              {/* Basic Information Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <Package className="h-4 w-4 text-blue-500" />
                      Product Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm ${
                          errors.name ? "border-red-400 bg-red-50/50" : "border-gray-200 hover:border-blue-300"
                        }`}
                        placeholder="Enter product name"
                        disabled={isLoading}
                      />
                      {errors.name && (
                        <div className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-500 text-sm">
                          <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                          {errors.name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <Hash className="h-4 w-4 text-blue-500" />
                      SKU *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => handleInputChange('sku', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm ${
                          errors.sku ? "border-red-400 bg-red-50/50" : "border-gray-200 hover:border-blue-300"
                        }`}
                        placeholder="Enter SKU"
                        disabled={isLoading}
                      />
                      {errors.sku && (
                        <div className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-500 text-sm">
                          <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                          {errors.sku}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <FileText className="h-4 w-4 text-blue-500" />
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm hover:border-blue-300 resize-none"
                    placeholder="Enter product description..."
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Category and Status Section */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Tag className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Category & Status</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <Tag className="h-4 w-4 text-purple-500" />
                      Category *
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => handleInputChange('categoryId', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-white/80 backdrop-blur-sm hover:border-purple-300"
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
                  {mode === 'edit' && (
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                        <Package className="h-4 w-4 text-purple-500" />
                        Status
                      </label>
                      <button
                        type="button"
                        onClick={() => handleInputChange('isActive', !formData.isActive)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium w-full justify-center ${
                          formData.isActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200 border-2 border-green-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300'
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
              </div>

              {/* Pricing Section */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Pricing Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      Price (ZAR) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 bg-white/80 backdrop-blur-sm ${
                          errors.price ? "border-red-400 bg-red-50/50" : "border-gray-200 hover:border-green-300"
                        }`}
                        placeholder="0.00"
                        disabled={isLoading}
                      />
                      {errors.price && (
                        <div className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-500 text-sm">
                          <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                          {errors.price}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      Cost (ZAR) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.cost}
                        onChange={(e) => handleInputChange('cost', parseFloat(e.target.value) || 0)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 bg-white/80 backdrop-blur-sm ${
                          errors.cost ? "border-red-400 bg-red-50/50" : "border-gray-200 hover:border-green-300"
                        }`}
                        placeholder="0.00"
                        disabled={isLoading}
                      />
                      {errors.cost && (
                        <div className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-500 text-sm">
                          <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                          {errors.cost}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Profit Margin Display */}
                {formData.price > 0 && formData.cost > 0 && (
                  <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-green-200">
                    <div className="text-sm text-gray-600">
                      Profit Margin: 
                      <span className={`ml-2 font-semibold text-lg ${
                        ((formData.price - formData.cost) / formData.cost) * 100 > 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {(((formData.price - formData.cost) / formData.cost) * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Inventory Section */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-amber-500 rounded-lg">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Inventory Management</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <Package className="h-4 w-4 text-amber-500" />
                      Initial Quantity *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={formData.quantity}
                        onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 bg-white/80 backdrop-blur-sm ${
                          errors.quantity ? "border-red-400 bg-red-50/50" : "border-gray-200 hover:border-amber-300"
                        }`}
                        placeholder="0"
                        disabled={isLoading}
                      />
                      {errors.quantity && (
                        <div className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-500 text-sm">
                          <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                          {errors.quantity}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <Package className="h-4 w-4 text-amber-500" />
                      Min Stock Level *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={formData.minStockLevel}
                        onChange={(e) => handleInputChange('minStockLevel', parseInt(e.target.value) || 0)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 bg-white/80 backdrop-blur-sm ${
                          errors.minStockLevel ? "border-red-400 bg-red-50/50" : "border-gray-200 hover:border-amber-300"
                        }`}
                        placeholder="0"
                        disabled={isLoading}
                      />
                      {errors.minStockLevel && (
                        <div className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-500 text-sm">
                          <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                          {errors.minStockLevel}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <Package className="h-4 w-4 text-amber-500" />
                      Max Stock Level *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={formData.maxStockLevel}
                        onChange={(e) => handleInputChange('maxStockLevel', parseInt(e.target.value) || 0)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 bg-white/80 backdrop-blur-sm ${
                          errors.maxStockLevel ? "border-red-400 bg-red-50/50" : "border-gray-200 hover:border-amber-300"
                        }`}
                        placeholder="100"
                        disabled={isLoading}
                      />
                      {errors.maxStockLevel && (
                        <div className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-500 text-sm">
                          <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                          {errors.maxStockLevel}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Total Value Display */}
                {formData.quantity > 0 && formData.cost > 0 && (
                  <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-amber-200">
                    <div className="text-sm text-gray-600">
                      Total Inventory Value: 
                      <span className="ml-2 font-semibold text-lg text-amber-600">
                        R {(formData.quantity * formData.cost).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Footer */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 px-8 py-6">
            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                disabled={isLoading || categories.length === 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    {mode === 'create' ? 'Create Product' : 'Update Product'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;