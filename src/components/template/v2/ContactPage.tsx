import { Mail, Globe } from 'lucide-react'
import { GithubIcon, InstagramIcon, LinkedinIcon, TwitterIcon } from './brand-icons'
import type { Content } from '@/lib/content/schema'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Contact card — ported from abt-mj/contact.tsx. Buttons render only for
// links/email the user has filled in.

export function ContactPage({ content }: { content: Content }) {
  const items: Array<{
    icon: React.ReactNode
    label: string
    href: string
  }> = []

  if (content.email) {
    items.push({
      icon: <Mail className="text-muted-foreground h-4 w-4" />,
      label: content.email,
      href: `mailto:${content.email}`,
    })
  }
  if (content.links.linkedin) {
    items.push({
      icon: <LinkedinIcon className="text-muted-foreground h-4 w-4" />,
      label: 'LinkedIn',
      href: content.links.linkedin,
    })
  }
  if (content.links.github) {
    items.push({
      icon: <GithubIcon className="text-muted-foreground h-4 w-4" />,
      label: 'GitHub',
      href: content.links.github,
    })
  }
  if (content.links.instagram) {
    items.push({
      icon: <InstagramIcon className="text-muted-foreground h-4 w-4" />,
      label: 'Instagram',
      href: content.links.instagram,
    })
  }
  if (content.links.twitter) {
    items.push({
      icon: <TwitterIcon className="text-muted-foreground h-4 w-4" />,
      label: 'Twitter',
      href: content.links.twitter,
    })
  }
  if (content.links.website) {
    items.push({
      icon: <Globe className="text-muted-foreground h-4 w-4" />,
      label: 'Website',
      href: content.links.website,
    })
  }

  return (
    <div className="w-full max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle>Get in Touch</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {items.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No contact links yet.
            </p>
          ) : (
            items.map((item) => (
              <Button
                key={item.label}
                asChild
                variant="outline"
                className="w-full justify-start gap-3"
              >
                <a
                  href={item.href}
                  target={item.href.startsWith('mailto:') ? undefined : '_blank'}
                  rel="noreferrer"
                >
                  {item.icon}
                  {item.label}
                </a>
              </Button>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
