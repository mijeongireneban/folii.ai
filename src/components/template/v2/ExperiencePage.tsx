import { MapPinIcon, CalendarIcon } from 'lucide-react'
import type { Content } from '@/lib/content/schema'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

// Experience accordion — ported from abt-mj/experience.tsx.
// Data comes from content.experience[]; achievements/technologies/location are
// schema-driven. "Key Projects" sub-section from abt-mj is dropped — folii keeps
// projects on their own page, not nested under experience.

export function ExperiencePage({ content }: { content: Content }) {
  const experiences = content.experience
  if (experiences.length === 0) {
    return (
      <div className="w-full max-w-4xl">
        <div className="text-muted-foreground rounded-lg border border-dashed p-10 text-center text-sm">
          No work experience yet.
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl">
      <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
        {experiences.map((exp, index) => {
          const duration = exp.end ? `${exp.start} – ${exp.end}` : `${exp.start} – Present`
          return (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-card rounded-lg border px-3 shadow-sm sm:px-6"
            >
              <AccordionTrigger className="items-start py-4 hover:no-underline sm:py-6">
                <div className="flex flex-col items-start gap-1.5 text-left sm:gap-2.5">
                  <span className="text-base font-bold tracking-tight sm:text-xl">{exp.role}</span>
                  <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:gap-x-4 sm:text-sm">
                    <span className="text-foreground/70 font-medium">{exp.company}</span>
                    {exp.location && (
                      <span className="flex items-center gap-1">
                        <MapPinIcon className="h-3 w-3" />
                        {exp.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      {duration}
                    </span>
                  </div>
                  <p className="text-foreground/70 pb-1 text-xs font-normal leading-relaxed sm:pb-2 sm:text-sm">
                    {exp.impact}
                  </p>
                </div>
              </AccordionTrigger>

              <AccordionContent className="pb-4 sm:pb-8">
                <div className="space-y-4 sm:space-y-6">
                  {exp.achievements.length > 0 && (
                    <div className="border-border/50 border-t pt-4 sm:pt-6">
                      <h4 className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wider sm:mb-3">
                        Key Achievements
                      </h4>
                      <ul className="space-y-2">
                        {exp.achievements.map((achievement, i) => (
                          <li key={i} className="flex gap-2 text-xs leading-relaxed sm:gap-3 sm:text-sm">
                            <span className="text-primary mt-0.5 shrink-0 text-xs">▸</span>
                            <span className="text-foreground/80">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {exp.technologies.length > 0 && (
                    <div className="border-border/50 border-t pt-4 sm:pt-6">
                      <h4 className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wider sm:mb-3">
                        Technologies
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {exp.technologies.map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-[10px] sm:text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}
