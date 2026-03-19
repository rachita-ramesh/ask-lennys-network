"use client";
import { useState } from "react";
import { usePRDReview } from "@/hooks/usePRDReview";
import PRDUploader from "./PRDUploader";
import PRDExpertBar from "./PRDExpertBar";
import PRDViewer from "./PRDViewer";
import PRDCommentsPanel from "./PRDCommentsPanel";

export default function PRDReviewLayout() {
  const {
    phase,
    parsedPRD,
    experts,
    allComments,
    activeSectionId,
    error,
    replyStreaming,
    uploadAndReview,
    replyToComment,
    setActiveSectionId,
    reset,
  } = usePRDReview();

  const [expertFilter, setExpertFilter] = useState<string | null>(null);

  const isLoading =
    phase === "uploading" || phase === "parsing" || phase === "selecting";

  // Idle state — show uploader
  if (phase === "idle" || isLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flex: 1,
          padding: "0 2rem",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "4rem", marginTop: "0" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#D45D48",
              marginBottom: "1.5rem",
              display: "block",
            }}
          >
            PRD Review
          </span>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(3.5rem, 6vw, 5.5rem)",
              fontWeight: 400,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              color: "#2A3122",
              marginBottom: "1.5rem",
            }}
          >
            <i style={{ fontStyle: "italic", paddingRight: "0.1em" }}>Sharpen</i> Your PRD
          </h1>
          <p
            style={{
              fontSize: "1.125rem",
              color: "#5F6854",
              fontFamily: "var(--font-sans)",
              maxWidth: "500px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Upload your product requirements document and get specific,
            actionable feedback from world-class product leaders.
          </p>
        </div>

        <PRDUploader onUpload={uploadAndReview} isLoading={isLoading} />

        {isLoading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <svg
              className="animate-spin"
              style={{ width: "20px", height: "20px", color: "#5F6854" }}
              viewBox="0 0 24 24"
            >
              <circle
                style={{ opacity: 0.25 }}
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                style={{ opacity: 0.75 }}
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#5F6854",
              }}
            >
              {phase === "parsing"
                ? "Reading your document..."
                : phase === "selecting"
                ? "Finding the best reviewers..."
                : "Uploading..."}
            </span>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "1rem 1.5rem",
              border: "1px solid rgba(212, 93, 72, 0.3)",
              borderRadius: "8px",
              background: "rgba(212, 93, 72, 0.05)",
              color: "#D45D48",
              fontSize: "0.9rem",
              maxWidth: "500px",
            }}
          >
            {error}
          </div>
        )}
      </div>
    );
  }

  // Reviewing / done — show the split layout
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
      }}
    >
      {/* Expert bar + reset button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.5rem",
          flexShrink: 0,
          borderBottom: "1px solid rgba(42, 49, 34, 0.08)",
        }}
      >
        <PRDExpertBar
          experts={experts}
          activeFilter={expertFilter}
          onFilter={setExpertFilter}
        />
        <button
          onClick={reset}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#5F6854",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.5rem",
          }}
        >
          New Review
        </button>
      </div>

      {/* Split pane: document left, comments right */}
      <div
        style={{
          display: "flex",
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Left: PRD document */}
        {parsedPRD && (
          <PRDViewer
            title={parsedPRD.title}
            sections={parsedPRD.sections}
            comments={allComments}
            activeSectionId={activeSectionId}
            onSectionClick={(id) =>
              setActiveSectionId(activeSectionId === id ? null : id)
            }
          />
        )}

        {/* Divider */}
        <div
          style={{
            width: "1px",
            background: "rgba(42, 49, 34, 0.1)",
            flexShrink: 0,
          }}
        />

        {/* Right: Comments */}
        {parsedPRD && (
          <div
            style={{
              width: "420px",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            <PRDCommentsPanel
              sections={parsedPRD.sections}
              comments={allComments}
              activeSectionId={activeSectionId}
              expertFilter={expertFilter}
              onReply={replyToComment}
              replyStreamingId={replyStreaming}
            />
          </div>
        )}
      </div>
    </div>
  );
}
