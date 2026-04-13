import Link from 'next/link'
import { doc } from './doc-styles'

export default function GettingStartedPage() {
  return (
    <>
      <h1 style={doc.title}>Getting Started</h1>
      <p style={doc.subtitle}>
        Go from resume to live portfolio in under five minutes.
      </p>

      <h2 style={doc.h2}>Why folii?</h2>
      <p style={doc.p}>
        Most engineers don&apos;t have a portfolio because building one is a
        weekend project that never ships. You know the drill: pick a template,
        fight with CSS, copy-paste your resume into 15 fields, give up at 2am.
      </p>
      <p style={doc.p}>
        folii skips all of that. Upload your resume, tell the AI what to
        change, and publish. No drag-and-drop builders. No theme stores. No
        design homework. Your portfolio should take less time than updating
        your LinkedIn.
      </p>

      <hr style={doc.divider} />

      <h2 style={doc.h2}>Three steps</h2>
      <ol style={doc.ol}>
        <li style={doc.step}>
          <span style={doc.stepNum}>01</span>
          <span style={doc.stepText}>
            <strong style={{ color: '#fff' }}>Import your data.</strong>{' '}
            Click the Import button to upload a resume, connect GitHub, or
            upload a LinkedIn PDF export. folii&apos;s AI extracts your
            experience, projects, skills, and contact info into structured
            content. No copy-pasting, no form fields.
          </span>
        </li>
        <li style={doc.step}>
          <span style={doc.stepNum}>02</span>
          <span style={doc.stepText}>
            <strong style={{ color: '#fff' }}>Edit with chat.</strong>{' '}
            Tell the AI what to change. &quot;Rewrite my bio to sound more
            senior.&quot; &quot;Add a project about my CLI tool.&quot; The preview
            updates in real time. Every edit is reversible. It&apos;s like having
            a copywriter and a web developer in one conversation.
          </span>
        </li>
        <li style={doc.step}>
          <span style={doc.stepNum}>03</span>
          <span style={doc.stepText}>
            <strong style={{ color: '#fff' }}>Publish.</strong>{' '}
            Hit the Publish button. Your portfolio goes live at{' '}
            <span style={doc.code}>folii.ai/your-username</span>. Share the link
            on LinkedIn, Twitter, or your email signature. Come back and update
            anytime — your site stays current as your career grows.
          </span>
        </li>
      </ol>

      <hr style={doc.divider} />

      <h2 style={doc.h2}>What you get</h2>
      <ul style={doc.ul}>
        <li style={doc.bullet}>
          <span style={doc.bulletDot} />
          <span style={doc.bulletText}>
            A polished portfolio site that looks like you hired a designer.
          </span>
        </li>
        <li style={doc.bullet}>
          <span style={doc.bulletDot} />
          <span style={doc.bulletText}>
            43 themes with dark and light mode — find the one that fits your style.
          </span>
        </li>
        <li style={doc.bullet}>
          <span style={doc.bulletDot} />
          <span style={doc.bulletText}>
            SEO-ready with Open Graph tags, so your link previews look great
            everywhere.
          </span>
        </li>
        <li style={doc.bullet}>
          <span style={doc.bulletDot} />
          <span style={doc.bulletText}>
            Mobile-friendly by default. No responsive design work on your end.
          </span>
        </li>
        <li style={doc.bullet}>
          <span style={doc.bulletDot} />
          <span style={doc.bulletText}>
            AI that actually understands engineering careers — it knows what
            impact metrics, tech stacks, and project descriptions should
            sound like.
          </span>
        </li>
      </ul>

      <hr style={doc.divider} />

      <h2 style={doc.h2}>Signing up</h2>
      <p style={doc.p}>
        Create an account with your email or sign in with Google. Your username
        becomes your public URL — pick something you&apos;d put on a business card.
      </p>

      <h2 style={doc.h2}>The editor</h2>
      <p style={doc.p}>
        The editor has two panels: a live preview on the left and a chat on the
        right. Everything you say in the chat updates the preview instantly.
        You can also switch to a JSON view to edit your portfolio data directly.
      </p>

      <div style={doc.tip}>
        <div style={doc.tipLabel}>Tip</div>
        <div style={doc.tipBody}>
          Don&apos;t have a resume handy? Just start chatting. Tell the AI about
          yourself and it&apos;ll build your portfolio from scratch.
        </div>
      </div>

      <h2 style={doc.h2}>What&apos;s next</h2>
      <ul style={doc.ul}>
        <li style={doc.bullet}>
          <span style={doc.bulletDot} />
          <span style={doc.bulletText}>
            <Link href="/docs/importing" style={doc.link}>Importing</Link> — upload
            a resume, connect GitHub, or import from LinkedIn.
          </span>
        </li>
        <li style={doc.bullet}>
          <span style={doc.bulletDot} />
          <span style={doc.bulletText}>
            <Link href="/docs/editing" style={doc.link}>Editing with AI</Link> — what
            kinds of prompts work and how to get the best results.
          </span>
        </li>
        <li style={doc.bullet}>
          <span style={doc.bulletDot} />
          <span style={doc.bulletText}>
            <Link href="/docs/themes" style={doc.link}>Themes</Link> — pick a color
            scheme and toggle between dark and light mode.
          </span>
        </li>
        <li style={doc.bullet}>
          <span style={doc.bulletDot} />
          <span style={doc.bulletText}>
            <Link href="/docs/publishing" style={doc.link}>Publishing</Link> — how
            to go live, unpublish, and share your portfolio.
          </span>
        </li>
      </ul>
    </>
  )
}
