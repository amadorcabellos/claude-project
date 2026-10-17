---
description: Reviews uncommitted code changes made on the current branch.
allowed-tools: Agent, Bash(git diff:*), Bash(git status:*)
---

Your job is to coordinate two reviewer subagents in parallel:

- **a11y-reviewer**
- **code-quality-reviewer**

## Goal

1. Gather the current branch diff including BOTH staged and unstaged changes.
2. Run both reviewer subagents in parallel on the same diff.
3. Combine their feedback into one unified report, de-duplicating overlap.
4. Produce a proposed edit plan (ordered checklist) to address the feedback.
5. Ask the user for explicit approval BEFORE making any code changes.

## Process

1. First, collect the diff (excluding the `tool-use.json` hook log):
   - Use `git diff -- . ':!tool-use.json'` for unstaged changes
   - Use `git diff --staged -- . ':!tool-use.json'` for staged changes
   - If both are empty, say so and stop (DO NOT PROCEED).

2. Then invoke both subagents in parallel. Provide each agent:
   - the combined diff output
   - brief repo context if needed (tech stack, lint/test commands if available)

   Tell them to be evidence-based (file paths, line/snippet references, no guessing), and NOT to review any code outside the diff.

3. Merge results into:
   1. Summary (max 8 bullets total)
   2. Accessibility findings (Blocker/Major/Minor/Nit)
   3. Code quality findings (Blocker/Major/Minor/Nit)
   4. Combined action plan (ordered checklist)
   5. Questions/uncertainties (anything that needs human intent)

## Rules

- Do NOT edit any files yet.
- Do NOT run formatting-only changes unless they fix a cited issue.

Finish by asking:

"Do you want me to implement the action plan now?"

Wait for user confirmation before making any changes.
