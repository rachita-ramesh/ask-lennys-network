"use client";
import { useState, FormEvent, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Person } from "@/lib/types";
import { Message } from "@/hooks/useQuestion";
interface Props {
  person: Person;
  question: string;
  answer: string;
  isStreaming: boolean;
  messages: Message[];
  isFollowUpStreaming: boolean;
  onFollowUp: (question: string) => void;
  onAnswerUpdate?: (text: string) => void;
}

function stripQuoteTags(text: string): string {
  return text.replace(/<\/?quote>/g, "");
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

function UserBubble({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
      <div style={{
        background: "#2A3122",
        color: "#EAE8DF",
        borderRadius: "16px 16px 4px 16px",
        padding: "0.75rem 1.125rem",
        maxWidth: "75%",
        fontSize: "0.95rem",
        lineHeight: 1.5,
        fontFamily: "var(--font-sans)",
      }}>
        {text}
      </div>
    </div>
  );
}

function AssistantBubble({ person, text, isStreaming }: { person: Person; text: string; isStreaming?: boolean }) {
  const bg = avatarColor(person.name);
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem", marginBottom: "1rem" }}>
      <div style={{
        width: "32px", height: "32px", borderRadius: "50%", background: bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontSize: "0.65rem", fontWeight: 600,
        fontFamily: "var(--font-sans)", flexShrink: 0, marginTop: "0.125rem",
      }}>
        {initials(person.name)}
      </div>
      <div style={{
        background: "rgba(255,255,255,0.4)",
        border: "1px solid rgba(42, 49, 34, 0.1)",
        borderRadius: "4px 16px 16px 16px",
        padding: "0.875rem 1.125rem",
        maxWidth: "85%",
        fontSize: "0.95rem",
        color: "#2A3122",
        lineHeight: 1.7,
        fontFamily: "var(--font-sans)",
      }}>
        <div className={`answer-markdown ${isStreaming ? "streaming-cursor" : ""}`}>
          {text ? <ReactMarkdown>{stripQuoteTags(text)}</ReactMarkdown> : (
            <span style={{
              color: "#5F6854", fontFamily: "var(--font-mono)",
              fontSize: "0.75rem", textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}>
              Thinking...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AnswerPanel({
  person,
  question,
  answer,
  isStreaming,
  messages,
  isFollowUpStreaming,
  onFollowUp,
  onAnswerUpdate,
}: Props) {
  const [followUpValue, setFollowUpValue] = useState("");
  const [followUpFocused, setFollowUpFocused] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (answer && onAnswerUpdate) onAnswerUpdate(answer);
  }, [answer, onAnswerUpdate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [answer, messages, isFollowUpStreaming]);

  const handleFollowUp = (e: FormEvent) => {
    e.preventDefault();
    const q = followUpValue.trim();
    if (q && !isFollowUpStreaming) {
      onFollowUp(q);
      setFollowUpValue("");
    }
  };

  const showInput = !isStreaming && answer.length > 0;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      flex: 1,
      minHeight: 0,
    }}>
      {/* Scrollable chat area */}
      <div style={{
        flex: 1, minHeight: 0, overflow: "auto",
        padding: "1rem 0",
      }}>
        {/* Initial question */}
        <UserBubble text={question} />

        {/* Initial answer */}
        <AssistantBubble person={person} text={answer} isStreaming={isStreaming} />

        {/* Follow-up messages */}
        {messages.slice(2).map((msg, i) => (
          msg.role === "user"
            ? <UserBubble key={i} text={msg.content} />
            : <AssistantBubble key={i} person={person} text={msg.content} />
        ))}

        {/* Follow-up loading */}
        {isFollowUpStreaming && (
          <AssistantBubble person={person} text="" />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input — always visible at bottom */}
      {showInput && (
        <form onSubmit={handleFollowUp} style={{
          padding: "0.75rem 0",
          flexShrink: 0,
        }}>
          <div style={{
            display: "flex",
            background: followUpFocused ? "#fff" : "rgba(255, 255, 255, 0.3)",
            border: `1px solid ${followUpFocused ? "rgba(212, 93, 72, 0.4)" : "rgba(42, 49, 34, 0.12)"}`,
            borderRadius: "100px",
            padding: "0.25rem",
            transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            boxShadow: followUpFocused ? "0 0 0 3px rgba(212, 93, 72, 0.08)" : "none",
          }}>
            <input
              type="text"
              value={followUpValue}
              onChange={(e) => setFollowUpValue(e.target.value)}
              onFocus={() => setFollowUpFocused(true)}
              onBlur={() => setFollowUpFocused(false)}
              placeholder={`Ask ${person.name.split(" ")[0]} a follow-up...`}
              disabled={isFollowUpStreaming}
              style={{
                flex: 1, border: "none", background: "transparent",
                padding: "0.75rem 1rem 0.75rem 1.25rem",
                fontFamily: "var(--font-sans)", fontSize: "0.95rem",
                color: "#2A3122", outline: "none", caretColor: "#D45D48",
              }}
            />
            <button
              type="submit"
              disabled={isFollowUpStreaming || !followUpValue.trim()}
              style={{
                backgroundColor: isFollowUpStreaming || !followUpValue.trim() ? "rgba(212, 93, 72, 0.4)" : "#D45D48",
                color: "#fff", border: "none", borderRadius: "100px",
                padding: "0 1.5rem", fontFamily: "var(--font-sans)",
                fontWeight: 500, fontSize: "0.875rem",
                cursor: isFollowUpStreaming || !followUpValue.trim() ? "not-allowed" : "pointer",
                transition: "background-color 0.2s ease",
              }}
            >{isFollowUpStreaming ? "..." : "Ask"}</button>
          </div>
        </form>
      )}
    </div>
  );
}
