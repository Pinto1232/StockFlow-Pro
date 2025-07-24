using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Web.Services;

public interface IInvoiceExportService
{
    Task<byte[]> ExportToPdfAsync(InvoiceDto invoice);
    Task<byte[]> ExportToExcelAsync(InvoiceDto invoice);
    Task<byte[]> ExportToCsvAsync(InvoiceDto invoice);
    Task<byte[]> ExportToJsonAsync(InvoiceDto invoice);
    Task<byte[]> ExportBulkToPdfAsync(IEnumerable<InvoiceDto> invoices);
    Task<byte[]> ExportBulkToExcelAsync(IEnumerable<InvoiceDto> invoices);
    Task<byte[]> ExportBulkToCsvAsync(IEnumerable<InvoiceDto> invoices);
    Task<byte[]> ExportBulkToJsonAsync(IEnumerable<InvoiceDto> invoices);
    string GetContentType(string format);
    string GetFileName(InvoiceDto invoice, string format);
    string GetBulkFileName(string format);
}