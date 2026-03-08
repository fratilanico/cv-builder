"use client";

import { useState } from "react";
import { useCV } from "@/context/CVContext";

export default function PDFExportButton() {
  const [isExporting, setIsExporting] = useState(false);
  const { cvData } = useCV();

  const hasContent = cvData.personalDetails.fullName || cvData.experience.length > 0;

  const handleExport = async () => {
    if (!hasContent) return;
    setIsExporting(true);
    try {
      const element = document.getElementById("cv-preview");
      if (!element) return;

      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");

      // Measure the full scrollable height
      const fullHeight = element.scrollHeight;
      const fullWidth = element.scrollWidth;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: fullWidth,
        height: fullHeight,
        windowWidth: fullWidth,
        windowHeight: fullHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Scale to fit width
      const ratio = pdfWidth / imgWidth;
      const scaledHeight = imgHeight * ratio;

      // Multi-page support
      let position = 0;
      let page = 0;

      while (position < scaledHeight) {
        if (page > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, "PNG", 0, -position, pdfWidth, scaledHeight);
        position += pdfHeight;
        page++;
      }

      const fileName = cvData.personalDetails.fullName
        ? `${cvData.personalDetails.fullName.replace(/\s+/g, "_")}_CV.pdf`
        : "CV.pdf";

      pdf.save(fileName);
    } catch (error) {
      console.error("PDF export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting || !hasContent}
      className="export-button"
      aria-label={isExporting ? "Generating PDF" : "Download PDF"}
    >
      {isExporting ? "GENERATING..." : "DOWNLOAD PDF"}
    </button>
  );
}
