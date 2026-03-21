import { NextRequest } from "next/server";
import { getClient } from "@/lib/claude";
import { getPersonBySlug } from "@/lib/people";
import { getRelevantChunks } from "@/lib/content";
import { prdReplyPrompt } from "@/lib/prd-prompts";
import { checkAuthAndQuota } from "@/lib/auth-check";

export async function POST(req: NextRequest) {
  try {
    const auth = await checkAuthAndQuota(req, false);
    if (!auth.ok) {
      return new Response(JSON.stringify({ error: auth.error }), {
        status: auth.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const {
      personSlug,
      sectionContent,
      originalComment,
      otherComments,
      threadHistory,
      userMessage,
    } = await req.json();

    if (!personSlug || !sectionContent || !originalComment || !userMessage) {
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

    const chunks = getRelevantChunks(personSlug, sectionContent, 3000);
    const chunksText = chunks
      .map(
        (c) =>
          `[From: ${c.sourceTitle} (${c.sourceDate})]\n${c.guestOnly || c.text}`
      )
      .join("\n\n---\n\n");

    const prompt = prdReplyPrompt(
      person.name,
      person.title,
      chunksText,
      sectionContent,
      originalComment,
      otherComments || "",
      threadHistory || [],
      userMessage
    );

    const claude = getClient(auth.apiKey);
    const stream = claude.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      temperature: 0.5,
      messages: [{ role: "user", content: prompt }],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const data = `data: ${JSON.stringify({ text: event.delta.text })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
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
    console.error("PRD reply error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
