"use client";
import { useState, useCallback, useRef } from "react";
import { Person } from "@/lib/types";
import { Message } from "@/hooks/useQuestion";
import QuestionInput from "@/components/QuestionInput";
import AnswerPanel from "@/components/AnswerPanel";
import Header from "@/components/Header";
import { useStreamingResponse } from "@/hooks/useStreamingResponse";

interface Props {
  person: Person;
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

export default function PersonQuestion({ person }: Props) {
  const [asked, setAsked] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isFollowUpStreaming, setIsFollowUpStreaming] = useState(false);
  const { text, isStreaming, startStream, reset } = useStreamingResponse();
  const answerRef = useRef("");

  const handleAsk = async (q: string) => {
    setAsked(true);
    setQuestion(q);
    setMessages([]);
    answerRef.current = "";
    reset();
    await startStream("/api/answer", {
      question: q,
      personSlug: person.slug,
    });
  };

  const handleAnswerUpdate = useCallback((t: string) => {
    answerRef.current = t;
  }, []);

  const handleFollowUp = useCallback(async (followUp: string) => {
    if (isFollowUpStreaming) return;
    setIsFollowUpStreaming(true);

    const currentHistory: Message[] = [...messages];
    if (currentHistory.length === 0) {
      currentHistory.push({ role: "user", content: question });
      currentHistory.push({ role: "assistant", content: answerRef.current });
    }
    currentHistory.push({ role: "user", content: followUp });

    try {
      const res = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: followUp,
          personSlug: person.slug,
          history: currentHistory,
        }),
      });

      if (!res.ok) throw new Error("Follow-up failed");

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let followUpText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) followUpText += parsed.text;
            } catch {}
          }
        }
      }

      setMessages((prev) => {
        const updated = [...prev];
        if (updated.length === 0) {
          updated.push({ role: "user", content: question });
          updated.push({ role: "assistant", content: answerRef.current });
        }
        updated.push({ role: "user", content: followUp });
        updated.push({ role: "assistant", content: followUpText });
        return updated;
      });
    } catch {} finally {
      setIsFollowUpStreaming(false);
    }
  }, [isFollowUpStreaming, messages, question, person.slug]);

  if (!asked) {
    return (
      <div>
        <QuestionInput onSubmit={handleAsk} isLoading={false} />
      </div>
    );
  }

  // Full-screen chat overlay with left panel + right chat
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "var(--background, #EAE8DF)",
      zIndex: 100,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: "0.5rem 2rem 0", flexShrink: 0 }}>
        <Header compact />
      </div>

      {/* Two-column layout */}
      <div style={{
        display: "flex",
        flex: 1,
        minHeight: 0,
        gap: "2rem",
        padding: "0 2.5rem 2.5rem",
      }}>
        {/* Left panel — person profile */}
        <aside style={{
          width: "360px",
          flexShrink: 0,
          background: "#F6F4F0",
          borderRadius: "36px",
          padding: "2.5rem",
          display: "flex",
          flexDirection: "column",
          border: "1px solid rgba(255, 255, 255, 0.6)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.03), inset 0 2px 4px rgba(255,255,255,0.5)",
          overflowY: "auto",
        }}>
          {/* Avatar with glow */}
          <div style={{
            position: "relative",
            width: "112px",
            height: "112px",
            margin: "0.5rem auto 0",
          }}>
            <div style={{
              position: "absolute",
              inset: 0,
              background: "rgba(140, 122, 107, 0.2)",
              filter: "blur(16px)",
              borderRadius: "50%",
              transform: "scale(1.1)",
            }} />
            <div style={{
              position: "absolute",
              inset: "-6px",
              borderRadius: "50%",
              border: "1px solid rgba(140, 122, 107, 0.15)",
            }} />
            <div style={{
              position: "absolute",
              inset: "-1px",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.8)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }} />
            <div style={{
              position: "relative",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: avatarColor(person.name),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "1.875rem",
              fontFamily: "var(--font-serif)",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
            }}>
              {initials(person.name)}
            </div>
          </div>

          {/* Name + title */}
          <div style={{ marginTop: "2rem", textAlign: "center" }}>
            <h1 style={{
              fontSize: "1.75rem",
              fontFamily: "var(--font-serif)",
              color: "#1c1917",
              letterSpacing: "-0.02em",
              fontWeight: 400,
            }}>
              {person.name}
            </h1>
            {person.title && (
              <p style={{
                marginTop: "0.625rem",
                fontSize: "0.6875rem",
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#78716c",
              }}>
                {person.title}
              </p>
            )}
          </div>

          {/* Divider */}
          <div style={{
            width: "2.5rem",
            height: "1px",
            background: "#d6d3d1",
            margin: "2rem auto",
          }} />

          {/* Description */}
          {person.description && (
            <p style={{
              fontSize: "0.9375rem",
              lineHeight: 1.8,
              color: "#57534e",
              textAlign: "center",
              padding: "0 0.5rem",
              fontWeight: 500,
            }}>
              {person.description}
            </p>
          )}

          {/* Expertise */}
          <div style={{ marginTop: "3rem" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1.25rem",
            }}>
              <h3 style={{
                fontSize: "0.625rem",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#a8a29e",
                whiteSpace: "nowrap",
              }}>
                Expertise
              </h3>
              <div style={{ height: "1px", background: "#e7e5e4", flex: 1 }} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem" }}>
              {person.tags.map((tag) => (
                <span key={tag} style={{
                  padding: "0.375rem 0.875rem",
                  borderRadius: "100px",
                  border: "1px solid rgba(214, 211, 209, 0.8)",
                  background: "rgba(255, 255, 255, 0.6)",
                  fontSize: "0.6875rem",
                  fontWeight: 500,
                  color: "#57534e",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.01)",
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Sources */}
          <div style={{ marginTop: "3rem", marginBottom: "1.5rem" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1.25rem",
            }}>
              <h3 style={{
                fontSize: "0.625rem",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#a8a29e",
                whiteSpace: "nowrap",
              }}>
                Sources <span style={{ color: "#d6d3d1" }}>({person.sources.length})</span>
              </h3>
              <div style={{ height: "1px", background: "#e7e5e4", flex: 1 }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              {person.sources.map((source, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                  padding: "0.75rem",
                  margin: "0 -0.75rem",
                  borderRadius: "12px",
                  transition: "background 0.2s",
                  cursor: "default",
                }}>
                  <span style={{
                    marginTop: "0.125rem",
                    color: "#a8a29e",
                    flexShrink: 0,
                  }}>
                    {source.type === "podcast" ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" x2="12" y1="19" y2="22" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" x2="8" y1="13" y2="13" />
                        <line x1="16" x2="8" y1="17" y2="17" />
                      </svg>
                    )}
                  </span>
                  <p style={{
                    fontSize: "0.8125rem",
                    lineHeight: 1.5,
                    color: "#78716c",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}>
                    {source.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Right side — chat */}
        <div style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}>
          <AnswerPanel
            person={person}
            question={question}
            answer={text}
            isStreaming={isStreaming}
            messages={messages}
            isFollowUpStreaming={isFollowUpStreaming}
            onFollowUp={handleFollowUp}
            onAnswerUpdate={handleAnswerUpdate}
          />
        </div>
      </div>
    </div>
  );
}
