using System.Globalization;
using System.Text;
using System.Text.Json;
using CsvHelper;
using iTextSharp.text;
using iTextSharp.text.pdf;
using OfficeOpenXml;
using StockFlowPro.Application.DTOs;
using StockFlowPro.Shared.Extensions;

namespace StockFlowPro.Web.Services;

public class InvoiceExportService : IInvoiceExportService
{
    public Task<byte[]> ExportToPdfAsync(InvoiceDto invoice)
    {
        using var memoryStream = new MemoryStream();
        var document = new Document(PageSize.A4, 50, 50, 25, 25);
        var writer = PdfWriter.GetInstance(document, memoryStream);
        
        document.Open();

        // Title
        var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 18, new BaseColor(0, 0, 0));
        var title = new Paragraph("INVOICE", titleFont)
        {
            Alignment = Element.ALIGN_CENTER,
            SpacingAfter = 20
        };
        document.Add(title);

        // Invoice details
        var normalFont = FontFactory.GetFont(FontFactory.HELVETICA, 12, new BaseColor(0, 0, 0));
        var boldFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12, new BaseColor(0, 0, 0));

        var invoiceNumber = invoice.Id.ToString().Substring(0, 8).ToUpper();
        document.Add(new Paragraph($"Invoice Number: {invoiceNumber}", boldFont) { SpacingAfter = 10 });
        document.Add(new Paragraph($"Date: {invoice.CreatedDate:yyyy-MM-dd}", normalFont) { SpacingAfter = 10 });
        document.Add(new Paragraph($"Created By: {invoice.CreatedByUserName}", normalFont) { SpacingAfter = 20 });

        // Items table
        var table = new PdfPTable(4) { WidthPercentage = 100 };
        table.SetWidths(new float[] { 40, 20, 15, 25 });

        // Table headers
        var headerFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10, new BaseColor(255, 255, 255));
        var headerCell = new PdfPCell(new Phrase("Product", headerFont))
        {
            BackgroundColor = new BaseColor(64, 64, 64),
            HorizontalAlignment = Element.ALIGN_CENTER,
            Padding = 8
        };
        table.AddCell(headerCell);

        headerCell = new PdfPCell(new Phrase("Unit Price", headerFont))
        {
            BackgroundColor = new BaseColor(64, 64, 64),
            HorizontalAlignment = Element.ALIGN_CENTER,
            Padding = 8
        };
        table.AddCell(headerCell);

        headerCell = new PdfPCell(new Phrase("Quantity", headerFont))
        {
            BackgroundColor = new BaseColor(64, 64, 64),
            HorizontalAlignment = Element.ALIGN_CENTER,
            Padding = 8
        };
        table.AddCell(headerCell);

        headerCell = new PdfPCell(new Phrase("Line Total", headerFont))
        {
            BackgroundColor = new BaseColor(64, 64, 64),
            HorizontalAlignment = Element.ALIGN_CENTER,
            Padding = 8
        };
        table.AddCell(headerCell);

        // Table data
        var cellFont = FontFactory.GetFont(FontFactory.HELVETICA, 10, new BaseColor(0, 0, 0));
        foreach (var item in invoice.Items)
        {
            table.AddCell(new PdfPCell(new Phrase(item.ProductName, cellFont)) { Padding = 5 });
            table.AddCell(new PdfPCell(new Phrase(item.UnitPrice.ToCurrency(), cellFont)) 
            { 
                Padding = 5, 
                HorizontalAlignment = Element.ALIGN_RIGHT 
            });
            table.AddCell(new PdfPCell(new Phrase(item.Quantity.ToString(), cellFont)) 
            { 
                Padding = 5, 
                HorizontalAlignment = Element.ALIGN_CENTER 
            });
            table.AddCell(new PdfPCell(new Phrase(item.LineTotal.ToCurrency(), cellFont)) 
            { 
                Padding = 5, 
                HorizontalAlignment = Element.ALIGN_RIGHT 
            });
        }

        document.Add(table);

        // Total
        var totalParagraph = new Paragraph($"Total: {invoice.Total.ToCurrency()}", boldFont)
        {
            Alignment = Element.ALIGN_RIGHT,
            SpacingBefore = 20
        };
        document.Add(totalParagraph);

        document.Close();
        return Task.FromResult(memoryStream.ToArray());
    }

    public Task<byte[]> ExportToExcelAsync(InvoiceDto invoice)
    {
        ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
        
        using var package = new ExcelPackage();
        var worksheet = package.Workbook.Worksheets.Add("Invoice");

        // Invoice header
        var invoiceNumber = invoice.Id.ToString().Substring(0, 8).ToUpper();
        worksheet.Cells["A1"].Value = "INVOICE";
        worksheet.Cells["A1"].Style.Font.Size = 18;
        worksheet.Cells["A1"].Style.Font.Bold = true;
        worksheet.Cells["A1:D1"].Merge = true;
        worksheet.Cells["A1"].Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;

        worksheet.Cells["A3"].Value = "Invoice Number:";
        worksheet.Cells["B3"].Value = invoiceNumber;
        worksheet.Cells["A4"].Value = "Date:";
        worksheet.Cells["B4"].Value = invoice.CreatedDate.ToString("yyyy-MM-dd");
        worksheet.Cells["A5"].Value = "Created By:";
        worksheet.Cells["B5"].Value = invoice.CreatedByUserName;

        // Items header
        worksheet.Cells["A7"].Value = "Product";
        worksheet.Cells["B7"].Value = "Unit Price";
        worksheet.Cells["C7"].Value = "Quantity";
        worksheet.Cells["D7"].Value = "Line Total";

        // Style headers
        using (var range = worksheet.Cells["A7:D7"])
        {
            range.Style.Font.Bold = true;
            range.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
            range.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
            range.Style.Border.BorderAround(OfficeOpenXml.Style.ExcelBorderStyle.Thin);
        }

        // Items data
        int row = 8;
        foreach (var item in invoice.Items)
        {
            worksheet.Cells[row, 1].Value = item.ProductName;
            worksheet.Cells[row, 2].Value = item.UnitPrice;
            worksheet.Cells[row, 2].Style.Numberformat.Format = "\"R\"#,##0.00";
            worksheet.Cells[row, 3].Value = item.Quantity;
            worksheet.Cells[row, 4].Value = item.LineTotal;
            worksheet.Cells[row, 4].Style.Numberformat.Format = "\"R\"#,##0.00";
            row++;
        }

        // Total
        worksheet.Cells[row + 1, 3].Value = "Total:";
        worksheet.Cells[row + 1, 3].Style.Font.Bold = true;
        worksheet.Cells[row + 1, 4].Value = invoice.Total;
        worksheet.Cells[row + 1, 4].Style.Font.Bold = true;
        worksheet.Cells[row + 1, 4].Style.Numberformat.Format = "\"R\"#,##0.00";

        // Auto-fit columns
        worksheet.Cells.AutoFitColumns();

        return Task.FromResult(package.GetAsByteArray());
    }

    public async Task<byte[]> ExportToCsvAsync(InvoiceDto invoice)
    {
        using var memoryStream = new MemoryStream();
        using var writer = new StreamWriter(memoryStream, Encoding.UTF8);
        using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);

        // Write invoice header
        var invoiceNumber = invoice.Id.ToString().Substring(0, 8).ToUpper();
        await writer.WriteLineAsync($"Invoice Number,{invoiceNumber}");
        await writer.WriteLineAsync($"Date,{invoice.CreatedDate:yyyy-MM-dd}");
        await writer.WriteLineAsync($"Created By,{invoice.CreatedByUserName}");
        await writer.WriteLineAsync($"Total,{invoice.Total.ToCurrency()}");
        await writer.WriteLineAsync(); // Empty line

        // Write items header
        await writer.WriteLineAsync("Product,Unit Price,Quantity,Line Total");

        // Write items
        foreach (var item in invoice.Items)
        {
            await writer.WriteLineAsync($"{item.ProductName},{item.UnitPrice.ToCurrency()},{item.Quantity},{item.LineTotal.ToCurrency()}");
        }

        await writer.FlushAsync();
        return memoryStream.ToArray();
    }

    public Task<byte[]> ExportToJsonAsync(InvoiceDto invoice)
    {
        var options = new JsonSerializerOptions
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        var json = JsonSerializer.Serialize(invoice, options);
        return Task.FromResult(Encoding.UTF8.GetBytes(json));
    }

    public string GetContentType(string format)
    {
        return format.ToLower() switch
        {
            "pdf" => "application/pdf",
            "excel" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "csv" => "text/csv",
            "json" => "application/json",
            _ => "application/octet-stream"
        };
    }

    public Task<byte[]> ExportBulkToPdfAsync(IEnumerable<InvoiceDto> invoices)
    {
        using var memoryStream = new MemoryStream();
        var document = new Document(PageSize.A4, 50, 50, 25, 25);
        var writer = PdfWriter.GetInstance(document, memoryStream);
        
        document.Open();

        // Title
        var titleFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 18, new BaseColor(0, 0, 0));
        var title = new Paragraph("ALL INVOICES REPORT", titleFont)
        {
            Alignment = Element.ALIGN_CENTER,
            SpacingAfter = 20
        };
        document.Add(title);

        // Report info
        var normalFont = FontFactory.GetFont(FontFactory.HELVETICA, 10, new BaseColor(0, 0, 0));
        var boldFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 10, new BaseColor(0, 0, 0));

        document.Add(new Paragraph($"Generated on: {DateTime.Now:yyyy-MM-dd HH:mm:ss}", normalFont) { SpacingAfter = 10 });
        document.Add(new Paragraph($"Total Invoices: {invoices.Count()}", boldFont) { SpacingAfter = 20 });

        // Summary table
        var summaryTable = new PdfPTable(7) { WidthPercentage = 100 };
        summaryTable.SetWidths(new float[] { 15, 20, 12, 12, 8, 15, 18 });

        // Table headers
        var headerFont = FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 8, new BaseColor(255, 255, 255));
        var headerCells = new string[] { "Invoice #", "Customer", "Issue Date", "Due Date", "Items", "Total", "Status" };
        
        foreach (var header in headerCells)
        {
            var headerCell = new PdfPCell(new Phrase(header, headerFont))
            {
                BackgroundColor = new BaseColor(64, 64, 64),
                HorizontalAlignment = Element.ALIGN_CENTER,
                Padding = 5
            };
            summaryTable.AddCell(headerCell);
        }

        // Table data
        var cellFont = FontFactory.GetFont(FontFactory.HELVETICA, 8, new BaseColor(0, 0, 0));
        var totalAmount = 0m;
        
        foreach (var invoice in invoices.OrderByDescending(i => i.CreatedAt))
        {
            var invoiceNumber = invoice.InvoiceNumber ?? invoice.Id.ToString().Substring(0, 8).ToUpper();
            
            summaryTable.AddCell(new PdfPCell(new Phrase(invoiceNumber, cellFont)) { Padding = 4 });
            summaryTable.AddCell(new PdfPCell(new Phrase(invoice.CustomerName ?? "Unknown", cellFont)) { Padding = 4 });
            summaryTable.AddCell(new PdfPCell(new Phrase(invoice.IssueDate.ToString("yyyy-MM-dd"), cellFont)) { Padding = 4, HorizontalAlignment = Element.ALIGN_CENTER });
            summaryTable.AddCell(new PdfPCell(new Phrase(invoice.DueDate.ToString("yyyy-MM-dd"), cellFont)) { Padding = 4, HorizontalAlignment = Element.ALIGN_CENTER });
            summaryTable.AddCell(new PdfPCell(new Phrase((invoice.Items?.Count ?? 0).ToString(), cellFont)) { Padding = 4, HorizontalAlignment = Element.ALIGN_CENTER });
            summaryTable.AddCell(new PdfPCell(new Phrase(invoice.TotalAmount.ToCurrency(), cellFont)) { Padding = 4, HorizontalAlignment = Element.ALIGN_RIGHT });
            summaryTable.AddCell(new PdfPCell(new Phrase(invoice.Status ?? "Draft", cellFont)) { Padding = 4, HorizontalAlignment = Element.ALIGN_CENTER });
            
            totalAmount += invoice.TotalAmount;
        }

        document.Add(summaryTable);

        // Total summary
        var totalParagraph = new Paragraph($"Grand Total: {totalAmount.ToCurrency()}", boldFont)
        {
            Alignment = Element.ALIGN_RIGHT,
            SpacingBefore = 20
        };
        document.Add(totalParagraph);

        // Statistics
        document.Add(new Paragraph("\nSUMMARY STATISTICS", boldFont) { SpacingBefore = 30, SpacingAfter = 10 });
        
        var statusGroups = invoices.GroupBy(i => i.Status ?? "Draft").ToList();
        foreach (var group in statusGroups)
        {
            var statusTotal = group.Sum(i => i.TotalAmount);
            document.Add(new Paragraph($"{group.Key}: {group.Count()} invoices - {statusTotal.ToCurrency()}", normalFont) { SpacingAfter = 5 });
        }

        document.Close();
        return Task.FromResult(memoryStream.ToArray());
    }

    public Task<byte[]> ExportBulkToExcelAsync(IEnumerable<InvoiceDto> invoices)
    {
        ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
        
        using var package = new ExcelPackage();
        var worksheet = package.Workbook.Worksheets.Add("All Invoices");

        // Headers
        worksheet.Cells["A1"].Value = "Invoice Number";
        worksheet.Cells["B1"].Value = "Customer";
        worksheet.Cells["C1"].Value = "Issue Date";
        worksheet.Cells["D1"].Value = "Due Date";
        worksheet.Cells["E1"].Value = "Status";
        worksheet.Cells["F1"].Value = "Items Count";
        worksheet.Cells["G1"].Value = "Total Amount";
        worksheet.Cells["H1"].Value = "Created By";
        worksheet.Cells["I1"].Value = "Created Date";

        // Style headers
        using (var range = worksheet.Cells["A1:I1"])
        {
            range.Style.Font.Bold = true;
            range.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
            range.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
            range.Style.Border.BorderAround(OfficeOpenXml.Style.ExcelBorderStyle.Thin);
        }

        // Data
        int row = 2;
        foreach (var invoice in invoices)
        {
            var invoiceNumber = invoice.InvoiceNumber ?? invoice.Id.ToString().Substring(0, 8).ToUpper();
            worksheet.Cells[row, 1].Value = invoiceNumber;
            worksheet.Cells[row, 2].Value = invoice.CustomerName ?? "Unknown Customer";
            worksheet.Cells[row, 3].Value = invoice.IssueDate;
            worksheet.Cells[row, 3].Style.Numberformat.Format = "yyyy-mm-dd";
            worksheet.Cells[row, 4].Value = invoice.DueDate;
            worksheet.Cells[row, 4].Style.Numberformat.Format = "yyyy-mm-dd";
            worksheet.Cells[row, 5].Value = invoice.Status ?? "Draft";
            worksheet.Cells[row, 6].Value = invoice.Items?.Count ?? 0;
            worksheet.Cells[row, 7].Value = invoice.TotalAmount;
            worksheet.Cells[row, 7].Style.Numberformat.Format = "\"R\"#,##0.00";
            worksheet.Cells[row, 8].Value = invoice.CreatedByUserName ?? "Unknown";
            worksheet.Cells[row, 9].Value = invoice.CreatedAt;
            worksheet.Cells[row, 9].Style.Numberformat.Format = "yyyy-mm-dd hh:mm:ss";
            row++;
        }

        // Auto-fit columns
        worksheet.Cells.AutoFitColumns();

        return Task.FromResult(package.GetAsByteArray());
    }

    public async Task<byte[]> ExportBulkToCsvAsync(IEnumerable<InvoiceDto> invoices)
    {
        using var memoryStream = new MemoryStream();
        using var writer = new StreamWriter(memoryStream, Encoding.UTF8);
        using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);

        // Write headers
        await writer.WriteLineAsync("Invoice Number,Customer,Issue Date,Due Date,Status,Items Count,Total Amount,Created By,Created Date");

        // Write data
        foreach (var invoice in invoices)
        {
            var invoiceNumber = invoice.InvoiceNumber ?? invoice.Id.ToString().Substring(0, 8).ToUpper();
            var customerName = invoice.CustomerName ?? "Unknown Customer";
            var status = invoice.Status ?? "Draft";
            var itemsCount = invoice.Items?.Count ?? 0;
            var createdBy = invoice.CreatedByUserName ?? "Unknown";
            
            await writer.WriteLineAsync($"\"{invoiceNumber}\",\"{customerName}\",{invoice.IssueDate:yyyy-MM-dd},{invoice.DueDate:yyyy-MM-dd},\"{status}\",{itemsCount},{invoice.TotalAmount:F2},\"{createdBy}\",{invoice.CreatedAt:yyyy-MM-dd HH:mm:ss}");
        }

        await writer.FlushAsync();
        return memoryStream.ToArray();
    }

    public Task<byte[]> ExportBulkToJsonAsync(IEnumerable<InvoiceDto> invoices)
    {
        var options = new JsonSerializerOptions
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        var json = JsonSerializer.Serialize(invoices, options);
        return Task.FromResult(Encoding.UTF8.GetBytes(json));
    }

    public string GetFileName(InvoiceDto invoice, string format)
    {
        var invoiceNumber = invoice.Id.ToString().Substring(0, 8).ToUpper();
        var date = invoice.CreatedDate.ToString("yyyy-MM-dd");
        var extension = format.ToLower() switch
        {
            "excel" => "xlsx",
            _ => format.ToLower()
        };

        return $"Invoice_{invoiceNumber}_{date}.{extension}";
    }

    public string GetBulkFileName(string format)
    {
        var date = DateTime.Now.ToString("yyyy-MM-dd");
        var extension = format.ToLower() switch
        {
            "excel" => "xlsx",
            _ => format.ToLower()
        };

        return $"All_Invoices_{date}.{extension}";
    }
}