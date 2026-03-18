"use client";
import { useState } from "react";
import { DissentResult } from "@/lib/types";

interface Props {
  dissent: DissentResult;
  onSelect: () => void;
}

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ["#D45D48", "#5F6854", "#8B7355", "#6B8E7B", "#9B6B5E", "#7B8471", "#A67B5B"];
  return colors[Math.abs(hash) % colors.length];
}

function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

export default function DissentBubble({ dissent, onSelect }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="animate-slide-in-right" style={{
      position: "fixed",
      bottom: "2rem",
      right: "2rem",
      maxWidth: "360px",
      zIndex: 40,
    }}>
      <button
        onClick={onSelect}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? "#fff" : "rgba(255,255,255,0.9)",
          backdropFilter: "blur(10px)",
          borderRadius: "12px",
          border: `1px solid ${hovered ? "rgba(212, 93, 72, 0.4)" : "rgba(42, 49, 34, 0.15)"}`,
          padding: "1.25rem",
          cursor: "pointer",
          width: "100%",
          textAlign: "left" as const,
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: hovered
            ? "0 12px 24px -8px rgba(42, 49, 34, 0.2)"
            : "0 8px 16px -4px rgba(42, 49, 34, 0.1)",
          transform: hovered ? "translateY(-2px)" : "translateY(0)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.75rem" }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: avatarColor(dissent.dissenter.name),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.7rem",
            flexShrink: 0,
          }}>
            {initials(dissent.dissenter.name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1rem",
              fontWeight: 400,
              color: "#2A3122",
            }}>
              {dissent.dissenter.name}
            </p>
            <p style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#D45D48",
            }}>
              Has a different take
            </p>
          </div>
        </div>
        <p style={{
          fontSize: "0.9rem",
          color: "#5F6854",
          lineHeight: 1.5,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {dissent.point}
        </p>
        {dissent.quote && (
          <p style={{
            fontSize: "0.8rem",
            color: "rgba(95, 104, 84, 0.7)",
            fontStyle: "italic",
            fontFamily: "var(--font-serif)",
            marginTop: "0.375rem",
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            &ldquo;{dissent.quote}&rdquo;
          </p>
        )}
      </button>
    </div>
  );
}
