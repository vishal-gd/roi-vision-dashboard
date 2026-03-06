import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface ReportDownloadProps {
  title: string;
  headers: string[];
  rows: (string | number)[][];
  filename: string;
  subtitle?: string;
  summaryRows?: { label: string; value: string }[];
}

export function ReportDownload({ title, headers, rows, filename, subtitle, summaryRows }: ReportDownloadProps) {
  const [downloading, setDownloading] = useState(false);

  const downloadPDF = () => {
    setDownloading(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header band
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 40, "F");

      // Accent line
      doc.setFillColor(59, 130, 246); // blue-500
      doc.rect(0, 40, pageWidth, 3, "F");

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(title, 14, 18);

      // Subtitle
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(subtitle || "Synoptek · Cloud ROI Dashboard", 14, 26);

      // Date + branding
      doc.setFontSize(9);
      doc.text(`Report Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, 14, 34);
      doc.setTextColor(59, 130, 246);
      doc.setFont("helvetica", "bold");
      doc.text("SYNOPTEK", pageWidth - 14, 18, { align: "right" });

      let startY = 50;

      // Summary KPI cards
      if (summaryRows && summaryRows.length > 0) {
        const cardWidth = (pageWidth - 28 - (summaryRows.length - 1) * 6) / summaryRows.length;
        summaryRows.forEach((s, i) => {
          const x = 14 + i * (cardWidth + 6);
          // Card background
          doc.setFillColor(241, 245, 249); // slate-100
          doc.roundedRect(x, startY, cardWidth, 24, 3, 3, "F");
          // Border
          doc.setDrawColor(203, 213, 225); // slate-300
          doc.setLineWidth(0.3);
          doc.roundedRect(x, startY, cardWidth, 24, 3, 3, "S");
          // Label
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(100, 116, 139); // slate-500
          doc.text(s.label, x + cardWidth / 2, startY + 9, { align: "center" });
          // Value
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(15, 23, 42); // slate-900
          doc.text(s.value, x + cardWidth / 2, startY + 19, { align: "center" });
        });
        startY += 32;
      }

      // Table
      autoTable(doc, {
        head: [headers],
        body: rows.map((r) => r.map((c) => String(c))),
        startY,
        styles: {
          fontSize: 8,
          cellPadding: 4,
          lineColor: [226, 232, 240], // slate-200
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: [30, 41, 59], // slate-800
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252], // slate-50
        },
        bodyStyles: {
          textColor: [51, 65, 85], // slate-700
        },
        margin: { left: 14, right: 14 },
        didDrawPage: (data) => {
          // Footer on every page
          const pageHeight = doc.internal.pageSize.getHeight();
          doc.setFillColor(248, 250, 252);
          doc.rect(0, pageHeight - 16, pageWidth, 16, "F");
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.3);
          doc.line(0, pageHeight - 16, pageWidth, pageHeight - 16);
          doc.setFontSize(7);
          doc.setTextColor(148, 163, 184);
          doc.setFont("helvetica", "normal");
          doc.text("Cloud ROI Dashboard · Synoptek", 14, pageHeight - 6);
          doc.text(
            `Page ${doc.getCurrentPageInfo().pageNumber}`,
            pageWidth - 14,
            pageHeight - 6,
            { align: "right" }
          );
        },
      });

      doc.save(`${filename}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  const downloadExcel = () => {
    setDownloading(true);
    try {
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      // Style column widths
      ws["!cols"] = headers.map((h) => ({ wch: Math.max(h.length + 4, 14) }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 31));
      XLSX.writeFile(wb, `${filename}.xlsx`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" disabled={downloading}>
          <Download className="h-3.5 w-3.5" />
          Report
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={downloadPDF} className="gap-2 cursor-pointer">
          <FileText className="h-4 w-4 text-destructive" />
          Download PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={downloadExcel} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="h-4 w-4 text-success" />
          Download Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
