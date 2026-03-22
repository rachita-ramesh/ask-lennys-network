"use client";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function Footer() {
  const isMobile = useIsMobile();

  return (
    <footer
      style={{
        width: "100%",
        padding: isMobile ? "0.75rem 1rem" : "1.5rem 2.5rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "0.375rem",
        flexShrink: 0,
        borderTop: "1px solid rgba(42, 49, 34, 0.08)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          color: "#a8a29e",
          letterSpacing: "0.03em",
        }}
      >
        Questions or feedback?
      </span>
      <a
        href="mailto:rachita.builds@gmail.com"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          color: "#D45D48",
          textDecoration: "none",
          letterSpacing: "0.03em",
        }}
      >
        rachita.builds@gmail.com
      </a>
    </footer>
  );
}
