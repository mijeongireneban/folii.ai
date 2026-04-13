import { doc } from '../doc-styles'

export default function ImportingPage() {
  return (
    <>
      <h1 style={doc.title}>Importing</h1>
      <p style={doc.subtitle}>
        Three ways to get your data into folii. Pick whichever fits your
        workflow, or combine them.
      </p>

      <p style={doc.p}>
        Click the <strong style={{ color: '#fff' }}>Import</strong> button in
        the editor top bar to open the import menu. You&apos;ll see three
        options: Resume, GitHub, and LinkedIn.
      </p>

      <hr style={doc.divider} />

      <h2 style={doc.h2}>Resume</h2>
      <p style={doc.p}>
        The fastest way to get started. Upload a PDF, TXT, or Markdown resume
        and folii&apos;s AI extracts your experience, projects, skills, and
        contact info into structured portfolio content. No copy-pasting, no
        form fields.
      </p>
      <ol style={doc.ol}>
        <li style={doc.step}>
          <span style={doc.stepNum}>01</span>
          <span style={doc.stepText}>
            Click <strong style={{ color: '#fff' }}>Import</strong> then select{' '}
            <strong style={{ color: '#fff' }}>Resume</strong>.
          </span>
        </li>
        <li style={doc.step}>
          <span style={doc.stepNum}>02</span>
          <span style={doc.stepText}>
            Click <strong style={{ color: '#fff' }}>Upload Resume</strong> and
            pick your file. Supports PDF, TXT, and Markdown up to 5 MB.
          </span>
        </li>
        <li style={doc.step}>
          <span style={doc.stepNum}>03</span>
          <span style={doc.stepText}>
            Wait a few seconds while the AI parses your resume into portfolio
            sections. The preview updates automatically.
          </span>
        </li>
      </ol>

      <div style={doc.tip}>
        <div style={doc.tipLabel}>Tip</div>
        <div style={doc.tipBody}>
          Resume import replaces your current portfolio content. If you want to
          keep existing content and add to it, use the chat instead.
        </div>
      </div>

      <hr style={doc.divider} />

      <h2 style={doc.h2}>GitHub</h2>
      <p style={doc.p}>
        Connect your GitHub account to import projects and profile data. GitHub
        import has three modes:
      </p>

      <h3 style={doc.h3}>Browse repos</h3>
      <p style={doc.p}>
        Select up to 5 repositories from your account. folii fetches each
        repo&apos;s name, description, language, stars, topics, and README
        excerpt, then creates polished project entries. Private repos are
        included if you granted the <span style={doc.code}>repo</span> scope.
      </p>

      <h3 style={doc.h3}>Import GitHub profile</h3>
      <p style={doc.p}>
        One click to fill your About Me and Skills sections. folii scans up to
        300 of your repos, aggregates languages by repo count and topics, then
        generates a bio, tagline, headline points, and skill categories from
        your actual code. Your GitHub avatar is set as your profile photo.
      </p>

      <h3 style={doc.h3}>Paste a repo URL</h3>
      <p style={doc.p}>
        Don&apos;t want to connect your account? Paste any public repo URL
        (e.g. <span style={doc.code}>https://github.com/user/repo</span>) and
        the AI adds it as a project via chat.
      </p>

      <h3 style={doc.h3}>Connecting GitHub</h3>
      <ol style={doc.ol}>
        <li style={doc.step}>
          <span style={doc.stepNum}>01</span>
          <span style={doc.stepText}>
            Click <strong style={{ color: '#fff' }}>Import</strong> then select{' '}
            <strong style={{ color: '#fff' }}>GitHub</strong>.
          </span>
        </li>
        <li style={doc.step}>
          <span style={doc.stepNum}>02</span>
          <span style={doc.stepText}>
            Click <strong style={{ color: '#fff' }}>Connect GitHub</strong>.
            You&apos;ll be redirected to GitHub to authorize folii.
          </span>
        </li>
        <li style={doc.step}>
          <span style={doc.stepNum}>03</span>
          <span style={doc.stepText}>
            After authorizing, you&apos;re redirected back to the editor. The
            import menu shows your connected username and the Browse / Import
            profile options.
          </span>
        </li>
      </ol>
      <p style={doc.p}>
        You can disconnect GitHub at any time from the import menu. folii does
        not sync automatically. Your token is only used when you explicitly
        trigger an import.
      </p>

      <hr style={doc.divider} />

      <h2 style={doc.h2}>LinkedIn</h2>
      <p style={doc.p}>
        Import your full LinkedIn profile by uploading LinkedIn&apos;s built-in
        PDF export. This captures experience, education, skills, and
        certifications that LinkedIn&apos;s API doesn&apos;t expose.
      </p>
      <ol style={doc.ol}>
        <li style={doc.step}>
          <span style={doc.stepNum}>01</span>
          <span style={doc.stepText}>
            Go to your LinkedIn profile page.
          </span>
        </li>
        <li style={doc.step}>
          <span style={doc.stepNum}>02</span>
          <span style={doc.stepText}>
            Click <strong style={{ color: '#fff' }}>More</strong> (below your
            headline), then select{' '}
            <strong style={{ color: '#fff' }}>Save to PDF</strong>.
          </span>
        </li>
        <li style={doc.step}>
          <span style={doc.stepNum}>03</span>
          <span style={doc.stepText}>
            In the folii editor, click{' '}
            <strong style={{ color: '#fff' }}>Import</strong> then select{' '}
            <strong style={{ color: '#fff' }}>LinkedIn</strong>.
          </span>
        </li>
        <li style={doc.step}>
          <span style={doc.stepNum}>04</span>
          <span style={doc.stepText}>
            Click <strong style={{ color: '#fff' }}>Upload LinkedIn PDF</strong>{' '}
            and pick the downloaded file. The AI parses it into your portfolio.
          </span>
        </li>
      </ol>

      <div style={doc.tip}>
        <div style={doc.tipLabel}>Tip</div>
        <div style={doc.tipBody}>
          LinkedIn import replaces your current portfolio content, just like
          resume import. Use it as a starting point, then refine with chat.
        </div>
      </div>

      <hr style={doc.divider} />

      <h2 style={doc.h2}>Combining imports</h2>
      <p style={doc.p}>
        A common workflow: start with a resume or LinkedIn import to fill your
        bio, experience, and skills. Then connect GitHub and browse your repos
        to add project entries. Finally, use the chat to polish everything.
      </p>
    </>
  )
}
