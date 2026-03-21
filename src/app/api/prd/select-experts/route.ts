import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/claude";
import { getPeopleMetaString, getPersonBySlug } from "@/lib/people";
import { prdExpertSelectionPrompt } from "@/lib/prd-prompts";
import { checkAuthAndQuota } from "@/lib/auth-check";

export async function POST(req: NextRequest) {
  try {
    const auth = await checkAuthAndQuota(req, true); // count this as a query
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { prdText, title } = await req.json();
    if (!prdText || !title) {
      return NextResponse.json(
        { error: "Missing prdText or title" },
        { status: 400 }
      );
    }

    // Truncate PRD to ~2000 words for selection prompt
    const words = prdText.split(/\s+/);
    const summary =
      words.length > 2000 ? words.slice(0, 2000).join(" ") + "..." : prdText;

    const peopleMetaJson = getPeopleMetaString();
    const prompt = prdExpertSelectionPrompt(peopleMetaJson, title, summary);

    const claude = getClient(auth.apiKey);
    const response = await claude.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    let jsonStr = text;
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    }

    const suggestions = JSON.parse(jsonStr);

    const enriched = suggestions
      .map((s: { slug: string; reason: string }) => {
        const person = getPersonBySlug(s.slug);
        if (!person) return null;
        return { person, reason: s.reason };
      })
      .filter(Boolean);

    return NextResponse.json({ suggestions: enriched });
  } catch (error: any) {
    console.error("PRD select-experts error:", error);
    return NextResponse.json(
      { error: error.message || "Internal error" },
      { status: 500 }
    );
  }
}
