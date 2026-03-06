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
  /** Bundle-wise breakdown for cost projection overview report */
  bundleBreakdown?: {
    bundle: string;
    color: number[];
    features: { name: string; count: number; unitCost: number; projected: number }[];
    totalCost: number;
  }[];
}

export function ReportDownload({ title, headers, rows, filename, subtitle, summaryRows, bundleBreakdown }: ReportDownloadProps) {
  const [downloading, setDownloading] = useState(false);

  const gradientColors: number[][] = [
    [59, 130, 246],
    [34, 197, 94],
    [245, 158, 11],
    [168, 85, 247],
    [239, 68, 68],
  ];

  const drawHeader = (doc: jsPDF, pageWidth: number) => {
    doc.setFillColor(10, 15, 30);
    doc.rect(0, 0, pageWidth, 44, "F");
    doc.setFillColor(20, 40, 80);
    doc.rect(0, 0, pageWidth * 0.6, 44, "F");

    const segWidth = pageWidth / gradientColors.length;
    gradientColors.forEach(([r, g, b], i) => {
      doc.setFillColor(r, g, b);
      doc.rect(i * segWidth, 44, segWidth + 1, 3, "F");
    });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(title, 14, 18);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 150, 200);
    doc.text(subtitle || "Cloud ROI Dashboard", 14, 27);

    doc.setFontSize(8);
    doc.setTextColor(100, 130, 180);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, 14, 36);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(59, 130, 246);
    doc.text("ROI DASHBOARD", pageWidth - 14, 18, { align: "right" });
    doc.setFontSize(7);
    doc.setTextColor(100, 130, 180);
    doc.setFont("helvetica", "normal");
    doc.text("Cloud Management Platform", pageWidth - 14, 25, { align: "right" });
  };

  const drawFooter = (doc: jsPDF, pageWidth: number) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFillColor(10, 15, 30);
    doc.rect(0, pageHeight - 14, pageWidth, 14, "F");
    const segWidth = pageWidth / gradientColors.length;
    gradientColors.forEach(([r, g, b], i) => {
      doc.setFillColor(r, g, b);
      doc.rect(i * segWidth, pageHeight - 14, segWidth + 1, 1.5, "F");
    });
    doc.setFontSize(7);
    doc.setTextColor(100, 130, 180);
    doc.setFont("helvetica", "normal");
    doc.text("Cloud ROI Dashboard", 14, pageHeight - 4);
    doc.text(`Page ${doc.getCurrentPageInfo().pageNumber}`, pageWidth - 14, pageHeight - 4, { align: "right" });
  };

  const drawSummaryCards = (doc: jsPDF, pageWidth: number, startY: number): number => {
    if (!summaryRows || summaryRows.length === 0) return startY;
    const cardWidth = (pageWidth - 28 - (summaryRows.length - 1) * 5) / summaryRows.length;
    const cardColors = [
      { bg: [30, 64, 175], accent: [59, 130, 246] },
      { bg: [21, 94, 59], accent: [34, 197, 94] },
      { bg: [146, 64, 14], accent: [245, 158, 11] },
      { bg: [88, 28, 135], accent: [168, 85, 247] },
    ];

    summaryRows.forEach((s, i) => {
      const x = 14 + i * (cardWidth + 5);
      const colors = cardColors[i % cardColors.length];
      doc.setFillColor(colors.bg[0], colors.bg[1], colors.bg[2]);
      doc.roundedRect(x, startY, cardWidth, 28, 3, 3, "F");
      doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      doc.rect(x, startY + 3, 2.5, 22, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(180, 200, 230);
      doc.text(s.label.toUpperCase(), x + 8, startY + 10);
      doc.setFontSize(15);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(s.value, x + 8, startY + 22);
    });
    return startY + 36;
  };

  const downloadPDF = () => {
    setDownloading(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      drawHeader(doc, pageWidth);
      let startY = 54;
      startY = drawSummaryCards(doc, pageWidth, startY);

      // If bundle breakdown is provided, render bundle-wise sections
      if (bundleBreakdown && bundleBreakdown.length > 0) {
        const totalProjected = bundleBreakdown.reduce((s, b) => s + b.totalCost, 0);

        // Bundle distribution bar
        if (totalProjected > 0) {
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(180, 200, 230);
          doc.text("COST DISTRIBUTION BY BUNDLE", 14, startY + 4);
          startY += 8;

          const barY = startY;
          const barH = 10;
          const barW = pageWidth - 28;
          let barX = 14;

          bundleBreakdown.forEach((b) => {
            const pct = b.totalCost / totalProjected;
            const w = barW * pct;
            doc.setFillColor(b.color[0], b.color[1], b.color[2]);
            doc.roundedRect(barX, barY, Math.max(w, 2), barH, 1, 1, "F");

            // Label on bar if wide enough
            if (w > 30) {
              doc.setFontSize(7);
              doc.setFont("helvetica", "bold");
              doc.setTextColor(255, 255, 255);
              doc.text(`${b.bundle} ${(pct * 100).toFixed(0)}%`, barX + 3, barY + 6.5);
            }
            barX += w;
          });
          startY += barH + 8;

          // Bundle legend
          let legendX = 14;
          bundleBreakdown.forEach((b) => {
            doc.setFillColor(b.color[0], b.color[1], b.color[2]);
            doc.roundedRect(legendX, startY, 6, 6, 1, 1, "F");
            doc.setFontSize(7);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(180, 200, 230);
            doc.text(`${b.bundle}: $${b.totalCost.toLocaleString()}`, legendX + 9, startY + 5);
            legendX += 55;
          });
          startY += 14;
        }

        // Bundle-wise tables
        bundleBreakdown.forEach((b) => {
          // Check if we need a new page
          if (startY > doc.internal.pageSize.getHeight() - 60) {
            doc.addPage();
            drawFooter(doc, pageWidth);
            startY = 20;
          }

          // Bundle section header
          doc.setFillColor(b.color[0], b.color[1], b.color[2]);
          doc.roundedRect(14, startY, pageWidth - 28, 16, 2, 2, "F");
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(255, 255, 255);
          doc.text(`${b.bundle} Bundle`, 20, startY + 10.5);
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.text(`$${b.totalCost.toLocaleString()} projected`, pageWidth - 20, startY + 10.5, { align: "right" });
          startY += 20;

          // Feature mini-bars
          const maxCount = Math.max(...b.features.map(f => f.count), 1);
          b.features.forEach((f) => {
            if (startY > doc.internal.pageSize.getHeight() - 30) {
              doc.addPage();
              drawFooter(doc, pageWidth);
              startY = 20;
            }

            const barWidth = 50;
            const fillW = (f.count / maxCount) * barWidth;

            doc.setFillColor(25, 30, 50);
            doc.roundedRect(14, startY, pageWidth - 28, 10, 1, 1, "F");

            // Feature name
            doc.setFontSize(7.5);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(180, 200, 230);
            doc.text(f.name, 18, startY + 6.5);

            // Count bar
            const barStartX = 85;
            doc.setFillColor(40, 50, 70);
            doc.roundedRect(barStartX, startY + 2.5, barWidth, 5, 1, 1, "F");
            doc.setFillColor(b.color[0], b.color[1], b.color[2]);
            if (fillW > 0) doc.roundedRect(barStartX, startY + 2.5, Math.max(fillW, 2), 5, 1, 1, "F");

            // Count value
            doc.setFontSize(7);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(200, 210, 230);
            doc.text(f.count.toLocaleString(), barStartX + barWidth + 4, startY + 6.5);

            // Unit cost
            doc.setFontSize(7);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(140, 160, 190);
            doc.text(`× $${f.unitCost}`, 150, startY + 6.5);

            // Projected
            doc.setFontSize(7.5);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(b.color[0], b.color[1], b.color[2]);
            doc.text(`$${f.projected.toLocaleString()}`, pageWidth - 18, startY + 6.5, { align: "right" });

            startY += 12;
          });

          startY += 6;
        });

        drawFooter(doc, pageWidth);
      } else {
        // Standard table report
        autoTable(doc, {
          head: [headers],
          body: rows.map((r) => r.map((c) => String(c))),
          startY,
          styles: {
            fontSize: 8, cellPadding: 4, lineColor: [40, 50, 70], lineWidth: 0.2,
            textColor: [200, 210, 230], fillColor: [15, 20, 35],
          },
          headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8 },
          alternateRowStyles: { fillColor: [20, 28, 50] },
          bodyStyles: { textColor: [180, 195, 220] },
          columnStyles: headers.reduce((acc, _, i) => {
            if (i >= headers.length - 2) acc[i] = { halign: "right" as const };
            return acc;
          }, {} as Record<number, { halign: "right" }>),
          margin: { left: 14, right: 14 },
          didDrawPage: () => drawFooter(doc, pageWidth),
        });
      }

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
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" disabled={downloading} onClick={(e) => e.stopPropagation()}>
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
