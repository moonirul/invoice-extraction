import { Card, CardBody } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export function ReviewSkeleton() {
  return (
    <div role="status" aria-live="polite" className="grid gap-6 lg:grid-cols-3">
      <span className="sr-only">Analysing invoice with AI…</span>

      {/* Main column */}
      <div className="space-y-6 lg:col-span-2">
        {[5, 6].map((n) => (
          <Card key={n}>
            {/* Card header skeleton */}
            <div className="flex items-center gap-3 border-b border-dark-700 px-5 py-4">
              <Skeleton className="size-9 rounded-lg shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: n }, (_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Sidebar */}
      <div className="space-y-5">
        <Card>
          <div className="flex items-center gap-3 border-b border-dark-700 px-5 py-4">
            <Skeleton className="size-9 rounded-lg shrink-0" />
            <Skeleton className="h-3.5 w-32" />
          </div>
          <CardBody className="space-y-4">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <div className="flex items-center justify-between border-b border-dark-700 px-5 py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-9 rounded-lg" />
              <Skeleton className="h-3.5 w-24" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <CardBody className="space-y-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="mt-0.5 size-4 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-2.5 w-full" />
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        <p className="text-center text-xs text-dark-300 animate-pulse">
          ⚡ AI is reading your PDF — up to a minute…
        </p>
      </div>
    </div>
  )
}
