"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isMobile = useIsMobile();
  const isBrowse = pathname === "/browse" || pathname.startsWith("/person/");

  const navItems = [
    { label: "Review", href: "/review" },
    // { label: "Ask", href: "/ask" },
    { label: "People", href: "/browse" },
  ];

  return (
    <header style={{
      width: "100%",
      padding: isMobile ? "0.75rem 1rem" : "0.75rem 2.5rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexShrink: 0,
    }}>
      <Link href="/review" style={{
        fontFamily: "var(--font-serif)",
        fontSize: isMobile ? "1.15rem" : "1.5rem",
        fontWeight: 400,
        color: "#2A3122",
        textDecoration: "none",
        letterSpacing: "-0.02em",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
      }}>
        <svg
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          width={isMobile ? 18 : 20}
          height={isMobile ? 18 : 20}
          fill="none"
          stroke="#D45D48"
          strokeWidth="2"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        {isMobile ? "Lenny\u2019s" : "Lenny\u2019s Network"}
      </Link>
      <nav style={{ display: "flex", gap: isMobile ? "0.75rem" : "2rem", alignItems: "center" }}>
        {navItems.map((item) => {
          const isActive =
            (item.href === "/review" && pathname === "/review") ||
            (item.href === "/ask" && pathname === "/ask") ||
            (item.href === "/browse" && isBrowse);

          return (
            <Link
              key={item.label}
              href={item.href}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: isMobile ? "0.75rem" : "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                textDecoration: "none",
                color: isActive ? "#D45D48" : "#5F6854",
                transition: "color 0.2s ease",
                position: "relative",
                paddingBottom: "0.25rem",
              }}
            >
              {item.label}
              {isActive && (
                <span style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  height: "2px",
                  backgroundColor: "#D45D48",
                }} />
              )}
            </Link>
          );
        })}
        {session?.user && (
          <>
            <div style={{ width: "1px", height: "20px", background: "rgba(42, 49, 34, 0.15)" }} />
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: isMobile ? "0.75rem" : "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "#a8a29e",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0.25rem 0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              {!isMobile && "Sign out"}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
