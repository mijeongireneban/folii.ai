# Changelog

Running log of what landed on `develop`. Newest first. Tied to PR numbers.

## 2026-04-16

- **#42** — feat: blog/writing section — chat-driven post editor, public `/[username]/blog` listing + `/[username]/blog/[slug]` reader with rehype-pretty-code syntax highlighting, blog-specific rate limits, autosave + tags + excerpt, unsaved-changes guard (TOK-32, TOK-33, TOK-34, TOK-35, TOK-36, TOK-50, TOK-51)
- **#45** — feat: confirmation dialogs for destructive actions (TOK-42)
- **#44** — fix: derive GitHub OAuth redirect URI from request origin (TOK-38)

## 2026-04-15

- **#43** — fix: bump chat route maxDuration to 120s (TOK-41)

## 2026-04-13

- **#41** — feat: add Logo component and favicon
- **#40** — feat: GitHub OAuth import, profile import, unified Import menu (TOK-24)
- **#39** — feat: unified Import menu with LinkedIn PDF import (TOK-25)
- **#38** — fix: improve rate limit error message

## 2026-04-12

- **#37** — feat: improve landing page content and structure
- **#36** — feat: GitHub project import via chat (TOK-17)
- **#35** — feat: sign out button + dark/light toggle on landing page
- **#34** — feat: changelog page at `/changelog` with v0.0.1 release notes (TOK-28)
- **#33** — feat: documentation pages at `/docs` (TOK-29)
- **#32** — feat: theme picker with 43 presets and dark/light toggle (TOK-30)
- **#31** — refactor: extract editor styles and suggestions
- **#30** — feat: smart contextual chat suggestions based on content gaps (TOK-18)
- **#29** — feat: SEO meta tags + dynamic OG image for portfolios (TOK-15)
- **#28** — feat: inline chat error messages with retry button (TOK-14)
- **#27** — feat: daily rate limits for AI chat and resume parsing (TOK-16)
- **#26** — fix: editor mobile layout with stacked panes (TOK-13)
- **#25** — feat: allow navigating between editor and landing page (TOK-12)
- **#24** — fix: make landing page responsive on mobile (TOK-11)
- **#23** — feat: allow removing nav bar items via chat (TOK-7)
- **#22** — fix: support multi-line typing in editor chat input (TOK-8)
- **#19** — docs: marketing launch kit (readme + license + hn post + tweet thread + og spec)

## 2026-04-08

- **#18** — docs: prd, architecture, implementation plan, test plan, changelog
- **#17** — fix: editor chat redesign, avatar cropper, republish, signup polish
- **#16** — feat: loading states across editor and public site
- **#15** — feat: publish button toggles to Unpublish when live
- **#14** — feat: editable username slug with uniqueness check
- **#13** — feat: avatar upload in profile
- **#12** — feat: JSON view with CodeMirror + fix split layout
- **#11** — feat: "made by folii.ai 💙" footer on published sites
- **#10** — chore: add `.env.example` and correct test framework note in CLAUDE.md

## 2026-04-07

- **#3** — fix: website template polish (Instagram links, centering, focus mode, project placeholders)
- **#2** — feat: v2 template port + editor browser-chrome preview
- **#1** — docs: design docs
