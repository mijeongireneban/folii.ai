import { doc } from '../doc-styles'

export default function PublishingPage() {
  return (
    <>
      <h1 style={doc.title}>Publishing</h1>
      <p style={doc.subtitle}>
        One click to go live. Update anytime.
      </p>

      <h2 style={doc.h2}>Going live</h2>
      <p style={doc.p}>
        Click the <strong style={{ color: '#fff' }}>Publish</strong> button in
        the editor top bar. Your portfolio is immediately live at{' '}
        <span style={doc.code}>folii.ai/your-username</span>.
      </p>
      <p style={doc.p}>
        The button changes to <strong style={{ color: '#fff' }}>Unpublish</strong>{' '}
        once you&apos;re live. A link to your public page appears next to it.
      </p>

      <hr style={doc.divider} />

      <h2 style={doc.h2}>Updating your portfolio</h2>
      <p style={doc.p}>
        Just keep editing. Your published site uses the same content as the
        editor. Every time you make a change and it saves, the live site
        reflects it on the next page load.
      </p>

      <div style={doc.tip}>
        <div style={doc.tipLabel}>Tip</div>
        <div style={doc.tipBody}>
          You don&apos;t need to re-publish after making edits. Changes save
          automatically and show up on your live site.
        </div>
      </div>

      <hr style={doc.divider} />

      <h2 style={doc.h2}>Unpublishing</h2>
      <p style={doc.p}>
        Click <strong style={{ color: '#fff' }}>Unpublish</strong> to take your
        portfolio offline. The URL will return a 404. Your content is preserved
        in the editor — you can re-publish at any time.
      </p>

      <hr style={doc.divider} />

      <h2 style={doc.h2}>Sharing</h2>
      <p style={doc.p}>
        Your portfolio URL is <span style={doc.code}>folii.ai/your-username</span>.
        When shared on Twitter, LinkedIn, or Slack, it shows a preview card with
        your name, tagline, and a branded image.
      </p>
      <ul style={doc.ul}>
        <li style={doc.bullet}>
          <span style={doc.bulletDot} />
          <span style={doc.bulletText}>
            Open Graph tags are set automatically — title, description, and image.
          </span>
        </li>
        <li style={doc.bullet}>
          <span style={doc.bulletDot} />
          <span style={doc.bulletText}>
            Twitter card meta tags are included for rich previews.
          </span>
        </li>
        <li style={doc.bullet}>
          <span style={doc.bulletDot} />
          <span style={doc.bulletText}>
            The preview image is generated dynamically from your name and tagline.
          </span>
        </li>
      </ul>

      <hr style={doc.divider} />

      <h2 style={doc.h2}>Your URL</h2>
      <p style={doc.p}>
        Your username is set when you sign up and becomes your permanent URL.
        Choose something professional — it&apos;s what you&apos;ll share with
        recruiters and on social media.
      </p>
    </>
  )
}
