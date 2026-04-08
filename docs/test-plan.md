# Test Plan — folii.ai v1

Source: compiled from the `/plan-eng-review` test plan in `~/.gstack/projects/mijeongireneban-folii.ai/`.

## Affected pages / routes

- `/auth/signup` — new account, email+password, verification flow
- `/auth/login` — existing account, wrong password handling
- `/auth/forgot-password` → `/auth/reset-password` — token flow
- `/editor` — authenticated editor with preview + chat + resume upload + JSON toggle
- `/[username]` — public portfolio (published profiles only)

## Key interactions to verify

- Sign up with email, verify, land in editor
- Upload resume PDF, see extracted text, confirm, see draft in preview pane
- Paste resume as text (alt path), see draft rendered
- Chat "make the bio shorter", preview updates within ~5s
- Revert, preview returns to prior state
- JSON toggle shows current content, copy button works
- Publish, visit `/username` in a new tab, see the public portfolio

## Edge cases

- Signup with duplicate email → clear error, no account created
- Weak password → client-side validation before submit
- Login with unverified email → clear message directing to resend
- Image-only scanned PDF → "we couldn't extract text, try pasting"
- Multi-column PDF → either works, or shows mangled text so user can fix before LLM
- 100k-char pasted text → accept or show length limit clearly
- Chat producing a no-op patch → clear error, not silent
- Chat breaking schema → error shown, content unchanged
- Rapid-fire chat (6 messages / second) → rate limit kicks in with clear message
- Navigate away mid-chat → cancels cleanly or completes, no weird state
- Revert with no `previous_content` → button disabled or clear "nothing to revert"
- Publish empty content → rejected with "your portfolio is empty"
- Visit someone else's `/username` while logged out → public portfolio or 404, never the editor
- Visit `/nonexistent-username` → clean 404, not a stack trace

## Critical paths (must work)

1. **Full signup to published.** New user creates account, uploads resume, gets draft, sends one chat edit, publishes, visits their public URL. The entire product in one flow.
2. **Auth data isolation.** User A cannot view or edit user B's profile, period. Test with real authenticated sessions, not just unit tests. RLS is a hard requirement, not a convention.
3. **Chat edit does not corrupt content.** A bad LLM response or failed patch apply must never leave stored content in an invalid state. Always validate-before-write.
4. **Published portfolio renders from public URL.** `/[username]` without a session must render the published content. This is what the user will share on Twitter or LinkedIn.

## Eval suites (deferred, but planned)

See [prd.md §Open questions](./prd.md#open-questions-still-unresolved). "Doesn't sound like a LinkedIn bio" is subjective. Plan:

- **Golden path script.** Headless run of signup → upload → chat → publish across 5-7 fixture resumes. Catches regressions in the mechanical flow.
- **LLM-as-judge.** Second model grades the draft on a rubric: specific > generic, active > passive, measurable > vague. Re-run after every prompt change.
- **Visual eval.** Playwright screenshots of the rendered public page, diffed against a baseline. Catches template regressions.

Fixtures live in `evals/fixtures/`. Grading happens manually until the LLM-as-judge rubric stabilizes.
