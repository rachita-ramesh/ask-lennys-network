"use client";
import { useState, useCallback, useRef } from "react";
import { Person } from "@/lib/types";
import { Message } from "@/hooks/useQuestion";
import QuestionInput from "@/components/QuestionInput";
import AnswerPanel from "@/components/AnswerPanel";
import { useStreamingResponse } from "@/hooks/useStreamingResponse";

interface Props {
  person: Person;
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

  return (
    <div>
      <QuestionInput onSubmit={handleAsk} isLoading={isStreaming} />
      {asked && (
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
      )}
    </div>
  );
}
