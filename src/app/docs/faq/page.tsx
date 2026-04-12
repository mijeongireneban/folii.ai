import { doc } from '../doc-styles'

const faqs: { q: string; a: string }[] = [
  {
    q: 'Is folii.ai free?',
    a: 'Yes. Creating an account, editing, and publishing your portfolio is free.',
  },
  {
    q: 'Can I use a custom domain?',
    a: "Not yet. For now, your portfolio lives at folii.ai/your-username. Custom domain support is on the roadmap.",
  },
  {
    q: 'What happens to my resume after I upload it?',
    a: "Your resume is parsed by AI to extract content. The file itself is not stored — only the structured data (name, bio, experience, etc.) is saved to your account.",
  },
  {
    q: 'Can I edit my portfolio without the AI?',
    a: 'Yes. Click the JSON button in the editor to edit your portfolio data directly. You have full control over every field.',
  },
  {
    q: 'How do I delete my account?',
    a: 'Contact us and we\'ll delete your account and all associated data. Self-service account deletion is coming soon.',
  },
  {
    q: 'Can I have multiple portfolios?',
    a: 'Not currently. Each account has one portfolio. If you need multiple, create separate accounts with different usernames.',
  },
  {
    q: 'Is my data private?',
    a: "Your portfolio content is private until you publish. Once published, it's publicly accessible at your URL. Unpublishing makes it private again.",
  },
  {
    q: 'What AI model do you use?',
    a: "folii.ai uses Claude by Anthropic to parse resumes and edit portfolio content.",
  },
  {
    q: 'Is there a rate limit on the AI chat?',
    a: 'Yes. There is a daily message limit to keep things fair. You\'ll see a notice when you\'re close to the limit.',
  },
  {
    q: 'Can I change my username?',
    a: 'Not currently. Pick your username carefully when you sign up — it becomes your public URL.',
  },
]

export default function FaqPage() {
  return (
    <>
      <h1 style={doc.title}>FAQ</h1>
      <p style={doc.subtitle}>Common questions about folii.ai.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {faqs.map((faq, i) => (
          <div key={i} style={styles.item}>
            <h3 style={styles.question}>{faq.q}</h3>
            <p style={styles.answer}>{faq.a}</p>
          </div>
        ))}
      </div>
    </>
  )
}

const styles = {
  item: {
    padding: '24px 0',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  } as const,
  question: {
    fontFamily: "'Inter Variable', sans-serif",
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: '-0.3px',
    marginBottom: 8,
  } as const,
  answer: {
    fontSize: 15,
    lineHeight: 1.6,
    color: '#a6a6a6',
    margin: 0,
  } as const,
}
