# Lenny's Network PRD Reviewer

Get expert feedback on your Product Requirements Documents from 297 world-class product leaders — powered by AI.

Upload a PRD, and the system selects the 4 most relevant experts from Lenny Rachitsky's podcast and newsletter network. Each expert reviews your document in their own voice, grounded in their real quotes and experiences. Ask follow-up questions to dig deeper.

## How It Works

1. **Upload** a PRD (PDF or DOCX)
2. **AI selects** 4 experts whose experience is most relevant to your product area
3. **Each expert reviews** your PRD section-by-section, leaving specific, actionable comments anchored to the text
4. **Ask follow-ups** — reply to any comment to get deeper insight from that expert

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **AI:** Anthropic Claude (Sonnet)
- **Auth:** NextAuth.js + Google OAuth
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS 4
- **File Parsing:** mammoth (DOCX), pdfjs-dist (PDF)
- **Streaming:** Server-Sent Events for real-time review delivery

## Getting Started

### Prerequisites

- Node.js 18+
- An Anthropic API key
- A Supabase project
- Google OAuth credentials

### Setup

```bash
# Install dependencies
npm install

# Copy env template and fill in your credentials
cp .env.example .env.local

# Generate the expert data index (requires Lenny's content archive — see DATA.md)
npm run build-index

# Start the dev server
npm run dev
```

See [DATA.md](DATA.md) for details on setting up the expert content data.

### Free Tier

Users get 3 free PRD reviews. For unlimited use, users can provide their own Anthropic API key in the app settings (stored in browser localStorage only — never sent to the server for storage).

## MCP Server

The PRD review system is also available as a set of [Model Context Protocol](https://modelcontextprotocol.io) tools, so you can use it from Claude Code or any MCP-compatible client.

Available tools: `parse_prd`, `list_experts`, `select_experts`, `review_prd`, `reply_to_expert`

To configure, copy `.mcp.json.example` to `.mcp.json` and update the paths.

## Project Structure

```
src/
  app/            # Pages and API routes
  components/     # React components
  hooks/          # Custom hooks (PRD workflow state, streaming, responsive)
  lib/            # Utilities (Claude client, data loading, prompts, auth)
mcp-server/src/   # MCP server exposing review tools
scripts/          # build-index.ts — generates expert data from source content
public/data/      # Generated expert data (not committed)
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions and guidelines.

## License

The application source code is licensed under [MIT](LICENSE).

The expert content data (Lenny's newsletter/podcast transcripts) is **not included** in this repository and is subject to its own license. See [DATA.md](DATA.md).
