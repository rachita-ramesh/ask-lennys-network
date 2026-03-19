"use client";
import { useState, useCallback, useRef } from "react";
import { Person, Suggestion } from "@/lib/types";
import {
  ParsedPRD,
  PRDComment,
  ExpertReview,
} from "@/lib/prd-types";

type Phase =
  | "idle"
  | "uploading"
  | "parsing"
  | "selecting"
  | "reviewing"
  | "done";

export function usePRDReview() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [parsedPRD, setParsedPRD] = useState<ParsedPRD | null>(null);
  const [experts, setExperts] = useState<ExpertReview[]>([]);
  const [allComments, setAllComments] = useState<PRDComment[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [replyStreaming, setReplyStreaming] = useState<string | null>(null); // commentId being replied to

  const uploadAndReview = useCallback(async (file: File) => {
    setError(null);
    setPhase("uploading");
    setParsedPRD(null);
    setExperts([]);
    setAllComments([]);

    try {
      // 1. Parse the file
      setPhase("parsing");
      const formData = new FormData();
      formData.append("file", file);

      const parseRes = await fetch("/api/prd/parse", {
        method: "POST",
        body: formData,
      });

      if (!parseRes.ok) {
        const err = await parseRes.json();
        throw new Error(err.error || "Failed to parse file");
      }

      const parsed: ParsedPRD = await parseRes.json();
      setParsedPRD(parsed);

      // 2. Select experts
      setPhase("selecting");
      const selectRes = await fetch("/api/prd/select-experts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prdText: parsed.rawText, title: parsed.title }),
      });

      if (!selectRes.ok) {
        const err = await selectRes.json();
        throw new Error(err.error || "Failed to select experts");
      }

      const { suggestions } = await selectRes.json() as {
        suggestions: Suggestion[];
      };

      const reviewExperts: ExpertReview[] = suggestions.map((s) => ({
        expert: s.person,
        reason: s.reason,
        status: "pending" as const,
        comments: [],
      }));
      setExperts(reviewExperts);

      // 3. Start all reviews in parallel
      setPhase("reviewing");

      await Promise.allSettled(
        reviewExperts.map((er) =>
          streamExpertReview(er.expert, parsed, (comment) => {
            const fullComment: PRDComment = {
              ...comment,
              expert: er.expert,
              timestamp: Date.now(),
              parentId: null,
            };
            setAllComments((prev) => [...prev, fullComment]);
            setExperts((prev) =>
              prev.map((e) =>
                e.expert.slug === er.expert.slug
                  ? { ...e, comments: [...e.comments, fullComment] }
                  : e
              )
            );
          })
            .then(() => {
              setExperts((prev) =>
                prev.map((e) =>
                  e.expert.slug === er.expert.slug
                    ? { ...e, status: "done" }
                    : e
                )
              );
            })
            .catch(() => {
              setExperts((prev) =>
                prev.map((e) =>
                  e.expert.slug === er.expert.slug
                    ? { ...e, status: "error" }
                    : e
                )
              );
            })
        )
      );

      setPhase("done");
    } catch (err: any) {
      setError(err.message);
      setPhase("idle");
    }
  }, []);

  const replyToComment = useCallback(
    async (commentId: string, userMessage: string) => {
      if (!parsedPRD || replyStreaming) return;

      const comment = allComments.find((c) => c.id === commentId);
      if (!comment) return;

      // Find the section
      const section = parsedPRD.sections.find(
        (s) => s.id === comment.sectionId
      );
      if (!section) return;

      // Build thread history (existing replies to this comment)
      const threadReplies = allComments.filter(
        (c) => c.parentId === commentId
      );
      const threadHistory = threadReplies.map((r) => ({
        role: (r.expert.slug === comment.expert.slug
          ? "assistant"
          : "user") as "user" | "assistant",
        content: r.content,
      }));

      // Other experts' comments on the same section
      const otherComments = allComments
        .filter(
          (c) =>
            c.sectionId === comment.sectionId &&
            c.expert.slug !== comment.expert.slug &&
            c.parentId === null
        )
        .map((c) => `${c.expert.name}: ${c.content}`)
        .join("\n\n");

      // Add user message as a reply immediately
      const userReply: PRDComment = {
        id: `user-${Date.now()}`,
        sectionId: comment.sectionId,
        highlightText: "",
        expert: comment.expert, // placeholder — it's the user's reply
        content: userMessage,
        timestamp: Date.now(),
        parentId: commentId,
      };
      // We'll mark user replies differently in the UI by checking if content was from user
      setAllComments((prev) => [
        ...prev,
        { ...userReply, expert: { ...comment.expert, slug: "__user__" } as Person },
      ]);

      setReplyStreaming(commentId);

      try {
        const res = await fetch("/api/prd/reply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            personSlug: comment.expert.slug,
            sectionContent: section.content,
            originalComment: comment.content,
            otherComments,
            threadHistory: [
              ...threadHistory,
              { role: "user", content: userMessage },
            ],
            userMessage,
          }),
        });

        if (!res.ok) throw new Error("Reply failed");

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let replyText = "";

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
                if (parsed.text) replyText += parsed.text;
              } catch {}
            }
          }
        }

        const expertReply: PRDComment = {
          id: `reply-${comment.expert.slug}-${Date.now()}`,
          sectionId: comment.sectionId,
          highlightText: "",
          expert: comment.expert,
          content: replyText,
          timestamp: Date.now(),
          parentId: commentId,
        };
        setAllComments((prev) => [...prev, expertReply]);
      } catch {} finally {
        setReplyStreaming(null);
      }
    },
    [parsedPRD, allComments, replyStreaming]
  );

  const reset = useCallback(() => {
    setPhase("idle");
    setParsedPRD(null);
    setExperts([]);
    setAllComments([]);
    setActiveSectionId(null);
    setError(null);
    setReplyStreaming(null);
  }, []);

  return {
    phase,
    parsedPRD,
    experts,
    allComments,
    activeSectionId,
    error,
    replyStreaming,
    uploadAndReview,
    replyToComment,
    setActiveSectionId,
    reset,
  };
}

async function streamExpertReview(
  expert: Person,
  prd: ParsedPRD,
  onComment: (comment: {
    id: string;
    sectionId: string;
    highlightText: string;
    content: string;
  }) => void
): Promise<void> {
  const res = await fetch("/api/prd/review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      personSlug: expert.slug,
      prdTitle: prd.title,
      sections: prd.sections,
    }),
  });

  if (!res.ok) throw new Error(`Review failed for ${expert.name}`);

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

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
          if (parsed.type === "comment" && parsed.comment) {
            onComment(parsed.comment);
          }
        } catch {}
      }
    }
  }
}
