import { Card, CardBody } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export function ReviewSkeleton() {
  return (
    <div role="status" aria-live="polite" className="grid gap-6 lg:grid-cols-3">
      <span className="sr-only">Analysing invoice with AI…</span>
      <div className="space-y-6 lg:col-span-2">
        {[5, 6].map((n) => (
          <Card key={n}>
            <CardBody className="space-y-4">
              <Skeleton className="h-4 w-40" />
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: n }, (_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
      <Card>
        <CardBody className="space-y-4">
          <Skeleton className="h-4 w-32" />
          {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          <p className="pt-2 text-center text-xs text-slate-500">
            Reading your PDF and analysing it with AI — this can take up to a minute.
          </p>
        </CardBody>
      </Card>
    </div>
  )
}
