import fs from "fs";
import path from "path";
import { PRDSection, PRDImage } from "../../src/lib/prd-types";

function convertTables(md: string): string {
  return md.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_, tableContent) => {
    const rows: string[][] = [];
    const rowsRaw: string[][] = [];
    const rowMatches = tableContent.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
    let hasHeader = false;

    for (const row of rowMatches) {
      const cells: string[] = [];
      const cellsRaw: string[] = [];
      const cellMatches = row.match(/<(td|th)[^>]*>([\s\S]*?)<\/\1>/gi) || [];
      for (const cell of cellMatches) {
        if (cell.startsWith("<th")) hasHeader = true;
        const inner = cell.replace(/<(td|th)[^>]*>([\s\S]*?)<\/\1>/i, "$2");
        cellsRaw.push(inner);
        let text = inner
          .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
          .replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**")
          .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
          .replace(/<[^>]+>/g, "")
          .replace(/&amp;/g, "&")
          .replace(/&nbsp;/g, " ")
          .trim();
        cells.push(text);
      }
      if (cells.length > 0) {
        rows.push(cells);
        rowsRaw.push(cellsRaw);
      }
    }

    if (rows.length === 0) return "";

    if (!hasHeader && rowsRaw.length > 0) {
      const firstRowAllBold = rowsRaw[0].every((c) => /<strong|<b[^>]*>/i.test(c));
      if (firstRowAllBold) hasHeader = true;
    }

    const colCount = Math.max(...rows.map((r) => r.length));
    const padRow = (row: string[]) => {
      const padded = [...row];
      while (padded.length < colCount) padded.push("");
      return padded;
    };

    let table = "";
    const headerRow = padRow(rows[0]).map((c) =>
      hasHeader ? c.replace(/\*\*/g, "") : c
    );
    table += "| " + headerRow.join(" | ") + " |\n";
    table += "| " + headerRow.map(() => "---").join(" | ") + " |\n";
    for (let i = 1; i < rows.length; i++) {
      table += "| " + padRow(rows[i]).join(" | ") + " |\n";
    }

    return "\n\n" + table + "\n\n";
  });
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

function htmlToMarkdown(html: string, images: PRDImage[]): string {
  let md = html;

  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, (_, content) => `# ${stripTags(content)}\n\n`);
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, (_, content) => `## ${stripTags(content)}\n\n`);
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, (_, content) => `### ${stripTags(content)}\n\n`);
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, (_, content) => `#### ${stripTags(content)}\n\n`);
  md = md.replace(/<h5[^>]*>(.*?)<\/h5>/gi, (_, content) => `##### ${stripTags(content)}\n\n`);
  md = md.replace(/<h6[^>]*>(.*?)<\/h6>/gi, (_, content) => `###### ${stripTags(content)}\n\n`);

  md = convertTables(md);

  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**");
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*");
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*");

  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, content) => {
    const cleaned = content.replace(/<\/?p[^>]*>/gi, "").trim();
    return `{{LI}}${cleaned}{{/LI}}\n`;
  });

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

  md = md.replace(/\{\{LI\}\}|\{\{\/LI\}\}/g, "");
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, (_, content) => `${content.trim()}\n\n`);
  md = md.replace(/<br\s*\/?>/gi, "\n");
  md = md.replace(/<hr\s*\/?>/gi, "\n---\n\n");

  md = md.replace(/<img[^>]+>/gi, (match) => {
    const srcMatch = match.match(/src="([^"]+)"/);
    const altMatch = match.match(/alt="([^"]*)"/);
    if (srcMatch) {
      const id = `prd-img-${images.length}`;
      images.push({ id, src: srcMatch[1], alt: altMatch ? altMatch[1] : "" });
      return `\n\n![${altMatch ? altMatch[1] : ""}](${id})\n\n`;
    }
    return "";
  });

  md = md.replace(/<[^>]+>/g, "");
  md = md.replace(/&amp;/g, "&");
  md = md.replace(/&lt;/g, "<");
  md = md.replace(/&gt;/g, ">");
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#39;/g, "'");
  md = md.replace(/&nbsp;/g, " ");
  md = md.replace(/\n{3,}/g, "\n\n");

  return md.trim();
}

function splitIntoSections(text: string): PRDSection[] {
  const lines = text.split("\n");
  const sections: PRDSection[] = [];
  let currentHeading: string | null = null;
  let currentContent: string[] = [];
  let index = 0;

  const flushSection = () => {
    const content = currentContent.join("\n").trim();
    if (content) {
      sections.push({ id: `section-${index}`, heading: currentHeading, content, index });
      index++;
    }
    currentContent = [];
  };

  for (const line of lines) {
    if (line.includes("<img") || line.includes("base64,") || line.includes("data:image")) {
      currentContent.push(line);
      continue;
    }

    const topLevelHeading = line.match(/^#{1,2}\s+(.+)/);
    const isSubheading = line.match(/^#{3,}\s+/);

    const allCapsHeading =
      !isSubheading &&
      line.trim().length > 3 &&
      line.trim() === line.trim().toUpperCase() &&
      /[A-Z]/.test(line.trim()) &&
      !/^[\-\*\d]/.test(line.trim());

    if ((topLevelHeading && !isSubheading) || allCapsHeading) {
      flushSection();
      currentHeading = topLevelHeading ? topLevelHeading[1].trim() : line.trim();
      continue;
    }

    if (line.trim() === "" && currentContent.length > 0) {
      const lastLine = currentContent[currentContent.length - 1];
      if (lastLine && lastLine.trim() === "") {
        flushSection();
        currentHeading = null;
        continue;
      }
    }

    currentContent.push(line);
  }

  flushSection();

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
  const headingMatch = text.match(/^#{1,2}\s+(.+)/m);
  if (headingMatch) return headingMatch[1].trim();

  const lines = text.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 3 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)) {
      return trimmed;
    }
  }

  return filename.replace(/\.(pdf|docx|txt|md)$/i, "");
}

export interface ParsedPRD {
  title: string;
  sections: PRDSection[];
  rawText: string;
  images: PRDImage[];
  sourceType: "pdf" | "docx" | "text";
}

export async function parsePRDFromFile(filePath: string): Promise<ParsedPRD> {
  const ext = path.extname(filePath).toLowerCase().slice(1);
  const filename = path.basename(filePath);
  const buffer = fs.readFileSync(filePath);

  if (ext === "txt" || ext === "md") {
    const rawText = buffer.toString("utf-8");
    const title = extractTitle(rawText, filename);
    const sections = splitIntoSections(rawText);
    return { title, sections, rawText, images: [], sourceType: "text" };
  }

  if (ext === "docx") {
    const mammoth = await import("mammoth");
    const images: PRDImage[] = [];
    const result = await mammoth.convertToHtml({ buffer });
    const rawText = htmlToMarkdown(result.value, images);

    if (!rawText.trim()) {
      throw new Error("Could not extract text from file. It may be scanned or empty.");
    }

    const title = extractTitle(rawText, filename);
    const sections = splitIntoSections(rawText);
    return { title, sections, rawText, images, sourceType: "docx" };
  }

  if (ext === "pdf") {
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const doc = await (pdfjsLib as any).getDocument({ data: new Uint8Array(buffer) }).promise;
    const pages: string[] = [];

    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      pages.push(pageText);
    }

    const rawText = pages.join("\n\n");
    if (!rawText.trim()) {
      throw new Error("Could not read this PDF. It may be scanned or empty.");
    }

    const title = extractTitle(rawText, filename);
    const sections = splitIntoSections(rawText);
    return { title, sections, rawText, images: [], sourceType: "pdf" };
  }

  throw new Error(`Unsupported file type: .${ext}. Supported: pdf, docx, txt, md`);
}

export function parsePRDFromText(text: string, title?: string): ParsedPRD {
  const resolvedTitle = title || extractTitle(text, "untitled");
  const sections = splitIntoSections(text);
  return { title: resolvedTitle, sections, rawText: text, images: [], sourceType: "text" };
}
