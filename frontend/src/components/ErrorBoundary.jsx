import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

/** Catches render errors so one broken section never blanks the whole dashboard. */
export class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Hook your error tracker (Sentry, etc.) here.
    console.error('UI error boundary caught:', error, info.componentStack)
  }

  reset = () => {
    this.setState({ error: null })
    this.props.onReset?.()
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
        <AlertTriangle className="mx-auto size-8 text-amber-500" aria-hidden />
        <h2 className="mt-3 text-sm font-semibold text-amber-900">{this.props.title ?? 'This section failed to load'}</h2>
        <p className="mt-1 text-sm text-amber-800">An unexpected error occurred. Your other work is unaffected.</p>
        <Button className="mt-4" variant="secondary" size="sm" onClick={this.reset}>Try again</Button>
      </div>
    )
  }
}
