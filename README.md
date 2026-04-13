# folii

**Ship your portfolio in minutes, not weeks.**

[Try folii →](https://folii-ai.vercel.app)

## Why folii

Most engineers don't have a personal site. Not because they can't build one, but because it takes a weekend to clone a template and the copy still reads like a LinkedIn bio. folii fixes the content problem: upload your resume, refine with AI chat, pick a theme, and publish. Five minutes from PDF to live link.

folii is built for software engineers with real experience and real projects. It's not a website builder, not a link-in-bio page, and not a template store. You talk to an AI and it handles the rest.

## How it works

1. **Upload your resume.** Drop a PDF. The AI parser extracts your experience, projects, skills, and links into structured content.
2. **Refine with AI chat.** Say "tighten the bio", "add a project about X", or "quantify my impact at Acme". The preview updates live. Revert any edit with one click.
3. **Pick a theme.** Choose from 40+ color themes, each with dark and light mode. Your visitors can toggle between them.
4. **Publish.** One click. Your portfolio is live at `folii.ai/your-username`. Update anytime.

## Features

- **AI-powered editing** — chat with folii to rewrite, add, or remove content in natural language
- **Resume parsing** — upload a PDF and get a structured portfolio in seconds
- **GitHub project import** — paste a repo URL and get a polished project entry with name, description, tech stack, and stars
- **40+ themes** — dark and light variants for every theme, sourced from the tweakcn community
- **Smart suggestions** — context-aware chips that suggest edits based on what's missing
- **Undo/revert** — roll back any AI edit from the chat history
- **JSON editor** — power users can edit the raw portfolio data directly
- **Section hiding** — toggle Experience, Skills, Projects, or Contact visibility
- **Project screenshots** — upload images for your project cards
- **Profile avatar** — upload and crop a profile photo
- **SEO meta tags** — Open Graph and Twitter cards with dynamic preview images
- **Mobile responsive** — editor and published portfolios work on all screen sizes
- **Sentry error tracking** — production error monitoring with Linear integration
- **Documentation** — getting started guide, editing tips, theme docs, publishing guide, and FAQ at `/docs`

<details>
<summary><strong>Stack</strong></summary>

- Next.js (app router, server components)
- React 19, TypeScript strict mode
- Supabase (Postgres, Auth, Storage) with row-level security
- OpenAI SDK with structured outputs (`response_format: { type: "json_object" }`)
- Zod as the single source of truth for content shape
- `pdfjs-dist` for server-side PDF parsing
- Sentry for error tracking
- CodeMirror 6 for the JSON editor
- Deployed on Vercel

Built with Claude Code. Full PRD, architecture, and implementation plan live under [`docs/`](./docs).

</details>

<details>
<summary><strong>Local setup</strong></summary>

```bash
pnpm install
cp .env.example .env.local   # fill in Supabase + OpenAI + Sentry keys
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Tests: `pnpm test` (vitest). Type check: `pnpm exec tsc --noEmit`.

</details>

## License

[MIT](./LICENSE). Built by [@mijeongireneban](https://github.com/mijeongireneban).
