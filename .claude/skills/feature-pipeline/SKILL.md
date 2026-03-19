---
name: feature-pipeline
description: PROACTIVELY invoke this skill when the user describes a new feature, UI change, or significant modification. Chains /spec → /codex-review → /frontend-design → /design-preview sequentially, using each step's output to inform the next. Produces a complete, reviewed, visually validated feature spec before any code is written.
---

# Feature Pipeline

When the user describes a feature or significant change, run this full review pipeline automatically. Each step feeds into the next.

## When to Trigger

- User describes a new feature or UI change
- User says "let's add...", "I want to...", "can we build..."
- Any request that touches both frontend and backend
- Any request where design decisions matter

## Pipeline

### Step 1: /spec — Principal Engineer Feature Review

Invoke the `/spec` skill. This produces:
- Conversational Q&A (ONE question at a time) to clarify requirements
- Technical System Review (data flow, limits, failure modes, error patterns)
- Pre-Implementation Documentation (data contracts, limits, failure handling)
- A Google Doc spec

**Gate**: Do NOT proceed until the spec is complete and user confirms.

### Step 2: /codex-review — Codex Plan Review

Invoke the `/codex-review` skill with the spec from Step 1:
- Write implementation plan to `/tmp/codex-review-plan.md`
- Send to Codex for second-opinion review
- Present: agreements, issues found, suggested improvements
- Incorporate valid feedback

**Gate**: Do NOT proceed until codex review is presented and user confirms.

### Step 3: /frontend-design — Design Direction

If the feature involves UI, invoke the `/frontend-design` skill:
- Brand app → "Gentle Humanists" aesthetic
- Consumer app → "Utopian Dreamers" aesthetic
- Produce concrete component designs matching the identity

**Gate**: Do NOT proceed until design direction is confirmed.

### Step 4: /design-preview — Visual Mockup

Invoke the `/design-preview` skill:
- Render 2-4 design options using Playwright `page.setContent()`
- Take full-page screenshot
- Present options with trade-offs

**Output**: User selects a direction → implementation begins.

## Rules

- Execute steps sequentially — each depends on the previous
- At each gate, ask the user if they're ready to proceed
- If a step reveals issues, loop back to the relevant earlier step
- Keep a running summary of decisions at each step
