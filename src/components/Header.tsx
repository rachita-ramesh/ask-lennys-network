"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const isBrowse = pathname === "/browse" || pathname.startsWith("/person/");

  const navItems = [
    { label: "Review", href: "/" },
    { label: "Ask", href: "/ask" },
    { label: "People", href: "/browse" },
  ];

  return (
    <header style={{
      width: "100%",
      padding: "0.75rem 2.5rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexShrink: 0,
    }}>
      <Link href="/" style={{
        fontFamily: "var(--font-serif)",
        fontSize: "1.5rem",
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
          width="20"
          height="20"
          fill="none"
          stroke="#D45D48"
          strokeWidth="2"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        Lenny&apos;s Network
      </Link>
      <nav style={{ display: "flex", gap: "2rem" }}>
        {navItems.map((item) => {
          const isActive =
            (item.href === "/" && pathname === "/") ||
            (item.href === "/ask" && pathname === "/ask") ||
            (item.href === "/browse" && isBrowse);

          return (
            <Link
              key={item.label}
              href={item.href}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.875rem",
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
      </nav>
    </header>
  );
}
