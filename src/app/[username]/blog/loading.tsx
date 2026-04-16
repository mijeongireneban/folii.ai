import { Skeleton } from '@/components/ui/skeleton'
import { TemplateLayout } from '@/components/template/v2/TemplateLayout'

export default function BlogListingLoading() {
  return (
    <TemplateLayout keyName="blog-loading">
      <div className="w-full max-w-2xl space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-4 w-40" />
        </div>

        <div className="space-y-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="border-border/50 rounded-xl border p-5"
            >
              <Skeleton className="h-5 w-3/4" />
              <div className="mt-3 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-12 rounded-full" />
                <Skeleton className="h-4 w-14 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </TemplateLayout>
  )
}
