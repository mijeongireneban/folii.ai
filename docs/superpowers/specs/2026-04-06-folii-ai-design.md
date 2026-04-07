# folii.ai — Design Spec

**Date:** 2026-04-06
**Status:** Approved for implementation planning

## Summary

folii.ai is a hosted multi-tenant web service that lets developers build a portfolio website by prompting for content. The visual template is fixed (ported from [mijeong.dev](https://www.mijeong.dev) / `abt-mj`); users only fill in content via a guided wizard and a chat-style editor. Publishing is a database flag flip — no git, no build, no DNS.

## Goals (v1)

- A logged-in user can go from empty state to a published portfolio at `folii.ai/{username}` in one session, without writing code or editing files.
- Content edits via natural-language chat update the live site within seconds.
- The visual template is locked: prompting changes content only, never layout, colors, or typography.
- Target user: software engineers (the template is dev-flavored: experience, projects, case studies, skills).

## Non-Goals (v1)

- Multiple template choices (one template only)
- Theming, color/layout customization, or section toggles
- Custom domains (deferred — see Future Work)
- Exporting to a user-owned GitHub repo / Vercel project (deferred)
- Multiple portfolios per user
- Undo / version history
- Analytics for portfolio owners
- Mobile editor (preview-only fallback message on small screens)

## Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 15 (App Router) on Vercel | Multi-tenant SSR, dynamic routes, API handlers in one deploy |
| Styling | Tailwind v4 + shadcn/ui | Matches `abt-mj` so template ports cleanly |
| Database | Supabase (Postgres) | Auth (magic link), DB, storage in one service |
| Auth | Supabase Auth — email magic link | Lowest friction for v1 |
| Storage | Supabase Storage | Image uploads |
| LLM | OpenAI API (server-side only) | Stable, well-known API; key never reaches browser |
| Deploy | Vercel | Matches existing flow |

## Architecture

Three surfaces in one Next.js app:

1. **Editor** (`/edit`, authenticated) — split pane: live preview iframe on the left, wizard + chat on the right.
2. **Published portfolio** (`/{username}`, public) — server-rendered template fed by user content from DB.
3. **Marketing + auth** (`/`, `/login`) — landing page and magic-link login.

### Data Model

One `portfolios` row per user. Content is a typed JSON blob mirroring `abt-mj`'s `experience.ts` shapes.

```
users (Supabase Auth managed)
  id, email, created_at

portfolios
  id              uuid pk
  user_id         uuid fk → users.id  (UNIQUE — one portfolio per user in v1)
  username        text unique          -- becomes folii.ai/{username}
  content         jsonb                -- full structured site content
  published       boolean default false
  created_at, updated_at

assets
  id              uuid pk
  user_id         uuid fk
  url             text                 -- Supabase storage URL or external URL
  kind            text                 -- 'upload' | 'external'
  created_at

chat_messages
  id              uuid pk
  portfolio_id    uuid fk
  role            text                 -- 'user' | 'assistant'
  content         text
  created_at
```

**`content` jsonb shape** (Zod schema is the source of truth):

```ts
{
  profile: { name, title, bio, avatar, location, links: { github, linkedin, ... } },
  experience: WorkExperience[],
  projects: Project[],          // each may include a CaseStudy
  skills: { category, items[] }[],
  contact: { email, message }
}
```

**Why one JSON blob instead of normalized tables:**
- The LLM reads and writes the whole structure naturally.
- No migrations when the template adds fields.
- One read = full portfolio render.
- Trade-off: harder to query across users — not needed in v1.

**Row-Level Security:** Supabase RLS policies ensure a user can only read/write their own `portfolios`, `assets`, and `chat_messages`. Public read of `portfolios` is allowed only when `published = true` (used by the public render route via service role check, or via a public RLS policy filtered by `published`).

### Editor + LLM Flow

**First-run wizard (guided pass):**
1. Detect empty `content`, run a scripted sequence: name & title → bio → current role → past roles → projects (loop) → skills → contact → username claim.
2. Each step is one LLM call: free-form user input → server prompts OpenAI with a strict JSON schema for that section → validate with Zod → merge into `content` → save.
3. After last step, switch to Chat tab automatically.

**Chat (iterative edits):**
- User: "make my bio more playful" / "add a project called X using Next.js" / "remove the second job"
- Server pipeline per message:
  1. Load current `content`.
  2. Send to OpenAI with system prompt: *"You edit portfolio JSON. Output a JSON Patch (RFC 6902) describing the change. Never invent facts."*
  3. Apply patch server-side; validate result against Zod schema.
  4. On validation failure: retry once with the error message; if it still fails, surface the error to the user and discard the patch.
  5. Save and return updated content + a brief assistant summary.
  6. Preview iframe reloads via revalidation.

**Why JSON Patch instead of returning full content:**
- Smaller token cost.
- Easier to show diffs / undo later.
- Forces the model to be specific.

**Image handling in chat:**
- Drag-drop or paste file → upload to Supabase storage → URL inserted into content via patch.
- Or: user provides a URL → stored as `kind = 'external'`.

**Guardrails:**
- Zod schema rejects malformed patches.
- Per-user daily message rate limit (cost control; exact number TBD at implementation, default 100/day).
- The `content` schema contains *no* layout/style fields, so the model literally cannot change design.

### Publishing & Routing

```
/                              → marketing landing
/login                         → magic link auth
/edit                          → editor (auth required)
/{username}                    → published portfolio (public)
/{username}/projects/[id]      → case study pages (matches abt-mj)
/api/chat                      → LLM edit endpoint
/api/upload                    → image upload to Supabase storage
/api/publish                   → publish/unpublish toggle
```

**Username rules:**
- Claimed during wizard, validated against a reserved list (`edit`, `login`, `api`, `admin`, `_next`, `assets`, etc.)
- Lowercase, `[a-z0-9-]`, 3–30 chars.
- Unique constraint at DB level.

**Draft vs published:**
- `published: false` by default — `/{username}` returns 404 until published.
- Preview mode (`?preview=1`) bypasses the published check but requires the auth cookie matching the owner.
- Unpublish flips the flag back; URL stops resolving. Content stays.

**Public render path:**
- Server component fetches `portfolios` row by username.
- Renders template components (ported from `abt-mj`) fed by `content` instead of static `experience.ts`.
- ISR + on-demand revalidation: every editor save calls `revalidatePath('/{username}')` so the live page updates within seconds.

**SEO:**
- Per-portfolio `<title>` and OG tags from `content.profile`.
- `robots.txt` allows published portfolios; blocks `/edit` and `/api`.

### Publish Flow (concrete)

When the user clicks **Publish**:

1. Client → `POST /api/publish`.
2. Server: auth check → load portfolio → validate `content` against Zod (reject with list of missing required fields if invalid) → re-check username availability → `UPDATE portfolios SET published = true` → `revalidatePath('/{username}')` → return `{ ok, url }`.
3. Client: toast + "View live" link, header badge flips Draft → Published.

**No git, no build, no DNS, no cert provisioning** — the route already exists; flipping `published` just stops it returning 404. Total time click→live: ~200ms.

**Edits after publish:** every save calls `revalidatePath`, so the live site updates within ~1s of any edit. No separate "republish" needed.

**Unpublish:** same flow, flag flipped to `false`. Content untouched.

## Testing Strategy (v1)

- **Zod schemas** are the contract: unit-test with sample valid/invalid `content` blobs.
- **JSON Patch apply pipeline:** unit-test with golden inputs (model output → expected content).
- **LLM calls:** mocked in unit tests; one manual smoke test per release against the real API.
- **Auth + RLS:** scripted test attempting to read/write another user's portfolio.
- **E2E:** skipped for v1; revisit when there's a real user flow worth protecting.

## Build Sequence

Each step is independently demoable.

1. Scaffold — Next.js 15, Tailwind v4, shadcn, Supabase client, env setup.
2. Port template — copy `abt-mj` components into `components/template/`, swap `experience.ts` for a `content` prop.
3. Data layer — Supabase migrations, Zod schemas mirroring `content`, RLS policies.
4. Auth + landing — magic link login, marketing page, protected `/edit`.
5. Public rendering — `/{username}` route reading from DB, ISR + revalidation, 404 when unpublished.
6. Editor shell — split-pane layout, preview iframe, username claim flow.
7. Chat endpoint — `/api/chat` with OpenAI + JSON Patch + Zod validation.
8. Wizard — first-run guided sequence, section schemas, auto-handoff to chat.
9. Image upload — Supabase storage + `/api/upload` + drag-drop in chat.
10. Publish flow — publish/unpublish toggle, reserved usernames, OG tags.
11. Polish — rate limiting, error states, empty states, mobile fallback message.

## Future Work (v2+)

### Custom domains

Not in v1. Adding it later is purely additive and does not break existing `folii.ai/{username}` URLs.

**Why deferred:** roughly a week of focused work and adds real failure modes (DNS misconfig support burden).

**What it requires:**
- `custom_domain` column on `portfolios` (or a separate `domains` table for multiple domains per portfolio).
- Vercel API integration to add/remove domains programmatically.
- SSL cert provisioning per domain (Vercel handles, but must be wired up).
- DNS verification flow: show CNAME/TXT record, poll until resolved.
- Next.js middleware: inspect `req.headers.host`; if it matches a `custom_domain`, internally rewrite to `/{username}`.
- Editor settings UI: "Custom domain" section with verification status.

**Natural fit for a future paid tier.**

### Other deferred features

- Multiple template choices.
- Theming and section toggles (content + light theming, then full theming).
- Export to user-owned GitHub repo + Vercel project (the inverse of the hosted model — useful for users who want full ownership later).
- Undo / version history (`portfolio_versions` table).
- Multiple portfolios per user.
- Portfolio-owner analytics.
- Mobile editor.
