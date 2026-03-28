#!/usr/bin/env node

import path from "path";
import { fileURLToPath } from "url";

// Set data dir before importing shared lib (they read it at import time)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.PRD_DATA_DIR ||= path.join(__dirname, "../../public/data");

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { getClient } from "../../src/lib/claude";
import { getAllPeople, getPeopleMetaString, getPersonBySlug } from "../../src/lib/people";
import { getRelevantChunks } from "../../src/lib/content";
import { prdExpertSelectionPrompt, prdReviewPrompt, prdReplyPrompt } from "../../src/lib/prd-prompts";
import { PRDSection } from "../../src/lib/prd-types";
import { parsePRDFromFile, parsePRDFromText } from "./parse";

const anthropic = getClient();

const server = new McpServer({
  name: "prd-reviewer",
  version: "1.0.0",
});

// --- Tool: parse_prd ---
server.tool(
  "parse_prd",
  "Parse a PRD from a file path (PDF, DOCX, TXT, MD) or raw text into structured sections",
  {
    file_path: z.string().optional().describe("Absolute path to a PRD file (PDF, DOCX, TXT, or MD)"),
    text: z.string().optional().describe("Raw PRD text (used if file_path is not provided)"),
    title: z.string().optional().describe("PRD title (auto-detected if not provided)"),
  },
  async ({ file_path, text, title }) => {
    if (!file_path && !text) {
      return { content: [{ type: "text" as const, text: "Error: Provide either file_path or text" }] };
    }

    try {
      const parsed = file_path
        ? await parsePRDFromFile(file_path)
        : parsePRDFromText(text!, title);

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            title: parsed.title,
            sectionCount: parsed.sections.length,
            sections: parsed.sections.map((s) => ({
              id: s.id,
              heading: s.heading,
              contentPreview: s.content.slice(0, 200) + (s.content.length > 200 ? "..." : ""),
            })),
            rawTextLength: parsed.rawText.length,
            sourceType: parsed.sourceType,
          }, null, 2),
        }],
      };
    } catch (err: any) {
      return { content: [{ type: "text" as const, text: `Error parsing PRD: ${err.message}` }] };
    }
  }
);

// --- Tool: list_experts ---
server.tool(
  "list_experts",
  "List all available experts from Lenny's Network with their expertise areas",
  {
    query: z.string().optional().describe("Filter experts by name, title, or tag"),
  },
  async ({ query }) => {
    let people = getAllPeople();

    if (query) {
      const q = query.toLowerCase();
      people = people.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.tags.some((t: string) => t.includes(q))
      );
    }

    const result = people.map((p) => ({
      slug: p.slug,
      name: p.name,
      title: p.title,
      tags: p.tags,
      description: p.description,
      sourceCount: p.sources.length,
      totalWords: p.totalWords,
    }));

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({ count: result.length, experts: result }, null, 2),
      }],
    };
  }
);

// --- Tool: select_experts ---
server.tool(
  "select_experts",
  "Given PRD content, use AI to select the 4 best expert reviewers from Lenny's Network",
  {
    prd_title: z.string().describe("Title of the PRD"),
    prd_text: z.string().describe("Full or summary text of the PRD"),
  },
  async ({ prd_title, prd_text }) => {
    try {
      const words = prd_text.split(/\s+/);
      const summary = words.length > 2000 ? words.slice(0, 2000).join(" ") + "..." : prd_text;

      const peopleMetaJson = getPeopleMetaString();
      const prompt = prdExpertSelectionPrompt(peopleMetaJson, prd_title, summary);

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        temperature: 0.3,
        messages: [{ role: "user", content: prompt }],
      });

      const text = response.content[0].type === "text" ? response.content[0].text : "";

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
          return {
            slug: person.slug,
            name: person.name,
            title: person.title,
            tags: person.tags,
            reason: s.reason,
          };
        })
        .filter(Boolean);

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({ experts: enriched }, null, 2),
        }],
      };
    } catch (err: any) {
      return { content: [{ type: "text" as const, text: `Error selecting experts: ${err.message}` }] };
    }
  }
);

// --- Tool: review_prd ---
server.tool(
  "review_prd",
  "Have a specific expert review a PRD. Returns inline comments with section references. Provide either parsed sections or raw text (which will be auto-parsed).",
  {
    expert_slug: z.string().describe("Slug of the expert to review as (from select_experts or list_experts)"),
    prd_title: z.string().describe("Title of the PRD"),
    sections: z.array(z.object({
      id: z.string(),
      heading: z.string().nullable(),
      content: z.string(),
      index: z.number(),
    })).optional().describe("Parsed PRD sections (from parse_prd)"),
    prd_text: z.string().optional().describe("Raw PRD text — will be auto-parsed into sections if sections not provided"),
  },
  async ({ expert_slug, prd_title, sections: inputSections, prd_text }) => {
    try {
      const person = getPersonBySlug(expert_slug);
      if (!person) {
        return { content: [{ type: "text" as const, text: `Error: Expert "${expert_slug}" not found` }] };
      }

      let sections: PRDSection[];
      if (inputSections && inputSections.length > 0) {
        sections = inputSections;
      } else if (prd_text) {
        const parsed = parsePRDFromText(prd_text, prd_title);
        sections = parsed.sections;
      } else {
        return { content: [{ type: "text" as const, text: "Error: Provide either sections or prd_text" }] };
      }

      const searchQuery = `${prd_title} ${sections.slice(0, 3).map((s) => s.content).join(" ")}`.slice(0, 500);
      const chunks = getRelevantChunks(expert_slug, searchQuery, 4000);
      const chunksText = chunks
        .map((c) => `[From: ${c.sourceTitle} (${c.sourceDate})]\n${c.guestOnly || c.text}`)
        .join("\n\n---\n\n");

      const sectionsText = sections
        .map((s) => `[${s.id}]${s.heading ? ` ${s.heading}` : ""}\n${s.content}`)
        .join("\n\n");

      const prompt = prdReviewPrompt(person.name, person.title, chunksText, prd_title, sectionsText);

      const stream = anthropic.messages.stream({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        temperature: 0.5,
        messages: [{ role: "user", content: prompt }],
      });

      let buffer = "";
      const comments: any[] = [];

      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          buffer += event.delta.text;

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("{")) continue;
            try {
              const comment = JSON.parse(trimmed);
              if (comment.sectionId && comment.content) {
                comments.push({
                  id: `${expert_slug}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                  sectionId: comment.sectionId,
                  highlightText: comment.highlightText || "",
                  content: comment.content,
                  expert: { slug: person.slug, name: person.name, title: person.title },
                });
              }
            } catch { /* not valid JSON yet */ }
          }
        }
      }

      if (buffer.trim()) {
        try {
          const comment = JSON.parse(buffer.trim());
          if (comment.sectionId && comment.content) {
            comments.push({
              id: `${expert_slug}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              sectionId: comment.sectionId,
              highlightText: comment.highlightText || "",
              content: comment.content,
              expert: { slug: person.slug, name: person.name, title: person.title },
            });
          }
        } catch { /* ignore */ }
      }

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            expert: { slug: person.slug, name: person.name, title: person.title },
            commentCount: comments.length,
            comments,
          }, null, 2),
        }],
      };
    } catch (err: any) {
      return { content: [{ type: "text" as const, text: `Error during review: ${err.message}` }] };
    }
  }
);

// --- Tool: reply_to_expert ---
server.tool(
  "reply_to_expert",
  "Ask a follow-up question to an expert about one of their review comments",
  {
    expert_slug: z.string().describe("Slug of the expert to reply to"),
    section_content: z.string().describe("The PRD section content the comment was on"),
    original_comment: z.string().describe("The expert's original comment you're replying to"),
    user_message: z.string().describe("Your follow-up question or response"),
    other_comments: z.string().optional().describe("Other experts' comments on the same section"),
    thread_history: z.array(z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })).optional().describe("Previous messages in this thread"),
  },
  async ({ expert_slug, section_content, original_comment, user_message, other_comments, thread_history }) => {
    try {
      const person = getPersonBySlug(expert_slug);
      if (!person) {
        return { content: [{ type: "text" as const, text: `Error: Expert "${expert_slug}" not found` }] };
      }

      const chunks = getRelevantChunks(expert_slug, section_content, 3000);
      const chunksText = chunks
        .map((c) => `[From: ${c.sourceTitle} (${c.sourceDate})]\n${c.guestOnly || c.text}`)
        .join("\n\n---\n\n");

      const prompt = prdReplyPrompt(
        person.name,
        person.title,
        chunksText,
        section_content,
        original_comment,
        other_comments || "",
        thread_history || [],
        user_message
      );

      const stream = anthropic.messages.stream({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        temperature: 0.5,
        messages: [{ role: "user", content: prompt }],
      });

      let reply = "";
      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          reply += event.delta.text;
        }
      }

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            expert: { slug: person.slug, name: person.name, title: person.title },
            reply: reply.trim(),
          }, null, 2),
        }],
      };
    } catch (err: any) {
      return { content: [{ type: "text" as const, text: `Error during reply: ${err.message}` }] };
    }
  }
);

// --- Start ---
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("PRD Reviewer MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
