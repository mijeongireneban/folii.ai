'use client'

import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Content } from '@/lib/schemas/content'

type Project = Content['projects'][number]
type CaseStudyData = NonNullable<Project['caseStudy']>

interface CaseStudyProps {
  project: Project
  caseStudy: CaseStudyData
}

export function CaseStudy({ project, caseStudy }: CaseStudyProps) {
  return (
    <div className="w-full max-w-5xl">
      {/* Header */}
      <div className="mb-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              {caseStudy.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {caseStudy.title}
            </h1>
            <div className="mb-4 flex flex-wrap gap-6 text-sm">
              <div>
                <p className="text-muted-foreground font-medium">Client</p>
                <p>{caseStudy.client}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Timeline</p>
                <p>{caseStudy.timeline}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium">Year</p>
                <p>{caseStudy.year}</p>
              </div>
            </div>
            <p className="text-muted-foreground">{caseStudy.summary}</p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-lg">
            <img
              src={caseStudy.mainImage}
              alt={caseStudy.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Tabbed Sections */}
      {caseStudy.sections.length > 0 && (
        <div className="mb-12">
          <Tabs defaultValue={caseStudy.sections[0]?.id} className="w-full">
            <div className="mb-6 overflow-x-auto">
              <TabsList className="inline-flex h-10 w-auto">
                {caseStudy.sections.map((section) => (
                  <TabsTrigger
                    key={section.id}
                    value={section.id}
                    className="px-4 whitespace-nowrap"
                  >
                    {section.title}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {caseStudy.sections.map((section, index) => (
              <TabsContent key={section.id} value={section.id} className="m-0">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className={index % 2 !== 0 ? 'md:order-2' : 'md:order-1'}>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-lg">
                      <img
                        src={section.image}
                        alt={section.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className={index % 2 !== 0 ? 'md:order-1' : 'md:order-2'}>
                    <h2 className="mb-4 text-2xl font-bold">{section.title}</h2>
                    <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                      {section.content}
                    </p>
                    {section.bullets.length > 0 && (
                      <div>
                        <h3 className="mb-3 text-sm font-semibold">Key Points</h3>
                        <ul className="space-y-2">
                          {section.bullets.map((bullet, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm">
                              <span className="bg-primary/10 text-primary flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium">
                                {idx + 1}
                              </span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}

      {/* Testimonial */}
      <div className="mx-auto mb-12 max-w-3xl">
        <div className="bg-muted/50 relative rounded-lg p-6 shadow-sm md:p-8">
          <div className="text-primary mb-4 text-4xl">&quot;</div>
          <blockquote className="text-muted-foreground mb-6 italic">
            {caseStudy.testimonial.quote}
          </blockquote>
          <div>
            <div className="font-semibold text-sm">{caseStudy.testimonial.author}</div>
            <div className="text-muted-foreground text-xs">{caseStudy.testimonial.role}</div>
          </div>
        </div>
      </div>

      {/* Tools & CTA */}
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-8">
          <h3 className="mb-4 text-sm font-semibold">Tools &amp; Technologies</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {caseStudy.tools.map((tool) => (
              <Badge key={tool} variant="outline">
                {tool}
              </Badge>
            ))}
          </div>
        </div>
        {caseStudy.link !== '#' && (
          <Button asChild size="lg">
            <a
              href={caseStudy.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Full Case Study
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        )}
      </div>
    </div>
  )
}
