import { PropsWithChildren } from 'react'

export default jest.fn(({ children }: PropsWithChildren) => <>{children}</>)
