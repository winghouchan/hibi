import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { PropsWithChildren, StrictMode } from 'react'
import { DataProvider } from '@/data'
import { IntlProvider } from '@/intl'

export default function mockAppRoot() {
  return function AppRootMock({ children }: PropsWithChildren) {
    return (
      <StrictMode>
        <IntlProvider>
          <DataProvider>
            <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
          </DataProvider>
        </IntlProvider>
      </StrictMode>
    )
  }
}
