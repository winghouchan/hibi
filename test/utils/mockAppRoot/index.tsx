import { IntlProvider } from '@/intl'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PropsWithChildren } from 'react'

export default function mockAppRoot() {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        /**
         * Setting `gcTime` to `Infinity` stops an error where Jest has to force
         * a worker to exit with one of the following messages:
         *
         * - "Jest did not exit one second after the test run completed."
         * - "A worker process has failed to exit gracefully and has been force
         *    exited. This is likely caused by tests leaking due to improper
         *    teardown."
         *
         * @see {@link https://tanstack.com/query/latest/docs/framework/react/guides/testing#set-gctime-to-infinity-with-jest}
         */
        gcTime: Infinity,

        /**
         * Disable query retries. Allows for the testing of query error states.
         *
         * @see {@link https://tanstack.com/query/latest/docs/framework/react/guides/testing#turn-off-retries}
         */
        retry: false,
      },
    },
  })

  return function AppRootMock({ children }: PropsWithChildren) {
    return (
      <IntlProvider>
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      </IntlProvider>
    )
  }
}
