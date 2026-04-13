## Branching — git flow

This project follows **git flow**. Always keep this in mind:

- `master` is the production branch. Never commit or branch directly off it for new work.
- `develop` is the integration branch. **All feature branches are cut off `develop`, and all feature PRs target `develop`.**
- Feature branches: `feature/<name>` off `develop` → PR back into `develop`.
- Release branches: `release/<version>` off `develop` → merged into both `master` and `develop`.
- Hotfix branches: `hotfix/<name>` off `master` → merged into both `master` and `develop`.

When any skill (office-hours, plan-eng-review, ship, etc.) refers to "the base branch" or "cut from master", interpret it as `develop` for feature work. Only release and hotfix flows touch `master` directly.

## Linear ticket workflow

When working on a Linear ticket for this repo, always follow this routine:

1. **Review** — read the ticket details and understand the scope.
2. **Move to In Progress** — update the ticket status if it's not already there.
3. **Create branch** — cut a `feature/<name>` or `bugfix/<name>` branch off `develop`.
4. **Implement & create PR** — do the work, commit, and open a PR targeting `develop`.
5. **Update ticket** — once the PR is created, update the Linear ticket status (e.g., In Review) and link the PR.

## Dev notes

- Package manager: **pnpm** (never npm/yarn).
- Tests: `pnpm test` (vitest, `passWithNoTests`). Also run `pnpm exec tsc --noEmit` before shipping.
- Hydration mismatches after className edits are usually stale Turbopack cache. Fix: `rm -rf .next` and restart `pnpm dev`.
- `src/lib/content/placeholder.ts` only seeds fresh rows. Existing users read `sites.content` from Supabase, so placeholder edits won't show until the user hits Reset (`DELETE /api/content`).
- `min-h-full` / `flex-1` only resolve if the full parent chain is `flex flex-col` with a defined height. When centering breaks, check `[username]/layout.tsx` → `TemplateLayout` → inner wrapper chain.

## Design System

Always read `DESIGN.md` before making any visual or UI decisions. All font choices, colors, spacing, border radii, elevation, and aesthetic direction are defined there. Do not deviate without explicit user approval. In QA mode, flag any code that does not match DESIGN.md.

Primary tokens: background `#000000`, text `#ffffff`, accent Framer Blue `#0099ff`, display font Cabinet Grotesk Medium (weight 500, extreme negative letter-spacing), body font Inter Variable with OpenType features. Buttons are pill-shaped (40px–100px radius), cards are 10–15px radius. See DESIGN.md §9 for agent prompt guide and component examples.

## gstack (recommended)

This project uses [gstack](https://github.com/garrytan/gstack) for AI-assisted workflows.
Install it for the best experience:

```bash
git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
cd ~/.claude/skills/gstack && ./setup --team
```

Skills like /qa, /ship, /review, /investigate, and /browse become available after install.
Use /browse for all web browsing. Use ~/.claude/skills/gstack/... for gstack file paths.

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
