"use client";
import { useState, useCallback, useRef } from "react";
import { Suggestion, Person, DissentResult } from "@/lib/types";

type Phase = "idle" | "selecting" | "selected" | "answering" | "answered";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

async function fetchAnswer(personSlug: string, question: string, history?: Message[]): Promise<string> {
  const body: Record<string, unknown> = { question, personSlug };
  if (history && history.length > 0) {
    body.history = history;
  }
  const res = await fetch("/api/answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to fetch answer");

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";

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
          if (parsed.text) fullText += parsed.text;
        } catch {}
      }
    }
  }
  return fullText;
}

export function useQuestion() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [question, setQuestion] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [answer, setAnswer] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [dissent, setDissent] = useState<DissentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isFollowUpStreaming, setIsFollowUpStreaming] = useState(false);

  // Pre-fetched answers keyed by person slug
  const prefetchedAnswers = useRef<Map<string, string>>(new Map());
  // Follow-up messages keyed by person slug
  const messagesPerPerson = useRef<Map<string, Message[]>>(new Map());
  const latestAnswerRef = useRef("");

  const askQuestion = useCallback(async (q: string) => {
    setQuestion(q);
    setPhase("selecting");
    setSuggestions([]);
    setSelectedPerson(null);
    setDissent(null);
    setError(null);
    setMessages([]);
    setAnswer("");
    prefetchedAnswers.current.clear();
    messagesPerPerson.current.clear();

    try {
      const res = await fetch("/api/suggest-people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to get suggestions");
      }
      const data = await res.json();
      setSuggestions(data.suggestions);
      setPhase("selected");

      // Pre-fetch all 4 answers in parallel
      for (const s of data.suggestions) {
        fetchAnswer(s.person.slug, q)
          .then((text) => {
            prefetchedAnswers.current.set(s.person.slug, text);
          })
          .catch(() => {});
      }
    } catch (err: any) {
      setError(err.message);
      setPhase("idle");
    }
  }, []);

  const selectPerson = useCallback(
    async (person: Person) => {
      // Save current person's messages before switching
      setMessages((prev) => {
        if (selectedPerson && prev.length > 0) {
          messagesPerPerson.current.set(selectedPerson.slug, prev);
        }
        return prev;
      });

      setSelectedPerson(person);
      setDissent(null);
      // Restore target person's messages
      const savedMessages = messagesPerPerson.current.get(person.slug) || [];
      setMessages(savedMessages);
      latestAnswerRef.current = "";

      // Check if answer is already prefetched
      const cached = prefetchedAnswers.current.get(person.slug);
      if (cached) {
        setAnswer(cached);
        latestAnswerRef.current = cached;
        setPhase("answered");
      } else {
        // Not ready yet — stream it live
        setAnswer("");
        setPhase("answering");
        setIsStreaming(true);

        try {
          const text = await fetchAnswer(person.slug, question);
          setAnswer(text);
          latestAnswerRef.current = text;
          prefetchedAnswers.current.set(person.slug, text);
          setPhase("answered");
        } catch (err: any) {
          setError(err.message);
          setPhase("selected");
        } finally {
          setIsStreaming(false);
        }
        return;
      }

      // Fire dissent check async
      const otherSlugs = suggestions
        .map((s) => s.person.slug)
        .filter((s) => s !== person.slug);

      if (otherSlugs.length > 0) {
        fetch("/api/dissent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question,
            answerSummary: cached || "",
            answererSlug: person.slug,
            otherSlugs,
          }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.dissent) setDissent(data.dissent);
          })
          .catch(() => {});
      }
    },
    [question, suggestions]
  );

  const askFollowUp = useCallback(
    async (followUp: string) => {
      if (!selectedPerson || isFollowUpStreaming) return;

      setIsFollowUpStreaming(true);
      setError(null);

      const currentHistory: Message[] = [...messages];
      if (currentHistory.length === 0) {
        currentHistory.push({ role: "user", content: question });
        currentHistory.push({ role: "assistant", content: latestAnswerRef.current });
      }
      currentHistory.push({ role: "user", content: followUp });

      try {
        const followUpText = await fetchAnswer(selectedPerson.slug, followUp, currentHistory);

        setMessages((prev) => {
          const updated = [...prev];
          if (updated.length === 0) {
            updated.push({ role: "user", content: question });
            updated.push({ role: "assistant", content: latestAnswerRef.current });
          }
          updated.push({ role: "user", content: followUp });
          updated.push({ role: "assistant", content: followUpText });
          // Persist to per-person map
          if (selectedPerson) {
            messagesPerPerson.current.set(selectedPerson.slug, updated);
          }
          return updated;
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsFollowUpStreaming(false);
      }
    },
    [selectedPerson, isFollowUpStreaming, messages, question]
  );

  const setAnswerRef = useCallback((text: string) => {
    latestAnswerRef.current = text;
  }, []);

  const reset = useCallback(() => {
    setPhase("idle");
    setQuestion("");
    setSuggestions([]);
    setSelectedPerson(null);
    setDissent(null);
    setError(null);
    setMessages([]);
    setAnswer("");
    prefetchedAnswers.current.clear();
    messagesPerPerson.current.clear();
  }, []);

  return {
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
  };
}
