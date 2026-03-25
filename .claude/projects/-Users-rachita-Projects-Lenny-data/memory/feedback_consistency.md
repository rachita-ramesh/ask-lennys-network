---
name: feedback_consistency
description: Always think about consistency across mobile and desktop views when making UI changes
type: feedback
---

When making mobile-responsive changes, always ensure consistency across all pages — don't set random one-off font sizes per file. Define a consistent mobile design system and apply it everywhere.

**Why:** Ad-hoc per-file mobile sizing creates visual inconsistency (e.g., headings being 2rem on one page and 2.25rem on another). The user called this out explicitly.

**How to apply:** Before changing any font size, padding, or spacing for mobile, check what the same element uses on other pages and match it. Think of mobile as a separate design system that should be internally consistent, just like desktop is.
