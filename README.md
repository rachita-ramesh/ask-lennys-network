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

### Install the MCP server

1. Clone this repo and install dependencies:

   ```bash
   git clone https://github.com/rachita-ramesh/ask-lennys-network.git
   cd ask-lennys-network
   npm install
   ```

2. Generate the expert data index (requires Lenny's content archive — see [DATA.md](DATA.md)):

   ```bash
   npm run build-index
   ```

3. Set your Anthropic API key:

   ```bash
   export ANTHROPIC_API_KEY=sk-ant-...
   ```

4. Add to your MCP client config. For **Claude Code**, add to your project's `.mcp.json`:

   ```json
   {
     "mcpServers": {
       "prd-reviewer": {
         "command": "npx",
         "args": ["tsx", "/absolute/path/to/ask-lennys-network/mcp-server/src/index.ts"],
         "env": {
           "ANTHROPIC_API_KEY": "sk-ant-..."
         }
       }
     }
   }
   ```

   For **Claude Desktop**, add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

   ```json
   {
     "mcpServers": {
       "prd-reviewer": {
         "command": "npx",
         "args": ["tsx", "/absolute/path/to/ask-lennys-network/mcp-server/src/index.ts"],
         "env": {
           "ANTHROPIC_API_KEY": "sk-ant-..."
         }
       }
     }
   }
   ```

### Available tools

| Tool | Description |
|---|---|
| `parse_prd` | Parse a PRD file (PDF, DOCX, TXT, MD) or raw text into structured sections |
| `list_experts` | List all 297 experts with optional name/title/tag filtering |
| `select_experts` | AI-powered selection of the 4 best reviewers for a given PRD |
| `review_prd` | Get a full expert review with section-anchored comments |
| `reply_to_expert` | Ask follow-up questions about specific review comments |

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
