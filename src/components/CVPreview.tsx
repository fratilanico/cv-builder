"use client";

import { sanitizeInlineMarkup } from "@/lib/sanitize-inline-markup";
import type { CVData } from "@/types/cv";

interface CVPreviewProps {
  cvData: CVData;
}

export default function CVPreview({ cvData }: CVPreviewProps) {
  const { personalDetails, summary, strategicPhilosophy, skillCategories, techTags, projects, experience, footer } = cvData;

  const hasContent = personalDetails.fullName || summary.length > 0 || experience.length > 0;

  return (
    <div
      id="cv-preview"
      style={{
        width: "210mm",
        minHeight: "297mm",
        background: "#1a1a2e",
        color: "#e0e0e0",
        fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
        fontSize: "9.5pt",
        lineHeight: "1.5",
        padding: "28mm 22mm 20mm 22mm",
        boxSizing: "border-box",
      }}
      >
      {!hasContent ? (
        <div className="preview-empty-state">
          <div className="preview-empty-state__grid" aria-hidden="true" />
          <div className="preview-empty-state__content">
            <p className="preview-empty-state__eyebrow">Preview pipeline idle</p>
            <h3 className="preview-empty-state__title">Upload a source CV to light up the final stage</h3>
            <p className="preview-empty-state__copy">
              The renderer is tuned to the Quanteam structure, with OCR fallback for scanned PDFs and secure worker-backed parsing for structured output.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* ── NAME ── */}
          {personalDetails.fullName && (
            <h1 style={{
              fontSize: "32pt",
              fontWeight: 900,
              color: "#ffffff",
              letterSpacing: "1px",
              margin: "0 0 6px 0",
              lineHeight: 1.1,
            }}>
              {personalDetails.fullName.toUpperCase()}
            </h1>
          )}

          {/* ── TITLE BAR ── */}
          {personalDetails.title && (
            <div style={{
              display: "inline-block",
              background: "#2a2a40",
              borderLeft: "3px solid #3ECF8E",
              padding: "4px 14px",
              marginBottom: "10px",
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
              fontSize: "9pt",
              fontWeight: 600,
              color: "#3ECF8E",
              letterSpacing: "1.5px",
            }}>
              {personalDetails.title.toUpperCase()}
            </div>
          )}

          {/* ── CONTACT LINE ── */}
          <div style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
            fontSize: "8.5pt",
            color: "#888",
            margin: "8px 0 6px 0",
            lineHeight: 1.6,
          }}>
            {[personalDetails.location, personalDetails.phone, personalDetails.email, personalDetails.linkedin, personalDetails.github]
              .filter(Boolean)
              .map((item, i) => (
                <span key={i}>
                  {i > 0 && <span style={{ margin: "0 10px", color: "#555" }}>{"// "}</span>}
                  {item}
                </span>
              ))}
          </div>

          {/* ── 01 PROFESSIONAL SUMMARY ── */}
          {summary.length > 0 && (
            <section style={{ marginTop: "24px" }}>
              <SectionHeader title="01_PROFESSIONAL_SUMMARY" />
              <div style={{ marginTop: "12px" }}>
                {summary.map((para, i) => (
                  <p key={i} style={{ margin: "0 0 10px 0", fontSize: "9.5pt", lineHeight: 1.6, color: "#d0d0d0" }}
                     dangerouslySetInnerHTML={{ __html: sanitizeInlineMarkup(para) }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── 02 TECHNICAL ARSENAL ── */}
          {(skillCategories.length > 0 || techTags.length > 0) && (
            <section style={{ marginTop: "24px" }}>
              <SectionHeader title="02_TECHNICAL_ARSENAL" />

              {/* Skill Cards 2x2 Grid */}
              {skillCategories.length > 0 && (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  marginTop: "14px",
                }}>
                  {skillCategories.map((cat) => (
                    <div key={cat.id} style={{
                      background: "#222240",
                      border: "1px solid #333355",
                      borderRadius: "4px",
                      padding: "14px 16px",
                    }}>
                      <div style={{
                        fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                        fontSize: "8pt",
                        fontWeight: 700,
                        color: "#3ECF8E",
                        letterSpacing: "1px",
                        marginBottom: "6px",
                      }}>
                        {cat.title.toUpperCase()}
                      </div>
                      <div style={{ fontSize: "8.5pt", color: "#b0b0b0", lineHeight: 1.5 }}>
                        {cat.items}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Strategic Philosophy */}
              {strategicPhilosophy && (
                <div style={{
                  marginTop: "16px",
                  borderLeft: "3px solid #3ECF8E",
                  padding: "12px 16px",
                  background: "#1e1e35",
                }}>
                  <div style={{
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                    fontSize: "8pt",
                    fontWeight: 700,
                    color: "#e0e0e0",
                    letterSpacing: "1px",
                    marginBottom: "8px",
                  }}>
                    STRATEGIC PHILOSOPHY
                  </div>
                  <p style={{
                    fontStyle: "italic",
                    fontSize: "9pt",
                    color: "#c0c0c0",
                    lineHeight: 1.6,
                    margin: 0,
                  }}>
                    {strategicPhilosophy}
                  </p>
                </div>
              )}

              {/* Tech Tags */}
              {techTags.length > 0 && (
                <div style={{
                  marginTop: "16px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  borderTop: "1px dashed #333355",
                  paddingTop: "14px",
                }}>
                  {techTags.map((tag, i) => (
                    <span key={i} style={{
                      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                      fontSize: "7.5pt",
                      color: "#c0c0c0",
                      border: "1px solid #444466",
                      borderRadius: "3px",
                      padding: "3px 10px",
                      letterSpacing: "0.5px",
                    }}>
                      # {tag.toUpperCase()}
                    </span>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── 03 FEATURED PROJECTS ── */}
          {projects.length > 0 && (
            <section style={{ marginTop: "24px" }}>
              <SectionHeader title="03_FEATURED_PROJECTS:_AUTONOMOUS_ARCHITECTURE" />
              {projects.map((proj) => (
                <div key={proj.id} style={{
                  marginTop: "16px",
                  background: "#1e1e35",
                  border: "1px solid #2a2a45",
                  borderRadius: "4px",
                  padding: "16px 18px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: "#3ECF8E", fontSize: "10pt" }}>&#x26A1;</span>
                      <span style={{
                        fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                        fontSize: "10pt",
                        fontWeight: 700,
                        color: "#ffffff",
                        letterSpacing: "0.5px",
                      }}>
                        {proj.name.toUpperCase()}
                      </span>
                    </div>
                    {proj.tag && (
                      <span style={{
                        fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                        fontSize: "7pt",
                        color: "#888",
                        border: "1px solid #333355",
                        borderRadius: "3px",
                        padding: "2px 8px",
                        letterSpacing: "1px",
                      }}>
                        {proj.tag.toUpperCase()}
                      </span>
                    )}
                  </div>
                  {proj.bullets.map((bullet, i) => (
                    <BulletPoint key={i} label={bullet.label} text={bullet.text} />
                  ))}
                </div>
              ))}
            </section>
          )}

          {/* ── 04 PROFESSIONAL EXPERIENCE ── */}
          {experience.length > 0 && (
            <section style={{ marginTop: "24px" }}>
              <SectionHeader title="04_PROFESSIONAL_EXPERIENCE" />
              {experience.map((exp) => (
                <div key={exp.id} style={{ marginTop: "18px" }}>
                  {/* Company Name */}
                  <h3 style={{
                    fontSize: "13pt",
                    fontWeight: 700,
                    color: "#ffffff",
                    margin: "0 0 4px 0",
                  }}>
                    {exp.company}
                  </h3>
                  {/* Role + Date */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "10px" }}>
                    <span style={{
                      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                      fontSize: "8.5pt",
                      color: "#3ECF8E",
                    }}>
                      {exp.role}{exp.type ? ` (${exp.type})` : ""}
                    </span>
                    <span style={{
                      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                      fontSize: "8pt",
                      color: "#888",
                      whiteSpace: "nowrap",
                    }}>
                      {exp.startDate}{exp.startDate && exp.endDate ? " – " : ""}{exp.endDate}
                    </span>
                  </div>

                  {/* Direct bullets (no sub-roles) */}
                  {exp.bullets.map((bullet, i) => (
                    <BulletPoint key={i} label={bullet.label} text={bullet.text} />
                  ))}

                  {/* Sub-roles */}
                  {exp.subRoles.map((sub, si) => (
                    <div key={si} style={{ marginTop: "12px" }}>
                      <div style={{
                        fontSize: "9.5pt",
                        fontWeight: 700,
                        color: "#e0e0e0",
                        borderBottom: "1px solid #2a2a45",
                        paddingBottom: "3px",
                        marginBottom: "8px",
                      }}>
                        {sub.title}
                      </div>
                      {sub.bullets.map((bullet, i) => (
                        <BulletPoint key={i} label={bullet.label} text={bullet.text} />
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </section>
          )}

          {/* ── FOOTER: EDUCATION / CERTS / AWARDS ── */}
          {footer.length > 0 && (
            <section style={{ marginTop: "28px", borderTop: "1.5px solid #333355", paddingTop: "16px" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: `repeat(${footer.length}, 1fr)`,
                gap: "16px",
              }}>
                {footer.map((col, i) => (
                  <div key={i} style={{
                    borderLeft: i > 0 ? "1px solid #333355" : "none",
                    paddingLeft: i > 0 ? "16px" : "0",
                  }}>
                    <div style={{
                      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                      fontSize: "8pt",
                      fontWeight: 700,
                      color: "#3ECF8E",
                      letterSpacing: "1px",
                      marginBottom: "6px",
                    }}>
                      {col.heading.toUpperCase()}
                    </div>
                    {col.lines.map((line, li) => (
                      <div key={li} style={{
                        fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                        fontSize: "8.5pt",
                        color: "#b0b0b0",
                        lineHeight: 1.6,
                      }}>
                        {line}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

/* ── Section Header with underline ── */
function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
      fontSize: "10pt",
      fontWeight: 700,
      color: "#e0e0e0",
      letterSpacing: "2px",
      paddingBottom: "6px",
      borderBottom: "1px solid #444466",
      display: "flex",
      alignItems: "center",
      gap: "12px",
    }}>
      <span>{title}</span>
      <span style={{ flex: 1, height: "1px", background: "#444466" }} />
    </div>
  );
}

/* ── Arrow Bullet ── */
function BulletPoint({ label, text }: { label: string; text: string }) {
  return (
    <div style={{
      display: "flex",
      gap: "8px",
      marginBottom: "6px",
      paddingLeft: "4px",
    }}>
      <span style={{ color: "#888", flexShrink: 0, fontSize: "9pt" }}>&#x2192;</span>
      <div style={{ fontSize: "9pt", lineHeight: 1.55, color: "#c8c8c8" }}>
        {label && (
          <span style={{ fontWeight: 700, color: "#e0e0e0" }}>{label} </span>
        )}
        <span dangerouslySetInnerHTML={{ __html: sanitizeInlineMarkup(text) }} />
      </div>
    </div>
  );
}
