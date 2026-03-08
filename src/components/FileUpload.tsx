"use client";

import { useRef, useState } from "react";
import { useCV } from "@/context/CVContext";

export default function FileUpload() {
  const { setCvData, setIsLoading, setError, isLoading, providerSettings } = useCV();
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
      formData.append("providerSettings", JSON.stringify(providerSettings));

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
      className={`upload-dropzone${dragActive ? " is-drag-active" : ""}${isLoading ? " is-loading" : ""}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="upload-dropzone__grid" aria-hidden="true" />

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={handleChange}
        className="sr-only"
        aria-label="Upload a PDF or Word CV"
      />

      {isLoading ? (
        <div className="upload-dropzone__content" aria-live="polite">
          <div className="upload-spinner" aria-hidden="true" />
          <p className="upload-dropzone__eyebrow">Runtime active</p>
          <p className="upload-dropzone__title">Processing {fileName}…</p>
            <p className="upload-dropzone__copy">
              Running OCR fallback where needed, then mapping the document through the configured parser.
            </p>
        </div>
      ) : (
        <div className="upload-dropzone__content">
          <div className="upload-glyph" aria-hidden="true">
            <span />
          </div>
          <p className="upload-dropzone__eyebrow">Source document</p>
          <p className="upload-dropzone__title">
            {fileName ? `Loaded: ${fileName}` : "Drop your CV here"}
          </p>
          <p className="upload-dropzone__copy">
            Supports PDF and Word (`.docx`) files. Drag and drop, or launch the file picker.
          </p>
          <button
            type="button"
            className="upload-trigger"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose file
          </button>
            <div className="upload-dropzone__meta" aria-hidden="true">
              <span>Quanteam structure locked</span>
              <span>{providerSettings.provider}</span>
              <span>OCR-ready</span>
            </div>
        </div>
      )}
    </div>
  );
}
