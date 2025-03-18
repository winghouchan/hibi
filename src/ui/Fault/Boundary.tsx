import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary, type ErrorBoundaryProps } from 'react-error-boundary'

export default function Boundary({
  children,
  onReset,
  ...props
}: ErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={(...args) => {
            onReset?.(...args)
            reset()
          }}
          {...props}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
