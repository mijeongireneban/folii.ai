import Link from 'next/link'
import { doc } from '../doc-styles'

export default function BlogDocsPage() {
  return (
    <>
      <h1 style={doc.title}>Blog</h1>
      <p style={doc.subtitle}>
        Write essays, project deep-dives, and announcements that live alongside
        your portfolio at <span style={doc.code}>folii.ai/your-username/blog</span>.
      </p>

      <h2 style={doc.h2}>Why blog on folii?</h2>
      <p style={doc.p}>
        Your portfolio shows what you&apos;ve built. The blog shows how you
        think. A short post about a tricky bug, a system you designed, or a
        library you wrote tells a hiring manager more in two minutes than a
        bulleted resume can in twenty.
      </p>
      <p style={doc.p}>
        And folii makes it cheap. No separate Substack to manage, no markdown
        repo to deploy, no CSS to fight. Open the editor, switch to the Blog
        tab, write or chat your way through a draft, hit Publish.
      </p>

      <hr style={doc.divider} />

      <h2 style={doc.h2}>Writing a post</h2>
      <ol style={doc.ol}>
        <li style={doc.step}>
          <span style={doc.stepNum}>01</span>
          <span style={doc.stepText}>
            <strong style={{ color: '#fff' }}>Open the Blog tab</strong> in the
            editor and click <em>New post</em>. You get an empty draft with a
            title field, a markdown body, an excerpt, and a tags input.
          </span>
        </li>
        <li style={doc.step}>
          <span style={doc.stepNum}>02</span>
          <span style={doc.stepText}>
            <strong style={{ color: '#fff' }}>Type the post yourself</strong>{' '}
            or use the chat panel on the right. The chat understands prompts
            like &quot;draft a 400-word post about my Stripe integration
            project&quot; or &quot;rewrite the intro to sound more conversational.&quot;
            Edits autosave as you go.
          </span>
        </li>
        <li style={doc.step}>
          <span style={doc.stepNum}>03</span>
          <span style={doc.stepText}>
            <strong style={{ color: '#fff' }}>Publish.</strong> Toggle status
            from Draft to Published. The post appears at{' '}
            <span style={doc.code}>folii.ai/your-username/blog/the-post-slug</span>{' '}
            and on the listing page at{' '}
            <span style={doc.code}>folii.ai/your-username/blog</span>.
          </span>
        </li>
      </ol>

      <hr style={doc.divider} />

      <h2 style={doc.h2}>Markdown that just works</h2>
      <p style={doc.p}>
        The body field is GitHub-flavored markdown. Headings, lists, links,
        images, tables, blockquotes, and fenced code blocks all render the way
        you&apos;d expect.
      </p>

      <h3 style={doc.h3}>Code blocks</h3>
      <p style={doc.p}>
        Triple-backtick code blocks get full syntax highlighting via Shiki.
        Specify the language right after the opening fence:
      </p>
      <ul style={doc.ul}>
        <li style={doc.bullet}>
          <span style={doc.bulletDot} />
          <span style={doc.bulletText}>
            <span style={doc.code}>```ts</span> for TypeScript,{' '}
            <span style={doc.code}>```py</span> for Python,{' '}
            <span style={doc.code}>```sql</span> for SQL, and so on.
          </span>
        </li>
        <li style={doc.bullet}>
          <span style={doc.bulletDot} />
          <span style={doc.bulletText}>
            Themes auto-switch with your reader&apos;s dark/light preference.
          </span>
        </li>
      </ul>

      <h3 style={doc.h3}>Tags and excerpts</h3>
      <ul style={doc.ul}>
        <li style={doc.bullet}>
          <span style={doc.bulletDot} />
          <span style={doc.bulletText}>
            <strong style={{ color: '#fff' }}>Tags</strong> show up as pills on
            the listing card and on the post page. Use them as topic markers
            (e.g. <span style={doc.code}>postgres</span>,{' '}
            <span style={doc.code}>career</span>).
          </span>
        </li>
        <li style={doc.bullet}>
          <span style={doc.bulletDot} />
          <span style={doc.bulletText}>
            <strong style={{ color: '#fff' }}>Excerpt</strong> is the
            two-liner under the title on the listing. Skip it and folii will
            use the first ~200 chars of the body.
          </span>
        </li>
      </ul>

      <hr style={doc.divider} />

      <h2 style={doc.h2}>Drafts vs published</h2>
      <p style={doc.p}>
        Every post starts as a draft. Drafts are visible only to you in the
        editor. Switch the status to Published and the post appears on your
        public blog. You can flip a published post back to draft at any time
        to take it offline without deleting it.
      </p>

      <div style={doc.tip}>
        <div style={doc.tipLabel}>Tip</div>
        <div style={doc.tipBody}>
          Slugs are derived from the title, but you can edit the slug before
          you publish. After publishing, changing the slug breaks any links
          you&apos;ve already shared, so lock it in early.
        </div>
      </div>

      <hr style={doc.divider} />

      <h2 style={doc.h2}>Writing with chat</h2>
      <p style={doc.p}>
        The blog chat sits next to the editor and is scoped to the post
        you&apos;re editing. Some prompts that work well:
      </p>
      <ul style={doc.ul}>
        <li style={doc.bullet}>
          <span style={doc.bulletDot} />
          <span style={doc.bulletText}>
            &quot;Draft a 500-word post about why I picked Postgres over
            DynamoDB for my last project.&quot;
          </span>
        </li>
        <li style={doc.bullet}>
          <span style={doc.bulletDot} />
          <span style={doc.bulletText}>
            &quot;Rewrite the second section to be less academic and more
            conversational.&quot;
          </span>
        </li>
        <li style={doc.bullet}>
          <span style={doc.bulletDot} />
          <span style={doc.bulletText}>
            &quot;Add a code example showing how I set up the rate limiter.&quot;
          </span>
        </li>
        <li style={doc.bullet}>
          <span style={doc.bulletDot} />
          <span style={doc.bulletText}>
            &quot;Suggest five tags for this post.&quot;
          </span>
        </li>
      </ul>
      <p style={doc.p}>
        The chat reads your portfolio for context, so &quot;write a post about
        the project I shipped at Stripe&quot; will pull from your actual project
        list, not invent details.
      </p>

      <hr style={doc.divider} />

      <h2 style={doc.h2}>What&apos;s next</h2>
      <ul style={doc.ul}>
        <li style={doc.bullet}>
          <span style={doc.bulletDot} />
          <span style={doc.bulletText}>
            <Link href="/docs/publishing" style={doc.link}>Publishing</Link> —
            how publish works for the portfolio and how it interacts with blog
            posts.
          </span>
        </li>
        <li style={doc.bullet}>
          <span style={doc.bulletDot} />
          <span style={doc.bulletText}>
            <Link href="/docs/editing" style={doc.link}>Editing with AI</Link> —
            the same chat principles that work for the portfolio also work for
            the blog.
          </span>
        </li>
      </ul>
    </>
  )
}
