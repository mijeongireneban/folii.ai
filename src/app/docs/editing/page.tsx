import { doc } from '../doc-styles'

export default function EditingPage() {
  return (
    <>
      <h1 style={doc.title}>Editing with AI</h1>
      <p style={doc.subtitle}>
        The chat is your editor. Say what you want changed and the preview
        updates live.
      </p>

      <h2 style={doc.h2}>What you can ask</h2>
      <p style={doc.p}>
        The AI understands your portfolio structure. It can edit any section:
        bio, experience, projects, skills, and contact info. Here are some
        things that work well:
      </p>

      <h3 style={doc.h3}>Rewriting content</h3>
      <ul style={doc.ul}>
        <li style={doc.bullet}>
          <span style={doc.bulletDot} />
          <span style={doc.bulletText}>
            &quot;Rewrite my bio to be more concise&quot;
          </span>
        </li>
        <li style={doc.bullet}>
          <span style={doc.bulletDot} />
          <span style={doc.bulletText}>
            &quot;Make my tagline sound more senior&quot;
          </span>
        </li>
        <li style={doc.bullet}>
          <span style={doc.bulletDot} />
          <span style={doc.bulletText}>
            &quot;Rewrite the first job description with more impact metrics&quot;
          </span>
        </li>
      </ul>

      <h3 style={doc.h3}>Adding content</h3>
      <ul style={doc.ul}>
        <li style={doc.bullet}>
          <span style={doc.bulletDot} />
          <span style={doc.bulletText}>
            &quot;Add a project about my open-source CLI tool called Fastlog&quot;
          </span>
        </li>
        <li style={doc.bullet}>
          <span style={doc.bulletDot} />
          <span style={doc.bulletText}>
            &quot;Add TypeScript and GraphQL to my skills&quot;
          </span>
        </li>
        <li style={doc.bullet}>
          <span style={doc.bulletDot} />
          <span style={doc.bulletText}>
            &quot;Add my LinkedIn link to the contact section&quot;
          </span>
        </li>
      </ul>

      <h3 style={doc.h3}>Removing and hiding</h3>
      <ul style={doc.ul}>
        <li style={doc.bullet}>
          <span style={doc.bulletDot} />
          <span style={doc.bulletText}>
            &quot;Remove the contact section&quot; — hides it from the nav and
            published page.
          </span>
        </li>
        <li style={doc.bullet}>
          <span style={doc.bulletDot} />
          <span style={doc.bulletText}>
            &quot;Delete the second project&quot;
          </span>
        </li>
        <li style={doc.bullet}>
          <span style={doc.bulletDot} />
          <span style={doc.bulletText}>
            &quot;Hide the skills section&quot;
          </span>
        </li>
      </ul>

      <hr style={doc.divider} />

      <h2 style={doc.h2}>Undo</h2>
      <p style={doc.p}>
        Every AI edit creates a version you can revert. Click the{' '}
        <strong style={{ color: '#fff' }}>Undo last edit</strong> button in the
        chat header to roll back. You can undo multiple times to step back
        through your edit history.
      </p>

      <hr style={doc.divider} />

      <h2 style={doc.h2}>Suggestions</h2>
      <p style={doc.p}>
        The chat shows suggestion chips based on what&apos;s missing or could be
        improved in your portfolio. These are context-aware — if your bio is
        generic, you&apos;ll see &quot;Rewrite my bio.&quot; If you have no
        projects, you&apos;ll see &quot;Add a project.&quot; Click a chip to
        send it as a message.
      </p>

      <hr style={doc.divider} />

      <h2 style={doc.h2}>JSON editor</h2>
      <p style={doc.p}>
        For power users: click the <strong style={{ color: '#fff' }}>JSON</strong>{' '}
        button in the top bar to edit your portfolio data directly. This is the
        same structured content the AI reads and writes. Make changes and click{' '}
        <strong style={{ color: '#fff' }}>Apply</strong> to update the preview.
      </p>

      <div style={doc.tip}>
        <div style={doc.tipLabel}>Tip</div>
        <div style={doc.tipBody}>
          Be specific in your prompts. &quot;Make it better&quot; gives
          mediocre results. &quot;Rewrite my bio to emphasize leadership
          and drop the first-person pronouns&quot; gets you exactly what
          you want.
        </div>
      </div>
    </>
  )
}
