# folii

**A personal site in 5 minutes. In your voice.**

[Try folii →](https://folii-ai.vercel.app)

<!-- TODO: replace with public/readme-hero.gif once recorded. See docs/launch/og-image-spec.md -->
![folii demo: upload a resume, refine through chat, publish a personal site](public/readme-hero.gif)

## Why folii

Most engineers don't have a personal site. Not because they can't. Because cloning a Vercel template takes a weekend, and after all that, the copy still reads like a LinkedIn bio. "Passionate full-stack engineer building scalable solutions." Nobody talks like that.

folii's wedge is content, not design. You get exactly one beautiful template per persona. You never touch the layout. The chat only modifies content, so the product can obsess over one thing: getting the AI to write in your voice instead of corporate-speak.

v1 ships for software engineers with 3 to 7 years of experience. Mid-career, GitHub presence, a few real projects. Other personas (designers, PMs, academics) arrive later as new templates, not as settings knobs.

What you actually do: upload your resume as a PDF or paste it as text, review the draft, refine through chat ("make the bio shorter", "drop the grad school project"), and publish to a public URL. About 5 minutes from file to live link.

## How it works

1. **Upload your resume.** PDF or paste-as-text. The text is extracted server-side and shown back to you so you can fix any parsing weirdness before burning an LLM call.
2. **Refine through chat.** Ask for shorter, sharper, or different. The chat returns a JSON Patch, which gets validated against the schema before it's applied. Bad responses never corrupt your content.
3. **Publish.** One click. Your site goes live at `folii-ai.vercel.app/your-name` and is statically cached so the first click is instant.

## What's in v1

One template, built for the modal mid-career software engineer. Email and password auth. Resume upload via PDF or text paste. Chat-driven content edits with one-level undo. JSON view for power users who want to hand-fix. Public portfolio at `/[username]`. Rate-limited LLM calls per user. Design freedom is deliberately zero, that's the wedge.

<details>
<summary><strong>Stack</strong></summary>

- Next.js 16 (app router, server components, server actions)
- React 19, TypeScript strict mode
- Tailwind + shadcn/ui (radix new-york style)
- Supabase (Postgres, Auth, Storage) with row-level security
- OpenAI SDK with structured outputs (`response_format: { type: "json_schema" }`)
- Zod as the single source of truth for content shape
- `pdfjs-dist` for layout-aware server-side PDF parsing
- `fast-json-patch` (RFC 6902) for chat edits
- Upstash Ratelimit, keyed by user
- CodeMirror 6 for the JSON view
- Deployed on Vercel

Built with Claude Code + gstack. Full PRD, architecture, and implementation plan live under [`docs/`](./docs).

</details>

<details>
<summary><strong>Local setup</strong></summary>

```bash
pnpm install
cp .env.example .env.local   # fill in Supabase + OpenAI keys
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Tests: `pnpm test` (vitest). Type check: `pnpm exec tsc --noEmit`.

</details>

## License

[MIT](./LICENSE). Built by [@mijeongireneban](https://github.com/mijeongireneban).
