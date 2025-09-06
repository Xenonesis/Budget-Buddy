import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export interface Transaction {
  id: string;
  user_id: string;
  type: "income" | "expense";
  category_id: string;
  category_name?: string;
  amount: number;
  description: string;
  date: string;
  created_at: string;
  recurring_id?: string;
}

export interface ExportColumns {
  date: boolean;
  type: boolean;
  category: boolean;
  description: boolean;
  amount: boolean;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface DateRange {
  start: string;
  end: string;
}

/**
 * Export transactions to CSV format
 */
export const exportToCSV = (
  transactions: Transaction[],
  exportColumns: ExportColumns
): void => {
  // Get selected columns
  const selectedColumns = Object.entries(exportColumns)
    .filter(([_, selected]) => selected)
    .map(([column]) => column);

  if (selectedColumns.length === 0) {
    toast.error("Please select at least one column to export");
    return;
  }

  // Create headers based on selected columns
  const headers = selectedColumns.map(col => {
    switch(col) {
      case 'date': return 'Date';
      case 'type': return 'Type';
      case 'category': return 'Category';
      case 'description': return 'Description';
      case 'amount': return 'Amount';
      default: return '';
    }
  });

  // Create CSV content with selected columns
  const csvContent = [
    headers.join(','),
    ...transactions.map(t => {
      const row: string[] = [];

      if (exportColumns.date) row.push(formatDate(t.date));
      if (exportColumns.type) row.push(t.type);
      if (exportColumns.category) row.push(t.category_name || 'Uncategorized');
      if (exportColumns.description) row.push(`"${t.description.replace(/"/g, '""')}"`); // Escape quotes
      if (exportColumns.amount) row.push(t.amount.toString());

      return row.join(',');
    })
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `transactions_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export transactions to Excel format
 */
export const exportToExcel = async (
  transactions: Transaction[],
  exportColumns: ExportColumns
): Promise<void> => {
  try {
    // Dynamic import to reduce bundle size
    const ExcelJS = await import('exceljs').then(mod => mod.default);

    // Get selected columns
    const selectedColumns = Object.entries(exportColumns)
      .filter(([_, selected]) => selected)
      .map(([column]) => column);

    if (selectedColumns.length === 0) {
      toast.error("Please select at least one column to export");
      return;
    }

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Transactions");

    // Define columns
    const columns = [];
    if (exportColumns.date) columns.push({ header: 'Date', key: 'date', width: 15 });
    if (exportColumns.type) columns.push({ header: 'Type', key: 'type', width: 10 });
    if (exportColumns.category) columns.push({ header: 'Category', key: 'category', width: 20 });
    if (exportColumns.description) columns.push({ header: 'Description', key: 'description', width: 30 });
    if (exportColumns.amount) columns.push({ header: 'Amount', key: 'amount', width: 15 });

    worksheet.columns = columns;

    // Add rows
    transactions.forEach(t => {
      const rowData: any = {};
      if (exportColumns.date) rowData.date = formatDate(t.date);
      if (exportColumns.type) rowData.type = t.type;
      if (exportColumns.category) rowData.category = t.category_name || 'Uncategorized';
      if (exportColumns.description) rowData.description = t.description;
      if (exportColumns.amount) rowData.amount = t.amount;

      worksheet.addRow(rowData);
    });

    // Style the header row
    worksheet.getRow(1).font = { bold: true };

    // Generate file and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions_${new Date().toISOString().slice(0,10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Excel file exported successfully");
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    toast.error("Failed to export to Excel");
  }
};

/**
 * Export transactions to PDF format
 */
export const exportToPDF = async (
  transactions: Transaction[],
  exportColumns: ExportColumns,
  summary: TransactionSummary,
  dateRange?: DateRange
): Promise<void> => {
  try {
    // Dynamic import to reduce bundle size
    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;

    // Create document
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(16);
    doc.text("Transactions Report", 14, 15);

    // Add date range if selected
    if (dateRange?.start && dateRange?.end) {
      doc.setFontSize(10);
      doc.text(`Date range: ${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`, 14, 22);
    }

    // Add summary section
    doc.setFontSize(10);
    const summaryY = dateRange?.start && dateRange?.end ? 28 : 22;
    doc.text(`Total Income: ${formatCurrency(summary.totalIncome)}`, 14, summaryY);
    doc.text(`Total Expenses: ${formatCurrency(summary.totalExpense)}`, 14, summaryY + 5);
    doc.text(`Net Balance: ${formatCurrency(summary.balance)}`, 14, summaryY + 10);

    // Get selected columns for export
    const selectedColumns = Object.entries(exportColumns)
      .filter(([_, selected]) => selected)
      .map(([column]) => column);

    if (selectedColumns.length === 0) {
      toast.error("Please select at least one column to export");
      return;
    }

    // Define table columns based on selections
    const columns = [];
    if (exportColumns.date) columns.push('Date');
    if (exportColumns.type) columns.push('Type');
    if (exportColumns.category) columns.push('Category');
    if (exportColumns.description) columns.push('Description');
    if (exportColumns.amount) columns.push('Amount');

    // Prepare rows based on selected columns
    const rows = transactions.map(t => {
      const row = [];
      if (exportColumns.date) row.push(formatDate(t.date));
      if (exportColumns.type) row.push(t.type.charAt(0).toUpperCase() + t.type.slice(1));
      if (exportColumns.category) row.push(t.category_name || 'Uncategorized');
      if (exportColumns.description) row.push(t.description);
      if (exportColumns.amount) row.push(formatCurrency(t.amount));
      return row;
    });

    // Add table
    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: summaryY + 15,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 25 }, // Date
        1: { cellWidth: 20 }, // Type
        2: { cellWidth: 30 }, // Category
        3: { cellWidth: 'auto' }, // Description (flexible)
        4: { cellWidth: 25, halign: 'right' } // Amount (right-aligned)
      }
    });

    // Add footer with generation date
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Generated on ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Save PDF
    doc.save(`transactions_${new Date().toISOString().slice(0,10)}.pdf`);

    toast.success("PDF generated successfully");
  } catch (error) {
    console.error("Error generating PDF:", error);
    toast.error("Failed to generate PDF");
  }
};

/**
 * Calculate next export date for scheduling
 */
export const calculateNextExportDate = (
  frequency: 'weekly' | 'monthly',
  day: number
): Date => {
  const now = new Date();
  const result = new Date(now);

  if (frequency === 'weekly') {
    // day is 0-6 (Sunday-Saturday)
    const currentDay = now.getDay(); // 0-6
    const daysToAdd = (day - currentDay + 7) % 7;
    result.setDate(now.getDate() + (daysToAdd === 0 ? 7 : daysToAdd));
  } else if (frequency === 'monthly') {
    // day is 1-31
    const currentMonth = now.getMonth();
    const targetDay = Math.min(day, new Date(now.getFullYear(), currentMonth + 1, 0).getDate());

    if (now.getDate() >= targetDay) {
      // Move to next month
      result.setMonth(currentMonth + 1);
    }

    result.setDate(targetDay);
  }

  return result;
};

/**
 * Schedule export for future execution
 */
export const scheduleExport = (
  frequency: 'weekly' | 'monthly',
  day: number,
  format: 'csv' | 'excel' | 'pdf',
  exportColumns: ExportColumns
): void => {
  try {
    // Calculate next export date
    const nextExportDate = calculateNextExportDate(frequency, day);
    
    // Store export schedule in localStorage for now
    // In a real application, this would be stored in a database
    const exportSchedule = {
      frequency,
      day,
      format,
      exportColumns,
      nextExportDate: nextExportDate.toISOString(),
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('scheduledExport', JSON.stringify(exportSchedule));
    
    toast.success(`Export scheduled for ${nextExportDate.toLocaleDateString()}`);
  } catch (error) {
    console.error("Error scheduling export:", error);
    toast.error("Failed to schedule export");
  }
};