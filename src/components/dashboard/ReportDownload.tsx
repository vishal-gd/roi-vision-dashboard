import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface AccountInventorySection {
  accountName: string;
  provider: string;
  providerColor: number[];
  totalInventory: number;
  categories: { category: string; count: number; percentage: number }[];
  features: { label: string; bundle: string; value: number }[];
}

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
  accountInventorySections?: AccountInventorySection[];
}

export function ReportDownload({ title, headers, rows, filename, subtitle, summaryRows, bundleBreakdown, accountInventorySections }: ReportDownloadProps) {
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

  const BUNDLE_REPORT_COLORS: Record<string, number[]> = {
    FinOps: [59, 130, 246],
    CloudOps: [34, 197, 94],
    SecOps: [239, 68, 68],
    Core: [139, 92, 246],
  };

  const drawAccountInventorySections = (doc: jsPDF, pageWidth: number, startY: number): number => {
    if (!accountInventorySections || accountInventorySections.length === 0) return startY;

    // Section title
    startY = checkPageBreak(doc, startY, 30, pageWidth);
    doc.setFillColor(15, 22, 40);
    doc.roundedRect(14, startY, pageWidth - 28, 12, 2, 2, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(59, 130, 246);
    doc.text("TOP CLOUD ACCOUNTS — INVENTORY DETAILS", 20, startY + 8);
    startY += 18;

    accountInventorySections.forEach((section, sIdx) => {
      startY = checkPageBreak(doc, startY, 80, pageWidth);

      // Account header bar
      const pc = section.providerColor;
      doc.setFillColor(pc[0], pc[1], pc[2]);
      doc.roundedRect(14, startY, pageWidth - 28, 16, 2, 2, "F");
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      const displayName = section.accountName.length > 55 ? section.accountName.slice(0, 53) + "…" : section.accountName;
      doc.text(`#${sIdx + 1}  ${displayName}`, 20, startY + 7);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text(`${section.provider}  ·  ${section.totalInventory.toLocaleString()} resources  ·  ${section.categories.length} categories`, 20, startY + 13);
      startY += 20;

      // Inventory category table
      if (section.categories.length > 0) {
        // Column headers
        doc.setFillColor(20, 28, 45);
        doc.rect(14, startY, pageWidth - 28, 8, "F");
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(140, 160, 190);
        doc.text("PRODUCT CATEGORY", 18, startY + 5.5);
        doc.text("COUNT", 105, startY + 5.5);
        doc.text("SHARE", pageWidth - 18, startY + 5.5, { align: "right" });
        // Progress bar header
        doc.text("DISTRIBUTION", 130, startY + 5.5);
        startY += 10;

        const maxCatCount = Math.max(...section.categories.map(c => c.count), 1);
        section.categories.forEach((cat, ci) => {
          startY = checkPageBreak(doc, startY, 10, pageWidth);
          doc.setFillColor(ci % 2 === 0 ? 15 : 20, ci % 2 === 0 ? 18 : 25, ci % 2 === 0 ? 30 : 42);
          doc.rect(14, startY, pageWidth - 28, 9, "F");

          // Color dot
          const dotColor = accentColors[ci % accentColors.length];
          doc.setFillColor(dotColor[0], dotColor[1], dotColor[2]);
          doc.circle(20, startY + 4.5, 1.5, "F");

          doc.setFontSize(7);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(190, 205, 225);
          doc.text(cat.category, 25, startY + 6);

          doc.setFont("helvetica", "bold");
          doc.setTextColor(210, 220, 235);
          doc.text(cat.count.toLocaleString(), 105, startY + 6);

          // Mini progress bar
          const barX = 130;
          const barW = 40;
          const fillW = (cat.count / maxCatCount) * barW;
          doc.setFillColor(35, 40, 55);
          doc.roundedRect(barX, startY + 2.5, barW, 4, 1, 1, "F");
          doc.setFillColor(pc[0], pc[1], pc[2]);
          if (fillW > 0) doc.roundedRect(barX, startY + 2.5, Math.max(fillW, 1.5), 4, 1, 1, "F");

          doc.setFontSize(6.5);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(140, 155, 180);
          doc.text(`${cat.percentage}%`, pageWidth - 18, startY + 6, { align: "right" });

          startY += 9;
        });

        // Category total
        doc.setFillColor(pc[0], pc[1], pc[2]);
        doc.setGState(new (doc as any).GState({ opacity: 0.12 }));
        doc.rect(14, startY, pageWidth - 28, 8, "F");
        doc.setGState(new (doc as any).GState({ opacity: 1 }));
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(pc[0], pc[1], pc[2]);
        doc.text("Total Resources", 18, startY + 5.5);
        doc.text(section.totalInventory.toLocaleString(), 105, startY + 5.5);
        doc.text("100%", pageWidth - 18, startY + 5.5, { align: "right" });
        startY += 12;
      }

      // Feature details by bundle
      if (section.features.length > 0) {
        startY = checkPageBreak(doc, startY, 20, pageWidth);
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(160, 180, 210);
        doc.text("FEATURE DETAILS", 18, startY + 3);
        startY += 7;

        // Group features by bundle
        const byBundle: Record<string, typeof section.features> = {};
        section.features.forEach(f => {
          if (!byBundle[f.bundle]) byBundle[f.bundle] = [];
          byBundle[f.bundle].push(f);
        });

        Object.entries(byBundle).forEach(([bundle, features]) => {
          startY = checkPageBreak(doc, startY, 15, pageWidth);
          const bColor = BUNDLE_REPORT_COLORS[bundle] || [100, 100, 100];
          
          // Bundle label
          doc.setFillColor(bColor[0], bColor[1], bColor[2]);
          doc.roundedRect(18, startY, 3, 6, 0.5, 0.5, "F");
          doc.setFontSize(6.5);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(bColor[0], bColor[1], bColor[2]);
          doc.text(bundle, 24, startY + 4.5);

          // Features inline
          let fX = 50;
          features.forEach(f => {
            if (fX + 45 > pageWidth - 14) {
              startY += 8;
              fX = 50;
              startY = checkPageBreak(doc, startY, 10, pageWidth);
            }
            doc.setFontSize(6);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(160, 175, 200);
            doc.text(f.label, fX, startY + 4.5);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(220, 230, 245);
            doc.text(String(f.value.toLocaleString()), fX + 32, startY + 4.5);
            fX += 45;
          });
          startY += 10;
        });
      }

      // Separator between accounts
      if (sIdx < accountInventorySections.length - 1) {
        startY += 2;
        doc.setDrawColor(40, 50, 70);
        doc.setLineWidth(0.3);
        doc.line(14, startY, pageWidth - 14, startY);
        startY += 6;
      }
    });

    return startY;
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

          const barW = pageWidth - 28;
          const barH = 12;
          let barX = 14;
          
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

          const maxCount = Math.max(...b.features.map(f => f.count), 1);
          b.features.forEach((f, fi) => {
            startY = checkPageBreak(doc, startY, 12, pageWidth);

            doc.setFillColor(fi % 2 === 0 ? 15 : 20, fi % 2 === 0 ? 18 : 25, fi % 2 === 0 ? 30 : 42);
            doc.rect(14, startY, pageWidth - 28, 10, "F");

            doc.setFontSize(7);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(190, 205, 225);
            doc.text(f.name, 18, startY + 6.5);

            const barStartX = 88;
            const barMaxW = 35;
            const fillW = (f.count / maxCount) * barMaxW;
            doc.setFillColor(35, 40, 55);
            doc.roundedRect(barStartX, startY + 3, barMaxW, 4, 1, 1, "F");
            doc.setFillColor(b.color[0], b.color[1], b.color[2]);
            if (fillW > 0) doc.roundedRect(barStartX, startY + 3, Math.max(fillW, 1.5), 4, 1, 1, "F");
            
            doc.setFontSize(7);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(210, 220, 235);
            doc.text(f.count.toLocaleString(), barStartX + barMaxW + 3, startY + 6.5);

            doc.setFontSize(7);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(140, 155, 180);
            doc.text(`$${f.unitCost}`, 134, startY + 6.5);

            doc.setFontSize(7.5);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(b.color[0], b.color[1], b.color[2]);
            doc.text(`$${f.projected.toLocaleString()}`, pageWidth - 18, startY + 6.5, { align: "right" });

            startY += 10;
          });

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
        const colCount = headers.length;
        const availableWidth = pageWidth - 28;
        
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

        // Draw account inventory sections after main table
        const finalY = (doc as any).lastAutoTable?.finalY || startY + 20;
        startY = finalY + 10;
        startY = drawAccountInventorySections(doc, pageWidth, startY);
        
        if (!accountInventorySections || accountInventorySections.length === 0) {
          drawFooter(doc, pageWidth);
        } else {
          drawFooter(doc, pageWidth);
        }
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
