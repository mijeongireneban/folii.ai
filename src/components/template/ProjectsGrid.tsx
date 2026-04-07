'use client'

import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Content } from '@/lib/schemas/content'

interface ProjectsGridProps {
  projects: Content['projects']
  username: string
}

export function ProjectsGrid({ projects, username }: ProjectsGridProps) {
  return (
    <div className="w-full max-w-3xl">
      <div className="bg-card rounded-xl border p-6">
        {projects.length === 0 ? (
          <div className="border-muted-foreground/10 my-6 rounded-lg border-2 border-dashed py-12 text-center">
            <p className="text-muted-foreground text-sm font-medium">
              No projects yet — add some via the chat.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {projects.map((project) => (
              <Card key={project.id} className="group gap-4 overflow-hidden pt-0 flex flex-col">
                {project.image && (
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <CardHeader className="px-4 pb-0">
                  <h3 className="text-base font-bold">{project.title}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">{project.description}</p>
                </CardHeader>
                <CardContent className="px-4 pb-0">
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="px-4 flex justify-end gap-2 mt-auto">
                  {project.caseStudy && (
                    <Link
                      href={`/${username}/projects/${project.id}`}
                      className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
                    >
                      <span>Case Study</span>
                      <ExternalLink className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  )}
                  {project.caseStudy?.link && project.caseStudy.link !== '#' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => window.open(project.caseStudy!.link, '_blank')}
                    >
                      <span>View project</span>
                      <ExternalLink className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
