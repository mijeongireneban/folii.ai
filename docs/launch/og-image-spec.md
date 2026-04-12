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
