import { Trans } from '@lingui/macro'
import { useQuery } from '@tanstack/react-query'
import { Link, Tabs } from 'expo-router'
import { ComponentRef, useRef } from 'react'
import { FlatList, View } from 'react-native'
import { collectionsQuery } from '@/collections'
import { Button, Text } from '@/ui'
import CreateMenu from '../CreateMenu'

function NoCollections() {
  return <Trans>No collections</Trans>
}

export default function LibraryScreen() {
  const createMenuRef = useRef<ComponentRef<typeof CreateMenu>>(null)
  const { data: collections } = useQuery(collectionsQuery())

  return (
    <>
      <Tabs.Screen
        options={{
          headerRight: () => (
            <View>
              <Button
                action="neutral"
                priority="low"
                testID="library.create.menu"
                onPress={() => {
                  createMenuRef.current?.open()
                }}
                size="small"
              >
                <Trans component={null}>➕</Trans>
              </Button>
            </View>
          ),
        }}
      />
      <CreateMenu ref={createMenuRef} />
      <View testID="library.screen" style={{ flex: 1 }}>
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
