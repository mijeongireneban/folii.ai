# Architecture — folii.ai v1

Tech design. How the product is actually built, at the level a new engineer joining the repo needs to know before touching code.

## Stack

- **Framework:** Next.js 16 (app router, server components, server actions)
- **Language:** TypeScript, strict mode
- **UI:** Tailwind + shadcn/ui (radix new-york style), framer-motion for transitions
- **DB / Auth / Storage:** Supabase (Postgres, Supabase Auth with email+password, Supabase Storage for PDFs and image uploads)
- **LLM:** OpenAI SDK. Structured outputs via `response_format: { type: "json_schema" }`
- **Validation:** Zod as the single source of truth. TypeScript types derived via `z.infer`
- **PDF parsing:** `pdfjs-dist`, server-side, layout-aware
- **Patch format:** `fast-json-patch` (RFC 6902) for chat edits
- **Editor:** CodeMirror 6 (`@uiw/react-codemirror`, `@codemirror/lang-json`, `@codemirror/theme-one-dark`)
- **Rate limiting:** Upstash Ratelimit
- **Deployment:** Vercel (serverless functions per request)

## Single source of truth: Zod

The portfolio content schema in `src/lib/content/schema.ts` is the single source of truth for everything downstream. LLM extraction, template renderer, chat-to-patch, publish all read and write against this schema.

- TypeScript types are derived via `type Content = z.infer<typeof contentSchema>`. **Never hand-written.**
- LLM prompts use `zod-to-json-schema` to serialize the schema into the prompt at runtime. Adding a field to Zod updates the prompt automatically.
- OpenAI calls use `response_format: { type: "json_schema", json_schema: ... }` to enforce the shape at the API level. Eliminates the "LLM returned invalid JSON" failure branch.

### Content shape (v1 SWE persona)

```
{
  name: string
  tagline: string
  bio: string
  avatar?: string          // URL to uploaded image
  links: {
    github?: string
    twitter?: string
    linkedin?: string
    website?: string
  }
  experience: Experience[]
  projects: Project[]
  education?: Education[]
  timezone?: string
}
```

Each field's max length and required/optional flag is encoded in the schema. No decorative fields (`icon`, `banner_image`, `illustration`). Engineer's own work is the only imagery on `/[username]`. Project screenshots are the one exception, they're content, not decoration.

## Data model (Postgres via Supabase)

### `profiles` table

```sql
user_id          uuid PRIMARY KEY REFERENCES auth.users(id)
username         citext UNIQUE NOT NULL
content          jsonb NOT NULL
previous_content jsonb                    -- last version before most recent edit (single-level undo)
published        boolean DEFAULT false
created_at       timestamptz DEFAULT now()
updated_at       timestamptz DEFAULT now()
```

Unique citext index on `username` for case-insensitive collision checks. Shape constraint on `username` (lowercase, alphanumeric + hyphens, 3-30 chars, no leading/trailing hyphen).

### Row-level security

- `SELECT` / `UPDATE` on own row: `user_id = auth.uid()`
- Public portfolio lookup uses the **server-side admin client** filtered by `published = true`. Never exposes unpublished drafts.
- RLS is tested as a hard requirement. Unpublished content must never leak across users.

### Storage buckets

- `project-images` — project screenshots and profile avatars. Reused for avatars via path convention `<user>/<site>-avatar-<ts>.<ext>`.

## Core flows

### Sign-up to published

```
signup → verify email → editor (empty) → upload resume PDF
  → extract text via pdfjs-dist
  → LLM: resume-to-content prompt → draft content
  → render in preview pane
  → chat edits ("tighten the bio")
  → publish → /[username] goes live
```

Full path top-to-bottom in user experience order. Target time for a real user: under 10 minutes.

### Chat edit (the product's load-bearing flow)

```
user message → POST /api/chat { message, currentContent }
  ├── auth check ───── fail ──▶ 401
  ├── rate limit ───── fail ──▶ 429
  ▼
  LLM: chat-edit-patch prompt → JSON Patch array (RFC 6902)
  ├── invalid JSON ──────── retry once, then 500
  ├── not a patch shape ──▶ schema reject
  ▼
  validate patch can apply ── fail ──▶ reject, keep prev
  ▼
  apply patch to currentContent
  ▼
  validate result against Zod schema ── fail ──▶ reject, keep prev
  ▼
  transaction:
    UPDATE profiles SET content = new, previous_content = old
  ▼
  RETURN { newContent, revertToken }
```

Every failure branch maps to a centralized error code.

### Publish flow

1. `POST /api/publish { published: true }`
2. Server sets `profiles.published = true`
3. `revalidatePath('/' + username)` invalidates the ISR cache
4. Next visitor to `/[username]` triggers regeneration
5. Subsequent visitors hit the Vercel CDN cache

The `/[username]` route is a statically-cached server component. First click is fast because there's no session and no DB query on the common path. Same `revalidatePath` fires on every chat edit so a published portfolio stays in sync with the editor.

## LLM latency UX (non-negotiable)

Resume-to-content and chat-edit calls take 3-8 seconds. Dead UI for that long feels broken. The editor must:

- **Optimistically render the user's chat message** the instant they hit enter. No waiting for the server.
- **Disable the chat input and show a cancel affordance** while a request is in flight. Prevents rapid-fire failure mode.
- **Show a skeleton / shimmer overlay on the preview pane** while content is regenerating.
- **Stream the LLM response where possible.** Stream JSON Patch tokens for chat edits, stream the content object for initial resume generation. OpenAI SDK supports this via `stream: true` on structured outputs.

## Rate limiting

Every LLM endpoint costs real money. Upstash Ratelimit is the limiter. All LLM endpoints are auth-protected, no unauthenticated access at all. Rate limit key is `user_id` from the Supabase session, not IP.

| Endpoint | Limit |
|---|---|
| `/api/wizard/parse` (resume parse) | 5 / user / hour |
| `/api/chat` (chat edit) | 30 / user / hour |
| `/api/publish` | tighter, shared bucket |
| `/api/upload/*` (image uploads) | 30 / user / hour |

## Error taxonomy

Centralized in `src/lib/errors.ts` as an enum + message map. Every API route returns `{ error: { code, message } }` on failure.

```
LLM_RETRY_EXHAUSTED   "The AI had trouble with that one. Try rephrasing?"
SCHEMA_REJECTED       "That change would break your portfolio structure. Try a smaller edit."
PATCH_INVALID         "Couldn't apply that edit, try being more specific."
RATE_LIMITED          "Slow down, try again in {N} minutes."
AUTH_REQUIRED         (middleware redirects to /auth/login)
UNKNOWN               "Something went wrong. Copy your last message and refresh."
```

## Routes

### Public

- `/` — landing
- `/auth/signup`, `/auth/login`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email`
- `/[username]`, `/[username]/experience`, `/[username]/skills`, `/[username]/projects`, `/[username]/contact` — public portfolio sections (published only, 404 otherwise)

### Authenticated

- `/editor` — single-page editor with preview + chat + JSON toggle, split or focus layout

### API

- `POST /api/wizard/parse` — resume PDF or text → extracted content
- `POST /api/chat` — chat message → JSON Patch → updated content
- `POST /api/revert` — restore `previous_content`
- `PUT /api/content` — save JSON directly (power-user path)
- `DELETE /api/content` — reset everything
- `POST /api/publish` — toggle publish state
- `POST /api/upload/project-image`, `POST /api/upload/avatar` — image uploads
- `GET /api/username/check?slug=...` — availability check
- `PATCH /api/username` — update slug

## Directory layout

```
src/
  app/
    [username]/          public portfolio pages + loading.tsx
    auth/                signup, login, password reset
    editor/              editor page + loading.tsx
    api/                 route handlers
  components/
    template/            SwePortfolio + v2/ section components
    ui/                  shadcn primitives
  lib/
    content/schema.ts    Zod source of truth
    content/placeholder.ts
    llm/prompts/         versioned prompt files
    supabase/            client + server + admin factories
    errors.ts            error code enum + messages
    rate-limit.ts        Upstash bucket config
    username.ts          validator + reserved words
supabase/
  migrations/            SQL files, numbered
docs/                    this folder
.claude/skills/          project-local Claude Code skills
```

## Key design decisions worth remembering

1. **Zod is the only source of truth.** Schema changes propagate to TS types, prompts, and LLM structured outputs automatically.
2. **One-level undo.** Not a full version history. `previous_content` column is enough for v1. Upgrade later if real users need more.
3. **Public page is ISR-cached.** First-click performance matters because this is what the user shares. No session lookup on the hot path.
4. **Rate limit by user, not IP.** All LLM endpoints are auth-protected. No anonymous fallback.
5. **Patches, not whole rewrites.** Chat edits return JSON Patches so we can validate the diff before applying. Avoids entire-document replacement on a minor edit.
6. **Separate parse + generate endpoints.** Resume PDF parsing is one call, LLM extraction is another. User reviews extracted text before burning an LLM call. Catches PDF parsing failures early.
