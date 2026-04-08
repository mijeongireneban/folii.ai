# Implementation Plan — folii.ai v1

The build sequence, top to bottom, in user-experience order. Each step is self-contained enough to ship and test before moving to the next.

Source: compiled from the `/office-hours` design doc in `~/.gstack/projects/mijeongireneban-folii.ai/`. If this file and the source diverge, update both.

## Step 0 — Branch setup

Cut `feature/v1-scaffold` from `develop` (git flow, see root `CLAUDE.md`). Keep `package.json`, `tsconfig.json`, `next.config.*`, `tailwind.config.*`, `postcss.config.*`, `eslint.config.*`, `.gitignore`. First commit: `chore: clean slate`.

## Step 1 — Content schema (single source of truth)

Define the portfolio content in Zod first. Every downstream piece reads/writes against this schema.

- File: `src/lib/content/schema.ts`
- Shape: `{ name, tagline, bio, avatar?, links, experience[], projects[], education?, timezone? }`
- TS types derived via `z.infer`, never hand-written
- **No decorative fields.** No `icon`, `banner_image`, `illustration`. Per DESIGN.md §4 and §7, the engineer's work is the only imagery. Project screenshots are the one exception.
- LLM prompts serialize the schema via `zod-to-json-schema` at runtime
- OpenAI calls enforce the shape at the API layer via `response_format: { type: "json_schema" }`

## Step 2 — The SWE template

Design first (Figma, paper, or hand-coded HTML with a real friend's content hardcoded). Then build as a React server component.

- File: `src/components/template/SwePortfolio.tsx`
- Takes the validated content object, renders a complete page
- Dark-theme-first, mobile-first, no props beyond content
- This is the artifact the whole product depends on. Give it real design time.

### Portfolio information architecture (`/[username]`)

Vertical order, top to bottom, no nav bar:

1. **Name** — Display Hero (Cabinet Grotesk Medium 110px, -5.5px tracking, 0.85 line-height)
2. **Tagline** — Body Large directly under the name
3. **Bio** — 720-860px read column, Body Large, generous top padding
4. **Projects** — Section Heading 62px, then cards (blue ring shadow, 12px radius). Hidden entirely if zero projects.
5. **Experience** — timeline, company at 32px, dates in Azeret Mono 10.4px muted silver
6. **Links** — GitHub / Twitter / LinkedIn / Website as Framer Blue inline links
7. **Footer** — Ghost-style "Built with folii.ai →", bottom-right, Caption size

### Interaction states

- Project card hover: ring shadow opacity 0.15 → 0.25, no transform
- Focus (keyboard): same ring lift + 2px `#0099ff` solid outline offset 2px
- Empty projects: hide section entirely. No placeholder text.
- Text-only project: card with title + description + tech stack, no placeholder image
- Long bio (500+ words): no "read more" fold, let it flow

## Step 3 — Supabase Auth (email + password)

Built-in provider, not hand-rolled crypto. Routes: `/auth/signup`, `/auth/login`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email`. Middleware protects `/editor` and redirects unauthenticated users to `/auth/login`. Username auto-generated from email local-part on signup.

## Step 4 — DB schema + RLS

Single `profiles` table with `previous_content` column for one-level undo. Full shape in [architecture.md](./architecture.md#profiles-table).

- Migration: `supabase/migrations/0001_profiles.sql`
- RLS: users can only `SELECT`/`UPDATE` their own row
- Public portfolio route uses the server-side admin client filtered by `published = true`

## Step 4.5 — Rate limiting

Every LLM endpoint costs money. Upstash Ratelimit, keyed by `user_id`, not IP. All LLM endpoints are auth-protected. Limits in [architecture.md](./architecture.md#rate-limiting).

## Step 5 — LLM prompts directory

Create `src/lib/llm/prompts/` with named files:

- `resume-to-content.ts` — system + user templates for resume → content extraction
- `chat-edit-patch.ts` — system prompt for chat → JSON Patch generation

Each exports a versioned const. No runtime complexity. Just organization for diff-ability and eval harness consumption.

## Step 6 — Eval harness

Before iterating any prompt. `scripts/eval-prompts.ts` reads 5 real SWE resumes from `evals/fixtures/`, runs each through `resume-to-content`, prints the extracted JSON + rendered preview. Grade manually. This is the feedback loop for every prompt change after this.

## Step 7 — Resume parse endpoint

`POST /api/wizard/parse`. Accepts multipart PDF OR JSON with a `text` field.

- PDF path uses `pdfjs-dist` (layout-aware, server-side) to extract text
- Both paths return the extracted text to the client for user review before the LLM step
- LLM step is a second call: `POST /api/content/generate` with the reviewed text
- Two endpoints on purpose, lets the user catch bad PDF extraction before burning an LLM call
- `pdfjs-dist` is CPU-heavy. Assumes Vercel-style serverless. If self-hosted later, move parsing to a worker thread.

## Step 8 — Editor page

`/editor`, protected. Layout: preview pane + chat + JSON toggle. Resume upload modal with PDF + paste.

### LLM latency UX (non-negotiable)

Calls take 3-8s. Dead UI for that long feels broken.

- **Optimistic chat message render** the instant the user hits enter
- **Disable input + show cancel** while a request is in flight
- **Skeleton/shimmer overlay** on the preview pane during regeneration
- **Stream the LLM response** where possible (`stream: true` on structured outputs)

## Step 9 — Chat-to-edit endpoint

`POST /api/chat`. Full data flow diagram and error codes in [architecture.md](./architecture.md#chat-edit-the-products-load-bearing-flow).

- LLM returns JSON Patch array (enforced via structured outputs)
- Validate patch shape → apply to current content → validate result against Zod
- Transactional write: `content = new, previous_content = old`
- Every failure branch maps to a centralized error code in `src/lib/errors.ts`

## Step 10 — Revert + JSON toggle

Revert button calls `POST /api/revert`. Server does `UPDATE profiles SET content = previous_content, previous_content = NULL`. One level of undo by design. JSON toggle opens a readonly CodeMirror view with syntax highlighting and a copy button.

## Step 11 — Publish flow

`POST /api/publish` sets `profiles.published = true`, then `revalidatePath('/' + username)`. Public route is a statically-cached server component. No session, no DB query on the common path. Same `revalidatePath` fires on every chat edit so a published portfolio stays in sync.

## Step 12 — Showtime

DM three real SWE friends, ask them to sign up and try it. Watch them without helping. Note every place they hesitate.

## Design system compliance checklist

Cite DESIGN.md by section when reviewing.

- [ ] Background `#000000` everywhere on `/[username]`, never a warm dark (§2)
- [ ] All display text Cabinet Grotesk Medium weight 500, never bold (§3)
- [ ] Cabinet Grotesk letter-spacing negative at every size per Hierarchy table (§3)
- [ ] Inter Variable with OpenType features `cv01 cv05 cv09 cv11 ss03 ss07` enabled globally (§3)
- [ ] Project cards use `rgba(0,153,255,0.15) 0 0 0 1px` blue ring shadow, 12px radius (§4, §6)
- [ ] Dates and tech stack tags in Azeret Mono 10.4px (§3)
- [ ] No decorative imagery, icons, or illustrations anywhere (§4, §7)
- [ ] No nav bar on `/[username]` (§4)
- [ ] Only Framer Blue `#0099ff` for interactive accents (§7)

## Responsive + a11y checklist

- [ ] Hero scales 110 → 85 → 62 → 40px across breakpoints, tracking scales proportionally
- [ ] Section spacing 120 → 60px mobile
- [ ] Project cards stack single-column below 809px
- [ ] All interactive elements have visible keyboard focus (2px `#0099ff` outline)
- [ ] Muted silver `#a6a6a6` on `#000` = 8.6:1 (WCAG AAA)
- [ ] Framer Blue `#0099ff` on `#000` = 6.4:1 (AA large, AAA large)
- [ ] Semantic landmarks: `<main>`, `<section aria-labelledby>`
- [ ] Project cards are `<a>` if clickable, never divs with click handlers
- [ ] `prefers-reduced-motion: reduce` disables button scale-press and ring-shadow hover lift
- [ ] `<html lang>` from profile locale (default `en`)
- [ ] Images have real alt text from the schema, not empty strings
