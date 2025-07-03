import { useLingui } from '@lingui/react/macro'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { collectionsQuery } from '@/collections/operations'
import { Collection } from '@/collections/schema'
import { Select, Text } from '@/ui'

interface Props {
  onChange: (value: Collection['id'][]) => void
  testID?: string
  value?: Collection['id'][]
}

export default function CollectionPicker({
  onChange,
  testID,
  value = [],
}: Props) {
  const { t: translate } = useLingui()
  const [isOpen, setIsOpen] = useState(false)
  const {
    data: collections,
    fetchNextPage: fetchMoreCollections,
    isFetchingNextPage: isFetchingMoreCollections,
  } = useInfiniteQuery({
    ...collectionsQuery(),
    enabled: isOpen,
  })

  const onOpen = () => {
    setIsOpen(true)
  }
  const onClose = () => {
    setIsOpen(false)
  }

  return (
    <Select testID={testID} onChange={onChange} value={value}>
      <Select.Button>{translate`Add to\ncollection`}</Select.Button>
      <Select.Options
        data={collections}
        keyExtractor={({ id }) => `${id}`}
        onClose={onClose}
        onEndReached={() =>
          !isFetchingMoreCollections && fetchMoreCollections()
        }
        onOpen={onOpen}
        renderItem={({ item: { name } }) => <Text>{name}</Text>}
        title={translate`Add to collection`}
      />
    </Select>
  )
}
