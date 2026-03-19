"use client";
import { ExpertReview } from "@/lib/prd-types";
import { avatarColor, initials } from "@/lib/ui-utils";

interface Props {
  experts: ExpertReview[];
  activeFilter: string | null;
  onFilter: (slug: string | null) => void;
}

export default function PRDExpertBar({
  experts,
  activeFilter,
  onFilter,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: "0.75rem",
        padding: "0.75rem 0",
        flexShrink: 0,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: "#a8a29e",
          fontWeight: 700,
        }}
      >
        Reviewers
      </span>
      {experts.map((er) => {
        const isActive = activeFilter === er.expert.slug;
        const bg = avatarColor(er.expert.name);
        return (
          <button
            key={er.expert.slug}
            onClick={() => onFilter(isActive ? null : er.expert.slug)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.375rem 0.75rem 0.375rem 0.375rem",
              borderRadius: "100px",
              border: isActive
                ? "2px solid #D45D48"
                : "1px solid rgba(42, 49, 34, 0.12)",
              background: isActive ? "rgba(212, 93, 72, 0.06)" : "rgba(255,255,255,0.5)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                background: bg,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.6rem",
                fontWeight: 700,
              }}
            >
              {initials(er.expert.name)}
            </div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#2A3122",
                }}
              >
                {er.expert.name}
              </span>
              {er.expert.title && (
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: "#78716c",
                    whiteSpace: "nowrap",
                  }}
                >
                  {er.expert.title}
                </span>
              )}
            </div>
            {/* Status indicator */}
            {er.status === "streaming" || er.status === "pending" ? (
              <svg
                className="animate-spin"
                style={{ width: "12px", height: "12px", color: "#5F6854" }}
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
            ) : er.status === "done" ? (
              <span style={{ color: "#6B8E7B", fontSize: "0.75rem" }}>
                &#10003;
              </span>
            ) : (
              <span style={{ color: "#D45D48", fontSize: "0.75rem" }}>
                &#10007;
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
