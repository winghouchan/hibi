import {
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet'
import { useLingui } from '@lingui/react/macro'
import { useEffect, useRef } from 'react'
import { FlatListProps, View, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native-unistyles'
import Button from '../Button'
import Text from '../Text'
import Backdrop from './Backdrop'
import Container from './Container'
import Option from './Option'
import useSelectContext from './useSelectContext'

type OptionConstraint<T> = { id: T; selected?: boolean }

interface Props<
  Option extends OptionConstraint<ID>,
  ID,
> extends FlatListProps<Option> {
  title: string
  onClose?: () => void
  onOpen?: () => void
}

const styles = StyleSheet.create(({ color, radius, spacing }) => ({
  background: {
    backgroundColor: color.background.default,
    borderRadius: radius.large,
  },
  handle: {
    backgroundColor: color.background.default,
    borderRadius: radius.large,
  },
  header: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.normal,
  },
  list: {
    flex: 1,
  },
  sheet: {
    flex: 1,
  },
}))

export default function Options<Option extends OptionConstraint<ID>, ID>({
  data,
  title,
  renderItem,
  onClose,
  onOpen,
  ...props
}: Props<Option, ID>) {
  const { t: translate } = useLingui()
  const previousIsOpen = useRef<boolean>(undefined)
  const {
    bottomSheetModalRef,
    close,
    isOpen,
    onChange,
    selected,
    setSelected,
    testID,
  } = useSelectContext()
  const safeAreaInsets = useSafeAreaInsets()
  const windowDimensions = useWindowDimensions()

  const handleSheetChange = () => {
    if (isOpen && !previousIsOpen.current) {
      previousIsOpen.current = true
      onOpen?.()
    } else if (!isOpen && previousIsOpen.current) {
      previousIsOpen.current = false
      onClose?.()
    }
  }

  useEffect(handleSheetChange, [isOpen, onClose, onOpen])

  return (
    <BottomSheetModal
      /**
       * Setting `accessibility` to `false` allows for the tapping of elements
       * within the bottom sheet by the testing framework.
       *
       * @see {@link https://maestro.mobile.dev/platform-support/react-native#interacting-with-nested-components-on-ios}
       */
      accessible={false}
      backdropComponent={Backdrop}
      containerComponent={Container}
      enableDynamicSizing={false}
      handleStyle={styles.handle}
      overDragResistanceFactor={0}
      ref={bottomSheetModalRef}
      snapPoints={[
        windowDimensions.height / 2 + safeAreaInsets.top,
        windowDimensions.height - safeAreaInsets.top,
      ]}
      style={styles.background}
    >
      <BottomSheetView style={styles.sheet}>
        <View style={styles.header}>
          <View>
            <Button
              action="neutral"
              onPress={() => close()}
              priority="low"
              size="small"
              testID={testID && `${testID}.cancel`}
            >
              {translate`Cancel`}
            </Button>
          </View>
          <View>
            <Text>{title}</Text>
          </View>
          <View>
            <Button
              action="primary"
              onPress={() => {
                onChange(Array.from(selected))
                close()
              }}
              priority="low"
              size="small"
              testID={testID && `${testID}.done`}
            >
              {translate`Done`}
            </Button>
          </View>
        </View>
        <BottomSheetFlatList
          data={Array.from(data ?? [], (item) => ({
            ...item,
            selected: selected.has(item.id) ?? false,
          }))}
          renderItem={({ item, ...args }) => (
            <Option
              accessibilityState={{
                selected: item.selected,
              }}
              onPress={() => {
                setSelected((state) => {
                  const newState = new Set(state)

                  if (state.has(item.id)) {
                    newState.delete(item.id)
                  } else {
                    newState.add(item.id)
                  }

                  return newState
                })
              }}
            >
              {renderItem?.({ item, ...args })}
              {item.selected && <Text>✅</Text>}
            </Option>
          )}
          style={styles.list}
          {...props}
        />
      </BottomSheetView>
    </BottomSheetModal>
  )
}
