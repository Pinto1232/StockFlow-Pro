using StockFlowPro.Application.DTOs;

namespace StockFlowPro.Web.Services;

public interface IInvoiceExportService
{
    Task<byte[]> ExportToPdfAsync(InvoiceDto invoice);
    Task<byte[]> ExportToExcelAsync(InvoiceDto invoice);
    Task<byte[]> ExportToCsvAsync(InvoiceDto invoice);
    Task<byte[]> ExportToJsonAsync(InvoiceDto invoice);
    string GetContentType(string format);
    string GetFileName(InvoiceDto invoice, string format);
}