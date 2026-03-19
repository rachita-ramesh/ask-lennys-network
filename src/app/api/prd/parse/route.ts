import { NextRequest, NextResponse } from "next/server";
import { PRDSection, ParsedPRD } from "@/lib/prd-types";

function splitIntoSections(text: string): PRDSection[] {
  const lines = text.split("\n");
  const sections: PRDSection[] = [];
  let currentHeading: string | null = null;
  let currentContent: string[] = [];
  let index = 0;

  const flushSection = () => {
    const content = currentContent.join("\n").trim();
    if (content) {
      sections.push({
        id: `section-${index}`,
        heading: currentHeading,
        content,
        index,
      });
      index++;
    }
    currentContent = [];
  };

  for (const line of lines) {
    // Detect headings: markdown style or ALL CAPS lines (>3 chars, no lowercase)
    const markdownHeading = line.match(/^#{1,3}\s+(.+)/);
    const allCapsHeading =
      line.trim().length > 3 &&
      line.trim() === line.trim().toUpperCase() &&
      /[A-Z]/.test(line.trim());

    if (markdownHeading || allCapsHeading) {
      flushSection();
      currentHeading = markdownHeading
        ? markdownHeading[1].trim()
        : line.trim();
      continue;
    }

    // Double newline = paragraph break within a section
    if (line.trim() === "" && currentContent.length > 0) {
      const lastLine = currentContent[currentContent.length - 1];
      if (lastLine && lastLine.trim() === "") {
        // Double blank line — flush as separate section
        flushSection();
        currentHeading = null;
        continue;
      }
    }

    currentContent.push(line);
  }

  flushSection();

  // If we got very few sections, re-split by paragraphs
  if (sections.length <= 2 && text.length > 500) {
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim());
    return paragraphs.map((p, i) => ({
      id: `section-${i}`,
      heading: null,
      content: p.trim(),
      index: i,
    }));
  }

  return sections;
}

function extractTitle(text: string, filename: string): string {
  // Try first heading
  const headingMatch = text.match(/^#{1,3}\s+(.+)/m);
  if (headingMatch) return headingMatch[1].trim();

  // Try first ALL CAPS line
  const lines = text.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.length > 3 &&
      trimmed === trimmed.toUpperCase() &&
      /[A-Z]/.test(trimmed)
    ) {
      return trimmed;
    }
  }

  // Fall back to filename without extension
  return filename.replace(/\.(pdf|docx)$/i, "");
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const filename = file.name;
    const ext = filename.split(".").pop()?.toLowerCase();

    if (!ext || !["pdf", "docx"].includes(ext)) {
      return NextResponse.json(
        { error: "Only PDF and DOCX files are supported" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let rawText = "";

    if (ext === "pdf") {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(buffer);
      rawText = data.text;
    } else {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      rawText = result.value;
    }

    if (!rawText.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from file. It may be scanned or empty." },
        { status: 422 }
      );
    }

    const title = extractTitle(rawText, filename);
    const sections = splitIntoSections(rawText);

    const parsed: ParsedPRD = { title, sections, rawText };
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("PRD parse error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to parse file" },
      { status: 500 }
    );
  }
}
