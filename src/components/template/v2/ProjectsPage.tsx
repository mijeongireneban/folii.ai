'use client'

import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  ExternalLink,
  Globe,
  MonitorCheck,
  Bot,
  LayoutDashboard,
  Sparkles,
  Smartphone,
} from 'lucide-react'
import type { Content } from '@/lib/content/schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

// Filterable projects grid — ported from abt-mj/projects.tsx. Category pills
// derive from the data, not a hardcoded list. Each project card uses schema
// fields: title, description, category, tech, screenshot/screenshot_alt, url,
// repo, built_with, release_url.

const CATEGORY_ICONS: Record<string, ReactNode> = {
  All: <Globe className="h-4 w-4" />,
  'Desktop App': <MonitorCheck className="h-4 w-4" />,
  'Web App': <LayoutDashboard className="h-4 w-4" />,
  'Mobile App': <Smartphone className="h-4 w-4" />,
  'AI Tool': <Bot className="h-4 w-4" />,
}

export function ProjectsPage({
  content,
  editable = false,
  onUploadImage,
  uploadingIndex = null,
}: {
  content: Content
  editable?: boolean
  onUploadImage?: (index: number, file: File) => void
  uploadingIndex?: number | null
}) {
  const projects = content.projects
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const p of projects) {
      if (p.category) set.add(p.category)
    }
    return ['All', ...Array.from(set)]
  }, [projects])

  const filtered = projects.filter(
    (p) => activeCategory === 'All' || p.category === activeCategory
  )

  if (projects.length === 0) {
    return (
      <div className="w-full max-w-3xl">
        <div className="text-muted-foreground rounded-lg border border-dashed p-10 text-center text-sm">
          No projects yet.
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl">
      <div className="bg-card rounded-xl border p-6">
        {categories.length > 1 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(category)}
                className="flex items-center gap-1.5"
              >
                {CATEGORY_ICONS[category] ?? <Globe className="h-4 w-4" />}
                {category}
              </Button>
            ))}
          </div>
        )}

        <div className="text-muted-foreground mb-4 text-xs">
          {filtered.length} of {projects.length} projects
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filtered.map((project, index) => {
              const primaryLink = project.url ?? project.repo
              return (
                <Card
                  key={`${project.title}-${index}`}
                  className="group flex flex-col gap-4 overflow-hidden pt-0"
                >
                  {project.screenshot ? (
                    <div className="relative aspect-video overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={project.screenshot}
                        alt={project.screenshot_alt ?? project.title}
                        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                      {project.category && (
                        <Badge
                          variant="secondary"
                          className="bg-background/80 absolute right-3 top-3 backdrop-blur-sm"
                        >
                          {project.category}
                        </Badge>
                      )}
                      {editable && (
                        <label className="bg-background/80 absolute left-3 top-3 cursor-pointer rounded-md border px-2 py-1 text-xs backdrop-blur-sm hover:bg-background">
                          {uploadingIndex === index ? 'Uploading…' : 'Replace'}
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0]
                              if (f && onUploadImage) onUploadImage(index, f)
                              e.target.value = ''
                            }}
                          />
                        </label>
                      )}
                    </div>
                  ) : !editable ? (
                    <div className="relative flex aspect-video items-center justify-center border-b border-dashed bg-muted/20 text-muted-foreground">
                      <LayoutDashboard className="h-8 w-8 opacity-40" />
                      {project.category && (
                        <Badge
                          variant="secondary"
                          className="bg-background/80 absolute right-3 top-3 backdrop-blur-sm"
                        >
                          {project.category}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <label className="relative flex aspect-video cursor-pointer items-center justify-center border-b border-dashed text-sm text-muted-foreground hover:bg-muted/40">
                      {uploadingIndex === index ? 'Uploading…' : '+ Add screenshot'}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f && onUploadImage) onUploadImage(index, f)
                          e.target.value = ''
                        }}
                      />
                    </label>
                  )}
                  <CardHeader className="px-4 pb-0">
                    <h3 className="text-base font-bold">{project.title}</h3>
                    {project.built_with && (
                      <span className="text-muted-foreground flex items-center gap-1 text-xs">
                        <Sparkles className="h-3 w-3" />
                        Built with {project.built_with}
                      </span>
                    )}
                    <p className="text-muted-foreground mt-1 text-sm">
                      {project.description}
                    </p>
                  </CardHeader>
                  {project.tech.length > 0 && (
                    <CardContent className="px-4 pb-0">
                      <div className="flex flex-wrap gap-1.5">
                        {project.tech.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  )}
                  {(project.release_url || primaryLink) && (
                    <CardFooter className="mt-auto flex justify-end gap-2 px-4">
                      {project.release_url && (
                        <Button asChild variant="secondary" size="sm">
                          <a
                            href={project.release_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Releases
                            <ExternalLink className="ml-1 h-3.5 w-3.5" />
                          </a>
                        </Button>
                      )}
                      {primaryLink && (
                        <Button asChild variant="secondary" size="sm">
                          <a href={primaryLink} target="_blank" rel="noreferrer">
                            <span>View project</span>
                            <ExternalLink className="ml-1 h-3.5 w-3.5" />
                          </a>
                        </Button>
                      )}
                    </CardFooter>
                  )}
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="border-muted-foreground/10 my-6 rounded-lg border-2 border-dashed py-12 text-center">
            <p className="text-muted-foreground text-sm font-medium">
              No projects match this filter
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setActiveCategory('All')}
            >
              Clear filter
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
