import { Trans, useLingui } from '@lingui/react/macro'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'expo-router'
import { ComponentRef, useRef } from 'react'
import { FlatList, Pressable, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { collectionsQuery } from '@/collections/operations'
import { Icon, Text } from '@/ui'
import CreateMenu from '../CreateMenu'

const styles = StyleSheet.create(({ spacing }, { insets }) => ({
  screen: {
    flex: 1,
    paddingTop: insets.top,
  },

  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
  },
}))

function NoCollections() {
  return <Trans>No collections</Trans>
}

export default function LibraryScreen() {
  const { t: translate } = useLingui()
  const createMenuRef = useRef<ComponentRef<typeof CreateMenu>>(null)
  const { data: collections } = useQuery(collectionsQuery())

  return (
    <>
      <CreateMenu ref={createMenuRef} />
      <View testID="library.screen" style={styles.screen}>
        <View style={styles.header}>
          <Text size="heading">{translate`Library`}</Text>
          <View>
            <Pressable
              accessibilityLabel={translate`Open menu to create collection or note`}
              accessibilityRole="button"
              testID="library.create.menu.button"
              onPress={() => {
                createMenuRef.current?.open()
              }}
            >
              <Icon name="plus" />
            </Pressable>
          </View>
        </View>
        {collections && (
          <FlatList
            data={collections}
            renderItem={({ item: { id, name } }) => (
              <Link
                key={id}
                href={`/collection/${id}`}
                testID="library.collection.list.item"
              >
                <Text>{name}</Text>
              </Link>
            )}
            testID="library.collection.list"
            ListEmptyComponent={NoCollections}
          />
        )}
      </View>
    </>
  )
}
