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
      <Accordion type="single" collapsible className="space-y-4">
        {experiences.map((exp, index) => {
          const duration = exp.end ? `${exp.start} – ${exp.end}` : `${exp.start} – Present`
          return (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-card rounded-lg border px-4 shadow-sm sm:px-6"
            >
              <AccordionTrigger className="items-start py-6 hover:no-underline">
                <div className="flex flex-col items-start gap-2.5 text-left">
                  <span className="text-xl font-bold tracking-tight">{exp.role}</span>
                  <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
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
                  <p className="text-foreground/70 pb-2 text-sm font-normal leading-relaxed">
                    {exp.impact}
                  </p>
                </div>
              </AccordionTrigger>

              <AccordionContent className="pb-8">
                <div className="space-y-6">
                  {exp.achievements.length > 0 && (
                    <div className="border-border/50 border-t pt-6">
                      <h4 className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wider">
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

                  {exp.technologies.length > 0 && (
                    <div className="border-border/50 border-t pt-6">
                      <h4 className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wider">
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
