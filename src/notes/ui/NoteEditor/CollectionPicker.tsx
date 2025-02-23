import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetFlatList,
  BottomSheetModal,
  type BottomSheetModalProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet'
import { Trans } from '@lingui/macro'
import { useQuery } from '@tanstack/react-query'
import { PropsWithChildren, useRef, useState } from 'react'
import {
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { FullWindowOverlay } from 'react-native-screens'
import { collectionsQuery } from '@/collections'
import { Button, Text } from '@/ui'

interface Props {
  onChange?: (value: number[]) => void
  value?: number[]
}

function Backdrop(props: BottomSheetBackdropProps) {
  return <BottomSheetBackdrop {...props} disappearsOnIndex={-1} />
}

function Container({ children }: PropsWithChildren) {
  return Platform.OS === 'ios' ? (
    <FullWindowOverlay>{children}</FullWindowOverlay>
  ) : (
    <View style={StyleSheet.absoluteFill}>{children}</View>
  )
}

export default function CollectionPicker({ onChange, value = [] }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const dimensions = useWindowDimensions()
  const safeAreaInsets = useSafeAreaInsets()
  const { data: selectedCollections } = useQuery(
    collectionsQuery({ filter: { id: value } }),
  )
  const { data: collections } = useQuery({
    ...collectionsQuery(),
    enabled: isOpen,
  })
  const [selected, setSelected] = useState(
    value.reduce<{ [key: number]: boolean }>(
      (obj, key) => ({ ...obj, [key]: true }),
      {},
    ),
  )

  const open = () => {
    bottomSheetModalRef.current?.present()
    setIsOpen(true)
  }

  const close = () => {
    bottomSheetModalRef.current?.close()
  }

  const done = () => {
    onChange?.(
      Object.entries(selected)
        .filter(([, selected]) => selected)
        .map(([id]) => Number(id)),
    )
    close()
  }

  const onPress = (id: number) => {
    setSelected((state) => ({ ...state, [id]: !state[id] }))
  }

  const onSheetChange: BottomSheetModalProps['onChange'] = (index) => {
    if (index === -1) {
      setIsOpen(false)
      setSelected(
        value.reduce<{ [key: number]: boolean }>(
          (obj, key) => ({ ...obj, [key]: true }),
          {},
        ),
      )
    }
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={() => open()}
        testID="note.note-editor.picker.button"
      >
        <Trans>Select collections</Trans>
        {selectedCollections?.map(({ id, name }) => (
          <Text key={id}>{name}</Text>
        ))}
      </Pressable>
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
        onChange={onSheetChange}
        ref={bottomSheetModalRef}
        snapPoints={[
          dimensions.height / 2 + safeAreaInsets.top,
          dimensions.height - safeAreaInsets.top,
        ]}
        overDragResistanceFactor={0}
      >
        <BottomSheetView style={{ flex: 1 }}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <Button
              onPress={() => close()}
              testID="note.note-editor.picker.cancel"
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button
              onPress={() => done()}
              testID="note.note-editor.picker.done"
            >
              <Trans>Done</Trans>
            </Button>
          </View>
          <BottomSheetFlatList
            data={collections}
            keyExtractor={({ id }) => `${id}`}
            renderItem={({ item: { id, name } }) => (
              <Pressable
                accessibilityRole="button"
                onPress={() => onPress(id)}
                style={{
                  height: 48,
                  flexDirection: 'row',
                }}
              >
                <Text>{name}</Text>
                <Text>{selected[id] && '✅'}</Text>
              </Pressable>
            )}
            style={{ flex: 1 }}
            testID="note.note-editor.picker.list"
          />
        </BottomSheetView>
      </BottomSheetModal>
    </>
  )
}
