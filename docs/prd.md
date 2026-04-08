# PRD — folii.ai v1

Status: Approved, in build
Source: `/office-hours` session, 2026-04-07

## One-line pitch

> Cloning a template takes a weekend and the copy still sounds like a LinkedIn bio. folii takes 5 minutes and the words actually sound human.

## Problem

Most knowledge workers, engineers, designers, PMs, academics, don't have a personal site. The reason isn't capability. The existing options each fail on at least one axis.

- **Vercel / Next / Squarespace templates.** Free, flexible, but cloning, customizing, and deploying takes a weekend. After all that, the copy still reads like a LinkedIn bio because the user hand-wrote "passionate full-stack engineer building scalable solutions".
- **read.cv, super.so, Linktree, About.me.** Polished but generic. The user still types every word.
- **Academic homepages on university CMSes.** Built once in 2014, never touched.
- **ChatGPT + manual deploy.** Works for technical users. Entirely on them: no template, no hosting, no curation.
- **Nothing.** The most common case. They've been meaning to do it for two years.

folii.ai targets the knowledge worker who wants a real personal site and doesn't want to spend a weekend building one or writing copy that doesn't sound human.

## The wedge

**Content, not design.**

folii.ai gives you exactly one beautiful template per persona. You never touch the layout. The chat only modifies content. Drop your resume or paste it as text, the AI writes the first draft in your voice, you refine through chat ("make the bio shorter", "remove the grad school project"). Five minutes from upload to a live `folii.ai/{username}` URL.

This positioning decides where engineering goes: **the LLM prompt that turns a resume into portfolio copy IS the product.** Not the editor, not the auth, not the templates. If the AI output sounds like a LinkedIn bio, the product fails. If it sounds like a human with taste, it wins.

## V1 launch persona

**Software engineer, 3-7 years of experience.**

The long-term audience is broader (designers, PMs, academics, researchers, generalists) but v1 ships with **one** template, designed for the modal mid-career SWE. Mid-career, generalist or backend, 3-5 real projects, GitHub presence. Other personas get added later as new templates, not by stretching this one.

Marketing can speak to everyone. The product on day one is built for someone specific.

## Constraints (accepted)

- **Goal:** Builder mode. Real users wanted, no monetization. Personal learning project for Claude Code workflows.
- **Resume input:** PDF upload AND paste-as-text. Both feed the same LLM extraction endpoint. Paste sidesteps PDF parsing risk for power users. PDF is the magic-moment demo for everyone else.
- **Chat-edit undo:** Revert-last-edit button + "show me the JSON" toggle for power users who want to hand-fix. Two affordances cover ~95% of recovery cases.
- **Auth:** Email + password. Deliberate learning choice, not a UX call. May swap to magic link or OAuth later if conversion data contradicts.
- **Design freedom:** None. One template per persona. Users cannot change layout, color, or typography within a template. Feature, not limitation.
- **Stack:** Next.js 16, React 19, Tailwind, shadcn/ui. Supabase (Postgres + Auth + Storage). OpenAI for all LLM calls.
- **Sequencing:** Vertical slice. Build the full thin path top-to-bottom in user-experience order, iterate the LLM prompt as you go.

## Premises (HIGH risk ones)

1. **SWEs will trust an AI to write the words that describe their own work.** High risk. Engineers are unusually picky about how their work is characterized. Mitigation: the user always sees and edits the draft before publishing.
2. **One template is enough for the v1 persona.** High risk. Even within "SWE 3-7 yrs" there's variance, backend infra vs design-systems frontend vs ML vs new-grad. Mitigation: optimize for the modal case, accept edge cases wait.
3. **Resume PDFs parse reliably enough to drive a draft.** Medium risk, mitigated by the chat-to-edit recovery loop.
4. **The chat-to-edit loop converges.** Medium risk, mitigated by revert-last and JSON view.
5. **Email + password is the right call for a speed-pitch product.** Accepted as a learning choice.

## Non-goals

- Multi-template design freedom
- Custom domains in v1
- Collaboration / multi-user editing
- Analytics or visitor tracking
- Monetization
- Any persona other than "SWE 3-7 yrs" in v1

## Success criteria

v1 ships when all three hold:

1. A real SWE friend, not the builder, can sign up, upload a resume, refine via chat, and publish a public URL, without help, in under 10 minutes.
2. The published page is something they would actually share on Twitter or LinkedIn, not "it works but I'd be embarrassed".
3. On at least 3 of 5 test resumes, the AI copy does not sound like a LinkedIn bio when read by another SWE. Informal, gut-level eval.

## Distribution

Web service. Next.js app deployed to Vercel. No binary, no package manager, no app store. Sharing happens through the engineer's own published URL.

## Open questions (still unresolved)

- **How do you measure "doesn't sound like a LinkedIn bio"?** Subjective. Planned: a 5-10 resume eval set, graded manually, re-run after every prompt change. See `docs/test-plan.md` for the shape. Deferred until after first ship.
- **Second template persona.** Out of scope for v1. Likely designer, academic, or PM. The schema and renderer should be persona-aware from day one so adding a second template isn't a refactor.
