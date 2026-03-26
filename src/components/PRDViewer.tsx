"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PRDSection, PRDComment, PRDImage, PDFPageImage } from "@/lib/prd-types";
import { useIsMobile } from "@/hooks/useIsMobile";

interface Props {
  title: string;
  sections: PRDSection[];
  comments: PRDComment[];
  images: PRDImage[];
  sourceType?: "pdf" | "docx";
  pageImages?: PDFPageImage[];
  activeSectionId: string | null;
  onSectionClick: (sectionId: string) => void;
}

export default function PRDViewer({
  title,
  sections,
  comments,
  images,
  sourceType,
  pageImages,
  activeSectionId,
  onSectionClick,
}: Props) {
  const isMobile = useIsMobile();
  const isPDF = sourceType === "pdf" && pageImages && pageImages.length > 0;
  // Build a map from image ID to base64 src for fast lookup
  const imageMap = new Map(images.map((img) => [img.id, img]));

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
        padding: isMobile ? "0.75rem" : "1.5rem 1.5rem",
        minWidth: 0,
      }}
    >
      {/* Document container */}
      <div
        style={{
          maxWidth: "780px",
          margin: "0 auto",
          background: "#fff",
          borderRadius: "12px",
          border: "1px solid rgba(42, 49, 34, 0.08)",
          boxShadow: "0 2px 20px rgba(0,0,0,0.04)",
          padding: isMobile ? "1.25rem 1rem" : "2.5rem 2.5rem",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: isMobile ? "1.5rem" : "2rem",
            fontWeight: 400,
            color: "#1c1917",
            marginBottom: "0.5rem",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>

        <div
          style={{
            width: "3rem",
            height: "2px",
            background: "#D45D48",
            margin: "1.5rem 0 2rem",
          }}
        />

        {isPDF ? (
          /* PDF: render page images */
          pageImages!.map((page) => {
            const sectionId = `section-${page.pageIndex}`;
            const isActive = activeSectionId === sectionId;
            const count = commentCountBySection.get(sectionId) || 0;

            return (
              <div
                key={sectionId}
                id={sectionId}
                onClick={() => onSectionClick(sectionId)}
                style={{
                  position: "relative",
                  marginBottom: "1rem",
                  borderRadius: "6px",
                  border: isActive
                    ? "2px solid #D45D48"
                    : count > 0
                    ? "2px solid rgba(212, 93, 72, 0.2)"
                    : "2px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  overflow: "hidden",
                }}
              >
                {/* Page label */}
                <div style={{
                  padding: "0.375rem 0.75rem",
                  background: isActive ? "rgba(212, 93, 72, 0.06)" : "rgba(0,0,0,0.02)",
                  fontSize: "0.65rem",
                  fontFamily: "var(--font-mono)",
                  color: isActive ? "#D45D48" : "#a8a29e",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontWeight: 600,
                }}>
                  Page {page.pageIndex + 1}
                </div>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={page.imageDataUrl}
                  alt={`Page ${page.pageIndex + 1}`}
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                  }}
                />

                {/* Comment count badge */}
                {count > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "0.375rem",
                      right: "0.5rem",
                      background: "#D45D48",
                      color: "#fff",
                      fontSize: "0.55rem",
                      fontWeight: 700,
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 1px 4px rgba(212, 93, 72, 0.3)",
                    }}
                  >
                    {count}
                  </span>
                )}
              </div>
            );
          })
        ) : (
          /* DOCX: render markdown sections */
          sections.map((section) => {
            const isActive = activeSectionId === section.id;
            const count = commentCountBySection.get(section.id) || 0;

            return (
              <div
                key={section.id}
                id={section.id}
                onClick={() => onSectionClick(section.id)}
                style={{
                  position: "relative",
                  padding: "0.75rem 1rem",
                  marginBottom: "0.125rem",
                  borderRadius: "6px",
                  borderLeft: isActive
                    ? "3px solid #D45D48"
                    : "3px solid transparent",
                  background: isActive
                    ? "rgba(212, 93, 72, 0.03)"
                    : count > 0
                    ? "rgba(245, 243, 239, 0.6)"
                    : "transparent",
                  cursor: count > 0 ? "pointer" : "default",
                  transition: "all 0.2s ease",
                  marginLeft: "-1rem",
                  marginRight: "-1rem",
                }}
              >
                {section.heading && (
                  <h2
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "1.35rem",
                      fontWeight: 400,
                      color: "#1c1917",
                      marginBottom: "0.625rem",
                      marginTop: "1.25rem",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {section.heading}
                  </h2>
                )}
                <div className="prd-document-content">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      img: ({ src, alt }) => {
                        const img = typeof src === "string" ? imageMap.get(src) : null;
                        if (img) {
                          return (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={img.src}
                              alt={img.alt || alt || ""}
                              style={{ maxWidth: "100%", height: "auto", borderRadius: "8px", margin: "1rem 0", display: "block" }}
                            />
                          );
                        }
                        if (typeof src === "string" && src.startsWith("data:")) {
                          return (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={src}
                              alt={alt || ""}
                              style={{ maxWidth: "100%", height: "auto", borderRadius: "8px", margin: "1rem 0", display: "block" }}
                            />
                          );
                        }
                        return null;
                      },
                    }}
                  >
                    {section.content}
                  </ReactMarkdown>
                </div>

                {/* Comment count badge */}
                {count > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "0.5rem",
                      right: "-0.25rem",
                      background: "#D45D48",
                      color: "#fff",
                      fontSize: "0.55rem",
                      fontWeight: 700,
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 1px 4px rgba(212, 93, 72, 0.3)",
                    }}
                  >
                    {count}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
