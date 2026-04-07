'use client'

import type { ElementType } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Mail, Globe, Code2, Briefcase, MessageCircle, MapPinIcon } from 'lucide-react'
import type { Content } from '@/lib/schemas/content'

interface ProfileHeaderProps {
  profile: Content['profile']
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const initials = profile.name
    ? profile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?'

  const socialLinks = [
    profile.links.github && {
      label: 'GitHub',
      url: profile.links.github,
      Icon: Code2,
    },
    profile.links.linkedin && {
      label: 'LinkedIn',
      url: profile.links.linkedin,
      Icon: Briefcase,
    },
    profile.links.twitter && {
      label: 'Twitter',
      url: profile.links.twitter,
      Icon: MessageCircle,
    },
    profile.links.website && {
      label: 'Website',
      url: profile.links.website,
      Icon: Globe,
    },
    profile.links.email && {
      label: 'Email',
      url: `mailto:${profile.links.email}`,
      Icon: Mail,
    },
  ].filter(Boolean) as { label: string; url: string; Icon: ElementType }[]

  return (
    <section className="w-full py-16 px-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        {/* Avatar row */}
        <Avatar className="h-20 w-20">
          <AvatarImage src={profile.avatar} alt={profile.name} />
          <AvatarFallback className="text-2xl font-bold">{initials}</AvatarFallback>
        </Avatar>

        {/* Name + title */}
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight leading-none">
            {profile.name || 'Your Name'}
          </h1>
          {profile.title && (
            <p className="text-xl text-muted-foreground">{profile.title}</p>
          )}
          {profile.location && (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground pt-1">
              <MapPinIcon className="h-3.5 w-3.5" />
              {profile.location}
            </p>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-base text-foreground/80 leading-relaxed max-w-xl">
            {profile.bio}
          </p>
        )}

        {/* Social links row */}
        {socialLinks.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {socialLinks.map(({ label, url, Icon }) => (
              <Button
                key={label}
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => {
                  if (url.startsWith('mailto:')) {
                    window.location.href = url
                  } else {
                    window.open(url, '_blank')
                  }
                }}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
