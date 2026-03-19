import { NextRequest } from "next/server";
import client from "@/lib/claude";
import { getPersonBySlug } from "@/lib/people";
import { getRelevantChunks } from "@/lib/content";
import { prdReviewPrompt } from "@/lib/prd-prompts";
import { PRDSection } from "@/lib/prd-types";

export async function POST(req: NextRequest) {
  try {
    const { personSlug, prdTitle, sections } = (await req.json()) as {
      personSlug: string;
      prdTitle: string;
      sections: PRDSection[];
    };

    if (!personSlug || !prdTitle || !sections?.length) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const person = getPersonBySlug(personSlug);
    if (!person) {
      return new Response(JSON.stringify({ error: "Person not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Build a search query from the PRD title + first section content
    const searchQuery = `${prdTitle} ${sections.slice(0, 3).map((s) => s.content).join(" ")}`.slice(0, 500);
    const chunks = getRelevantChunks(personSlug, searchQuery, 4000);
    const chunksText = chunks
      .map(
        (c) =>
          `[From: ${c.sourceTitle} (${c.sourceDate})]\n${c.guestOnly || c.text}`
      )
      .join("\n\n---\n\n");

    // Format sections for the prompt
    const sectionsText = sections
      .map(
        (s) =>
          `[${s.id}]${s.heading ? ` ${s.heading}` : ""}\n${s.content}`
      )
      .join("\n\n");

    const prompt = prdReviewPrompt(
      person.name,
      person.title,
      chunksText,
      prdTitle,
      sectionsText
    );

    const stream = client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      temperature: 0.5,
      messages: [{ role: "user", content: prompt }],
    });

    const encoder = new TextEncoder();
    let buffer = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              buffer += event.delta.text;

              // Try to extract complete JSON objects line by line
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith("{")) continue;

                try {
                  const comment = JSON.parse(trimmed);
                  if (comment.sectionId && comment.content) {
                    const id = `${personSlug}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
                    const data = `data: ${JSON.stringify({
                      type: "comment",
                      comment: {
                        id,
                        sectionId: comment.sectionId,
                        highlightText: comment.highlightText || "",
                        content: comment.content,
                      },
                    })}\n\n`;
                    controller.enqueue(encoder.encode(data));
                  }
                } catch {
                  // Not valid JSON yet, skip
                }
              }
            }
          }

          // Process any remaining buffer
          if (buffer.trim()) {
            try {
              const comment = JSON.parse(buffer.trim());
              if (comment.sectionId && comment.content) {
                const id = `${personSlug}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
                const data = `data: ${JSON.stringify({
                  type: "comment",
                  comment: {
                    id,
                    sectionId: comment.sectionId,
                    highlightText: comment.highlightText || "",
                    content: comment.content,
                  },
                })}\n\n`;
                controller.enqueue(encoder.encode(data));
              }
            } catch {}
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("PRD review error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
