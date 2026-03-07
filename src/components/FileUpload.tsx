"use client";

import { useRef, useState } from "react";
import { useCV } from "@/context/CVContext";

export default function FileUpload() {
  const { setCvData, setIsLoading, setError, isLoading } = useCV();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const processFile = async (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(file.type)) {
      setError("Please upload a PDF (.pdf) or Word (.docx) file.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/parse-cv", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to parse CV");
      }

      const data = await response.json();
      setCvData(data.cvData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process file");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      style={{
        border: `2px dashed ${dragActive ? "#3ECF8E" : "#333355"}`,
        borderRadius: "8px",
        padding: "32px 24px",
        textAlign: "center",
        cursor: isLoading ? "wait" : "pointer",
        background: dragActive ? "rgba(62, 207, 142, 0.05)" : "#1e1e35",
        transition: "all 0.2s ease",
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={handleChange}
        style={{ display: "none" }}
      />

      {isLoading ? (
        <div>
          <div style={{
            width: "32px",
            height: "32px",
            border: "3px solid #333355",
            borderTop: "3px solid #3ECF8E",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 12px",
          }} />
          <p style={{ color: "#3ECF8E", fontSize: "11pt", fontWeight: 600 }}>
            Processing {fileName}...
          </p>
          <p style={{ color: "#666", fontSize: "9pt", marginTop: "4px" }}>
            Parsing document and structuring CV data
          </p>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: "28pt", marginBottom: "8px" }}>
            <span style={{ color: "#3ECF8E" }}>&#x2191;</span>
          </div>
          <p style={{ color: "#e0e0e0", fontSize: "11pt", fontWeight: 600, marginBottom: "4px" }}>
            {fileName ? `Loaded: ${fileName}` : "Drop your CV here"}
          </p>
          <p style={{ color: "#666", fontSize: "9pt" }}>
            Supports PDF and Word (.docx) files
          </p>
        </div>
      )}
    </div>
  );
}
