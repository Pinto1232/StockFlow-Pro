import React from "react";
import { X, Download, Mail, Edit, Printer, FileText, User, Calendar, Package, Calculator, Building, Phone, MapPin } from "lucide-react";
import { formatCurrency } from "../../utils/currency";
import { useGenerateInvoicePdf } from "../../hooks/useInvoices";
import type { InvoiceDto } from "../../types/index";

interface InvoiceDetailProps {
    invoice: InvoiceDto;
    isOpen: boolean;
    onClose: () => void;
    onEdit: () => void;
}

const InvoiceDetail: React.FC<InvoiceDetailProps> = ({
    invoice,
    isOpen,
    onClose,
    onEdit,
}) => {
    const generatePdfMutation = useGenerateInvoicePdf();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const handleDownloadPdf = async () => {
        try {
            const blob = await generatePdfMutation.mutateAsync(invoice.id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `invoice-${invoice.invoiceNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to download PDF:", error);
            alert("Failed to download PDF. Please try again.");
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleSendEmail = () => {
        // TODO: Implement email sending functionality
        const email = prompt("Enter email address to send invoice:");
        if (email) {
            console.log("Send invoice to:", email);
            // Implement email sending logic here
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden border border-gray-100">
                {/* Enhanced Header */}
                <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 text-white p-6 print:hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-blue-700/90"></div>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                                <FileText className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold">Invoice Details</h2>
                                <p className="text-indigo-100 mt-1">View and manage invoice information</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onEdit}
                                className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-200 font-medium backdrop-blur-sm border border-white/20"
                            >
                                <Edit className="h-4 w-4" />
                                Edit
                            </button>
                            <button
                                onClick={handleDownloadPdf}
                                className="flex items-center gap-2 px-4 py-2 bg-green-500/90 text-white rounded-xl hover:bg-green-600 transition-all duration-200 font-medium backdrop-blur-sm"
                                disabled={generatePdfMutation.isPending}
                            >
                                <Download className="h-4 w-4" />
                                {generatePdfMutation.isPending ? "Generating..." : "PDF"}
                            </button>
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-500/90 text-white rounded-xl hover:bg-purple-600 transition-all duration-200 font-medium backdrop-blur-sm"
                            >
                                <Printer className="h-4 w-4" />
                                Print
                            </button>
                            <button
                                onClick={handleSendEmail}
                                className="flex items-center gap-2 px-4 py-2 bg-orange-500/90 text-white rounded-xl hover:bg-orange-600 transition-all duration-200 font-medium backdrop-blur-sm"
                            >
                                <Mail className="h-4 w-4" />
                                Email
                            </button>
                            <button
                                onClick={onClose}
                                className="p-3 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
                            >
                                <X className="h-6 w-6 text-white" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Enhanced Invoice Content */}
                <div className="overflow-y-auto max-h-[calc(95vh-100px)] scrollbar-hide scroll-smooth">
                    <div className="p-8 print:p-0 bg-gradient-to-br from-gray-50 to-white">
                        {/* Professional Invoice Header */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
                            <div className="flex justify-between items-start mb-8">
                                <div className="flex items-center gap-6">
                                    <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl">
                                        <Building className="h-12 w-12 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                            INVOICE
                                        </h1>
                                        <p className="text-2xl font-semibold text-gray-700">#{invoice.invoiceNumber}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                        StockFlow Pro
                                    </div>
                                    <p className="text-gray-600 font-medium">Professional Invoice Management</p>
                                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                                        <MapPin className="h-4 w-4" />
                                        <span>Business Address</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                        <Phone className="h-4 w-4" />
                                        <span>+1 (555) 123-4567</span>
                                    </div>
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="flex justify-end mb-6">
                                <span
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                                        invoice.status === "Paid"
                                            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                                            : invoice.status === "Pending"
                                            ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg"
                                            : "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg"
                                    }`}
                                >
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                    {invoice.status || "Draft"}
                                </span>
                            </div>
                        </div>

                        {/* Customer and Invoice Information */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            {/* Bill To Section */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-blue-500 rounded-lg">
                                        <User className="h-5 w-5 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Bill To</h3>
                                </div>
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                                    <p className="text-xl font-bold text-gray-900 mb-2">{invoice.customerName}</p>
                                    <p className="text-gray-600 flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Customer ID: {invoice.customerId}
                                    </p>
                                </div>
                            </div>

                            {/* Invoice Details Section */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-purple-500 rounded-lg">
                                        <Calendar className="h-5 w-5 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Invoice Details</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                                        <span className="text-gray-600 font-medium flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Issue Date:
                                        </span>
                                        <span className="font-semibold text-gray-900">{formatDate(invoice.issueDate)}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                                        <span className="text-gray-600 font-medium flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            Due Date:
                                        </span>
                                        <span className="font-semibold text-gray-900">{formatDate(invoice.dueDate)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Invoice Items Section */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-green-500 rounded-lg">
                                    <Package className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Invoice Items</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 rounded-tl-xl">
                                                Product
                                            </th>
                                            <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">
                                                Quantity
                                            </th>
                                            <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                                                Unit Price
                                            </th>
                                            <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 rounded-tr-xl">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoice.items.map((item, index) => (
                                            <tr
                                                key={item.id}
                                                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                                    index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                                                }`}
                                            >
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                    <div className="flex items-center gap-2">
                                                        <Package className="h-4 w-4 text-gray-400" />
                                                        {item.productName}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 text-center font-semibold">
                                                    {item.quantity}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 text-right font-semibold">
                                                    {formatCurrency(item.unitPrice)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 text-right font-bold">
                                                    {formatCurrency(item.totalPrice)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Enhanced Invoice Summary */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-indigo-500 rounded-lg">
                                    <Calculator className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Invoice Summary</h3>
                            </div>
                            <div className="flex justify-end">
                                <div className="w-full max-w-md">
                                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center py-2 border-b border-indigo-200">
                                                <span className="text-gray-600 font-medium">Subtotal:</span>
                                                <span className="text-lg font-semibold text-gray-900">{formatCurrency(invoice.subtotal)}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-indigo-200">
                                                <span className="text-gray-600 font-medium">Tax:</span>
                                                <span className="text-lg font-semibold text-gray-900">{formatCurrency(invoice.taxAmount)}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-4 border-t-2 border-indigo-300">
                                                <span className="text-xl font-bold text-gray-900">Total Amount:</span>
                                                <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                                    {formatCurrency(invoice.totalAmount)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes Section */}
                        {invoice.notes && (
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-amber-500 rounded-lg">
                                        <FileText className="h-5 w-5 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Additional Notes</h3>
                                </div>
                                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
                                    <p className="text-gray-700 leading-relaxed">{invoice.notes}</p>
                                </div>
                            </div>
                        )}

                        {/* Professional Footer */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <div className="text-center">
                                <div className="border-t-2 border-gradient-to-r from-indigo-200 to-purple-200 pt-6">
                                    <p className="text-lg font-semibold text-gray-700 mb-2">Thank you for your business!</p>
                                    <p className="text-sm text-gray-500">
                                        Generated on {formatDate(new Date().toISOString())} by StockFlow Pro
                                    </p>
                                    <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
                                        <span>Professional Invoice Management System</span>
                                        <span>•</span>
                                        <span>Powered by StockFlow Pro</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetail;