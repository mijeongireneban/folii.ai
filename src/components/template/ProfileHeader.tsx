'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { MapPinIcon, ClockIcon, Mail, Globe, ExternalLink } from 'lucide-react'
import type { Content } from '@/lib/schemas/content'

interface ProfileHeaderProps {
  profile: Content['profile']
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles' }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const initials = profile.name
    ? profile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?'

  const socialLinks = [
    profile.links.linkedin && { label: 'LinkedIn', url: profile.links.linkedin },
    profile.links.github && { label: 'GitHub', url: profile.links.github },
    profile.links.twitter && { label: 'Twitter', url: profile.links.twitter },
  ].filter(Boolean) as { label: string; url: string }[]

  return (
    <div className="w-full max-w-sm">
      <div>
        <Card className="flex h-full flex-col">
          <CardHeader className="pb-0">
            <div className="flex items-start justify-between">
              <div className="bg-card relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profile.avatar} alt={profile.name} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Hello!</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex flex-col items-end gap-1">
                {currentTime && (
                  <div className="flex items-center gap-1">
                    <ClockIcon className="text-muted-foreground h-3 w-3" />
                    <span className="text-muted-foreground text-xs">{currentTime}</span>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="text-muted-foreground h-3 w-3" />
                    <span className="text-muted-foreground text-xs">{profile.location}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-3">
              <CardTitle>{profile.name}</CardTitle>
              <div className="mt-1 flex items-center gap-1">
                <CardDescription className="!mt-0">{profile.title}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-grow flex-col gap-2">
            {profile.bio && (
              <p className="text-muted-foreground mb-2 text-xs">{profile.bio}</p>
            )}
            <div className="flex gap-2 justify-end mt-auto flex-wrap">
              {profile.links.email && (
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full w-7 h-7"
                  onClick={() => (window.location.href = `mailto:${profile.links.email}`)}
                  title="Email"
                >
                  <Mail className="w-3 h-3 hover:text-primary transition-colors text-muted-foreground" />
                </Button>
              )}
              {socialLinks.map(({ label, url }) => (
                <Button
                  key={label}
                  variant="outline"
                  size="icon"
                  className="rounded-full w-7 h-7"
                  onClick={() => window.open(url, '_blank')}
                  title={label}
                >
                  <ExternalLink className="w-3 h-3 hover:text-primary transition-colors text-muted-foreground" />
                </Button>
              ))}
              {profile.links.website && (
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full w-7 h-7"
                  onClick={() => window.open(profile.links.website, '_blank')}
                  title="Website"
                >
                  <Globe className="w-3 h-3 hover:text-primary transition-colors text-muted-foreground" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
