import { DataProvider } from '@/data'
import { IntlProvider } from '@/intl'
import { PropsWithChildren } from 'react'

export default function mockAppRoot() {
  return function AppRootMock({ children }: PropsWithChildren) {
    return (
      <IntlProvider>
        <DataProvider>{children}</DataProvider>
      </IntlProvider>
    )
  }
}
