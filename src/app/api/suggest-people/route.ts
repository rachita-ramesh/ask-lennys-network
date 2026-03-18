import { NextRequest, NextResponse } from "next/server";
import client from "@/lib/claude";
import { getPeopleMetaString, getPersonBySlug } from "@/lib/people";
import { personSelectionPrompt } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const peopleMetaJson = getPeopleMetaString();
    const prompt = personSelectionPrompt(peopleMetaJson, question);

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = text;
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    }

    const suggestions = JSON.parse(jsonStr);

    // Enrich with full person data
    const enriched = suggestions
      .map((s: { slug: string; reason: string }) => {
        const person = getPersonBySlug(s.slug);
        if (!person) return null;
        return { person, reason: s.reason };
      })
      .filter(Boolean);

    return NextResponse.json({ suggestions: enriched });
  } catch (error: any) {
    console.error("suggest-people error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
