'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail } from 'lucide-react'
import type { Content } from '@/lib/schemas/content'

interface ContactSectionProps {
  contact: Content['contact']
}

export function ContactSection({ contact }: ContactSectionProps) {
  return (
    <div className="w-full max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle>Get in Touch</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {contact.message && (
            <p className="text-muted-foreground text-sm">{contact.message}</p>
          )}
          {contact.email && (
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => (window.location.href = `mailto:${contact.email}`)}
            >
              <Mail className="h-4 w-4 text-muted-foreground" />
              {contact.email}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
