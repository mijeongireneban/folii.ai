---
name: pr-writer
description: Use when the user asks to open a PR, write a PR description, ship changes, or create a pull request on GitHub. Drafts title and body from the current branch diff and runs gh pr create.
---

# PR Writer

Creates a well-structured GitHub pull request from the current branch.

## Preflight

1. Confirm a branch is checked out and not `master` or `develop`:
   ```bash
   git branch --show-current
   ```
   If on `master`/`develop`, stop and ask the user which feature branch they meant.

2. Gather context in parallel:
   ```bash
   git status
   git diff develop...HEAD
   git log develop..HEAD --oneline
   ```

3. If there are uncommitted changes, ask the user whether to commit them first or stash. Do not silently commit.

## Draft

Title rules:
- Under 70 characters.
- Conventional commit style: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`.
- Describe the outcome, not the mechanism. "feat: avatar upload in profile", not "feat: add handleAvatarUpload function".

Body template:
```markdown
Closes #<issue-number-if-applicable>

## Summary
- <2-4 bullets, the "why", not the "what">
- <user-visible change>
- <any tradeoff or follow-up worth flagging>

## Test plan
- [ ] <manual step 1>
- [ ] <manual step 2>
- [ ] <edge case>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

## Create

This repo follows **git flow**. Feature PRs target `develop`, never `master`.

```bash
gh pr create --base develop --title "<title>" --body "$(cat <<'EOF'
<body>
EOF
)"
```

If the branch has no upstream, push first with `git push -u origin <branch>`.

## Rules

- **Never** target `master` for feature work. Only `release/*` and `hotfix/*` branches go to `master`.
- **Never** use `--no-verify` or skip hooks.
- **Never** force-push unless the user explicitly asks.
- If the diff touches `.env*`, `credentials`, or any secret-looking file, stop and warn the user before pushing.
- If the PR closes a GitHub issue, include `Closes #N` in the body so GitHub auto-links.
- Return the PR URL at the end so the user can click through.

## Edge cases

- **Empty diff vs base:** tell the user the branch has no changes against `develop` and stop.
- **Branch already has an open PR:** run `gh pr view` instead of creating a duplicate. Offer to update the description.
- **Pre-commit hook fails on push:** do not retry with `--no-verify`. Surface the error, let the user fix.
