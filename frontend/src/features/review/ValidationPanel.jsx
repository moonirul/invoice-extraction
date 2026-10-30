import { CheckCircle2, MinusCircle, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { ShieldCheck } from 'lucide-react'

const ICON = {
  pass: <CheckCircle2 className="size-4 text-emerald-500" aria-label="Passed" />,
  fail: <XCircle className="size-4 text-red-500" aria-label="Failed" />,
  skip: <MinusCircle className="size-4 text-slate-300" aria-label="Skipped" />,
}

export function ValidationPanel({ analysis, server }) {
  return (
    <Card>
      <CardHeader
        icon={ShieldCheck}
        title="Validation"
        action={
          analysis.hasIssues ? <Badge tone="warning">Needs review</Badge> : <Badge tone="success">Looks good</Badge>
        }
      />
      <CardBody className="space-y-3">
        <ul className="space-y-2.5">
          {analysis.checks.map((check) => (
            <li key={check.id} className="flex items-start gap-2.5">
              <span className="mt-0.5">{ICON[check.status]}</span>
              <div>
                <p className="text-sm font-medium text-slate-800">{check.label}</p>
                <p className="text-xs text-slate-500">{check.message}</p>
              </div>
            </li>
          ))}
        </ul>
        {server && (
          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            <p className="font-medium text-slate-700">
              AI check on original extraction{server.status ? `: ${server.status}` : ''}
            </p>
            {server.messages.length > 0 && (
              <ul className="mt-1 list-disc space-y-0.5 pl-4">
                {server.messages.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            )}
          </div>
        )}
        <p className="text-xs text-slate-400">Checks update live as you edit the fields.</p>
      </CardBody>
    </Card>
  )
}
