# Marketing launch kit — design spec

Date: 2026-04-08
Branch: feature/v1-scaffold
Status: Approved, ready for implementation plan

## Goal

Replace the stock `create-next-app` README with a product-first README, and draft a launch kit (HN post, tweet thread, OG image spec) so folii can be shared publicly without scrambling on launch day.

The copy must read like an actual service a stranger would sign up for, not a "look what I built" devlog. Builders who dig into the repo will still find the full `docs/` trail and the stack disclosure — but they are not the primary voice of the README.

## Audience (ranked)

1. **Prospective users** — landing from HN / Twitter / a friend's share. Need to understand what folii does, see proof it works, and click through to try it in under 30 seconds.
2. **Fellow builders / recruiters** — reading the repo page to evaluate taste and execution. Get fed by the substance of the repo (`docs/`, commit history, DESIGN.md) and a small, honest stack disclosure. Not addressed by copy.
3. **Contributors / future-me** — collapsed `<details>` blocks for stack and local setup. No contributor onboarding push; this isn't an OSS invite.

## Non-goals

- Landing page (`/`) copy audit — separate project, goes through `/design-consultation`
- `public/og.png` as a deliverable — the spec ships, the asset is follow-up
- Hero GIF as a deliverable — spec ships, recording is follow-up after a clean demo run
- Contributor onboarding, CODE_OF_CONDUCT, issue templates — not an OSS invite
- Any "built with Claude Code" framing in the hero or as a section heading
- Any "personal learning project" framing anywhere in user-facing copy

## Tone

Inherited from `DESIGN.md` voice and the PRD's "sounds like a human with taste" bar:

- Direct, specific, active voice
- No AI vocabulary (delve, crucial, robust, comprehensive, nuanced, multifaceted, etc.)
- No em dashes — use commas, periods, or "..."
- No "revolutionize", "unlock", "all-in-one", "AI-powered"
- Short paragraphs. One-sentence paragraphs allowed and encouraged.
- The README should pass the same bar as a folii-generated bio: specific > generic, active > passive, measurable > vague

## Deliverables

Written to the repo in this PR:

1. `README.md` — replaces current `create-next-app` boilerplate
2. `docs/launch/hn-post.md` — Show HN draft
3. `docs/launch/tweet-thread.md` — 6-tweet thread draft
4. `docs/launch/og-image-spec.md` — OG image + README hero GIF specs
5. `LICENSE` — MIT, standard text, copyright mijeongireneban

Not in this PR:

- `public/og.png` (follow-up, generated from the spec)
- `public/readme-hero.gif` (follow-up, recorded from a clean demo run)

## README structure

Target length ~140 lines, reads in 30 seconds.

```
<hero>
  folii
  One-liner: "A personal site in 5 minutes. In your voice."
  [Try folii →](https://folii-ai.vercel.app)
  ![hero demo](public/readme-hero.gif)  <!-- TODO: record -->

<why folii>
  Four tight paragraphs adapted from docs/prd.md:
    1. The problem: cloning a template takes a weekend and the copy still
       sounds like a LinkedIn bio.
    2. The wedge: content, not design. One beautiful template per persona.
       You never touch layout. You refine content through chat.
    3. Who it's for (v1): software engineers with 3–7 years of experience.
       Mid-career, GitHub presence, a few real projects.
    4. What you actually do: upload your resume, review the draft, refine
       via chat, publish to a public URL.

<how it works>
  Three steps, one line each, each with an inline visual placeholder:
    1. Upload your resume (PDF or paste as text)
    2. Refine through chat ("make the bio shorter", "drop the grad project")
    3. Publish to folii-ai.vercel.app/your-name

<what's in v1>
  One short paragraph:
    "v1 ships with one template, built for the modal mid-career software
    engineer. Other personas (designers, PMs, academics) arrive as new
    templates, not as settings knobs. Design freedom is deliberately zero."

<stack>  (collapsed <details>)
  Next.js 16 (app router, server components)
  React 19
  TypeScript strict
  Tailwind + shadcn/ui (radix new-york)
  Supabase (Postgres, Auth, Storage)
  OpenAI SDK with structured outputs
  Zod as single source of truth
  pdfjs-dist for server-side resume parsing
  fast-json-patch (RFC 6902) for chat edits
  Upstash Ratelimit
  CodeMirror 6 for the JSON view
  Deployed on Vercel
  ---
  One-liner at the bottom of the stack block:
    "Built with Claude Code + gstack. Full PRD, architecture, and
    implementation plan live under docs/."

<local setup>  (collapsed <details>)
  pnpm install
  cp .env.example .env.local   (fill in Supabase + OpenAI keys)
  pnpm dev
  That's it. No contributor onboarding wall.

<license + footer>
  MIT. Built by [@mijeongireneban](https://github.com/mijeongireneban).
```

### Hero one-liner

Primary: **"A personal site in 5 minutes. In your voice."**

Alternates (on the shelf if the primary doesn't feel right once written):

- "Upload your resume. Get a personal site that doesn't sound like a LinkedIn bio."
- "The personal site that writes itself. You just refine."

### CTA

Single primary CTA in the hero: `[Try folii →](https://folii-ai.vercel.app)`. No secondary CTA in the hero. Secondary "read the code" happens naturally because this IS the repo.

When the custom domain lands (TBD, `folii.*`), the implementation plan should include a single-commit URL swap across README + launch kit.

## HN / Show HN post

File: `docs/launch/hn-post.md`

**Title** (~80 chars): `Show HN: folii – a personal site in 5 minutes, in your voice`

**Body** (~250 words), five paragraphs:

1. **What it is** (2 sentences): folii turns a resume into a personal website in about 5 minutes. Upload a PDF, refine the draft through chat, publish to a public URL.
2. **Why I built it** (3 sentences): most engineers don't have a personal site. Not because they can't. Because cloning a template takes a weekend and the copy still sounds like a LinkedIn bio.
3. **The wedge** (3 sentences): folii gives you exactly one template per persona. You never touch layout. The chat only modifies content, so the product can obsess over one thing: getting the AI to write in your voice instead of corporate-speak.
4. **What's in v1** (2 sentences): one template, built for mid-career software engineers. Other personas arrive as new templates, not settings.
5. **What I want from HN** (2 sentences): it's v1 and rough edges exist. I especially want to know if the AI copy sounds like a human or a LinkedIn bio when you read it — that's the one thing that decides whether this product works.

**Link block at the bottom:**
- Live demo: https://folii-ai.vercel.app
- Repo: (link to GitHub repo)

**Tone note:** no mention of Claude Code, gstack, or "personal learning project" anywhere in the post. Builders who click through to the repo find that context themselves.

## Tweet thread

File: `docs/launch/tweet-thread.md`

Six tweets, draft copy:

1. **Hook** — "I got tired of personal site templates that still sound like a LinkedIn bio. So I built folii. [demo link] [hero GIF attached]"
2. **Problem** — "Cloning a Vercel template: a weekend gone, copy still generic. ChatGPT + manual deploy: works for 5% of engineers, nobody else. Most people just... don't have a personal site."
3. **Wedge** — "folii is one template per persona. You never touch layout. You upload your resume, refine through chat, publish. About 5 minutes from file to live URL."
4. **What makes it different** — "Design freedom is zero on purpose. The product only has one job: get the AI to write in your voice, not in 'passionate full-stack engineer building scalable solutions' voice."
5. **Concrete demo moment** — "You type 'make the bio shorter' in chat. The preview updates. You type 'drop the grad school project'. It's gone. You publish. Your friend opens the URL. That's the whole product."
6. **CTA** — "v1 is software engineers only, 3–7 years in. Try it, break it, tell me if the copy sounds robotic so I can fix the prompt. [demo link]"

**Author voice:** attributed to mijeongireneban. No "shipped with Claude Code" in the thread body. If there's a 7th tweet it's a reply, not part of the main thread.

## OG image + README hero GIF spec

File: `docs/launch/og-image-spec.md`

### OG image (`public/og.png`, 1200×630)

- Background: `#000000` (DESIGN.md §2)
- Wordmark: "folii", Cabinet Grotesk Medium weight 500, ~180px, `-5.5px` letter-spacing (DESIGN.md §3)
- Tagline underneath: "A personal site in 5 minutes. In your voice." — Inter Variable, ~36px, muted silver `#a6a6a6`
- Accent: 2px horizontal line in Framer Blue `#0099ff` between wordmark and tagline, ~200px wide
- No icons, no illustrations, no decorative gradients (DESIGN.md §4, §7)
- Generation: hand-composed in Figma or scripted via `@vercel/og`. Either is fine. `@vercel/og` is lower-maintenance.

Meta tags to add to `src/app/layout.tsx` once the image ships:

```tsx
openGraph: {
  title: "folii — a personal site in 5 minutes, in your voice",
  description: "Upload your resume, refine through chat, publish. Built for software engineers.",
  images: ["/og.png"],
}
```

### README hero GIF (`public/readme-hero.gif`)

- Dimensions: 800px wide, 16:9 ratio
- Length: 6–8 seconds, loops seamlessly
- Frame rate: 12fps (keeps file under 2MB)
- Content: a single continuous demo take showing:
  1. Editor open with an empty preview
  2. Paste resume text into the upload modal
  3. Preview populates with the generated draft
  4. User types "make the bio shorter" in chat
  5. Preview updates
  6. User clicks Publish
  7. New tab opens to the public `/username` URL
- Recording: 1440×900 source, cropped to 16:9, exported at 12fps via ffmpeg or Kap
- Alt text: "folii demo: upload a resume, refine the draft through chat, publish a personal site in about a minute"

## License

MIT. Standard OSI text. Copyright holder: `mijeongireneban`. Year: 2026.

The repo is open because the `docs/` trail is half the value for the builder audience, and MIT removes any ambiguity about forking or learning from the code. This does not make folii an OSS project — it's a product that happens to have a public repo.

## Implementation order

1. `LICENSE` file (30 seconds, unblocks everything)
2. `README.md` — full replacement of the create-next-app boilerplate
3. `docs/launch/hn-post.md`
4. `docs/launch/tweet-thread.md`
5. `docs/launch/og-image-spec.md`
6. Single commit, PR against `develop`, title: `docs: marketing launch kit (readme + hn post + tweet thread + og spec)`

No code changes, no new dependencies, no `public/` assets in this PR.

## Open questions deferred to implementation

- **Custom domain URL swap.** Whenever `folii.*` is purchased, a single follow-up PR does a find-and-replace across README, launch kit, and `src/app/layout.tsx` meta tags. Not blocking this launch kit.
- **Hero one-liner final pick.** Primary is "A personal site in 5 minutes. In your voice." Two alternates on the shelf. Final decision happens when the README draft is read end-to-end — sometimes a line reads fine in a spec and wrong in context.
- **Twitter handle.** If one exists and should be linked in the footer, it gets added during implementation. If not, README footer is GitHub-only.
