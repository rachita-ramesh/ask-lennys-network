import { NextRequest, NextResponse } from "next/server";
import client from "@/lib/claude";
import { getPersonBySlug } from "@/lib/people";
import { getRelevantChunks } from "@/lib/content";
import { dissentPrompt } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  try {
    const { question, answerSummary, answererSlug, otherSlugs } = await req.json();
    if (!question || !answerSummary || !answererSlug || !otherSlugs?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const answerer = getPersonBySlug(answererSlug);
    if (!answerer) {
      return NextResponse.json({ error: "Answerer not found" }, { status: 404 });
    }

    // Build candidate info with chunks
    const candidatesInfo = otherSlugs
      .map((slug: string) => {
        const person = getPersonBySlug(slug);
        if (!person) return "";
        const chunks = getRelevantChunks(slug, question, 3000);
        const text = chunks.map((c) => c.guestOnly || c.text).join("\n\n");
        return `## ${person.name} (${person.title})\nSlug: ${person.slug}\n${text}`;
      })
      .filter(Boolean)
      .join("\n\n===\n\n");

    const prompt = dissentPrompt(answerSummary, answerer.name, candidatesInfo);

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      temperature: 0.6,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    let jsonStr = text.trim();
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    }

    if (jsonStr === "null" || jsonStr === "") {
      return NextResponse.json({ dissent: null });
    }

    const parsed = JSON.parse(jsonStr);
    const dissenterPerson = getPersonBySlug(parsed.dissenterSlug);

    return NextResponse.json({
      dissent: dissenterPerson
        ? {
            dissenter: dissenterPerson,
            point: parsed.point,
            quote: parsed.quote,
          }
        : null,
    });
  } catch (error: any) {
    console.error("dissent error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
