import Link from 'next/link'
import { doc } from './doc-styles'

export default function GettingStartedPage() {
  return (
    <>
      <h1 style={doc.title}>Getting Started</h1>
      <p style={doc.subtitle}>
        Go from resume to live portfolio in under five minutes.
      </p>

      <h2 style={doc.h2}>Three steps</h2>
      <ol style={doc.ol}>
        <li style={doc.step}>
          <span style={doc.stepNum}>01</span>
          <span style={doc.stepText}>
            <strong style={{ color: '#fff' }}>Upload your resume.</strong>{' '}
            Drop a PDF, TXT, or Markdown file into the editor. folii&apos;s AI
            extracts your experience, projects, skills, and contact info into
            structured content.
          </span>
        </li>
        <li style={doc.step}>
          <span style={doc.stepNum}>02</span>
          <span style={doc.stepText}>
            <strong style={{ color: '#fff' }}>Edit with chat.</strong>{' '}
            Tell the AI what to change. &quot;Rewrite my bio to sound more
            senior.&quot; &quot;Add a project about my CLI tool.&quot; The preview
            updates in real time. You can undo any edit from the chat history.
          </span>
        </li>
        <li style={doc.step}>
          <span style={doc.stepNum}>03</span>
          <span style={doc.stepText}>
            <strong style={{ color: '#fff' }}>Publish.</strong>{' '}
            Hit the Publish button. Your portfolio goes live at{' '}
            <span style={doc.code}>folii.ai/your-username</span>. Share the link.
            Come back and update anytime.
          </span>
        </li>
      </ol>

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
