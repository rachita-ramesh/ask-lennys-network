"use client";
import { useState, FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import { PRDComment } from "@/lib/prd-types";
import { avatarColor, initials } from "@/lib/ui-utils";

interface Props {
  comment: PRDComment;
  replies: PRDComment[];
  onReply: (commentId: string, message: string) => void;
  isReplying: boolean;
}

export default function PRDCommentThread({
  comment,
  replies,
  onReply,
  isReplying,
}: Props) {
  const [replyText, setReplyText] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);
  const bg = avatarColor(comment.expert.name);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = replyText.trim();
    if (text && !isReplying) {
      onReply(comment.id, text);
      setReplyText("");
    }
  };

  return (
    <div
      style={{
        marginBottom: "1rem",
        padding: "1rem",
        background: "rgba(255, 255, 255, 0.5)",
        border: "1px solid rgba(42, 49, 34, 0.08)",
        borderRadius: "12px",
      }}
    >
      {/* Main comment */}
      <div style={{ display: "flex", gap: "0.625rem", marginBottom: "0.5rem" }}>
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            background: bg,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.55rem",
            fontWeight: 700,
            flexShrink: 0,
            marginTop: "0.125rem",
          }}
        >
          {initials(comment.expert.name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#2A3122",
              marginBottom: "0.25rem",
            }}
          >
            {comment.expert.name}
          </p>
          {comment.highlightText && (
            <p
              style={{
                fontSize: "0.75rem",
                color: "#a8a29e",
                fontStyle: "italic",
                marginBottom: "0.5rem",
                borderLeft: "2px solid rgba(212, 93, 72, 0.3)",
                paddingLeft: "0.5rem",
              }}
            >
              &ldquo;{comment.highlightText}&rdquo;
            </p>
          )}
          <div
            className="answer-markdown"
            style={{
              fontSize: "0.875rem",
              lineHeight: 1.6,
              color: "#57534e",
            }}
          >
            <ReactMarkdown>{comment.content}</ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div style={{ marginLeft: "2.125rem", marginTop: "0.75rem" }}>
          {replies.map((reply) => {
            const isUser = reply.expert.slug === "__user__";
            return (
              <div
                key={reply.id}
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  marginBottom: "0.625rem",
                  padding: "0.625rem",
                  background: isUser
                    ? "rgba(42, 49, 34, 0.04)"
                    : "rgba(212, 93, 72, 0.03)",
                  borderRadius: "8px",
                }}
              >
                {isUser ? (
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "#2A3122",
                      color: "#EAE8DF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.5rem",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    You
                  </div>
                ) : (
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: avatarColor(reply.expert.name),
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.45rem",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {initials(reply.expert.name)}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: "#2A3122",
                      marginBottom: "0.125rem",
                    }}
                  >
                    {isUser ? "You" : reply.expert.name}
                  </p>
                  <div
                    className="answer-markdown"
                    style={{
                      fontSize: "0.8rem",
                      lineHeight: 1.5,
                      color: "#57534e",
                    }}
                  >
                    <ReactMarkdown>{reply.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Typing indicator */}
      {isReplying && (
        <div style={{ marginLeft: "2.125rem", marginTop: "0.5rem" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}>
            <div style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: avatarColor(comment.expert.name),
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.45rem",
              fontWeight: 700,
              flexShrink: 0,
            }}>
              {initials(comment.expert.name)}
            </div>
            <div style={{
              background: "rgba(42, 49, 34, 0.06)",
              borderRadius: "16px 16px 16px 4px",
              padding: "0.625rem 1rem",
              display: "flex",
              gap: "0.25rem",
              alignItems: "center",
            }}>
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        </div>
      )}

      {/* Reply button / input */}
      <div style={{ marginLeft: "2.125rem", marginTop: "0.5rem" }}>
        {showReplyInput ? (
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Reply..."
              disabled={isReplying}
              style={{
                flex: 1,
                border: "1px solid rgba(42, 49, 34, 0.12)",
                borderRadius: "100px",
                padding: "0.5rem 1rem",
                fontSize: "0.8rem",
                fontFamily: "var(--font-sans)",
                background: "rgba(255,255,255,0.6)",
                outline: "none",
                color: "#2A3122",
              }}
            />
            <button
              type="submit"
              disabled={isReplying || !replyText.trim()}
              style={{
                background:
                  isReplying || !replyText.trim()
                    ? "rgba(212, 93, 72, 0.4)"
                    : "#D45D48",
                color: "#fff",
                border: "none",
                borderRadius: "100px",
                padding: "0.5rem 1rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor:
                  isReplying || !replyText.trim() ? "not-allowed" : "pointer",
              }}
            >
              Reply
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowReplyInput(true)}
            style={{
              background: "none",
              border: "none",
              color: "#D45D48",
              fontSize: "0.7rem",
              fontFamily: "var(--font-mono)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Reply
          </button>
        )}
      </div>
    </div>
  );
}
