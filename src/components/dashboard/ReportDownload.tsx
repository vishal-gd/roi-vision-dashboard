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

      // === GRADIENT HEADER ===
      // Dark navy base
      doc.setFillColor(10, 15, 30);
      doc.rect(0, 0, pageWidth, 44, "F");
      // Subtle overlay gradient stripe
      doc.setFillColor(20, 40, 80);
      doc.rect(0, 0, pageWidth * 0.6, 44, "F");
      // Accent gradient bar (multi-color)
      const gradientColors = [
        [59, 130, 246],   // blue
        [34, 197, 94],    // green
        [245, 158, 11],   // amber
        [168, 85, 247],   // purple
        [239, 68, 68],    // red
      ];
      const segWidth = pageWidth / gradientColors.length;
      gradientColors.forEach(([r, g, b], i) => {
        doc.setFillColor(r, g, b);
        doc.rect(i * segWidth, 44, segWidth + 1, 3, "F");
      });

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text(title, 14, 18);

      // Subtitle
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 150, 200);
      doc.text(subtitle || "Synoptek · Cloud ROI Dashboard", 14, 27);

      // Date
      doc.setFontSize(8);
      doc.setTextColor(100, 130, 180);
      doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, 14, 36);

      // Brand
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(59, 130, 246);
      doc.text("SYNOPTEK", pageWidth - 14, 18, { align: "right" });
      doc.setFontSize(7);
      doc.setTextColor(100, 130, 180);
      doc.setFont("helvetica", "normal");
      doc.text("Cloud Management Platform", pageWidth - 14, 25, { align: "right" });

      let startY = 54;

      // === SUMMARY KPI CARDS ===
      if (summaryRows && summaryRows.length > 0) {
        const cardWidth = (pageWidth - 28 - (summaryRows.length - 1) * 5) / summaryRows.length;
        const cardColors = [
          { bg: [30, 64, 175], accent: [59, 130, 246] },   // blue
          { bg: [21, 94, 59], accent: [34, 197, 94] },     // green
          { bg: [146, 64, 14], accent: [245, 158, 11] },   // amber
          { bg: [88, 28, 135], accent: [168, 85, 247] },   // purple
        ];

        summaryRows.forEach((s, i) => {
          const x = 14 + i * (cardWidth + 5);
          const colors = cardColors[i % cardColors.length];

          // Card bg
          doc.setFillColor(colors.bg[0], colors.bg[1], colors.bg[2]);
          doc.roundedRect(x, startY, cardWidth, 28, 3, 3, "F");

          // Left accent bar
          doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
          doc.rect(x, startY + 3, 2.5, 22, "F");

          // Label
          doc.setFontSize(7);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(180, 200, 230);
          doc.text(s.label.toUpperCase(), x + 8, startY + 10);

          // Value
          doc.setFontSize(15);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(255, 255, 255);
          doc.text(s.value, x + 8, startY + 22);
        });
        startY += 36;
      }

      // === DATA TABLE ===
      autoTable(doc, {
        head: [headers],
        body: rows.map((r) => r.map((c) => String(c))),
        startY,
        styles: {
          fontSize: 8,
          cellPadding: 4,
          lineColor: [40, 50, 70],
          lineWidth: 0.2,
          textColor: [200, 210, 230],
          fillColor: [15, 20, 35],
        },
        headStyles: {
          fillColor: [30, 58, 138],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8,
        },
        alternateRowStyles: {
          fillColor: [20, 28, 50],
        },
        bodyStyles: {
          textColor: [180, 195, 220],
        },
        columnStyles: headers.reduce((acc, _, i) => {
          if (i >= headers.length - 2) acc[i] = { halign: "right" as const };
          return acc;
        }, {} as Record<number, { halign: "right" }>),
        margin: { left: 14, right: 14 },
        didDrawPage: () => {
          // Footer
          const pageHeight = doc.internal.pageSize.getHeight();
          doc.setFillColor(10, 15, 30);
          doc.rect(0, pageHeight - 14, pageWidth, 14, "F");
          // Accent line
          gradientColors.forEach(([r, g, b], i) => {
            doc.setFillColor(r, g, b);
            doc.rect(i * segWidth, pageHeight - 14, segWidth + 1, 1.5, "F");
          });
          doc.setFontSize(7);
          doc.setTextColor(100, 130, 180);
          doc.setFont("helvetica", "normal");
          doc.text("Cloud ROI Dashboard · Synoptek", 14, pageHeight - 4);
          doc.text(`Page ${doc.getCurrentPageInfo().pageNumber}`, pageWidth - 14, pageHeight - 4, { align: "right" });
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
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" disabled={downloading}>
          <Download className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        <DropdownMenuItem onClick={downloadPDF} className="gap-2 cursor-pointer text-xs">
          <FileText className="h-3.5 w-3.5 text-destructive" />
          PDF Report
        </DropdownMenuItem>
        <DropdownMenuItem onClick={downloadExcel} className="gap-2 cursor-pointer text-xs">
          <FileSpreadsheet className="h-3.5 w-3.5 text-success" />
          Excel Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
