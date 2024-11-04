import { PropsWithChildren } from 'react'
import { DataProvider } from '@/data'
import { IntlProvider } from '@/intl'

export default function mockAppRoot() {
  return function AppRootMock({ children }: PropsWithChildren) {
    return (
      <IntlProvider>
        <DataProvider>{children}</DataProvider>
      </IntlProvider>
    )
  }
}
