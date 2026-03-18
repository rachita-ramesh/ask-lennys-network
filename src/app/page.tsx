"use client";
import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import QuestionInput from "@/components/QuestionInput";
import PeopleSuggestions from "@/components/PeopleSuggestions";
import AnswerPanel from "@/components/AnswerPanel";
import DissentBubble from "@/components/DissentBubble";
import { useQuestion } from "@/hooks/useQuestion";

const exampleCards = [
  { tag: "Growth", title: "Structuring a Growth Team", question: "When transitioning from early stage to series B, how should you divide responsibilities between core product and growth?" },
  { tag: "Strategy", title: "Defining Product Vision", question: "Practical frameworks for moving past a feature backlog and establishing a compelling 3-year product vision." },
  { tag: "Metrics", title: "Choosing a North Star", question: "Examples of good vs. bad North Star metrics for B2B SaaS companies focusing on bottom-up adoption." },
  { tag: "Hiring", title: "First PM Hire", question: "What specific traits and prior experiences should a technical founder look for when hiring their very first Product Manager?" },
];

function ExampleCard({ tag, title, description, onClick, delay }: {
  tag: string; title: string; description: string; onClick: () => void; delay: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`animate-fade-up ${delay}`}
      style={{
        display: "block",
        textDecoration: "none",
        textAlign: "left",
        padding: "2rem",
        border: "1px solid rgba(42, 49, 34, 0.15)",
        borderRadius: "12px",
        background: "transparent",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        width: "100%",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.transform = "translateY(-4px)";
        el.style.borderColor = "rgba(212, 93, 72, 0.6)";
        el.style.boxShadow = "0 12px 24px -8px rgba(42, 49, 34, 0.15), 0 4px 8px -4px rgba(42, 49, 34, 0.05)";
        el.style.background = "rgba(255,255,255,0.4)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.transform = "translateY(0)";
        el.style.borderColor = "rgba(42, 49, 34, 0.15)";
        el.style.boxShadow = "none";
        el.style.background = "transparent";
      }}
    >
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1.25rem",
      }}>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "#5F6854",
          border: "1px solid rgba(42, 49, 34, 0.15)",
          padding: "0.25rem 0.5rem",
          borderRadius: "4px",
        }}>
          {tag}
        </span>
        <svg
          style={{ color: "#D45D48", opacity: 0.5 }}
          width="20" height="20" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </div>
      <h3 style={{
        fontFamily: "var(--font-serif)",
        fontSize: "1.5rem",
        fontWeight: 400,
        color: "#2A3122",
        lineHeight: 1.2,
        marginBottom: "0.75rem",
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: "0.95rem",
        color: "#5F6854",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}>
        {description}
      </p>
    </button>
  );
}

export default function Home() {
  const {
    phase,
    question,
    suggestions,
    selectedPerson,
    answer,
    isStreaming,
    dissent,
    error,
    messages,
    isFollowUpStreaming,
    askQuestion,
    selectPerson,
    askFollowUp,
    setAnswerRef,
    reset,
  } = useQuestion();

  const [dissentDismissed, setDissentDismissed] = useState(false);
  const lastQuestionRef = useRef("");

  // Reset dismissed state when a new question is asked
  useEffect(() => {
    if (question && question !== lastQuestionRef.current) {
      lastQuestionRef.current = question;
      setDissentDismissed(false);
    }
  }, [question]);

  const showDissent = dissent && selectedPerson && !dissentDismissed &&
    dissent.dissenter.slug !== selectedPerson.slug;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: phase !== "idle" && selectedPerson ? "1rem 2rem" : "2rem",
      height: phase !== "idle" && selectedPerson ? "100vh" : undefined,
      minHeight: phase !== "idle" && selectedPerson ? undefined : "100vh",
      overflow: phase !== "idle" && selectedPerson ? "hidden" : undefined,
      position: "relative",
    }}>
      <div style={{ width: "100%", maxWidth: "1120px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <Header compact={phase !== "idle" && !!selectedPerson} />

        <main>
          {/* Hero — shown when idle */}
          {phase === "idle" && (
            <>
              <section className="animate-fade-up" style={{ textAlign: "center", marginBottom: "4rem" }}>
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#D45D48",
                  marginBottom: "1.5rem",
                  display: "block",
                }}>
                  Knowledge Base
                </span>
                <h1 style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(3.5rem, 6vw, 5.5rem)",
                  fontWeight: 400,
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  marginBottom: "1.5rem",
                  color: "#2A3122",
                }}>
                  Ask <i style={{ fontStyle: "italic", paddingRight: "0.1em" }}>Lenny&apos;s</i> Network
                </h1>
                <p style={{
                  fontSize: "1.125rem",
                  color: "#5F6854",
                  fontFamily: "var(--font-sans)",
                  maxWidth: "500px",
                  margin: "0 auto",
                  lineHeight: 1.6,
                }}>
                  Search thousands of vetted answers, frameworks, and advice from world-class product leaders.
                </p>
              </section>

              <div className="animate-fade-up delay-3" style={{ marginBottom: "5rem" }}>
                <QuestionInput onSubmit={askQuestion} isLoading={false} />
              </div>

              <section className="animate-fade-up delay-4">
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "2rem",
                  gap: "1rem",
                }}>
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#5F6854",
                  }}>
                    Frequently Asked
                  </span>
                  <div style={{ flex: 1, height: "1px", background: "rgba(42, 49, 34, 0.15)" }} />
                </div>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "1.5rem",
                }}>
                  {exampleCards.map((card, i) => (
                    <ExampleCard
                      key={card.tag}
                      tag={card.tag}
                      title={card.title}
                      description={card.question}
                      onClick={() => askQuestion(card.question)}
                      delay={`delay-${i + 1}`}
                    />
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Active question state */}
          {phase !== "idle" && (
            <div style={{
              display: "flex",
              flexDirection: "column",
              height: "calc(100vh - 6.5rem)",
              minHeight: 0,
            }}>
              {/* Spacer */}
              <div style={{ flexShrink: 0 }} />

              {/* Loading state */}
              {phase === "selecting" && (
                <div style={{
                  textAlign: "center",
                  marginTop: "2rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "1rem",
                }}>
                  <svg className="animate-spin" style={{ width: "20px", height: "20px", color: "#5F6854" }} viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#5F6854",
                  }}>
                    Finding the best people to answer this...
                  </span>
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={{
                  maxWidth: "640px",
                  margin: "0.5rem auto",
                  padding: "1rem 1.5rem",
                  border: "1px solid rgba(212, 93, 72, 0.3)",
                  borderRadius: "8px",
                  background: "rgba(212, 93, 72, 0.05)",
                  color: "#D45D48",
                  fontSize: "0.9rem",
                  flexShrink: 0,
                }}>
                  {error}
                </div>
              )}

              {/* People suggestions (no person selected yet) */}
              {(phase === "selected" || phase === "answering" || phase === "answered") && !selectedPerson && (
                <div style={{ overflow: "auto", flex: 1, minHeight: 0 }}>
                  <PeopleSuggestions suggestions={suggestions} onSelect={selectPerson} />
                </div>
              )}

              {/* Selected person — tabs fixed, answer scrolls */}
              {selectedPerson && (
                <>
                  {/* Person tabs — fixed */}
                  <div style={{
                    display: "flex",
                    gap: "0.5rem",
                    justifyContent: "center",
                    flexWrap: "wrap",
                    marginBottom: "0.5rem",
                    flexShrink: 0,
                  }}>
                    {suggestions.map((s) => (
                      <button
                        key={s.person.slug}
                        onClick={() => selectPerson(s.person)}
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.7rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          padding: "0.5rem 1rem",
                          borderRadius: "100px",
                          border: `1px solid ${s.person.slug === selectedPerson.slug ? "#D45D48" : "rgba(42, 49, 34, 0.15)"}`,
                          background: s.person.slug === selectedPerson.slug ? "#D45D48" : "transparent",
                          color: s.person.slug === selectedPerson.slug ? "#fff" : "#5F6854",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                      >
                        {s.person.name}
                      </button>
                    ))}
                  </div>

                  {/* Chat interface */}
                  <AnswerPanel
                    person={selectedPerson}
                    question={question}
                    answer={answer}
                    isStreaming={isStreaming}
                    messages={messages}
                    isFollowUpStreaming={isFollowUpStreaming}
                    onFollowUp={askFollowUp}
                    onAnswerUpdate={setAnswerRef}
                  />
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Dissent bubble — shown once per question */}
      {showDissent && (
        <DissentBubble
          dissent={dissent}
          onSelect={() => {
            setDissentDismissed(true);
            selectPerson(dissent.dissenter);
          }}
          onDismiss={() => setDissentDismissed(true)}
        />
      )}
    </div>
  );
}
