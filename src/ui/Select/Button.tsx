import { PropsWithChildren } from 'react'
import Button from '../Button'
import useSelectContext from './useSelectContext'

export default function SelectButton({ children }: PropsWithChildren) {
  const { open, testID } = useSelectContext()

  return (
    <Button
      priority="low"
      action="neutral"
      onPress={() => {
        open()
      }}
      testID={testID && `${testID}.open`}
    >
      {children}
    </Button>
  )
}
