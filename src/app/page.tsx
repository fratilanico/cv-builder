"use client";

import { CVProvider, useCV } from "@/context/CVContext";
import FileUpload from "@/components/FileUpload";
import CVPreview from "@/components/CVPreview";
import PDFExportButton from "@/components/PDFExportButton";

function AppContent() {
  const { cvData, error } = useCV();

  return (
    <div className="app-shell">
      {/* Header */}
      <header
        id="app-header"
        style={{
          background: "#1a1a2e",
          borderBottom: "1px solid #333355",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "14pt",
            fontWeight: 700,
            color: "#3ECF8E",
            letterSpacing: "1px",
          }}>
            CV BUILDER
          </span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "8pt",
            color: "#555",
            letterSpacing: "1px",
          }}>
            {"// APEX OS"}
          </span>
        </div>
        <PDFExportButton />
      </header>

      {/* Main Content */}
      <main className="main-shell">
        {/* Left Panel - Upload */}
        <div id="upload-panel" className="upload-panel">
          <FileUpload />

          {error && (
            <div style={{
              background: "#2a1525",
              border: "1px solid #552233",
              borderRadius: "6px",
              padding: "12px 16px",
              fontSize: "9pt",
              color: "#ff6b6b",
            }}>
              {error}
            </div>
          )}

          {/* Instructions */}
          <div style={{
            background: "#1e1e35",
            border: "1px solid #2a2a45",
            borderRadius: "8px",
            padding: "16px",
          }}>
            <h3 style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "9pt",
              fontWeight: 700,
              color: "#3ECF8E",
              letterSpacing: "1px",
              marginBottom: "12px",
            }}>
              HOW IT WORKS
            </h3>
            <div style={{ fontSize: "9pt", color: "#888", lineHeight: 1.8 }}>
              <div style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
                <span style={{ color: "#3ECF8E" }}>01</span>
                <span>Upload your CV (PDF or Word)</span>
              </div>
              <div style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
                <span style={{ color: "#3ECF8E" }}>02</span>
                <span>AI parses and structures your content</span>
              </div>
              <div style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
                <span style={{ color: "#3ECF8E" }}>03</span>
                <span>Preview your styled CV in real-time</span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ color: "#3ECF8E" }}>04</span>
                <span>Download as a professional PDF</span>
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div style={{
            background: "#1e1e35",
            border: "1px solid #2a2a45",
            borderRadius: "8px",
            padding: "16px",
          }}>
            <h3 style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "9pt",
              fontWeight: 700,
              color: "#3ECF8E",
              letterSpacing: "1px",
              marginBottom: "12px",
            }}>
              POWERED BY
            </h3>
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
            }}>
              {["Next.js", "Claude AI", "TypeScript", "Tailwind"].map((tech) => (
                <span
                  key={tech}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "7.5pt",
                    color: "#999",
                    border: "1px solid #333355",
                    borderRadius: "3px",
                    padding: "2px 8px",
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="preview-panel">
          <CVPreview cvData={cvData} />
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <CVProvider>
      <AppContent />
    </CVProvider>
  );
}
