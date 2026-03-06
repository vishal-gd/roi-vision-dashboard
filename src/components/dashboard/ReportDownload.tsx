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
}

export function ReportDownload({ title, headers, rows, filename }: ReportDownloadProps) {
  const [downloading, setDownloading] = useState(false);

  const downloadPDF = () => {
    setDownloading(true);
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(title, 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);

      autoTable(doc, {
        head: [headers],
        body: rows.map((r) => r.map((c) => String(c))),
        startY: 35,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
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
