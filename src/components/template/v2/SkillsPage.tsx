import {
  Code2,
  Server,
  Globe,
  FlaskConical,
  DatabaseZap,
  Cloud,
  Bot,
  Wrench,
  Palette,
  Smartphone,
  Cpu,
  Layers,
  type LucideIcon,
} from 'lucide-react'
import type { Content } from '@/lib/content/schema'

// Skills grid — ported from abt-mj/skills.tsx. Fully schema-driven: categories
// and items come from content.skills[]. Icon names in the schema map to lucide
// components via ICON_MAP; unknown names fall back to Layers.

const ICON_MAP: Record<string, LucideIcon> = {
  Code2,
  Server,
  Globe,
  FlaskConical,
  DatabaseZap,
  Cloud,
  Bot,
  Wrench,
  Palette,
  Smartphone,
  Cpu,
  Layers,
}

function iconFor(name: string | undefined): LucideIcon {
  if (!name) return Layers
  return ICON_MAP[name] ?? Layers
}

export function SkillsPage({ content }: { content: Content }) {
  const categories = content.skills
  if (categories.length === 0) {
    return (
      <div className="w-full max-w-5xl">
        <div className="text-muted-foreground rounded-lg border border-dashed p-10 text-center text-sm">
          No skills listed yet.
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-5xl">
      <div className="bg-card rounded-xl border p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => {
            const Icon = iconFor(cat.icon)
            return (
              <div key={cat.category} className="space-y-3 rounded-lg border p-4">
                <h4 className="flex items-center gap-2 text-sm font-medium">
                  <Icon className="h-5 w-5" />
                  {cat.category}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map((item) => (
                    <div
                      key={item}
                      className="bg-muted/40 hover:border-muted rounded-md border border-transparent px-3 py-1.5 text-sm transition-colors"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
