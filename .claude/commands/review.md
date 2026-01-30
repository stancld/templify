# Review Code Changes

**Goal**: Review uncommitted changes for quality issues and produce PR-ready summary.

## Scope

| Context | What to Review |
|---------|----------------|
| No argument | Uncommitted changes; if none, review last commit |
| Commit provided | The specified commit(s) |

## Review Checklist

| Category | Check For |
|----------|-----------|
| Unused code | Dead imports, variables, unreachable branches |
| Duplication | Repeated logic that should use shared components |
| AI slop | Excessive try/catch, defensive checks in trusted paths, `as any` casts |
| Types | Proper TypeScript types, no `any` escapes |
| Documentation | Changes reflected in README.md and CLAUDE.md if needed |

## Approach

| Step | Action |
|------|--------|
| Analyze | Review diff for issues in checklist |
| Critical issues | Use `AskUserQuestion` for each - fix or skip |
| Lint/Build | Ask whether to run `npm run lint && npm run build` |
| Summary | Generate short PR description of what was done |

## Output

Provide PR-ready summary:

```
## Summary
- <1-3 bullets describing changes>

## Review Notes
- <any issues found and addressed>
```

## Constraints

- Ask before running lint/build (use `AskUserQuestion`)
- No automatic commits
- Report only critical issues, not style nitpicks
