# folii.ai docs

Engineering and product docs for folii.ai. The source of truth for what we're building and why.

## Contents

- [prd.md](./prd.md) — product requirements. The problem, the wedge, who it's for, what "done" looks like.
- [architecture.md](./architecture.md) — tech design. Stack, data model, core flows, error handling, rate limits.
- [implementation-plan.md](./implementation-plan.md) — the v1 build sequence, step by step, from content schema to launch.
- [test-plan.md](./test-plan.md) — critical paths, edge cases, RLS and privacy tests, eval suites.
- [changelog.md](./changelog.md) — shipped log. What landed on `develop`, tied to issue numbers and PRs.

## Source of truth

The PRD, architecture, and implementation plan here are compiled from the `/office-hours` design session and `/plan-eng-review` test plan stored in `~/.gstack/projects/mijeongireneban-folii.ai/`. Those are the original artifacts. These docs are the repo-checked-in version for anyone reading the codebase.

If you change direction, update both.

## Read in this order

1. `prd.md` — what are we building?
2. `architecture.md` — how does it work?
3. `implementation-plan.md` — what's the build order?
4. `test-plan.md` — how do we know it works?
5. Root `CLAUDE.md` — day-to-day dev notes and git flow rules
6. Root `DESIGN.md` — visual system, tokens, component rules
