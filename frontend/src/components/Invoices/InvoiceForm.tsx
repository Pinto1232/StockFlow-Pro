import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { useProducts } from "../../hooks/useProducts";
import { useCreateInvoice, useUpdateInvoice } from "../../hooks/useInvoices";
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
            if (invoice) {
                await updateInvoiceMutation.mutateAsync({
                    id: invoice.id,
                    data: invoiceData as UpdateInvoiceDto,
                });
            } else {
                await createInvoiceMutation.mutateAsync(invoiceData as CreateInvoiceDto);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to save invoice:", error);
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {invoice ? "Edit Invoice" : "Create New Invoice"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={isLoading}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Customer Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Customer Name *
                                </label>
                                <input
                                    type="text"
                                    name="customerName"
                                    value={formData.customerName}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.customerName ? "border-red-500" : "border-gray-300"
                                    }`}
                                    placeholder="Enter customer name"
                                    disabled={isLoading}
                                />
                                {errors.customerName && (
                                    <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Due Date *
                                </label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={formData.dueDate}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.dueDate ? "border-red-500" : "border-gray-300"
                                    }`}
                                    disabled={isLoading}
                                />
                                {errors.dueDate && (
                                    <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>
                                )}
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notes
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Additional notes..."
                                disabled={isLoading}
                            />
                        </div>

                        {/* Invoice Items */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Invoice Items</h3>
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    disabled={isLoading}
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Item
                                </button>
                            </div>

                            {errors.items && (
                                <p className="text-red-500 text-sm mb-4">{errors.items}</p>
                            )}

                            <div className="space-y-4">
                                {items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border border-gray-200 rounded-lg"
                                    >
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Product *
                                            </label>
                                            <select
                                                value={item.productId}
                                                onChange={(e) =>
                                                    updateItem(index, "productId", e.target.value)
                                                }
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors[`item_${index}_product`]
                                                        ? "border-red-500"
                                                        : "border-gray-300"
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
                                                <p className="text-red-500 text-xs mt-1">
                                                    {errors[`item_${index}_product`]}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Quantity *
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    updateItem(index, "quantity", Number(e.target.value))
                                                }
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors[`item_${index}_quantity`]
                                                        ? "border-red-500"
                                                        : "border-gray-300"
                                                }`}
                                                disabled={isLoading}
                                            />
                                            {errors[`item_${index}_quantity`] && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {errors[`item_${index}_quantity`]}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors[`item_${index}_price`]
                                                        ? "border-red-500"
                                                        : "border-gray-300"
                                                }`}
                                                disabled={isLoading}
                                            />
                                            {errors[`item_${index}_price`] && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {errors[`item_${index}_price`]}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Total
                                            </label>
                                            <input
                                                type="text"
                                                value={`$${item.totalPrice.toFixed(2)}`}
                                                readOnly
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                disabled={isLoading}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Invoice Summary */}
                        {items.length > 0 && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Invoice Summary
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>${calculateSubtotal().toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tax (10%):</span>
                                        <span>${calculateTax().toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                                        <span>Total:</span>
                                        <span>${calculateTotal().toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            {invoice ? "Update Invoice" : "Create Invoice"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InvoiceForm;