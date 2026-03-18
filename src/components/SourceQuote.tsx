"use client";
import { useState } from "react";

interface Props {
  quote: string;
}

export default function SourceQuote({ quote }: Props) {
  const [expanded, setExpanded] = useState(false);
  const isLong = quote.length > 200;
  const display = !expanded && isLong ? quote.slice(0, 200) + "..." : quote;

  return (
    <div style={{
      borderLeft: "3px solid #D45D48",
      background: "rgba(212, 93, 72, 0.06)",
      borderRadius: "0 8px 8px 0",
      padding: "1rem 1.25rem",
      margin: "1rem 0",
    }}>
      <p style={{
        fontSize: "0.95rem",
        color: "#5F6854",
        fontStyle: "italic",
        lineHeight: 1.7,
        fontFamily: "var(--font-serif)",
      }}>
        &ldquo;{display}&rdquo;
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            fontSize: "0.75rem",
            color: "#D45D48",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginTop: "0.5rem",
            padding: 0,
          }}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
