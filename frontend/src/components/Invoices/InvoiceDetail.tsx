import React from "react";
import { X, Download, Mail, Edit, Printer } from "lucide-react";
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 print:hidden">
                    <h2 className="text-2xl font-bold text-gray-900">Invoice Details</h2>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onEdit}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            <Edit className="h-4 w-4" />
                            Edit
                        </button>
                        <button
                            onClick={handleDownloadPdf}
                            className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            disabled={generatePdfMutation.isPending}
                        >
                            <Download className="h-4 w-4" />
                            {generatePdfMutation.isPending ? "Generating..." : "Download PDF"}
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                        >
                            <Printer className="h-4 w-4" />
                            Print
                        </button>
                        <button
                            onClick={handleSendEmail}
                            className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            <Mail className="h-4 w-4" />
                            Email
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Invoice Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                    <div className="p-8 print:p-0">
                        {/* Invoice Header */}
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
                                <p className="text-lg text-gray-600">#{invoice.invoiceNumber}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600 mb-2">
                                    StockFlow Pro
                                </div>
                                <p className="text-gray-600">Invoice Management System</p>
                            </div>
                        </div>

                        {/* Invoice Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="font-semibold text-gray-900">{invoice.customerName}</p>
                                    <p className="text-gray-600">Customer ID: {invoice.customerId}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Invoice Details:</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Issue Date:</span>
                                        <span className="font-medium">{formatDate(invoice.issueDate)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Due Date:</span>
                                        <span className="font-medium">{formatDate(invoice.dueDate)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span
                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                invoice.status === "Paid"
                                                    ? "bg-green-100 text-green-800"
                                                    : invoice.status === "Pending"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-gray-100 text-gray-800"
                                            }`}
                                        >
                                            {invoice.status || "Draft"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Invoice Items */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Items:</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full border border-gray-200 rounded-lg">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">
                                                Product
                                            </th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border-b">
                                                Quantity
                                            </th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 border-b">
                                                Unit Price
                                            </th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 border-b">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoice.items.map((item, index) => (
                                            <tr
                                                key={item.id}
                                                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                            >
                                                <td className="px-4 py-3 text-sm text-gray-900 border-b">
                                                    {item.productName}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 text-center border-b">
                                                    {item.quantity}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 text-right border-b">
                                                    {formatCurrency(item.unitPrice)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-900 text-right border-b">
                                                    {formatCurrency(item.totalPrice)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Invoice Summary */}
                        <div className="flex justify-end mb-8">
                            <div className="w-full max-w-sm">
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Subtotal:</span>
                                            <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Tax:</span>
                                            <span className="font-medium">{formatCurrency(invoice.taxAmount)}</span>
                                        </div>
                                        <div className="border-t pt-3">
                                            <div className="flex justify-between text-lg font-bold">
                                                <span>Total:</span>
                                                <span className="text-blue-600">
                                                    {formatCurrency(invoice.totalAmount)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {invoice.notes && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes:</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-gray-700">{invoice.notes}</p>
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="text-center text-sm text-gray-500 border-t pt-6">
                            <p>Thank you for your business!</p>
                            <p className="mt-2">
                                Generated on {formatDate(new Date().toISOString())} by StockFlow Pro
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetail;