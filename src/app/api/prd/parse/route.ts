import { NextRequest, NextResponse } from "next/server";
import { PRDSection, ParsedPRD } from "@/lib/prd-types";

/**
 * Convert HTML (from mammoth) to markdown, preserving headings, lists,
 * bold, italic, and paragraph structure.
 */
function htmlToMarkdown(html: string): string {
  let md = html;

  // Replace headings
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, (_, content) => `# ${stripTags(content)}\n\n`);
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, (_, content) => `## ${stripTags(content)}\n\n`);
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, (_, content) => `### ${stripTags(content)}\n\n`);
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, (_, content) => `#### ${stripTags(content)}\n\n`);
  md = md.replace(/<h5[^>]*>(.*?)<\/h5>/gi, (_, content) => `##### ${stripTags(content)}\n\n`);
  md = md.replace(/<h6[^>]*>(.*?)<\/h6>/gi, (_, content) => `###### ${stripTags(content)}\n\n`);

  // Bold and italic (before stripping other tags)
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**");
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*");
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*");

  // Handle nested lists by processing from inside out
  // First, convert list items
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, content) => {
    // Clean inner content but preserve nested lists temporarily
    const cleaned = content.replace(/<\/?p[^>]*>/gi, "").trim();
    return `{{LI}}${cleaned}{{/LI}}\n`;
  });

  // Convert unordered lists
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, content) => {
    const items = content.match(/\{\{LI\}\}([\s\S]*?)\{\{\/LI\}\}/g) || [];
    const result = items
      .map((item: string) => {
        const text = item.replace(/\{\{LI\}\}|\{\{\/LI\}\}/g, "").trim();
        return `- ${text}`;
      })
      .join("\n");
    return `\n${result}\n\n`;
  });

  // Convert ordered lists
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, content) => {
    const items = content.match(/\{\{LI\}\}([\s\S]*?)\{\{\/LI\}\}/g) || [];
    let idx = 0;
    const result = items
      .map((item: string) => {
        idx++;
        const text = item.replace(/\{\{LI\}\}|\{\{\/LI\}\}/g, "").trim();
        return `${idx}. ${text}`;
      })
      .join("\n");
    return `\n${result}\n\n`;
  });

  // Clean up any remaining LI markers
  md = md.replace(/\{\{LI\}\}|\{\{\/LI\}\}/g, "");

  // Paragraphs
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, (_, content) => `${content.trim()}\n\n`);

  // Line breaks
  md = md.replace(/<br\s*\/?>/gi, "\n");

  // Horizontal rules
  md = md.replace(/<hr\s*\/?>/gi, "\n---\n\n");

  // Strip remaining HTML tags
  md = md.replace(/<[^>]+>/g, "");

  // Decode common HTML entities
  md = md.replace(/&amp;/g, "&");
  md = md.replace(/&lt;/g, "<");
  md = md.replace(/&gt;/g, ">");
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#39;/g, "'");
  md = md.replace(/&nbsp;/g, " ");

  // Normalize excessive blank lines
  md = md.replace(/\n{3,}/g, "\n\n");

  return md.trim();
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

/**
 * Split markdown text into sections. Only top-level headings (# and ##) create
 * new sections. Subheadings (### and below) stay within the section content
 * so ReactMarkdown can render them with proper hierarchy.
 */
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
    // Only split on # and ## (top-level headings) — keep ### and below in content
    const topLevelHeading = line.match(/^#{1,2}\s+(.+)/);
    // Don't match ### or deeper as section boundaries
    const isSubheading = line.match(/^#{3,}\s+/);

    const allCapsHeading =
      !isSubheading &&
      line.trim().length > 3 &&
      line.trim() === line.trim().toUpperCase() &&
      /[A-Z]/.test(line.trim()) &&
      // Avoid matching bullet points or numbered items that happen to be caps
      !/^[\-\*\d]/.test(line.trim());

    if ((topLevelHeading && !isSubheading) || allCapsHeading) {
      flushSection();
      currentHeading = topLevelHeading
        ? topLevelHeading[1].trim()
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
  const headingMatch = text.match(/^#{1,2}\s+(.+)/m);
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
      // Use convertToHtml to preserve headings, lists, bold/italic, etc.
      const mammoth = await import("mammoth");
      const result = await mammoth.convertToHtml({ buffer });
      rawText = htmlToMarkdown(result.value);
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
