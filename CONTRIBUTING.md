# Contributing

Thanks for your interest in contributing! Here's how to get started.

## Prerequisites

- Node.js 18+
- npm
- A Google Cloud project with OAuth credentials
- A Supabase project
- An Anthropic API key

## Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ask-lennys-network.git
   cd ask-lennys-network
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the example env file and fill in your credentials:
   ```bash
   cp .env.example .env.local
   ```

4. Set up the data — see [DATA.md](DATA.md) for instructions on generating the expert content index.

5. Set up Supabase:
   - Create a `users` table with columns: `email` (text, primary key), `query_count` (integer, default 0)

6. Start the dev server:
   ```bash
   npm run dev
   ```

## Making Changes

1. Create a branch from `main`:
   ```bash
   git checkout -b your-feature-name
   ```

2. Make your changes. Keep PRs focused — one feature or fix per PR.

3. Test locally to make sure everything works.

4. Open a pull request with a clear description of what you changed and why.

## Code Structure

```
src/
  app/          # Next.js pages and API routes
  components/   # React components
  hooks/        # Custom React hooks
  lib/          # Shared utilities (Claude client, data loading, prompts)
mcp-server/     # MCP server exposing PRD review as tools
scripts/        # Data indexing scripts
public/data/    # Generated expert data (not committed — see DATA.md)
```

## Guidelines

- Follow existing code style and patterns
- Keep the UI consistent across mobile and desktop
- Don't commit secrets, API keys, or generated data files
- If you're adding a new feature, consider updating the MCP server tools too

## Ideas

See [FUTURE_IDEAS.md](FUTURE_IDEAS.md) for feature ideas that would make great contributions.
