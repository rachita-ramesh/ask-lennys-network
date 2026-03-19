"use client";
import { PRDSection, PRDComment } from "@/lib/prd-types";
import PRDCommentThread from "./PRDCommentThread";

interface Props {
  sections: PRDSection[];
  comments: PRDComment[];
  activeSectionId: string | null;
  expertFilter: string | null;
  onReply: (commentId: string, message: string) => void;
  replyStreamingId: string | null;
}

export default function PRDCommentsPanel({
  sections,
  comments,
  activeSectionId,
  expertFilter,
  onReply,
  replyStreamingId,
}: Props) {
  // Filter top-level comments
  let topLevelComments = comments.filter((c) => c.parentId === null);

  if (activeSectionId) {
    topLevelComments = topLevelComments.filter(
      (c) => c.sectionId === activeSectionId
    );
  }

  if (expertFilter) {
    topLevelComments = topLevelComments.filter(
      (c) => c.expert.slug === expertFilter
    );
  }

  // Group by section
  const sectionMap = new Map<string, PRDSection>();
  for (const s of sections) sectionMap.set(s.id, s);

  const grouped = new Map<string, PRDComment[]>();
  for (const c of topLevelComments) {
    const existing = grouped.get(c.sectionId) || [];
    existing.push(c);
    grouped.set(c.sectionId, existing);
  }

  // Sort section groups by section index
  const sortedSectionIds = Array.from(grouped.keys()).sort((a, b) => {
    const sa = sectionMap.get(a);
    const sb = sectionMap.get(b);
    return (sa?.index || 0) - (sb?.index || 0);
  });

  if (topLevelComments.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#a8a29e",
          fontSize: "0.85rem",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        {activeSectionId
          ? "No comments on this section yet."
          : "Comments will appear here as experts review..."}
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "1rem 1.5rem",
      }}
    >
      {sortedSectionIds.map((sectionId) => {
        const section = sectionMap.get(sectionId);
        const sectionComments = grouped.get(sectionId) || [];

        return (
          <div key={sectionId} style={{ marginBottom: "1.5rem" }}>
            {/* Section header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.75rem",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#a8a29e",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                {section?.heading || `Section ${(section?.index || 0) + 1}`}
              </span>
              <div
                style={{ height: "1px", background: "#e7e5e4", flex: 1 }}
              />
            </div>

            {/* Comments */}
            {sectionComments.map((comment) => {
              const replies = comments.filter(
                (c) => c.parentId === comment.id
              );
              return (
                <PRDCommentThread
                  key={comment.id}
                  comment={comment}
                  replies={replies}
                  onReply={onReply}
                  isReplying={replyStreamingId === comment.id}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
