"use client";
import { PRDSection, PRDComment } from "@/lib/prd-types";

interface Props {
  title: string;
  sections: PRDSection[];
  comments: PRDComment[];
  activeSectionId: string | null;
  onSectionClick: (sectionId: string) => void;
}

export default function PRDViewer({
  title,
  sections,
  comments,
  activeSectionId,
  onSectionClick,
}: Props) {
  const commentCountBySection = new Map<string, number>();
  for (const c of comments) {
    if (c.parentId === null) {
      commentCountBySection.set(
        c.sectionId,
        (commentCountBySection.get(c.sectionId) || 0) + 1
      );
    }
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "2rem 2.5rem",
        minWidth: 0,
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "2rem",
          fontWeight: 400,
          color: "#2A3122",
          marginBottom: "2rem",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h1>

      {sections.map((section) => {
        const isActive = activeSectionId === section.id;
        const count = commentCountBySection.get(section.id) || 0;

        return (
          <div
            key={section.id}
            id={section.id}
            onClick={() => onSectionClick(section.id)}
            style={{
              position: "relative",
              padding: "1rem 1.25rem",
              marginBottom: "0.25rem",
              borderRadius: "8px",
              borderLeft: isActive
                ? "3px solid #D45D48"
                : "3px solid transparent",
              background: isActive
                ? "rgba(212, 93, 72, 0.04)"
                : count > 0
                ? "rgba(255, 255, 255, 0.3)"
                : "transparent",
              cursor: count > 0 ? "pointer" : "default",
              transition: "all 0.2s ease",
            }}
          >
            {section.heading && (
              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.25rem",
                  fontWeight: 400,
                  color: "#2A3122",
                  marginBottom: "0.5rem",
                }}
              >
                {section.heading}
              </h2>
            )}
            <p
              style={{
                fontSize: "0.95rem",
                lineHeight: 1.8,
                color: "#57534e",
                whiteSpace: "pre-wrap",
              }}
            >
              {section.content}
            </p>

            {/* Comment count badge */}
            {count > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "0.75rem",
                  right: "0.75rem",
                  background: "#D45D48",
                  color: "#fff",
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {count}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
