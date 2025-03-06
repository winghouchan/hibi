import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetFlatList,
  BottomSheetModal,
  type BottomSheetModalProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet'
import { Trans, useLingui } from '@lingui/react/macro'
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
import { collectionsQuery } from '@/collections/operations'
import { Button, Text } from '@/ui'
import styles from './CollectionPicker.styles'

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
  const { t: translate } = useLingui()
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
        backgroundStyle={styles.background}
        containerComponent={Container}
        enableDynamicSizing={false}
        handleStyle={styles.handle}
        onChange={onSheetChange}
        overDragResistanceFactor={0}
        ref={bottomSheetModalRef}
        snapPoints={[
          dimensions.height / 2 + safeAreaInsets.top,
          dimensions.height - safeAreaInsets.top,
        ]}
      >
        <BottomSheetView style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Button
                action="neutral"
                onPress={() => close()}
                priority="low"
                size="small"
                testID="note.note-editor.picker.cancel"
              >
                {translate`Cancel`}
              </Button>
            </View>
            <View>
              <Trans>Select collections</Trans>
            </View>
            <View>
              <Button
                action="primary"
                onPress={() => done()}
                priority="low"
                size="small"
                testID="note.note-editor.picker.done"
              >
                {translate`Done`}
              </Button>
            </View>
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
            style={styles.list}
            testID="note.note-editor.picker.list"
          />
        </BottomSheetView>
      </BottomSheetModal>
    </>
  )
}
