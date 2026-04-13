# Design System — folii.ai

> Adopted from the [Framer design system spec](https://github.com/VoltAgent/awesome-design-md/tree/main/design-md/framer) (VoltAgent awesome-design-md). The aesthetic is Framer's, applied to folii.ai as the product canvas. The structure is the 9-section format designed for AI agents to follow reliably.

## Product Context
- **What this is:** folii.ai — AI-assisted portfolio website builder. Upload a resume, refine via chat, publish a public URL at `folii.ai/{username}`.
- **Who it's for:** Software engineers, 3-7 years experience (v1 launch persona). Broader knowledge-worker audience post-v1.
- **Space/industry:** Developer tools / personal web publishing.
- **Project type:** Hybrid — `/[username]` is marketing/editorial (the published portfolio is the product artifact people share), `/editor` is app UI, `/auth/*` is auth.

## 1. Visual Theme & Atmosphere

folii.ai is a cinematic, tool-obsessed dark canvas that radiates the confidence of a builder who worships craft. The entire experience is drenched in pure black — not a warm charcoal or a cozy dark gray, but an absolute void (`#000000`) that makes every element, every published portfolio, every typographic flourish feel like it's floating in deep space. Every published folii portfolio is a page that treats its own content as the hero art: the engineer's name, their projects, their experience — embedded in the narrative flow with no decoration competing for attention.

The typography is the signature move: Cabinet Grotesk with aggressively tight letter-spacing (as extreme as -5.5px on 110px display text) creates headlines that feel compressed, kinetic, almost spring-loaded — like words under pressure that might expand at any moment. The transition to Inter for body text is seamless, with extensive OpenType feature usage (`cv01`, `cv05`, `cv09`, `cv11`, `ss03`, `ss07`) that gives even small text a refined, custom feel. Framer Blue (`#0099ff`) is deployed sparingly but decisively — as link color, border accents, and subtle ring shadows — creating a cold, electric throughline against the warm-less black.

The overall effect is a nightclub for engineers: dark, precise, seductive, and unapologetically content-forward. Every section exists to showcase what the engineer has built, with the page itself serving as proof of taste.

**Key Characteristics:**
- Pure black (`#000000`) void canvas — absolute dark, not warm or gray-tinted
- Cabinet Grotesk display font with extreme negative letter-spacing (-5.5px at 110px)
- Framer Blue (`#0099ff`) as the sole accent color — cold, electric, precise
- Pill-shaped buttons (40px–100px radius) — no sharp corners on interactive elements
- The engineer's content IS the hero art — name, projects, experience take centerstage
- Frosted glass button variants using `rgba(255, 255, 255, 0.1)` on dark surfaces
- Extensive OpenType feature usage across Inter for refined micro-typography

## 2. Color Palette & Roles

### Primary
- **Pure Black** (`#000000`): Primary background, the void canvas that defines folii's dark-first identity
- **Pure White** (`#ffffff`): Primary text color on dark surfaces, button text on accent backgrounds
- **Framer Blue** (`#0099ff`): Primary accent color — links, borders, ring shadows, interactive highlights

### Secondary & Accent
- **Muted Silver** (`#a6a6a6`): Secondary text, subdued labels, dimmed descriptions on dark surfaces
- **Near Black** (`#090909`): Elevated dark surface, shadow ring color for subtle depth separation

### Surface & Background
- **Void Black** (`#000000`): Page background, primary canvas
- **Frosted White** (`rgba(255, 255, 255, 0.1)`): Translucent button backgrounds, glass-effect surfaces on dark
- **Subtle White** (`rgba(255, 255, 255, 0.5)`): Slightly more opaque frosted elements for hover states

### Neutrals & Text
- **Pure White** (`#ffffff`): Heading text, high-emphasis body text
- **Muted Silver** (`#a6a6a6`): Body text, descriptions, secondary information
- **Ghost White** (`rgba(255, 255, 255, 0.6)`): Tertiary text, placeholders on dark surfaces

### Semantic & Accent
- **Framer Blue** (`#0099ff`): Links, interactive borders, focus rings
- **Blue Glow** (`rgba(0, 153, 255, 0.15)`): Focus ring shadow, subtle blue halo around interactive elements
- **Default Link Blue** (`#0000ee`): Standard browser link color (used sparingly in content areas)
- **Success** (`#4ade80`) / **Warning** (`#fbbf24`) / **Error** (`#f87171`): For editor toasts and inline API errors only. Never on the public portfolio.

### Gradient System
- No prominent gradient usage — folii relies on pure flat black surfaces with occasional blue-tinted glows for depth
- Subtle radial glow effects behind featured content using Framer Blue at very low opacity

## 3. Typography Rules

### Font Family
- **Display**: `Cabinet Grotesk` — geometric sans-serif, weight 500 (Medium). Free, available from [Fontshare](https://www.fontshare.com/fonts/cabinet-grotesk). Load via self-hosted `woff2` in `public/fonts/` and declare with `font-display: swap`. Cabinet Grotesk holds extreme negative letter-spacing well at display sizes and has a similar geometric weight to Cabinet Grotesk without the license cost. If a paid upgrade is ever desired, Cabinet Grotesk Medium is a drop-in replacement at the same metrics.
- **Body/UI**: `Inter Variable` — variable sans-serif with extensive OpenType features. Free, load via `@fontsource-variable/inter` or Google Fonts. Fallbacks: `-apple-system`, `system-ui`, `sans-serif`.
- **Accent**: `Mona Sans` — GitHub's open-source font, used for select elements at ultra-light weight (100). Free, available from [github.com/github/mona-sans](https://github.com/github/mona-sans).
- **Monospace**: `Azeret Mono` — companion mono for code and technical labels. Free, available on Google Fonts.
- **Rounded**: `Open Runde` — small rounded companion font for micro-labels. Free, available from [github.com/lauridskern/open-runde](https://github.com/lauridskern/open-runde).

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display Hero (engineer's name) | Cabinet Grotesk Medium | 110px | 500 | 0.85 | -5.5px | Extreme negative tracking, compressed impact |
| Section Display | Cabinet Grotesk Medium | 85px | 500 | 0.95 | -4.25px | OpenType: ss02, tnum |
| Section Heading ("Projects", "Experience") | Cabinet Grotesk Medium | 62px | 500 | 1.00 | -3.1px | OpenType: ss02 |
| Feature Heading (project title) | Cabinet Grotesk Medium | 32px | 500 | 1.13 | -1px | Tightest of the smaller headings |
| Accent Display | Mona Sans | 61.5px | 100 | 1.00 | -3.1px | Ultra-light weight, ethereal |
| Card Title | Inter Variable | 24px | 400 | 1.30 | -0.01px | OpenType: cv01, cv05, cv09, cv11, ss03, ss07 |
| Feature Title | Inter | 22px | 700 | 1.20 | -0.8px | OpenType: cv05 |
| Sub-heading | Inter | 20px | 600 | 1.20 | -0.8px | OpenType: cv01, cv09 |
| Body Large (bio) | Inter Variable | 18px | 400 | 1.30 | -0.01px | OpenType: cv01, cv05, cv09, cv11, ss03, ss07 |
| Body | Inter Variable | 15px | 400 | 1.30 | -0.01px | OpenType: cv11 |
| Nav/UI | Inter Variable | 15px | 400 | 1.00 | -0.15px | OpenType: cv06, cv11, dlig, ss03 |
| Body Readable (long-form) | Inter Regular | 14px | 400 | 1.60 | normal | Long-form body text |
| Caption | Inter Variable | 14px | 400 | 1.40 | normal | OpenType: cv01, cv06, cv09, cv11, ss03, ss07 |
| Label | Inter | 13px | 500 | 1.60 | normal | OpenType: cv06, cv11, ss03 |
| Small Caption | Inter Variable | 12px | 400 | 1.40 | normal | OpenType: cv01, cv06, cv09, cv11, ss03, ss07 |
| Micro Code (tech stack tags) | Azeret Mono | 10.4px | 400 | 1.60 | normal | OpenType: cv06, cv11, ss03 |
| Badge | Open Runde | 9px | 600 | 1.11 | normal | OpenType: cv01, cv09 |
| Micro Uppercase | Inter Variable | 7px | 400 | 1.00 | 0.21px | uppercase transform |

### Principles
- **Compression as personality**: Cabinet Grotesk's extreme negative letter-spacing (-5.5px at 110px) is the defining typographic gesture — headlines feel spring-loaded, urgent, almost breathless. The engineer's name at the top of their portfolio is the loudest thing on the page, and it compresses under its own weight.
- **OpenType maximalism**: Inter is deployed with 6+ OpenType features simultaneously (`cv01`, `cv05`, `cv09`, `cv11`, `ss03`, `ss07`), creating a subtly custom feel even at body sizes.
- **Weight restraint on display**: All Cabinet Grotesk usage is weight 500 (medium) — never bold, never regular. This creates a confident-but-not-aggressive display tone.
- **Ultra-tight line heights**: Display text at 0.85 line-height means letters nearly overlap vertically — intentional density that rewards reading at arm's length.

## 4. Component Stylings

### Buttons
- **Frosted Pill**: `rgba(255, 255, 255, 0.1)` background, white text (`#ffffff`), pill shape (40px radius). The glass-effect button that lives on dark surfaces — translucent, ambient, subtle. Used for secondary CTAs in the editor.
- **Solid White Pill**: `rgb(255, 255, 255)` background, black text (`#000000`), full pill shape (100px radius), padding `10px 15px`. The primary CTA — clean, high-contrast on dark, unmissable. Used for "Publish" in the editor and "Sign up" on marketing pages.
- **Ghost**: No visible background, white text, relies on text styling alone. Hover reveals subtle frosted background. Used for nav links and tertiary actions.
- **Transition**: Scale-based animations (matrix transform with 0.85 scale factor on press), opacity transitions for reveal effects.

### Cards & Containers
- **Dark Surface Card**: Black or near-black (`#090909`) background, `rgba(0, 153, 255, 0.15) 0px 0px 0px 1px` blue ring shadow border, rounded corners (10px–15px radius). Used for project cards on the portfolio and content cards in the editor.
- **Elevated Card**: Multi-layer shadow — `rgba(255, 255, 255, 0.1) 0px 0.5px 0px 0.5px` (subtle top highlight) + `rgba(0, 0, 0, 0.25) 0px 10px 30px` (deep ambient shadow). Used for the editor chat drawer and the resume upload modal.
- **Content Blocks**: Full-width or padded within dark containers, 8px–12px border-radius for embedded content.
- **Hover**: Subtle glow increase on Framer Blue ring shadow, or brightness shift on frosted surfaces.

### Inputs & Forms
- Auth forms, editor chat input, resume paste textarea all follow dark theme: dark background (`#090909`), subtle border (`rgba(255, 255, 255, 0.1)`), white text.
- Focus state: Framer Blue (`#0099ff`) ring border, `1px solid #0099ff`, plus `rgba(0, 153, 255, 0.15) 0px 0px 0px 3px` glow halo.
- Placeholder text in `rgba(255, 255, 255, 0.4)`.
- Error state: border and focus glow swap to `#f87171`, inline error text below input in `#f87171` at Caption size (14px).

### Navigation
- **Dark floating nav bar**: Black background with frosted glass effect, white text links. Present on marketing pages and the editor header.
- **Nav links**: Inter at 15px, weight 400, white text with subtle hover opacity change (0.7).
- **CTA button**: Pill-shaped, solid white, positioned at right end of nav.
- **Mobile**: Collapses to hamburger menu, maintains dark theme.
- **Sticky behavior**: Nav remains fixed at top on scroll with backdrop blur on the editor and marketing pages. Published portfolios (`/[username]`) have no nav bar — the page is a pure read, uninterrupted.

### Image Treatment
- **Project screenshots as centerpiece**: When an engineer adds a project with an image, it renders full-width within the project card, 8px–12px border-radius, embedded on the black surface with subtle shadow for depth separation.
- **Dark-on-dark composition**: Screenshots placed on black backgrounds with subtle shadow for depth separation.
- **Aspect ratios**: 16:9 default for project screenshots; custom aspect ratios honored when provided.
- **No decorative imagery**: All images are content — the engineer's own work, avatar, or project captures. No stock photos, no illustrations, no icon decoration.

### Trust & Social Proof (marketing pages only)
- Customer logos and testimonials in muted gray (`#a6a6a6`) on dark surfaces.
- Minimal ornamentation — published portfolios built on folii are the trust signal. Every visit to `folii.ai/{username}` is proof the product works.

## 5. Layout Principles

### Spacing System
- **Base unit**: 8px
- **Scale**: 1px, 2px, 3px, 4px, 5px, 6px, 8px, 10px, 12px, 15px, 20px, 30px, 35px
- **Section padding**: Large vertical spacing (80px–120px between sections on the public portfolio and marketing pages)
- **Card padding**: 15px–30px internal padding
- **Component gaps**: 8px–20px between related elements

### Grid & Container
- **Max width**: ~1200px container, centered on marketing pages. Portfolio uses a narrower 720–860px read column for body content, with projects allowed to break wider.
- **Column patterns**: Full-width hero (engineer's name + tagline), 2-column feature sections for experience/projects, single-column content showcases.
- **Asymmetric layouts**: Feature sections often pair text (40%) with screenshot (60%).

### Whitespace Philosophy
- **Breathe through darkness**: Generous vertical spacing between sections — the black background means whitespace manifests as void, creating dramatic pauses between content blocks.
- **Dense within, spacious between**: Individual components are tightly composed (tight line-heights, compressed text) but float in generous surrounding space.
- **Content-first density**: Project and experience sections are allowed to be dense and information-rich, contrasting with the sparse bio and tagline at the top.

### Border Radius Scale
- **1px**: Micro-elements, nearly squared precision edges
- **5px–7px**: Small UI elements, image thumbnails — subtly softened
- **8px**: Standard component radius — code blocks, buttons, interactive elements
- **10px–12px**: Cards, project screenshots — comfortably rounded
- **15px–20px**: Large containers, feature cards — generously rounded
- **30px–40px**: Navigation pills, pagination — noticeably rounded
- **100px**: Full pill shape — primary CTAs, tag elements

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Level 0 (Flat) | No shadow, pure black surface | Page background, empty areas |
| Level 1 (Ring) | `rgba(0, 153, 255, 0.15) 0px 0px 0px 1px` | Card borders, interactive element outlines — Framer Blue glow ring |
| Level 2 (Contained) | `rgb(9, 9, 9) 0px 0px 0px 2px` | Near-black ring for subtle containment on dark surfaces |
| Level 3 (Floating) | `rgba(255, 255, 255, 0.1) 0px 0.5px 0px 0.5px, rgba(0, 0, 0, 0.25) 0px 10px 30px` | Elevated cards, floating elements — subtle white top-edge highlight + deep ambient shadow |

### Shadow Philosophy
folii's elevation system is inverted from traditional light-theme designs. Instead of darker shadows on light backgrounds, folii uses:
- **Blue-tinted ring shadows** at very low opacity (0.15) for containment — a signature move that subtly brands every bordered element.
- **White edge highlights** (0.5px) on the top edge of elevated elements — simulating light hitting the top surface.
- **Deep ambient shadows** for true floating elements — `rgba(0, 0, 0, 0.25)` at large spread (30px).

### Decorative Depth
- **Blue glow auras**: Subtle Framer Blue (`#0099ff`) radial gradients behind key interactive areas (hero CTAs, focus states).
- **No background blur/glassmorphism**: Despite the frosted button effect, there's no heavy glass blur usage — the translucency is achieved through simple rgba opacity.

## 7. Do's and Don'ts

### Do
- Use pure black (`#000000`) as the primary background — not dark gray, not charcoal.
- Apply extreme negative letter-spacing on Cabinet Grotesk display text (-3px to -5.5px).
- Keep all buttons pill-shaped (40px+ radius) — never use squared or slightly-rounded buttons.
- Use Framer Blue (`#0099ff`) exclusively for interactive accents — links, borders, focus states.
- Deploy `rgba(255, 255, 255, 0.1)` for frosted glass surfaces on dark backgrounds.
- Maintain Cabinet Grotesk at weight 500 only — the medium weight IS the brand.
- Use extensive OpenType features on Inter text (cv01, cv05, cv09, cv11, ss03, ss07).
- Let the engineer's content be the visual centerpiece — the portfolio markets the person.
- Apply blue ring shadows (`rgba(0, 153, 255, 0.15) 0px 0px 0px 1px`) for card containment.

### Don't
- Use warm dark backgrounds (no `#1a1a1a`, `#2d2d2d`, or brownish blacks).
- Apply bold (700+) weight to Cabinet Grotesk display text — medium 500 only.
- Introduce additional accent colors beyond Framer Blue — this is a one-accent-color system. Semantic colors (success/warning/error) are reserved for the editor, never the public portfolio.
- Use large border-radius on non-interactive elements (cards use 10px–15px, only buttons get 40px+).
- Add decorative imagery, illustrations, or icons — the engineer's work IS the illustration.
- Use positive letter-spacing on headlines — everything is compressed, negative tracking.
- Create heavy drop shadows — depth is communicated through subtle rings and minimal ambients.
- Place light/white backgrounds behind content sections — the void is sacred.
- Use serif or display-weight fonts — the system is geometric sans-serif only.

## 8. Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <809px | Single column, stacked sections, reduced hero text (62px→40px), hamburger nav on editor |
| Tablet | 809px–1199px | 2-column feature sections begin, nav links partially visible, screenshots scale down |
| Desktop | >1199px | Full layout, expanded nav with all links + CTA, 110px display hero, side-by-side features |

### Touch Targets
- Pill buttons: minimum 40px height with 10px vertical padding — exceeds 44px WCAG minimum with generous padding.
- Nav links: 15px text with generous padding for touch accessibility.
- Mobile CTA buttons: Full-width pills on mobile for easy thumb reach.

### Collapsing Strategy
- **Navigation**: Full horizontal nav → hamburger menu at mobile breakpoint (editor and marketing pages only; portfolios have no nav).
- **Hero text**: 110px display → 85px → 62px → ~40px across breakpoints, maintaining extreme negative tracking proportionally.
- **Feature sections**: Side-by-side (text + screenshot) → stacked vertically on mobile.
- **Project screenshots**: Scale responsively within containers, maintaining aspect ratios.
- **Section spacing**: Reduces proportionally — 120px desktop → 60px mobile.

### Image Behavior
- Project screenshots are responsive, scaling within their container boundaries.
- No art direction changes — same crops across breakpoints.
- Dark background ensures screenshots maintain visual impact at any size.
- Screenshots lazy-load as user scrolls into view.

## 9. Agent Prompt Guide

### Quick Color Reference
- Primary Background: Void Black (`#000000`)
- Primary Text: Pure White (`#ffffff`)
- Accent/CTA: Framer Blue (`#0099ff`)
- Secondary Text: Muted Silver (`#a6a6a6`)
- Frosted Surface: Translucent White (`rgba(255, 255, 255, 0.1)`)
- Elevation Ring: Blue Glow (`rgba(0, 153, 255, 0.15)`)

### Example Component Prompts
- "Create a hero section on pure black background with 110px Cabinet Grotesk heading in white (the engineer's name), letter-spacing -5.5px, line-height 0.85, and a pill-shaped white CTA button (100px radius) with black text."
- "Design a project card on black background with a 1px Framer Blue ring shadow border (rgba(0,153,255,0.15)), 12px border-radius, white project title in Inter at 22px weight 700, muted silver (a6a6a6) description, and Azeret Mono tech stack tags at 10.4px."
- "Build a navigation bar for the editor with black background, white Inter text links at 15px, and a solid white pill button (100px radius) labeled 'Publish' as the primary CTA."
- "Create an experience timeline section on black, with company names in 32px Cabinet Grotesk Medium (letter-spacing -1px), dates in Azeret Mono 10.4px muted silver, and one-line impact in Inter Variable 15px white."
- "Design the chat input for the editor: frosted surface (rgba(255,255,255,0.1)), white Inter Variable 15px text, placeholder in rgba(255,255,255,0.4), Framer Blue focus ring (rgba(0,153,255,0.15) 0px 0px 0px 3px)."

### Iteration Guide
When refining existing screens generated with this design system:
1. Focus on ONE component at a time — the dark canvas makes each element precious.
2. Always verify letter-spacing on Cabinet Grotesk headings — the extreme negative tracking is non-negotiable.
3. Check that Framer Blue appears ONLY on interactive elements — never as decorative background or text color for non-links.
4. Ensure all buttons are pill-shaped — any squared corner immediately breaks the aesthetic.
5. Test frosted glass surfaces by checking they have exactly `rgba(255, 255, 255, 0.1)` — too opaque looks like a bug, too transparent disappears.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-07 | Initial design system created | Adopted the [VoltAgent Framer DESIGN.md spec](https://github.com/VoltAgent/awesome-design-md/tree/main/design-md/framer) verbatim as the folii.ai design system. User chose "Format + Framer aesthetic verbatim" in /design-consultation. |
| 2026-04-07 | Display font: Cabinet Grotesk (free) | Swapped from GT Walsheim (paid, ~$400). Cabinet Grotesk from Fontshare holds the same extreme negative letter-spacing and geometric weight at display sizes. Zero license cost. Drop-in upgrade path to GT Walsheim later if ever desired. |
