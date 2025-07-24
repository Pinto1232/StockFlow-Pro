import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Save, Loader2, FileText, User, Calendar, MessageSquare, Package, Calculator } from "lucide-react";
import { useProducts } from "../../hooks/useProducts";
import { useCreateInvoice, useUpdateInvoice } from "../../hooks/useInvoices";
import { formatCurrency } from "../../utils/currency";
import type { InvoiceDto } from "../../types/index";
import type { CreateInvoiceDto, UpdateInvoiceDto } from "../../services/invoiceService";

interface InvoiceFormProps {
    invoice?: InvoiceDto;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface InvoiceItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
    invoice,
    isOpen,
    onClose,
    onSuccess,
}) => {
    // Add CSS for hiding scrollbar
    React.useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .invoice-form-scroll::-webkit-scrollbar {
                display: none;
            }
            .invoice-form-scroll {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);
    const [formData, setFormData] = useState({
        customerId: "",
        customerName: "",
        dueDate: "",
        notes: "",
    });
    const [items, setItems] = useState<InvoiceItem[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch products for dropdown
    const { data: productsResponse } = useProducts(
        { pageNumber: 1, pageSize: 1000 },
        { isActive: true }
    );
    const products = productsResponse?.data || [];

    // Mutations
    const createInvoiceMutation = useCreateInvoice();
    const updateInvoiceMutation = useUpdateInvoice();

    // Initialize form data when invoice prop changes
    useEffect(() => {
        if (invoice) {
            setFormData({
                customerId: invoice.customerId,
                customerName: invoice.customerName,
                dueDate: invoice.dueDate.split('T')[0], // Format for date input
                notes: invoice.notes || "",
            });
            setItems(
                invoice.items.map((item) => ({
                    productId: item.productId,
                    productName: item.productName,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.totalPrice,
                }))
            );
        } else {
            // Reset form for new invoice
            setFormData({
                customerId: "",
                customerName: "",
                dueDate: "",
                notes: "",
            });
            setItems([]);
        }
        setErrors({});
    }, [invoice, isOpen]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const addItem = () => {
        setItems((prev) => [
            ...prev,
            {
                productId: "",
                productName: "",
                quantity: 1,
                unitPrice: 0,
                totalPrice: 0,
            },
        ]);
    };

    const removeItem = (index: number) => {
        setItems((prev) => prev.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
        setItems((prev) => {
            const newItems = [...prev];
            newItems[index] = { ...newItems[index], [field]: value };

            // If product is selected, update product name and unit price
            if (field === "productId") {
                const selectedProduct = products.find((p) => p.id === value);
                if (selectedProduct) {
                    newItems[index].productName = selectedProduct.name;
                    newItems[index].unitPrice = selectedProduct.costPerItem;
                }
            }

            // Recalculate total price
            if (field === "quantity" || field === "unitPrice" || field === "productId") {
                newItems[index].totalPrice =
                    newItems[index].quantity * newItems[index].unitPrice;
            }

            return newItems;
        });
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.customerName.trim()) {
            newErrors.customerName = "Customer name is required";
        }
        if (!formData.dueDate) {
            newErrors.dueDate = "Due date is required";
        }
        if (items.length === 0) {
            newErrors.items = "At least one item is required";
        }

        items.forEach((item, index) => {
            if (!item.productId) {
                newErrors[`item_${index}_product`] = "Product is required";
            }
            if (item.quantity <= 0) {
                newErrors[`item_${index}_quantity`] = "Quantity must be greater than 0";
            }
            if (item.unitPrice <= 0) {
                newErrors[`item_${index}_price`] = "Unit price must be greater than 0";
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const invoiceData = {
            customerId: formData.customerId || crypto.randomUUID(), // Generate if not provided
            customerName: formData.customerName,
            dueDate: formData.dueDate,
            notes: formData.notes,
            items: items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
            })),
        };

        try {
            let result;
            if (invoice) {
                result = await updateInvoiceMutation.mutateAsync({
                    id: invoice.id,
                    data: invoiceData as UpdateInvoiceDto,
                });
                console.log("Invoice updated successfully:", result);
            } else {
                result = await createInvoiceMutation.mutateAsync(invoiceData as CreateInvoiceDto);
                console.log("Invoice created successfully:", result);
            }
            
            // Call onSuccess to refresh the invoice list
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to save invoice:", error);
            // You might want to show an error message to the user here
            alert(`Failed to ${invoice ? 'update' : 'create'} invoice. Please try again.`);
        }
    };

    const calculateSubtotal = () => {
        return items.reduce((sum, item) => sum + item.totalPrice, 0);
    };

    const calculateTax = () => {
        return calculateSubtotal() * 0.1; // 10% tax
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTax();
    };

    if (!isOpen) return null;

    const isLoading = createInvoiceMutation.isPending || updateInvoiceMutation.isPending;

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full h-[95vh] flex flex-col overflow-hidden border border-gray-100">
                {/* Enhanced Header */}
                <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white p-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-700/90"></div>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                                <FileText className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold">
                                    {invoice ? "Edit Invoice" : "Create New Invoice"}
                                </h2>
                                <p className="text-blue-100 mt-1">
                                    {invoice ? "Update invoice details and items" : "Fill in the details to create a new invoice"}
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
                    <div className="flex-1 overflow-y-auto invoice-form-scroll">
                        <div className="p-8 space-y-8">
                        {/* Customer Information Section */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-500 rounded-lg">
                                    <User className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">Customer Information</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                        <User className="h-4 w-4 text-blue-500" />
                                        Customer Name *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="customerName"
                                            value={formData.customerName}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm ${
                                                errors.customerName ? "border-red-400 bg-red-50/50" : "border-gray-200 hover:border-blue-300"
                                            }`}
                                            placeholder="Enter customer name"
                                            disabled={isLoading}
                                        />
                                        {errors.customerName && (
                                            <div className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-500 text-sm">
                                                <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                                                {errors.customerName}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                        <Calendar className="h-4 w-4 text-blue-500" />
                                        Due Date *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            name="dueDate"
                                            value={formData.dueDate}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm ${
                                                errors.dueDate ? "border-red-400 bg-red-50/50" : "border-gray-200 hover:border-blue-300"
                                            }`}
                                            disabled={isLoading}
                                        />
                                        {errors.dueDate && (
                                            <div className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-500 text-sm">
                                                <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                                                {errors.dueDate}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes Section */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-amber-500 rounded-lg">
                                    <MessageSquare className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">Additional Notes</h3>
                            </div>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 bg-white/80 backdrop-blur-sm hover:border-amber-300 resize-none"
                                placeholder="Add any additional notes or special instructions..."
                                disabled={isLoading}
                            />
                        </div>

                        {/* Invoice Items Section */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-500 rounded-lg">
                                        <Package className="h-5 w-5 text-white" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900">Invoice Items</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    disabled={isLoading}
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Item
                                </button>
                            </div>

                            {errors.items && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    {errors.items}
                                </div>
                            )}

                            <div className="space-y-4">
                                {items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl p-6 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Product *
                                                </label>
                                                <select
                                                    value={item.productId}
                                                    onChange={(e) =>
                                                        updateItem(index, "productId", e.target.value)
                                                    }
                                                    className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 ${
                                                        errors[`item_${index}_product`]
                                                            ? "border-red-400 bg-red-50/50"
                                                            : "border-gray-200 hover:border-green-300"
                                                    }`}
                                                    disabled={isLoading}
                                                >
                                                    <option value="">Select product</option>
                                                    {products.map((product) => (
                                                        <option key={product.id} value={product.id}>
                                                            {product.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors[`item_${index}_product`] && (
                                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                                        <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                                                        {errors[`item_${index}_product`]}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Quantity *
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) =>
                                                        updateItem(index, "quantity", Number(e.target.value))
                                                    }
                                                    className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 ${
                                                        errors[`item_${index}_quantity`]
                                                            ? "border-red-400 bg-red-50/50"
                                                            : "border-gray-200 hover:border-green-300"
                                                    }`}
                                                    disabled={isLoading}
                                                />
                                                {errors[`item_${index}_quantity`] && (
                                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                                        <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                                                        {errors[`item_${index}_quantity`]}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Unit Price *
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.unitPrice}
                                                    onChange={(e) =>
                                                        updateItem(index, "unitPrice", Number(e.target.value))
                                                    }
                                                    className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 ${
                                                        errors[`item_${index}_price`]
                                                            ? "border-red-400 bg-red-50/50"
                                                            : "border-gray-200 hover:border-green-300"
                                                    }`}
                                                    disabled={isLoading}
                                                />
                                                {errors[`item_${index}_price`] && (
                                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                                        <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                                                        {errors[`item_${index}_price`]}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Total
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={formatCurrency(item.totalPrice)}
                                                        readOnly
                                                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-semibold"
                                                    />
                                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                        <Calculator className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-end justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110 border-2 border-transparent hover:border-red-200"
                                                    disabled={isLoading}
                                                    title="Remove item"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Enhanced Invoice Summary */}
                        {items.length > 0 && (
                            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-purple-500 rounded-lg">
                                        <Calculator className="h-5 w-5 text-white" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900">Invoice Summary</h3>
                                </div>
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-gray-600 font-medium">Subtotal:</span>
                                        <span className="text-lg font-semibold text-gray-900">{formatCurrency(calculateSubtotal())}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-gray-600 font-medium">Tax (10%):</span>
                                        <span className="text-lg font-semibold text-gray-900">{formatCurrency(calculateTax())}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-t-2 border-purple-200">
                                        <span className="text-xl font-bold text-gray-900">Total:</span>
                                        <span className="text-2xl font-bold text-purple-600">{formatCurrency(calculateTotal())}</span>
                                    </div>
                                </div>
                            </div>
                        )}
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
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5" />
                                        {invoice ? "Update Invoice" : "Create Invoice"}
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

export default InvoiceForm;