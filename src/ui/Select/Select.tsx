import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { PropsWithChildren, useRef, useState } from 'react'
import Button from './Button'
import Context from './Context'
import Option from './Option'
import Options from './Options'

type Props<T> = PropsWithChildren<{
  testID?: string
  onChange: (value: T[]) => void
  value: T[]
}>

function Select<T>({ children, onChange, testID, value }: Props<T>) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState(new Set(value))

  const open = () => {
    bottomSheetModalRef.current?.present()
    setIsOpen(true)
  }

  const close = () => {
    bottomSheetModalRef.current?.close()
    setIsOpen(false)
  }

  const context = {
    bottomSheetModalRef,
    close,
    isOpen,
    onChange,
    open,
    selected,
    setSelected,
    testID: testID && `${testID}.select`,
  }

  return <Context.Provider value={context}>{children}</Context.Provider>
}

Select.Button = Button
Select.Options = Options
Select.Option = Option

export default Select
