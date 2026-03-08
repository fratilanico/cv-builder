"use client";

import FileUpload from "@/components/FileUpload";
import CVPreview from "@/components/CVPreview";
import PDFExportButton from "@/components/PDFExportButton";
import ProviderSettings from "@/components/ProviderSettings";
import { CVProvider, useCV } from "@/context/CVContext";

function AppContent() {
  const { cvData, error, isLoading, setProviderSettings } = useCV();

  const hasContent = Boolean(
    cvData.personalDetails.fullName ||
      cvData.summary.length ||
      cvData.projects.length ||
      cvData.experience.length,
  );

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header id="app-header" className="topbar">
        <div className="topbar__inner">
          <div className="brand-lockup">
            <div>
              <p className="brand-eyebrow">Apex OS // Editorial Cyber Terminal</p>
              <div className="brand-row">
                <span className="brand-mark">CV BUILDER</span>
                <span className="brand-slash">{"//"}</span>
                <span className="brand-meta">Quanteam Template Runtime</span>
              </div>
            </div>

            <div className="status-strip" aria-label="System status">
              <span className="status-pill">Provider adapter</span>
              <span className="status-pill">OCR fallback</span>
              <span className="status-pill">PDF export</span>
            </div>
          </div>

          <div className="topbar__actions">
            <div className="signal-card" aria-live="polite">
              <span className="signal-card__label">Pipeline</span>
              <span className="signal-card__value">
                {isLoading ? "Parsing live..." : hasContent ? "Preview ready" : "Awaiting file"}
              </span>
            </div>
            <PDFExportButton />
          </div>
        </div>
      </header>

      <main id="main-content" className="main-shell">
        <aside id="upload-panel" className="upload-panel">
          <section className="control-card control-card--hero">
            <p className="panel-kicker">Parser workflow</p>
              <h1 className="panel-title">Upload once. Parse through your chosen provider. Ship a polished CV.</h1>
            <p className="panel-copy">
              This builder is tuned to your dark Quanteam structure. It accepts raw Word or PDF input,
              extracts content, normalizes the response, and stages the final document for export.
            </p>
            <FileUpload />
          </section>

          <ProviderSettings onSettingsChange={setProviderSettings} />

          {error && (
            <div className="alert-card" role="alert" aria-live="polite">
              <span className="alert-card__eyebrow">Parse issue</span>
              <p className="alert-card__message">{error}</p>
            </div>
          )}

          <section className="control-card">
            <div className="control-card__header">
              <p className="panel-kicker">Execution flow</p>
              <h2 className="section-title">How it works</h2>
            </div>
            <ol className="process-list">
              <li>
                <span>01</span>
                <div>
                  <strong>Ingest the source CV</strong>
                  <p>Drop in a `.pdf` or `.docx` from local disk.</p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <strong>Parse with your stack</strong>
                  <p>OCR fallback handles scanned pages before your configured provider structures the content.</p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <strong>Stage the preview</strong>
                  <p>The Quanteam renderer maps everything into the fixed editorial format.</p>
                </div>
              </li>
              <li>
                <span>04</span>
                <div>
                  <strong>Export the output</strong>
                  <p>Download the final document as a production-ready PDF.</p>
                </div>
              </li>
            </ol>
          </section>

          <section className="control-card control-card--compact-grid">
            <div className="control-card__header">
              <p className="panel-kicker">Signal stack</p>
              <h2 className="section-title">Powered by</h2>
            </div>
            <div className="chip-grid">
              {[
                "Next.js App Router",
                "Provider adapter layer",
                "Swift OCR fallback",
                "TypeScript",
                "HTML to PDF export",
                "Fixed CV schema",
              ].map((tech) => (
                <span key={tech} className="info-chip">
                  {tech}
                </span>
              ))}
            </div>
          </section>

          <section className="control-card control-card--compact-grid">
            <div className="control-card__header">
              <p className="panel-kicker">Quality bar</p>
              <h2 className="section-title">UX promises</h2>
            </div>
            <ul className="promise-list">
              <li>Keyboard-friendly controls</li>
              <li>Responsive control deck on mobile</li>
              <li>Clear live parsing states</li>
              <li>Premium empty stage before upload</li>
            </ul>
          </section>
        </aside>

        <section className="preview-panel" aria-label="CV preview stage">
          <div className="preview-shell">
            <div className="preview-shell__header">
              <div>
                <p className="panel-kicker">Preview stage</p>
                <h2 className="section-title">Rendered Quanteam output</h2>
              </div>
              <div className="preview-shell__stats">
                <span>{hasContent ? "Live data mapped" : "Waiting for content"}</span>
                <span>{cvData.projects.length} projects</span>
                <span>{cvData.experience.length} roles</span>
              </div>
            </div>

            <div className="preview-stage-frame">
              <div className="preview-stage-frame__glow" aria-hidden="true" />
              <CVPreview cvData={cvData} />
            </div>
          </div>
        </section>
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
