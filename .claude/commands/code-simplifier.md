# Code Simplifier

**Goal**: Simplify and refine code for clarity, consistency, and maintainability while preserving all functionality. Focus on recently modified code unless instructed otherwise.

## Scope

Only refine code modified in the current branch (diff against `master`), unless instructed otherwise.

## Principles

| Principle | Description |
|-----------|-------------|
| Preserve Functionality | Never change what the code does - only how it does it |
| Enhance Clarity | Reduce complexity, improve naming, consolidate logic |
| Maintain Balance | Avoid over-simplification that reduces maintainability |

## What to Simplify

| Category | Pattern |
|----------|---------|
| Nesting | Deep conditionals that can be flattened with early returns |
| Redundancy | Repeated logic, unused variables, dead imports |
| Over-abstraction | Helpers/utilities used only once |
| Complexity | Nested ternaries - prefer if/else or switch statements |
| Comments | Remove comments that describe obvious code |

## Project Standards (from CLAUDE.md)

| Rule | Correct | Avoid |
|------|---------|-------|
| TypeScript | Fully typed components and functions | `any` to silence errors |
| Components | Small and focused | Large monolithic components |
| Error handling | Graceful handling for file parsing | Silent failures |
| Debug logs | Remove before committing | `console.log` left in code |
| ESLint | Zero warnings | Ignored warnings |

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
| Scan | Find simplification opportunities |
| Clean | Apply changes preserving all functionality |
| Verify | Run `npm run lint && npm run build` to confirm no regressions |

## Output

1. Report 1-3 sentence summary of changes made
2. Conclude with a ready-to-use commit message

## Constraints

- No automatic commits
- Preserve all existing functionality
- Run lint/build to verify no regressions
