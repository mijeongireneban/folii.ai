import type { Content } from '@/lib/schemas/content'

interface SkillsSectionProps {
  skills: Content['skills']
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  return (
    <div className="w-full max-w-5xl">
      <div className="bg-card rounded-xl border p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {skills.map((cat) => (
            <div key={cat.category} className="space-y-3 rounded-lg border p-4">
              <h4 className="flex items-center gap-2 text-sm font-medium">{cat.category}</h4>
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
          ))}
        </div>
      </div>
    </div>
  )
}
