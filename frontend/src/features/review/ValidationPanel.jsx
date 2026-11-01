import { CheckCircle2, MinusCircle, ShieldCheck, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'

const ICON = {
  pass: <CheckCircle2 className="size-4 text-emerald-400 shrink-0" aria-label="Passed" />,
  fail: <XCircle     className="size-4 text-red-400    shrink-0" aria-label="Failed" />,
  skip: <MinusCircle className="size-4 text-dark-400   shrink-0" aria-label="Skipped" />,
}

export function ValidationPanel({ analysis, server }) {
  return (
    <Card>
      <CardHeader
        icon={ShieldCheck}
        title="Validation"
        gradient="bg-gradient-green"
        action={
          analysis.hasIssues
            ? <Badge tone="warning">Needs review</Badge>
            : <Badge tone="success">Looks good</Badge>
        }
      />
      <CardBody className="space-y-4">
        <ul className="space-y-3">
          {analysis.checks.map((check) => (
            <li key={check.id} className="flex items-start gap-3">
              <span className="mt-0.5">{ICON[check.status]}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-200">{check.label}</p>
                <p className="text-xs text-dark-300 mt-0.5">{check.message}</p>
              </div>
            </li>
          ))}
        </ul>

        {server && (
          <div className="rounded-lg border border-dark-600 bg-dark-700 p-3.5 text-xs text-dark-300">
            <p className="font-semibold text-slate-300">
              AI check{server.status ? `: ${server.status}` : ''}
            </p>
            {server.messages.length > 0 && (
              <ul className="mt-1.5 space-y-1 list-disc pl-4">
                {server.messages.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            )}
          </div>
        )}

        <p className="text-[11px] text-dark-400 text-center">
          ✦ Checks update live as you edit fields
        </p>
      </CardBody>
    </Card>
  )
}
