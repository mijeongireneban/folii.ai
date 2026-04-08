# Marketing Launch Kit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the stock create-next-app README with a product-first README, add MIT license, and draft a launch kit (HN post, tweet thread, OG image spec) so folii can be shared publicly.

**Architecture:** Pure documentation PR. Five new/replaced files in the repo, no code changes, no new dependencies. Each file is independent — order is chosen for low-risk-first (LICENSE first because it's trivial and unblocks the footer link in README, then README, then the three launch docs).

**Tech Stack:** Markdown only. No tools, no build step. The repo's existing pnpm/Next.js setup is unchanged.

Spec: `docs/superpowers/specs/2026-04-08-marketing-launch-kit-design.md`

Branch: cut a new feature branch `feature/marketing-launch-kit` off `develop` per the project's git flow (see `CLAUDE.md`).

---

## Pre-flight

- [ ] **Step 0.1: Confirm clean working tree on develop**

```bash
cd /Users/mijeongban/Documents/dev-ai/folii-ai
git status
git checkout develop
git pull origin develop
```

Expected: clean working tree, on `develop`, up to date with origin.

- [ ] **Step 0.2: Cut the feature branch**

```bash
git checkout -b feature/marketing-launch-kit
```

Expected: switched to a new branch `feature/marketing-launch-kit`.

- [ ] **Step 0.3: Create the launch directory**

```bash
mkdir -p docs/launch
```

Expected: directory exists. (No commit yet — empty dirs aren't tracked by git.)

---

## Task 1: LICENSE file

**Files:**
- Create: `LICENSE`

- [ ] **Step 1.1: Write the LICENSE file**

Create `LICENSE` with this exact content:

```
MIT License

Copyright (c) 2026 mijeongireneban

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 1.2: Verify the file exists**

```bash
ls -la LICENSE && wc -l LICENSE
```

Expected: file exists, ~21 lines.

- [ ] **Step 1.3: Commit**

```bash
git add LICENSE
git commit -m "chore: add MIT license"
```

---

## Task 2: README.md replacement

**Files:**
- Modify: `README.md` (full replacement of the create-next-app boilerplate)

- [ ] **Step 2.1: Replace README.md with the full content below**

Overwrite `README.md` with this exact content:

````markdown
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

One template, built for the modal mid-career software engineer. Email and password auth. Resume upload via PDF or text paste. Chat-driven content edits with one-level undo. JSON view for power users who want to hand-fix. Public portfolio at `/[username]`. Rate-limited LLM calls per user. Design freedom is deliberately zero — that's the wedge.

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
````

- [ ] **Step 2.2: Verify the file looks right**

```bash
wc -l README.md && head -5 README.md
```

Expected: roughly 90 to 120 lines, first line is `# folii`.

- [ ] **Step 2.3: Commit**

```bash
git add README.md
git commit -m "docs: replace boilerplate README with product-first launch copy"
```

---

## Task 3: HN Show HN post draft

**Files:**
- Create: `docs/launch/hn-post.md`

- [ ] **Step 3.1: Write the HN post**

Create `docs/launch/hn-post.md` with this exact content:

````markdown
# Show HN post — folii

Status: draft, not posted yet.
Last updated: 2026-04-08.

---

**Title** (keep under 80 chars):

```
Show HN: folii – a personal site in 5 minutes, in your voice
```

---

**Body:**

folii turns a resume into a personal website in about 5 minutes. You upload a PDF or paste the text, refine the draft through chat, and publish to a public URL.

I built it because most engineers I know don't have a personal site. Not because they can't. Because cloning a Vercel template takes a weekend, and after all that, the copy still reads like a LinkedIn bio. "Passionate full-stack engineer building scalable solutions." Nobody talks like that.

folii's wedge is content, not design. You get exactly one beautiful template per persona. You never touch the layout. The chat only modifies content, so the product can obsess over one thing: getting the AI to write in your voice instead of corporate-speak.

v1 is one template, built for software engineers 3 to 7 years in. Mid-career, GitHub presence, a few real projects. Other personas (designers, PMs, academics) will arrive as new templates, not as settings knobs.

It's v1 and rough edges exist. The thing I most want feedback on: read someone else's published folii page and tell me whether the AI copy sounds like a human or a LinkedIn bio. That's the one bar that decides whether this product works.

Live demo: https://folii-ai.vercel.app
Repo: https://github.com/mijeongireneban/folii.ai

---

## Notes for the poster

- Post on a Tuesday or Wednesday morning Pacific time, not weekend.
- Reply to the first 10 comments within 30 minutes. After that, momentum has either started or it hasn't.
- Do NOT mention Claude Code, gstack, or "personal learning project" in the post body. Builders who click through find that context themselves in `docs/`.
- If asked "how was this built", THEN mention Claude Code + gstack and link to `docs/prd.md`, `docs/architecture.md`, `docs/implementation-plan.md`. Not before.
- If the demo URL has changed to a custom domain by post day, update both the title (if needed) and the link block above.
````

- [ ] **Step 3.2: Verify the file**

```bash
wc -l docs/launch/hn-post.md
```

Expected: roughly 40 to 55 lines.

- [ ] **Step 3.3: Commit**

```bash
git add docs/launch/hn-post.md
git commit -m "docs: add show hn post draft"
```

---

## Task 4: Tweet thread draft

**Files:**
- Create: `docs/launch/tweet-thread.md`

- [ ] **Step 4.1: Write the tweet thread**

Create `docs/launch/tweet-thread.md` with this exact content:

````markdown
# Tweet thread — folii launch

Status: draft, not posted yet.
Last updated: 2026-04-08.
Author: @mijeongireneban (or whichever handle ends up active)

---

## Tweet 1 — hook (attach hero GIF)

```
I got tired of personal site templates that still sound like a LinkedIn bio.

So I built folii. Upload your resume, refine through chat, publish in 5 minutes.

https://folii-ai.vercel.app
```

(280 chars, attach `public/readme-hero.gif` once recorded.)

---

## Tweet 2 — the problem

```
Two existing options for a personal site:

1. Clone a Vercel template. Lose a weekend. Copy still reads like "passionate full-stack engineer building scalable solutions."
2. ChatGPT + manual deploy. Works for 5% of engineers.

Most people just don't have a personal site.
```

---

## Tweet 3 — the wedge

```
folii is one beautiful template per persona. You never touch the layout.

The chat only modifies content, so the product can obsess over one thing: getting the AI to write in your voice instead of corporate-speak.

About 5 minutes from resume to live URL.
```

---

## Tweet 4 — what makes it different

```
Design freedom is zero on purpose.

You can't change the template, the colors, the typography. The product has exactly one job, and that job is the words.

If the bio sounds like you, it works. If it sounds like LinkedIn, it fails. There is no other axis.
```

---

## Tweet 5 — the demo moment

```
You type "make the bio shorter" in chat.
The preview updates.
You type "drop the grad school project."
It's gone.
You publish.
Your friend opens the URL.

That's the whole product.
```

---

## Tweet 6 — CTA

```
v1 is for software engineers, 3 to 7 years in. One template, designed for the modal mid-career SWE.

Try it, break it, tell me if the AI copy sounds robotic so I can fix the prompt.

https://folii-ai.vercel.app
```

---

## Notes for the poster

- Post Tuesday or Wednesday morning Pacific time. Same window as the HN post; can be the same day if HN is going well.
- Tweet 1 needs the hero GIF attached or it dies in feed.
- Do NOT mention Claude Code or gstack in the main thread. If someone replies asking how it was built, reply with a link to `docs/` then.
- If the URL changes to a custom domain, update tweets 1, 3, and 6.
- Pin the thread for at least a week after posting.
````

- [ ] **Step 4.2: Verify the file**

```bash
wc -l docs/launch/tweet-thread.md
```

Expected: roughly 70 to 90 lines.

- [ ] **Step 4.3: Commit**

```bash
git add docs/launch/tweet-thread.md
git commit -m "docs: add launch tweet thread draft"
```

---

## Task 5: OG image and hero GIF spec

**Files:**
- Create: `docs/launch/og-image-spec.md`

- [ ] **Step 5.1: Write the spec**

Create `docs/launch/og-image-spec.md` with this exact content:

````markdown
# OG image and README hero GIF spec

Two visual assets the launch kit depends on. Both are specs here, not deliverables for the same PR. Generate them after the launch kit lands.

## OG image (`public/og.png`)

Dimensions: 1200×630. Format: PNG, under 300KB.

Layout:

- Background: solid `#000000`. No gradient, no texture, no decorative element. (DESIGN.md §2)
- Wordmark: "folii" in Cabinet Grotesk Medium, weight 500, size ~180px, letter-spacing `-5.5px`, line-height 0.85. White `#ffffff`. Centered horizontally, vertically positioned at ~40% from the top. (DESIGN.md §3)
- Accent line: 2px tall, ~200px wide, Framer Blue `#0099ff`, centered horizontally, sitting 20px below the wordmark. (DESIGN.md §7)
- Tagline: "A personal site in 5 minutes. In your voice." Inter Variable, size ~36px, weight 400, color muted silver `#a6a6a6`. Centered, sitting 40px below the accent line.
- No icons, no illustrations, no logos, no decorative shapes. (DESIGN.md §4, §7)

Generation options:

- **Hand-composed in Figma**: easiest if a Figma file already exists for the brand. Export as PNG at 2x, then resize to 1200×630.
- **Scripted via `@vercel/og`**: lower-maintenance long term. Add a route at `src/app/og/route.tsx` that returns the image with the same composition above. Reference: https://vercel.com/docs/functions/og-image-generation.

Either is fine. Pick whichever takes 30 minutes, not 3 hours.

## Meta tags (after `og.png` ships)

Add to `src/app/layout.tsx` inside the `metadata` export:

```tsx
openGraph: {
  title: "folii — a personal site in 5 minutes, in your voice",
  description: "Upload your resume, refine through chat, publish. Built for software engineers.",
  url: "https://folii-ai.vercel.app",
  siteName: "folii",
  images: [
    {
      url: "/og.png",
      width: 1200,
      height: 630,
      alt: "folii — a personal site in 5 minutes, in your voice",
    },
  ],
  type: "website",
},
twitter: {
  card: "summary_large_image",
  title: "folii — a personal site in 5 minutes, in your voice",
  description: "Upload your resume, refine through chat, publish.",
  images: ["/og.png"],
},
```

## README hero GIF (`public/readme-hero.gif`)

Dimensions: 800px wide, 16:9 ratio (so 800×450). Format: GIF, under 2MB.

Length: 6 to 8 seconds. Loops seamlessly (last frame matches first).

Frame rate: 12fps. Higher framerates blow past the 2MB cap; 12 is the floor for "feels smooth enough."

Content (single continuous take, no cuts):

1. Editor open with an empty preview pane and the upload modal visible
2. User pastes resume text into the upload modal and clicks the parse button
3. Preview pane populates with the generated draft
4. User types `make the bio shorter` in the chat input and hits enter
5. Preview pane updates with the shorter bio
6. User clicks the Publish button in the top right
7. New tab opens to `folii-ai.vercel.app/their-username` showing the live page

Recording workflow:

1. Run `pnpm dev` against a clean local Supabase with one test account
2. Record at 1440×900 source resolution using Kap, CleanShot, or QuickTime
3. Crop to 16:9 (so 1440×810), then resize to 800×450
4. Export to GIF at 12fps via `ffmpeg`:

```bash
ffmpeg -i source.mov -vf "fps=12,scale=800:-1:flags=lanczos" -loop 0 public/readme-hero.gif
```

5. Verify file size is under 2MB. If over, drop fps to 10 or shorten the take.

Alt text (used in README and Twitter): "folii demo: upload a resume, refine the draft through chat, publish a personal site in about a minute."

## Tracking

- [ ] OG image generated and committed to `public/og.png`
- [ ] Meta tags added to `src/app/layout.tsx`
- [ ] Hero GIF recorded and committed to `public/readme-hero.gif`
- [ ] `<!-- TODO -->` comment removed from README.md
````

- [ ] **Step 5.2: Verify the file**

```bash
wc -l docs/launch/og-image-spec.md
```

Expected: roughly 70 to 95 lines.

- [ ] **Step 5.3: Commit**

```bash
git add docs/launch/og-image-spec.md
git commit -m "docs: add og image and hero gif spec"
```

---

## Task 6: Push and open PR

- [ ] **Step 6.1: Sanity check the branch**

```bash
git status
git log --oneline develop..HEAD
```

Expected: clean working tree, 5 commits ahead of `develop` (LICENSE, README, hn-post, tweet-thread, og-spec).

- [ ] **Step 6.2: Push the branch**

```bash
git push -u origin feature/marketing-launch-kit
```

Expected: branch pushed, upstream tracking set.

- [ ] **Step 6.3: Open the PR against develop**

```bash
gh pr create --base develop --title "docs: marketing launch kit (readme + hn post + tweet thread + og spec)" --body "$(cat <<'EOF'
## Summary

- Replaces stock create-next-app README with product-first launch copy
- Adds MIT LICENSE
- Drafts Show HN post, tweet thread, and OG image + hero GIF spec under docs/launch/

No code changes. No new dependencies. No public/ assets in this PR (those follow once the OG image is generated and the hero GIF is recorded).

Spec: docs/superpowers/specs/2026-04-08-marketing-launch-kit-design.md
Plan: docs/superpowers/plans/2026-04-08-marketing-launch-kit.md

## Test plan

- [ ] README renders correctly on GitHub (check the rendered preview, not the raw markdown)
- [ ] All links in README resolve (live demo, /docs, LICENSE, GitHub profile)
- [ ] HN post body fits comfortably under HN's character limits
- [ ] Tweet drafts each fit under 280 chars
- [ ] OG spec is concrete enough that someone could generate the image without asking questions
EOF
)"
```

Expected: PR created, URL printed.

- [ ] **Step 6.4: Print the PR URL for the user**

The `gh pr create` command above prints the URL. Paste it back to the user and stop.

---

## Done criteria

- 5 commits on `feature/marketing-launch-kit` (LICENSE, README, HN post, tweet thread, OG spec)
- Branch pushed
- PR open against `develop` with the title and body above
- README renders correctly on the PR page
- No code changes, no new deps, no `public/` asset additions
