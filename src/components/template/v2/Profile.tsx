'use client'

import { useEffect, useState } from 'react'
import {
  BriefcaseIcon,
  MapPinIcon,
  DownloadIcon,
  ClockIcon,
  SparklesIcon,
  Mail,
  Globe,
} from 'lucide-react'
import { GithubIcon, LinkedinIcon, TwitterIcon } from './brand-icons'
import type { Content } from '@/lib/content/schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// Profile card — ported from abt-mj/profile.tsx. Every visible field is
// schema-driven, so other folii users render with the same structure/design
// as mijeong.dev but with their own content.

function useLocalTime(tz: string | undefined) {
  const [t, setT] = useState<string>('')
  useEffect(() => {
    const tick = () => {
      const d = new Date()
      setT(
        d.toLocaleTimeString('en-US', {
          timeZone: tz || undefined,
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
        })
      )
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [tz])
  return t
}

export function Profile({ content }: { content: Content }) {
  const currentTime = useLocalTime(content.timezone)
  const currentRole = content.experience[0]
  const subtitle = currentRole
    ? `${currentRole.role} @ ${currentRole.company}`
    : content.tagline
  const initials =
    content.avatar_initials ||
    content.name
      .split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()

  // Flatten skills for the preview strip. Show up to 13, like abt-mj.
  const flatSkills = content.skills.flatMap((cat) => cat.items)
  const previewSkills = flatSkills.slice(0, 13)
  const hasMoreSkills = flatSkills.length > 13

  return (
    <div className="w-full max-w-sm">
      <Card className="flex h-full flex-col">
        <CardHeader className="pb-0">
          <div className="flex items-start justify-between">
            <div className="bg-card relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full">
              <Avatar className="h-12 w-12">
                {content.avatar && (
                  <AvatarImage src={content.avatar} alt={content.name} />
                )}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col items-end gap-1">
              {content.timezone && (
                <div className="flex items-center gap-1">
                  <ClockIcon className="text-muted-foreground h-3 w-3" />
                  <span className="text-muted-foreground text-xs">
                    {currentTime}
                  </span>
                </div>
              )}
              {content.location && (
                <div className="flex items-center gap-1">
                  <MapPinIcon className="text-muted-foreground h-3 w-3" />
                  <span className="text-muted-foreground text-xs">
                    {content.location}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-3">
            <CardTitle>{content.name}</CardTitle>
            <div className="mt-1 flex items-center gap-1">
              <CardDescription className="!mt-0">{subtitle}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-grow flex-col gap-2">
          {(content.headline_points.length > 0 || content.years_experience) && (
            <div className="space-y-1">
              {content.headline_points[0] && (
                <div className="flex items-center gap-2">
                  <SparklesIcon className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm">{content.headline_points[0]}</span>
                </div>
              )}
              {content.years_experience && (
                <div className="flex items-center gap-2">
                  <BriefcaseIcon className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm">
                    {content.years_experience} of software engineering
                  </span>
                </div>
              )}
              {content.headline_points.slice(1).map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <SparklesIcon className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm">{p}</span>
                </div>
              ))}
            </div>
          )}

          <p className="text-muted-foreground mb-2 text-xs sm:text-sm">
            {content.bio}
          </p>

          {previewSkills.length > 0 && (
            <div className="mt-auto">
              <p className="text-muted-foreground mb-1.5 text-xs font-medium">
                Skills & Expertise
              </p>
              <div className="flex flex-wrap gap-1.5">
                {previewSkills.map((s, i) => (
                  <Badge variant="secondary" key={`${s}-${i}`} className="text-xs">
                    {s}
                  </Badge>
                ))}
                {hasMoreSkills && (
                  <Badge variant="outline" className="text-xs">
                    and more
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="mt-1 flex justify-end gap-2">
            {content.links.linkedin && (
              <IconLinkButton href={content.links.linkedin}>
                <LinkedinIcon className="h-3 w-3" />
              </IconLinkButton>
            )}
            {content.links.github && (
              <IconLinkButton href={content.links.github}>
                <GithubIcon className="h-3 w-3" />
              </IconLinkButton>
            )}
            {content.email && (
              <IconLinkButton href={`mailto:${content.email}`}>
                <Mail className="h-3 w-3" />
              </IconLinkButton>
            )}
            {content.links.twitter && (
              <IconLinkButton href={content.links.twitter}>
                <TwitterIcon className="h-3 w-3" />
              </IconLinkButton>
            )}
            {content.links.website && (
              <IconLinkButton href={content.links.website}>
                <Globe className="h-3 w-3" />
              </IconLinkButton>
            )}
          </div>
        </CardContent>

        {content.resume_url && (
          <CardFooter>
            <a
              href={content.resume_url}
              target="_blank"
              rel="noreferrer"
              className="w-full"
            >
              <Button size="sm" className="w-full">
                <DownloadIcon className="mr-1 h-4 w-4" />
                Resume
              </Button>
            </a>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

function IconLinkButton({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Button
      asChild
      variant="outline"
      size="icon"
      className="h-7 w-7 rounded-full"
    >
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="text-muted-foreground hover:text-primary"
      >
        {children}
      </a>
    </Button>
  )
}
