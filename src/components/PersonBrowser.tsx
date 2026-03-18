"use client";
import { useState, useMemo } from "react";
import { Person } from "@/lib/types";
import Link from "next/link";

interface Props {
  people: Person[];
}

function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

function BrowsePersonCard({ person, delay }: { person: Person; delay: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/person/${person.slug}`}
      style={{
        background: hovered ? "rgba(255,255,255,0.4)" : "transparent",
        border: `1px solid ${hovered ? "rgba(212, 93, 72, 0.6)" : "rgba(42, 49, 34, 0.15)"}`,
        borderRadius: "16px",
        padding: "2rem 1.5rem",
        textAlign: "center",
        textDecoration: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 12px 24px -8px rgba(42, 49, 34, 0.15), 0 4px 8px -4px rgba(42, 49, 34, 0.05)"
          : "none",
        animation: `fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s both`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar */}
      <div style={{
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #E2E0D4, #C5C2B3)",
        marginBottom: "1.25rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-serif)",
        fontSize: "2rem",
        color: "#5F6854",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        border: "2px solid #fff",
      }}>
        {initials(person.name)}
      </div>

      {/* Name */}
      <h3 style={{
        fontFamily: "var(--font-serif)",
        fontSize: "1.5rem",
        color: "#2A3122",
        marginBottom: "0.25rem",
        lineHeight: 1.2,
      }}>
        {person.name}
      </h3>

      {/* Role */}
      <p style={{
        fontSize: "0.875rem",
        color: "#5F6854",
        fontFamily: "var(--font-sans)",
        marginBottom: "1.5rem",
        minHeight: "2.5em",
        lineHeight: 1.4,
      }}>
        {person.title || "Expert"}
      </p>

      {/* Tags */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.4rem",
        justifyContent: "center",
        marginTop: "auto",
      }}>
        {person.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              textTransform: "uppercase",
              color: hovered ? "#D45D48" : "#5F6854",
              padding: "0.2rem 0.6rem",
              border: `1px solid ${hovered ? "#D45D48" : "rgba(42, 49, 34, 0.15)"}`,
              borderRadius: "4px",
              background: "rgba(255,255,255,0.2)",
              transition: "color 0.3s ease, border-color 0.3s ease",
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}

export default function PersonBrowser({ people }: Props) {
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  const filterCategories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of people) {
      for (const t of p.tags) {
        counts.set(t, (counts.get(t) || 0) + 1);
      }
    }
    const top = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);
    return ["All", ...top];
  }, [people]);

  const filtered = useMemo(() => {
    let result = people;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (activeFilter !== "All") {
      result = result.filter((p) => p.tags.includes(activeFilter));
    }
    return result;
  }, [people, search, activeFilter]);

  return (
    <div>
      {/* Search + Filters */}
      <section style={{
        marginBottom: "4rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.5rem",
      }}>
        {/* Search bar */}
        <div style={{ width: "100%", maxWidth: "600px", position: "relative" }}>
          <svg
            style={{
              position: "absolute",
              left: "1.25rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#5F6854",
              width: "20px",
              height: "20px",
              pointerEvents: "none",
            }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search by name, role, or company..."
            style={{
              width: "100%",
              background: searchFocused ? "#fff" : "rgba(255, 255, 255, 0.3)",
              border: `1px solid ${searchFocused ? "rgba(212, 93, 72, 0.6)" : "rgba(42, 49, 34, 0.15)"}`,
              borderRadius: "100px",
              padding: "1rem 1.5rem 1rem 3.5rem",
              fontFamily: "var(--font-sans)",
              fontSize: "1rem",
              color: "#2A3122",
              outline: "none",
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: searchFocused ? "0 0 0 4px rgba(212, 93, 72, 0.1)" : "none",
              caretColor: "#D45D48",
            }}
          />
        </div>

        {/* Filter chips */}
        <div style={{
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}>
          {filterCategories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                padding: "0.5rem 1.25rem",
                borderRadius: "100px",
                border: `1px solid ${activeFilter === category ? "#2A3122" : "rgba(42, 49, 34, 0.15)"}`,
                background: activeFilter === category ? "#2A3122" : "transparent",
                color: activeFilter === category ? "#EAE8DF" : "#5F6854",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Expert grid — 4 columns */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "1.5rem",
        marginBottom: "5rem",
      }}>
        {filtered.map((person, index) => (
          <BrowsePersonCard
            key={person.slug}
            person={person}
            delay={0.3 + index * 0.03}
          />
        ))}
      </div>
    </div>
  );
}
