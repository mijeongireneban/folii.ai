'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { MapPinIcon, CalendarIcon, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import type { Content } from '@/lib/schemas/content'

interface ExperienceListProps {
  experience: Content['experience']
  username: string
}

export function ExperienceList({ experience, username }: ExperienceListProps) {
  return (
    <div className="w-full max-w-4xl">
      <Accordion className="space-y-4">
        {experience.map((exp, index) => (
          <AccordionItem
            key={index}
            value={`item-${index}`}
            className="bg-card rounded-lg border px-6 shadow-sm"
          >
            <AccordionTrigger className="hover:no-underline py-6 items-start">
              <div className="flex flex-col items-start gap-2.5 text-left">
                <span className="text-xl font-bold tracking-tight">{exp.role}</span>
                <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <span className="text-foreground/70 font-medium">{exp.company}</span>
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="h-3 w-3" />
                    {exp.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    {exp.duration}
                  </span>
                </div>
                <p className="text-foreground/70 text-sm leading-relaxed pb-2 font-normal">
                  {exp.description}
                </p>
              </div>
            </AccordionTrigger>

            <AccordionContent className="pb-8">
              <div className="space-y-6">
                {exp.achievements.length > 0 && (
                  <div className="border-t border-border/50 pt-6">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Key Achievements
                    </h4>
                    <ul className="space-y-2.5">
                      {exp.achievements.map((achievement, i) => (
                        <li key={i} className="flex gap-3 text-sm leading-relaxed">
                          <span className="text-primary mt-1 shrink-0 text-xs">▸</span>
                          <span className="text-foreground/80">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="border-t border-border/50 pt-6">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Technologies
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {exp.technologies.map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                {exp.projects.length > 0 && (
                  <div className="border-t border-border/50 pt-6">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Key Projects
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {exp.projects.map((project) => (
                        <div
                          key={project.id}
                          className="bg-muted/40 hover:bg-muted/60 rounded-lg p-4 transition-colors"
                        >
                          <h5 className="text-sm font-semibold">{project.title}</h5>
                          <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                            {project.description}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-1">
                            {project.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          {project.caseStudy && (
                            <Link
                              href={`/${username}/projects/${project.id}`}
                              className="mt-2 inline-flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                              View Details
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {exp.link && exp.link !== '#' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(exp.link, '_blank')}
                  >
                    Learn More
                    <ExternalLink className="ml-1 h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
