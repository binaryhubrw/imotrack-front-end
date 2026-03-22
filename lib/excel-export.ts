import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { format } from "date-fns";

/** Brand blue for title row */
const TITLE_BG = "FF00628B";
const TITLE_FONT = "FFFFFFFF";
/** Dark gray for table header */
const HEADER_BG = "FF404040";
const HEADER_FONT = "FFFFFFFF";
/** Light green for PAID / completed status */
const STATUS_PAID_BG = "FFC6EFCE";
const STATUS_PENDING_BG = "FFFFEB9C";
const BORDER_THIN = { style: "thin" as const, color: { argb: "FF000000" } };

export interface StyledExcelOptions {
  /** Report title (e.g. "Users - Export Report") */
  title: string;
  /** Sheet tab name */
  sheetName: string;
  /** Column headers in order */
  columns: string[];
  /** Data rows - objects keyed by column header */
  data: Record<string, string | number>[];
  /** Output filename (without extension) */
  filename: string;
  /** Optional filter description for row 3 */
  filters?: string;
  /** Column key to apply status-based background (e.g. "Status") */
  statusColumn?: string;
  /** Map status values to background ARGB (e.g. { "PAID": "FFC6EFCE" }) */
  statusColors?: Record<string, string>;
  /** Custom column widths by index (default: 18 for all) */
  columnWidths?: number[];
}

/**
 * Export data to a styled Excel file with title, export date, filters,
 * formatted header row, and bordered data cells for better visibility.
 */
export async function exportToStyledExcel(options: StyledExcelOptions): Promise<void> {
  const {
    title,
    sheetName,
    columns,
    data,
    filename,
    filters = "",
    statusColumn,
    statusColors = {
    PAID: STATUS_PAID_BG, COMPLETED: STATUS_PAID_BG, APPROVED: STATUS_PAID_BG, CLOSED: STATUS_PAID_BG, ACTIVE: STATUS_PAID_BG,
    PENDING: STATUS_PENDING_BG, OPEN: STATUS_PENDING_BG,
  },
    columnWidths,
  } = options;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName, { properties: { defaultColWidth: 18 } });

  const colCount = columns.length;
  const dataStartRow = 5; // Row 1: title, 2: date, 3: filters, 4: blank, 5: header

  // 1. Title row (merged, blue bg, white bold)
  worksheet.mergeCells(1, 1, 1, colCount);
  const titleCell = worksheet.getCell(1, 1);
  titleCell.value = title;
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: TITLE_BG } };
  titleCell.font = { bold: true, size: 14, color: { argb: TITLE_FONT } };
  titleCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };

  // 2. Export date
  const dateCell = worksheet.getCell(2, 1);
  dateCell.value = `Export Date: ${format(new Date(), "dd/MM/yyyy, HH:mm:ss")}`;
  dateCell.font = { size: 10, color: { argb: "FF333333" } };

  // 3. Filters (optional)
  const filterCell = worksheet.getCell(3, 1);
  filterCell.value = `Filters: ${filters}`;
  filterCell.font = { size: 10, color: { argb: "FF333333" } };

  // 4. Blank row handled by dataStartRow

  // 5. Header row
  columns.forEach((col, c) => {
    const cell = worksheet.getCell(dataStartRow, c + 1);
    cell.value = col;
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_BG } };
    cell.font = { bold: true, size: 11, color: { argb: HEADER_FONT } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = {
      top: BORDER_THIN,
      left: BORDER_THIN,
      bottom: BORDER_THIN,
      right: BORDER_THIN,
    };
  });

  // 6. Data rows with borders
  data.forEach((row, r) => {
    columns.forEach((colKey, c) => {
      const cell = worksheet.getCell(dataStartRow + 1 + r, c + 1);
      const val = row[colKey];
      cell.value = val !== undefined && val !== null ? String(val) : "";
      cell.border = {
        top: BORDER_THIN,
        left: BORDER_THIN,
        bottom: BORDER_THIN,
        right: BORDER_THIN,
      };
      cell.alignment = { vertical: "middle", wrapText: true };

      // Status column coloring
      if (statusColumn && colKey === statusColumn && val) {
        const statusStr = String(val).toUpperCase();
        const bg = statusColors[statusStr];
        if (bg) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
        }
      }
    });
  });

  // Column widths
  columns.forEach((_, i) => {
    const col = worksheet.getColumn(i + 1);
    col.width = columnWidths?.[i] ?? 20;
  });

  // Freeze title + header
  worksheet.views = [{ state: "frozen", ySplit: dataStartRow, activeCell: "A6" }];

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const ts = format(new Date(), "yyyy-MM-dd_HH-mm-ss");
  saveAs(blob, `${filename}_${ts}.xlsx`);
}
