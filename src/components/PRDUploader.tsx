"use client";
import { useState, useRef, DragEvent } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";

interface Props {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export default function PRDUploader({ onUpload, isLoading }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const handleFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf" && ext !== "docx") {
      alert("Please upload a PDF or DOCX file.");
      return;
    }
    onUpload(file);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setDragging(false)}
      onClick={() => inputRef.current?.click()}
      style={{
        border: `2px dashed ${dragging ? "#D45D48" : "rgba(42, 49, 34, 0.2)"}`,
        borderRadius: isMobile ? "16px" : "24px",
        padding: isMobile ? "1.5rem 1.25rem" : "4rem 2rem",
        textAlign: "center",
        cursor: isLoading ? "not-allowed" : "pointer",
        background: dragging
          ? "rgba(212, 93, 72, 0.04)"
          : "rgba(255, 255, 255, 0.2)",
        transition: "all 0.3s ease",
        maxWidth: "600px",
        margin: "0 auto",
        opacity: isLoading ? 0.6 : 1,
        width: "100%",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        disabled={isLoading}
      />

      <svg
        width={isMobile ? 32 : 48}
        height={isMobile ? 32 : 48}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#5F6854"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ margin: isMobile ? "0 auto 0.75rem" : "0 auto 1.5rem", opacity: 0.5 }}
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <line x1="9" y1="15" x2="12" y2="12" />
        <line x1="15" y1="15" x2="12" y2="12" />
      </svg>

      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: isMobile ? "1.1rem" : "1.5rem",
          color: "#2A3122",
          marginBottom: isMobile ? "0.375rem" : "0.75rem",
          fontWeight: 400,
        }}
      >
        {isMobile ? "Tap to upload your PRD" : "Drop your PRD here"}
      </p>
      <p
        style={{
          fontSize: isMobile ? "0.8rem" : "0.9rem",
          color: "#5F6854",
          marginBottom: isMobile ? "0.75rem" : "1.5rem",
        }}
      >
        {isMobile ? "Supports PDF and DOCX." : "or click to browse. Supports PDF and DOCX."}
      </p>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: isMobile ? "0.6rem" : "0.7rem",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "#D45D48",
        }}
      >
        {isLoading ? "Processing..." : "Upload & Get Expert Feedback"}
      </span>
    </div>
  );
}
