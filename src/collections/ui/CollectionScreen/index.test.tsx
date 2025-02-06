import { screen, waitFor } from '@testing-library/react-native'
import { renderRouter } from 'expo-router/testing-library'
import { Alert } from 'react-native'
import { mockCollection } from '@/collections/test'
import { mockAppRoot } from 'test/utils'
import CollectionScreen from '.'

describe('<CollectionScreen />', () => {
  test('when there is a collection ID and the collection exists, it is displayed', async () => {
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
        initialUrl: '/collection/1',
        wrapper: mockAppRoot(),
      },
    )

    await waitFor(async () => {
      expect(await screen.findByText(fixture.collection.name)).toBeOnTheScreen()
    })
  })

  test('when there is a collection ID and the collection does not exist, the user is alerted', async () => {
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

    await waitFor(async () => {
      expect(alertSpy).toHaveBeenCalledOnce()
    })
  })
})
