"use client";
import { useState, useEffect } from "react";
import { usePRDReview } from "@/hooks/usePRDReview";
import PRDUploader from "./PRDUploader";
import PRDExpertBar from "./PRDExpertBar";
import PRDViewer from "./PRDViewer";
import PRDCommentsPanel from "./PRDCommentsPanel";
import ApiKeyForm from "./ApiKeyForm";
import { useIsMobile } from "@/hooks/useIsMobile";

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
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const [mobileTab, setMobileTab] = useState<"document" | "comments">("document");
  const isMobile = useIsMobile();

  const isLoading =
    phase === "uploading" || phase === "parsing" || phase === "selecting";

  // Detect quota exceeded error
  const isQuotaError = error?.includes("free reviews") || error?.includes("API key");
  const showApiKeyModal = phase === "idle" && (needsApiKey || isQuotaError);

  // Loading state — animated visuals
  if (isLoading) {
    return <PRDLoadingView phase={phase} />;
  }

  // Idle state — show uploader
  if (phase === "idle") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: isMobile ? "center" : undefined,
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          padding: isMobile ? "0 1rem" : "0 2rem",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: isMobile ? "1.5rem" : "4rem", marginTop: "0" }}>
          {!isMobile && (
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
          )}
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: isMobile ? "2.25rem" : "clamp(3.5rem, 6vw, 5.5rem)",
              fontWeight: 400,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              color: "#2A3122",
              marginBottom: isMobile ? "0.75rem" : "1.5rem",
            }}
          >
            <i style={{ fontStyle: "italic", paddingRight: "0.1em" }}>Sharpen</i> Your PRD
          </h1>
          <p
            style={{
              fontSize: isMobile ? "0.9rem" : "1.125rem",
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

        <PRDUploader onUpload={uploadAndReview} isLoading={false} />

        {error && !isQuotaError && (
          <div
            style={{
              padding: "1rem 1.5rem",
              border: "1px solid rgba(212, 93, 72, 0.3)",
              borderRadius: "8px",
              background: "rgba(212, 93, 72, 0.05)",
              color: "#D45D48",
              fontSize: "0.9rem",
              maxWidth: "500px",
              marginTop: "2rem",
            }}
          >
            {error}
          </div>
        )}

        {showApiKeyModal && <ApiKeyModal onSuccess={() => { setNeedsApiKey(false); reset(); }} />}
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
          padding: isMobile ? "0 0.75rem" : "0 1.5rem",
          flexShrink: 0,
          borderBottom: "1px solid rgba(42, 49, 34, 0.08)",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <PRDExpertBar
            experts={experts}
            activeFilter={expertFilter}
            onFilter={setExpertFilter}
          />
        </div>
        <button
          onClick={reset}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: isMobile ? "0.65rem" : "0.8rem",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "#5F6854",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.5rem",
            whiteSpace: "nowrap",
          }}
        >
          New Review
        </button>
      </div>

      {/* Mobile: Tab bar */}
      {isMobile && (
        <div style={{
          display: "flex",
          flexShrink: 0,
          borderBottom: "1px solid rgba(42, 49, 34, 0.08)",
        }}>
          {(["document", "comments"] as const).map((tab) => {
            const isActive = mobileTab === tab;
            const visibleComments = allComments.filter(c =>
              c.parentId === null &&
              (!activeSectionId || c.sectionId === activeSectionId)
            );
            const label = tab === "document" ? "Document" : `Comments (${visibleComments.length})`;
            return (
              <button
                key={tab}
                onClick={() => setMobileTab(tab)}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: isActive ? "#D45D48" : "#5F6854",
                  background: "none",
                  border: "none",
                  borderBottom: isActive ? "2px solid #D45D48" : "2px solid transparent",
                  cursor: "pointer",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Content area */}
      {isMobile ? (
        /* Mobile: show one tab at a time */
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          {parsedPRD && mobileTab === "document" && (
            <PRDViewer
              title={parsedPRD.title}
              sections={parsedPRD.sections}
              comments={allComments}
              images={parsedPRD.images || []}
              activeSectionId={activeSectionId}
              onSectionClick={(id) =>
                setActiveSectionId(activeSectionId === id ? null : id)
              }
            />
          )}
          {parsedPRD && mobileTab === "comments" && (
            <PRDCommentsPanel
              sections={parsedPRD.sections}
              comments={allComments}
              activeSectionId={activeSectionId}
              expertFilter={expertFilter}
              onReply={replyToComment}
              replyStreamingId={replyStreaming}
            />
          )}
        </div>
      ) : (
        /* Desktop: split pane */
        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          {parsedPRD && (
            <PRDViewer
              title={parsedPRD.title}
              sections={parsedPRD.sections}
              comments={allComments}
              images={parsedPRD.images || []}
              activeSectionId={activeSectionId}
              onSectionClick={(id) =>
                setActiveSectionId(activeSectionId === id ? null : id)
              }
            />
          )}
          <div style={{ width: "1px", background: "rgba(42, 49, 34, 0.1)", flexShrink: 0 }} />
          {parsedPRD && (
            <div style={{ width: "420px", flexShrink: 0, display: "flex", flexDirection: "column", minHeight: 0 }}>
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
      )}
    </div>
  );
}

/* ── API Key Modal ── */

function ApiKeyModal({ onSuccess }: { onSuccess: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Blurred backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          background: "rgba(234, 232, 223, 0.7)",
        }}
      />
      {/* Modal content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <ApiKeyForm onSuccess={onSuccess} />
      </div>
    </div>
  );
}

/* ── Animated loading view ── */

function PRDLoadingView({ phase }: { phase: string }) {
  const isMobile = useIsMobile();
  const [nodesVisible, setNodesVisible] = useState(false);

  const currentStage = phase === "uploading" ? 1 : phase === "parsing" ? 2 : 3;

  useEffect(() => {
    if (currentStage === 3) {
      const t = setTimeout(() => setNodesVisible(true), 100);
      return () => clearTimeout(t);
    } else {
      setNodesVisible(false);
    }
  }, [currentStage]);

  const steps = [
    { index: 1, label: "Uploading your product spec" },
    { index: 2, label: "Reading and understanding your PRD" },
    { index: 3, label: "Finding the best expert reviewers" },
  ];

  const nodePositions = [
    { id: 1, top: "76px", left: "96px", width: "48px", height: "48px", delay: "400ms", name: "SJ" },
    { id: 2, top: "66px", right: "76px", width: "56px", height: "56px", delay: "600ms", name: "DC" },
    { id: 3, bottom: "96px", right: "56px", width: "48px", height: "48px", delay: "800ms", name: "EM" },
    { id: 4, bottom: "106px", left: "66px", width: "40px", height: "40px", delay: "1100ms", name: "MR" },
  ];

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Visual area */}
      <div style={{ position: "relative", width: "100%", maxWidth: isMobile ? "100%" : "672px", height: isMobile ? "250px" : "400px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: isMobile ? "1.5rem" : "4rem", overflow: "hidden" }}>

        {/* Stage 1 — Document Scan */}
        <div className={currentStage === 1 ? "stage-active" : "stage-inactive"} style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transition: "all 0.7s ease-in-out" }}>
          <div style={{ position: "absolute", width: "300px", height: "300px", background: "rgba(232, 227, 218, 0.3)", borderRadius: "50%", filter: "blur(48px)" }} />
          <div style={{ position: "relative", zIndex: 10, animation: "float 4s ease-in-out infinite" }}>
            <div style={{ width: "192px", height: "240px", background: "#fff", borderRadius: "12px", boxShadow: "0 25px 50px -12px rgba(212,93,72,0.1)", border: "1px solid #E8E3DA", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", padding: "1.5rem", gap: "1rem" }}>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", borderBottom: "1px solid #E8E3DA", paddingBottom: "1rem" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "6px", background: "rgba(236,168,154,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#D45D48" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
                  <div style={{ height: "10px", width: "100%", background: "#E8E3DA", borderRadius: "100px" }} />
                  <div style={{ height: "8px", width: "66%", background: "#E8E3DA", borderRadius: "100px", opacity: 0.6 }} />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
                <div style={{ height: "8px", width: "100%", background: "#E8E3DA", borderRadius: "100px" }} />
                <div style={{ height: "8px", width: "100%", background: "#E8E3DA", borderRadius: "100px" }} />
                <div style={{ height: "8px", width: "83%", background: "#E8E3DA", borderRadius: "100px" }} />
                <div style={{ height: "8px", width: "66%", background: "#E8E3DA", borderRadius: "100px" }} />
              </div>
              {/* Scan line */}
              <div style={{ position: "absolute", left: 0, right: 0, height: "4px", background: "linear-gradient(to right, transparent, #D45D48, transparent)", opacity: 0.8, boxShadow: "0 0 15px rgba(212,93,72,0.8)", animation: "scan 2.5s linear infinite" }} />
            </div>
          </div>
          {/* Particles */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#D45D48", position: "absolute", opacity: 0, marginLeft: "96px", animation: "particle-up 2s ease-out infinite", animationDelay: "0.2s" }} />
            <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#92A897", position: "absolute", opacity: 0, marginLeft: "-112px", animation: "particle-up 2.5s ease-out infinite", animationDelay: "0.7s" }} />
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#D45D48", position: "absolute", opacity: 0, marginLeft: "40px", animation: "particle-up 1.8s ease-out infinite", animationDelay: "1.2s" }} />
          </div>
        </div>

        {/* Stage 2 — Extracting Context */}
        <div className={currentStage === 2 ? "stage-active" : "stage-inactive"} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.7s ease-in-out" }}>
          <div style={{ position: "relative", width: "340px", height: "340px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* Orbiting rings */}
            <div style={{ position: "absolute", width: "280px", height: "280px", borderRadius: "50%", border: "1px solid rgba(197,209,200,0.4)", animation: "spin-slow 20s linear infinite" }}>
              <div style={{ position: "absolute", top: 0, left: "50%", width: "12px", height: "12px", background: "#92A897", borderRadius: "50%", transform: "translate(-50%, -50%)", boxShadow: "0 0 10px rgba(146,168,151,0.5)" }} />
            </div>
            <div style={{ position: "absolute", width: "200px", height: "200px", borderRadius: "50%", border: "1px solid rgba(236,168,154,0.3)", animation: "spin-slow 15s linear infinite reverse" }}>
              <div style={{ position: "absolute", bottom: 0, left: "50%", width: "8px", height: "8px", background: "#D45D48", borderRadius: "50%", transform: "translate(-50%, 50%)", boxShadow: "0 0 8px rgba(212,93,72,0.5)" }} />
            </div>
            {/* Card */}
            <div style={{ position: "relative", zIndex: 10, width: "224px", height: "288px", background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)", borderRadius: "12px", border: "1px solid #E8E3DA", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", padding: "1.5rem", gap: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.625rem", fontWeight: 700, color: "#92A897", letterSpacing: "0.15em", textTransform: "uppercase" }}>Extracting Context</span>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#D45D48" }} className="animate-ping" />
              </div>
              {[0, 2, 4].map((glowOffset) => (
                <div key={glowOffset} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "4px", background: "#E8E3DA", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9D9891" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1, paddingTop: "4px" }}>
                    <div className={`anim-text-glow-${glowOffset}`} style={{ height: "6px", width: "100%", borderRadius: "100px" }} />
                    <div className={`anim-text-glow-${glowOffset + 1}`} style={{ height: "6px", width: "80%", borderRadius: "100px" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stage 3 — Network Graph */}
        <div className={currentStage === 3 ? "stage-active" : "stage-inactive"} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.7s ease-in-out" }}>
          <div style={{ position: "relative", width: "480px", height: "360px" }}>
            {/* Connection lines */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0, filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.02))" }}>
              {[
                "M240 180 Q 180 100 120 100",
                "M240 180 Q 300 80 380 90",
                "M240 180 Q 320 280 400 240",
                "M240 180 Q 160 260 90 230",
              ].map((d, i) => (
                <g key={i}>
                  <path d={d} fill="none" stroke="#E8E3DA" strokeWidth="2" strokeLinecap="round" />
                  <path d={d} fill="none" stroke="#D45D48" strokeWidth="2" strokeLinecap="round" className="line-flow" style={{ opacity: nodesVisible ? 1 : 0, transition: `opacity 0.5s ${0.3 + i * 0.2}s` }} />
                </g>
              ))}
            </svg>
            {/* Center node */}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 20 }}>
              <div className="node-pulse-anim" style={{ position: "relative", width: "80px", height: "80px", background: "#fff", borderRadius: "16px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.08)", border: "2px solid #D45D48", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D45D48" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><circle cx="12" cy="14" r="3" /></svg>
              </div>
              <div className="pulse-ring-anim-1" style={{ position: "absolute", inset: 0, borderRadius: "16px", border: "2px solid rgba(212,93,72,0.2)", zIndex: -1 }} />
              <div className="pulse-ring-anim-2" style={{ position: "absolute", inset: 0, borderRadius: "16px", border: "2px solid rgba(212,93,72,0.1)", zIndex: -1 }} />
            </div>
            {/* Expert nodes */}
            {nodePositions.map((node) => (
              <div key={node.id} style={{
                position: "absolute",
                top: node.top,
                left: node.left,
                right: node.right,
                bottom: node.bottom,
                width: node.width,
                height: node.height,
                background: "#fff",
                borderRadius: "50%",
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.08)",
                border: "2px solid #92A897",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                opacity: nodesVisible ? 1 : 0,
                transform: nodesVisible ? "scale(1)" : "scale(0.5)",
                transition: "all 0.5s ease",
                transitionDelay: node.delay,
                fontFamily: "var(--font-sans)",
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "#2D2B2A",
              }}>
                {node.name}
                <div style={{ position: "absolute", bottom: "-4px", right: "-4px", width: "14px", height: "14px", background: "#92A897", border: "2px solid #fff", borderRadius: "50%" }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress steps */}
      {isMobile ? (
        /* Mobile: vertical steps */
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", padding: "0 1.5rem", maxWidth: "300px" }}>
          {steps.map((step) => {
            const isDone = step.index < currentStage;
            const isCurrent = step.index === currentStage;
            return (
              <div key={step.index} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{
                  width: "24px", height: "24px", borderRadius: "50%",
                  border: `2px solid ${isDone ? "#92A897" : isCurrent ? "#D45D48" : "#E8E3DA"}`,
                  background: isDone ? "#92A897" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "all 0.5s ease",
                }}>
                  {isDone && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                  )}
                  {isCurrent && (
                    <div style={{ width: "10px", height: "10px", border: "2px solid #D45D48", borderTopColor: "transparent", borderRadius: "50%" }} className="animate-spin" />
                  )}
                </div>
                <span style={{
                  fontSize: "0.85rem", fontWeight: isCurrent ? 500 : 400,
                  color: isDone ? "#92A897" : isCurrent ? "#2D2B2A" : "#9D9891",
                  transition: "color 0.5s",
                }}>
                  {step.label}{isCurrent && "..."}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        /* Desktop: horizontal steps */
        <div style={{ position: "relative", width: "100%", maxWidth: "700px", display: "flex", alignItems: "center", gap: "0" }}>
          {steps.map((step, i) => {
            const isDone = step.index < currentStage;
            const isCurrent = step.index === currentStage;
            return (
              <div key={step.index} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : undefined }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.625rem", minWidth: "fit-content" }}>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    border: `2px solid ${isDone ? "#92A897" : isCurrent ? "#D45D48" : "#E8E3DA"}`,
                    background: isDone ? "#92A897" : "var(--background, #EAE8DF)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, zIndex: 10, transition: "all 0.5s ease",
                    boxShadow: "0 0 0 4px var(--background, #EAE8DF)",
                  }}>
                    {isDone && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
                    )}
                    {isCurrent && (
                      <div style={{ width: "12px", height: "12px", border: "2px solid #D45D48", borderTopColor: "transparent", borderRadius: "50%" }} className="animate-spin" />
                    )}
                  </div>
                  <span style={{
                    fontSize: "0.75rem", fontWeight: isCurrent ? 600 : 400,
                    color: isDone ? "#92A897" : isCurrent ? "#2D2B2A" : "#9D9891",
                    transition: "color 0.5s",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                  }}>
                    {step.label}{isCurrent && "..."}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div style={{
                    flex: 1, height: "2px", marginBottom: "1.75rem",
                    background: isDone ? "#D45D48" : "#E8E3DA",
                    transition: "background 1s ease",
                    minWidth: "2rem",
                  }} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom progress bar */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "4px", background: "#E8E3DA", overflow: "hidden" }}>
        <div style={{ height: "100%", background: "rgba(212,93,72,0.3)", width: "20%", animation: "slide-right 2s linear infinite" }} />
      </div>
    </div>
  );
}
