# Clean AI Slop & Simplify Code

**Goal**: Remove AI-generated patterns and simplify code while preserving exact functionality.

## Scope

Only refine code modified in the current branch (diff against `master`), unless instructed otherwise.

## What to Remove

| Category | Pattern | Example |
|----------|---------|---------|
| AI Slop | Redundant comments | Comments explaining what, not why |
| AI Slop | Excessive defensiveness | Try/catch or null checks in trusted internal paths |
| AI Slop | Type bypasses | `as any`, `@ts-ignore`, excessive type assertions |
| AI Slop | Over-documentation | JSDoc for self-explanatory functions |
| Simplify | Dead code | Unused variables, imports, unreachable branches |
| Simplify | Over-abstraction | Helpers/utilities used only once |
| Simplify | Premature generalization | Config options or parameters never used |
| Simplify | Unnecessary nesting | Deep conditionals that can be flattened |

## Project Standards (from CLAUDE.md)

| Rule | Correct | Avoid |
|------|---------|-------|
| TypeScript | Proper types | `any`, `unknown` to silence errors |
| Components | Small, focused | Monolithic components |
| Comments | Explain why | Explain what |
| Console | `console.error` for errors only | `console.log` debugging |
| ESLint | Zero warnings | Suppressed warnings |

## Balance

| Do | Don't |
|----|-------|
| Prefer clarity over brevity | Create dense one-liners |
| Keep helpful abstractions | Remove structure that aids understanding |
| Use explicit patterns | Write clever code that's hard to debug |
| Follow existing file style | Introduce new conventions |

## Approach

| Step | Action |
|------|--------|
| Diff | `git diff master...HEAD` to identify changed files |
| Scan | Find AI patterns and simplification opportunities |
| Clean | Apply changes preserving all functionality |
| Verify | Run `npm run lint && npm run build` to confirm behavior unchanged |

## Output

Report 1-3 sentence summary of changes made.

## Constraints

- No automatic commits
- Preserve all existing functionality
- Run lint/build before and after to verify no regressions
