import { screen, waitFor } from '@testing-library/react-native'
import { renderRouter } from 'expo-router/testing-library'
import { Alert } from 'react-native'
import { mockCollection, mockCollectionError } from '@/collections/test'
import { mockAppRoot } from 'test/utils'
import CollectionScreen from '.'

describe('<CollectionScreen />', () => {
  describe('when there is a collection ID', () => {
    test('and the collection exists, the collection is displayed', async () => {
      const fixture = {
        collection: {
          id: 1,
          name: 'Collection Name',
          createdAt: new Date(),
          notes: [],
        },
      }

      mockCollection(fixture.collection)

      renderRouter(
        {
          'collection/[id]': CollectionScreen,
        },
        {
          initialUrl: `/collection/${fixture.collection.id}`,
          wrapper: mockAppRoot(),
        },
      )

      await waitFor(async () => {
        expect(
          await screen.findByText(fixture.collection.name),
        ).toBeOnTheScreen()
      })
    })

    test('and the collection does not exist, an alert is displayed', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert')
      const fixture = {
        collection: null,
      }

      mockCollection(fixture.collection)

      renderRouter(
        {
          'collection/[id]': CollectionScreen,
        },
        {
          initialUrl: '/collection/0',
          wrapper: mockAppRoot(),
        },
      )

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledOnce()
      })
    })

    test('and there was an error fetching the collection, an alert is displayed', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert')

      mockCollectionError(new Error('Mock Error'))

      renderRouter(
        {
          'collection/[id]': CollectionScreen,
        },
        {
          initialUrl: '/collection/1',
          wrapper: mockAppRoot(),
        },
      )

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledOnce()
      })
    })
  })
})
