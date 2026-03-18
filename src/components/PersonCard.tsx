"use client";
import { useState } from "react";
import { Person } from "@/lib/types";

interface Props {
  person: Person;
  reason?: string;
  onClick?: () => void;
  compact?: boolean;
  tag?: string;
}

export default function PersonCard({ person, reason, onClick, compact, tag }: Props) {
  const [hovered, setHovered] = useState(false);
  const displayTag = tag || person.tags[0] || "Expert";

  const cardStyle: React.CSSProperties = {
    display: "block",
    textDecoration: "none",
    padding: compact ? "1.5rem" : "2rem",
    border: `1px solid ${hovered ? "rgba(212, 93, 72, 0.6)" : "rgba(42, 49, 34, 0.15)"}`,
    borderRadius: "12px",
    background: hovered ? "rgba(255,255,255,0.4)" : "transparent",
    transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
    position: "relative",
    overflow: "hidden",
    cursor: onClick ? "pointer" : "default",
    transform: hovered ? "translateY(-4px)" : "translateY(0)",
    boxShadow: hovered
      ? "0 12px 24px -8px rgba(42, 49, 34, 0.15), 0 4px 8px -4px rgba(42, 49, 34, 0.05)"
      : "none",
    width: "100%",
    textAlign: "left" as const,
  };

  const Component = onClick ? "button" : "div";

  return (
    <Component
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={cardStyle}
    >
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1.25rem",
      }}>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: hovered ? "#D45D48" : "#5F6854",
          border: `1px solid ${hovered ? "#D45D48" : "rgba(42, 49, 34, 0.15)"}`,
          padding: "0.25rem 0.5rem",
          borderRadius: "4px",
          transition: "color 0.3s ease, border-color 0.3s ease",
        }}>
          {displayTag}
        </span>
        <svg
          style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateX(0)" : "translateX(-10px)",
            color: "#D45D48",
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </div>
      <h3 style={{
        fontFamily: "var(--font-serif)",
        fontSize: compact ? "1.25rem" : "1.5rem",
        fontWeight: 400,
        color: "#2A3122",
        lineHeight: 1.2,
        marginBottom: "0.5rem",
      }}>
        {person.name}
      </h3>
      {person.title && (
        <p style={{
          fontSize: "0.85rem",
          color: "#5F6854",
          marginBottom: reason ? "0.5rem" : 0,
          fontFamily: "var(--font-sans)",
        }}>
          {person.title}
        </p>
      )}
      {reason && (
        <p style={{
          fontSize: "0.95rem",
          color: "#5F6854",
          fontFamily: "var(--font-sans)",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          lineHeight: 1.5,
        }}>
          {reason}
        </p>
      )}
    </Component>
  );
}
