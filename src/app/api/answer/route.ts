import { NextRequest } from "next/server";
import client from "@/lib/claude";
import { getPersonBySlug } from "@/lib/people";
import { getRelevantChunks } from "@/lib/content";
import { answerSynthesisPrompt, followUpPrompt } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  try {
    const { question, personSlug, history } = await req.json();
    if (!question || !personSlug) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const person = getPersonBySlug(personSlug);
    if (!person) {
      return new Response(JSON.stringify({ error: "Person not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const chunks = getRelevantChunks(personSlug, question);
    const chunksText = chunks
      .map((c) => `[From: ${c.sourceTitle} (${c.sourceDate})]\n${c.guestOnly || c.text}`)
      .join("\n\n---\n\n");

    const isFollowUp = Array.isArray(history) && history.length > 0;
    const prompt = isFollowUp
      ? followUpPrompt(person.name, person.title, chunksText, history, question)
      : answerSynthesisPrompt(person.name, person.title, question, chunksText);

    const stream = client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
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
    console.error("answer error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
