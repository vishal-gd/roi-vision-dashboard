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
  bundleBreakdown?: {
    bundle: string;
    color: number[];
    features: { name: string; count: number; unitCost: number; projected: number }[];
    totalCost: number;
  }[];
}

export function ReportDownload({ title, headers, rows, filename, subtitle, summaryRows, bundleBreakdown }: ReportDownloadProps) {
  const [downloading, setDownloading] = useState(false);

  const accentColors: number[][] = [
    [59, 130, 246],
    [34, 197, 94],
    [245, 158, 11],
    [168, 85, 247],
    [239, 68, 68],
    [6, 182, 212],
  ];

  const drawHeader = (doc: jsPDF, pageWidth: number) => {
    // Dark header band
    doc.setFillColor(10, 15, 30);
    doc.rect(0, 0, pageWidth, 40, "F");
    // Gradient accent stripe
    const segW = pageWidth / accentColors.length;
    accentColors.forEach(([r, g, b], i) => {
      doc.setFillColor(r, g, b);
      doc.rect(i * segW, 40, segW + 1, 2.5, "F");
    });

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    const titleText = title.length > 50 ? title.slice(0, 48) + "…" : title;
    doc.text(titleText, 14, 16);

    // Subtitle
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(130, 160, 210);
    doc.text(subtitle || "Cloud ROI Dashboard", 14, 24);

    // Date
    doc.setFontSize(7);
    doc.setTextColor(100, 130, 180);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, 14, 33);

    // Right brand
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(59, 130, 246);
    doc.text("ROI DASHBOARD", pageWidth - 14, 16, { align: "right" });
    doc.setFontSize(6.5);
    doc.setTextColor(100, 130, 180);
    doc.setFont("helvetica", "normal");
    doc.text("Cloud Management Platform", pageWidth - 14, 23, { align: "right" });
  };

  const drawFooter = (doc: jsPDF, pageWidth: number) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFillColor(10, 15, 30);
    doc.rect(0, pageHeight - 12, pageWidth, 12, "F");
    const segW = pageWidth / accentColors.length;
    accentColors.forEach(([r, g, b], i) => {
      doc.setFillColor(r, g, b);
      doc.rect(i * segW, pageHeight - 12, segW + 1, 1.2, "F");
    });
    doc.setFontSize(6.5);
    doc.setTextColor(100, 130, 180);
    doc.text("Cloud ROI Dashboard", 14, pageHeight - 3.5);
    doc.text(`Page ${doc.getCurrentPageInfo().pageNumber}`, pageWidth - 14, pageHeight - 3.5, { align: "right" });
  };

  const checkPageBreak = (doc: jsPDF, startY: number, needed: number, pageWidth: number): number => {
    if (startY + needed > doc.internal.pageSize.getHeight() - 20) {
      drawFooter(doc, pageWidth);
      doc.addPage();
      return 16;
    }
    return startY;
  };

  const drawSummaryCards = (doc: jsPDF, pageWidth: number, startY: number): number => {
    if (!summaryRows || summaryRows.length === 0) return startY;
    
    // Limit to max 4 cards per row for proper sizing
    const maxPerRow = Math.min(summaryRows.length, 4);
    const cardGap = 4;
    const totalGap = (maxPerRow - 1) * cardGap;
    const cardWidth = (pageWidth - 28 - totalGap) / maxPerRow;
    
    const cardColorSets = [
      { bg: [25, 50, 120], accent: [59, 130, 246] },
      { bg: [15, 70, 45], accent: [34, 197, 94] },
      { bg: [100, 50, 10], accent: [245, 158, 11] },
      { bg: [65, 20, 100], accent: [168, 85, 247] },
      { bg: [100, 25, 25], accent: [239, 68, 68] },
      { bg: [10, 70, 80], accent: [6, 182, 212] },
    ];

    for (let row = 0; row < Math.ceil(summaryRows.length / maxPerRow); row++) {
      const rowItems = summaryRows.slice(row * maxPerRow, (row + 1) * maxPerRow);
      const actualCardWidth = rowItems.length < maxPerRow 
        ? (pageWidth - 28 - (rowItems.length - 1) * cardGap) / rowItems.length
        : cardWidth;
      
      startY = checkPageBreak(doc, startY, 30, pageWidth);
      
      rowItems.forEach((s, i) => {
        const globalIdx = row * maxPerRow + i;
        const x = 14 + i * (actualCardWidth + cardGap);
        const colors = cardColorSets[globalIdx % cardColorSets.length];
        
        // Card background
        doc.setFillColor(colors.bg[0], colors.bg[1], colors.bg[2]);
        doc.roundedRect(x, startY, actualCardWidth, 24, 2, 2, "F");
        
        // Left accent bar
        doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        doc.roundedRect(x, startY + 3, 2, 18, 1, 1, "F");
        
        // Label
        doc.setFontSize(6);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(160, 180, 210);
        doc.text(s.label.toUpperCase(), x + 7, startY + 9);
        
        // Value
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        const val = s.value.length > 12 ? s.value.slice(0, 11) + "…" : s.value;
        doc.text(val, x + 7, startY + 19);
      });
      startY += 28;
    }
    return startY + 4;
  };

  const downloadPDF = () => {
    setDownloading(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      drawHeader(doc, pageWidth);
      let startY = 50;
      startY = drawSummaryCards(doc, pageWidth, startY);

      if (bundleBreakdown && bundleBreakdown.length > 0) {
        const totalProjected = bundleBreakdown.reduce((s, b) => s + b.totalCost, 0);

        // === COST DISTRIBUTION BAR ===
        if (totalProjected > 0) {
          startY = checkPageBreak(doc, startY, 35, pageWidth);
          
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(160, 180, 210);
          doc.text("COST DISTRIBUTION BY BUNDLE", 14, startY + 3);
          startY += 7;

          // Stacked bar
          const barW = pageWidth - 28;
          const barH = 12;
          let barX = 14;
          
          // Background
          doc.setFillColor(20, 25, 40);
          doc.roundedRect(14, startY, barW, barH, 2, 2, "F");

          bundleBreakdown.forEach((b) => {
            const pct = b.totalCost / totalProjected;
            const w = barW * pct;
            if (w > 1) {
              doc.setFillColor(b.color[0], b.color[1], b.color[2]);
              doc.rect(barX, startY, Math.max(w, 2), barH, "F");
              if (w > 35) {
                doc.setFontSize(6.5);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(255, 255, 255);
                doc.text(`${b.bundle} ${(pct * 100).toFixed(0)}%`, barX + 3, startY + 7.5);
              }
            }
            barX += w;
          });
          startY += barH + 5;

          // Legend row
          let legendX = 14;
          bundleBreakdown.forEach((b) => {
            doc.setFillColor(b.color[0], b.color[1], b.color[2]);
            doc.roundedRect(legendX, startY, 5, 5, 1, 1, "F");
            doc.setFontSize(6.5);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(160, 180, 210);
            doc.text(`${b.bundle}: $${b.totalCost.toLocaleString()}`, legendX + 8, startY + 4);
            legendX += 55;
          });
          startY += 12;
        }

        // === BUNDLE TABLES ===
        bundleBreakdown.forEach((b) => {
          startY = checkPageBreak(doc, startY, 50, pageWidth);

          // Bundle header bar
          doc.setFillColor(b.color[0], b.color[1], b.color[2]);
          doc.roundedRect(14, startY, pageWidth - 28, 14, 2, 2, "F");
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(255, 255, 255);
          doc.text(`${b.bundle} Bundle`, 20, startY + 9.5);
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.text(`$${b.totalCost.toLocaleString()} projected`, pageWidth - 20, startY + 9.5, { align: "right" });
          startY += 18;

          // Column headers
          doc.setFillColor(20, 28, 45);
          doc.rect(14, startY, pageWidth - 28, 8, "F");
          doc.setFontSize(6.5);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(140, 160, 190);
          doc.text("FEATURE", 18, startY + 5.5);
          doc.text("COUNT", 95, startY + 5.5);
          doc.text("UNIT COST", 130, startY + 5.5);
          doc.text("PROJECTED", pageWidth - 18, startY + 5.5, { align: "right" });
          startY += 10;

          // Feature rows
          const maxCount = Math.max(...b.features.map(f => f.count), 1);
          b.features.forEach((f, fi) => {
            startY = checkPageBreak(doc, startY, 12, pageWidth);

            // Alternating row bg
            doc.setFillColor(fi % 2 === 0 ? 15 : 20, fi % 2 === 0 ? 18 : 25, fi % 2 === 0 ? 30 : 42);
            doc.rect(14, startY, pageWidth - 28, 10, "F");

            // Feature name
            doc.setFontSize(7);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(190, 205, 225);
            doc.text(f.name, 18, startY + 6.5);

            // Mini progress bar for count
            const barStartX = 88;
            const barMaxW = 35;
            const fillW = (f.count / maxCount) * barMaxW;
            doc.setFillColor(35, 40, 55);
            doc.roundedRect(barStartX, startY + 3, barMaxW, 4, 1, 1, "F");
            doc.setFillColor(b.color[0], b.color[1], b.color[2]);
            if (fillW > 0) doc.roundedRect(barStartX, startY + 3, Math.max(fillW, 1.5), 4, 1, 1, "F");
            
            // Count value
            doc.setFontSize(7);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(210, 220, 235);
            doc.text(f.count.toLocaleString(), barStartX + barMaxW + 3, startY + 6.5);

            // Unit cost
            doc.setFontSize(7);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(140, 155, 180);
            doc.text(`$${f.unitCost}`, 134, startY + 6.5);

            // Projected cost
            doc.setFontSize(7.5);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(b.color[0], b.color[1], b.color[2]);
            doc.text(`$${f.projected.toLocaleString()}`, pageWidth - 18, startY + 6.5, { align: "right" });

            startY += 10;
          });

          // Bundle subtotal
          doc.setFillColor(b.color[0], b.color[1], b.color[2]);
          doc.setGState(new (doc as any).GState({ opacity: 0.15 }));
          doc.rect(14, startY, pageWidth - 28, 8, "F");
          doc.setGState(new (doc as any).GState({ opacity: 1 }));
          doc.setFontSize(7);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(b.color[0], b.color[1], b.color[2]);
          doc.text(`${b.bundle} Total`, 18, startY + 5.5);
          doc.text(`$${b.totalCost.toLocaleString()}`, pageWidth - 18, startY + 5.5, { align: "right" });
          startY += 14;
        });

        drawFooter(doc, pageWidth);
      } else {
        // === STANDARD TABLE REPORT ===
        // Use autoTable with proper column sizing
        const colCount = headers.length;
        const availableWidth = pageWidth - 28;
        
        // Smart column widths: first column wider, rest equal
        const firstColWidth = Math.min(availableWidth * 0.3, 60);
        const otherColWidth = (availableWidth - firstColWidth) / (colCount - 1);
        
        const columnStyles: Record<number, { cellWidth?: number; halign?: "left" | "right" | "center" }> = {};
        columnStyles[0] = { cellWidth: firstColWidth };
        for (let i = 1; i < colCount; i++) {
          columnStyles[i] = { 
            cellWidth: otherColWidth,
            halign: i >= colCount - 3 ? "right" as const : "left" as const
          };
        }

        autoTable(doc, {
          head: [headers],
          body: rows.map((r) => r.map((c) => String(c))),
          startY,
          styles: {
            fontSize: 7.5,
            cellPadding: 3.5,
            lineColor: [35, 45, 65],
            lineWidth: 0.15,
            textColor: [190, 205, 225],
            fillColor: [15, 20, 35],
            overflow: 'linebreak',
          },
          headStyles: {
            fillColor: [25, 45, 100],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 7,
            cellPadding: 4,
          },
          alternateRowStyles: { fillColor: [20, 28, 48] },
          bodyStyles: { textColor: [180, 195, 220] },
          columnStyles,
          margin: { left: 14, right: 14 },
          tableWidth: availableWidth,
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
