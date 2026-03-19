# Codex Plan Review

You are about to send an implementation plan to OpenAI Codex for a second-opinion review. This creates a two-agent collaboration: you (Claude) produce the plan, Codex reviews it, and you synthesize the feedback.

## Argument

The argument `$ARGUMENTS` is a description of what the plan is about. If no argument is given, ask the user what plan they want reviewed.

## Workflow

### Step 1: Write the Plan

If you haven't already written a detailed implementation plan, do so now. The plan should include:
- **Goal**: What we're changing and why
- **Current state**: Relevant file paths, line counts, function names
- **Proposed changes**: Specific files to create/modify, what moves where
- **Migration strategy**: How to avoid breaking existing functionality
- **Risk assessment**: What could go wrong, how we mitigate it
- **Verification steps**: How to confirm the refactor worked

Write the plan to `/tmp/codex-review-plan.md`.

### Step 2: Send to Codex

Run Codex in non-interactive mode to review the plan. Use this exact pattern:

```bash
codex exec \
  --sandbox read-only \
  --ephemeral \
  -m gpt-5.3-codex \
  --cd /Users/rachita/Projects/Pai \
  -o /tmp/codex-review-output.md \
  "You are a senior software engineer reviewing an implementation plan for a Python/Next.js serverless codebase. The project uses Vercel serverless functions (Python), Modal.com for heavy AI jobs, Supabase PostgreSQL, and Next.js 15 frontends.

Read the file /tmp/codex-review-plan.md. Then review it critically:

1. CORRECTNESS: Will the proposed changes break existing functionality? Check import paths, function references, API route mappings.
2. COMPLETENESS: Are there files or callers that the plan misses? Search the codebase for all references to functions/files being moved.
3. RISKS: What could go wrong during the migration? Are there race conditions, deployment ordering issues, or rollback concerns?
4. IMPROVEMENTS: Suggest any better approaches or simplifications you see.
5. VERCEL ROUTING: If API files are being renamed/moved, will vercel.json and the URL routing still work? Vercel maps api/foo-bar.py to /api/foo-bar.
6. MISSING STEPS: Are there steps the plan forgot (updating imports, tests, CLAUDE.md, local_server.py route mappings)?

Be specific. Reference exact file paths and function names. If you find a problem, show the fix." \
  2>/dev/null
```

**IMPORTANT**: The `codex exec` command may take 2-5 minutes. Use a timeout of 600000ms. If it fails, check that `CODEX_API_KEY` or `OPENAI_API_KEY` is set in the environment.

### Step 3: Read and Present the Review

Read `/tmp/codex-review-output.md` and present the Codex review to the user with this format:

---

## Codex Review Results

### Agreement
[List points where Codex agrees the plan is sound]

### Issues Found
[List any problems Codex identified, with your assessment of whether each is valid]

### Suggested Improvements
[List Codex's suggestions, with your take on each]

### My Response
[For each issue/suggestion, state whether you agree and how you'd adjust the plan]

### Updated Plan
[If changes are needed, present the revised plan incorporating valid feedback]

---

### Step 4: Iterate if Needed

If the user wants another round of review (e.g., after plan changes), repeat steps 1-3 with the updated plan.

## Rules

- ALWAYS write the plan to `/tmp/codex-review-plan.md` before calling Codex
- ALWAYS save Codex output to `/tmp/codex-review-output.md` via the `-o` flag
- NEVER fabricate Codex's review — only report what the output file contains
- If Codex finds a real issue, acknowledge it and fix the plan
- If Codex raises a false concern, explain why it's not actually a problem
- Present BOTH perspectives fairly — this is a collaboration, not a rubber stamp
