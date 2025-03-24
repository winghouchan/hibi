import { screen, waitFor } from '@testing-library/react-native'
import { Stack } from 'expo-router'
import { renderRouter } from 'expo-router/testing-library'
import { ErrorBoundary } from 'react-error-boundary'
import { Alert, View } from 'react-native'
import { mockNotes } from '@/notes/test'
import { mockAppRoot } from 'test/utils'
import { mockCollection, mockCollectionError } from '../../test'
import CollectionScreen from '.'

const routerMock = {
  '(app)/_layout': () => <Stack />,
  '(app)/(tabs)/_layout': () => <Stack />,
  '(app)/collection/_layout': () => (
    <Stack
      screenLayout={({ children }) => (
        <ErrorBoundary
          fallback={<View testID="error-boundary-fallback-mock" />}
        >
          {children}
        </ErrorBoundary>
      )}
    />
  ),
  '(app)/collection/[id]/index': CollectionScreen,
} satisfies Parameters<typeof renderRouter>[0]

describe('<CollectionScreen />', () => {
  describe('when there is a collection ID', () => {
    test('and the collection exists, the collection is displayed', async () => {
      const fixture = {
        collection: {
          id: 1,
          name: 'Collection Name',
          createdAt: new Date(),
        },
        notes: [],
      }

      mockCollection(fixture.collection)
      mockNotes({ cursor: { next: undefined }, notes: fixture.notes })

      renderRouter(routerMock, {
        initialUrl: `/collection/${fixture.collection.id}`,
        wrapper: mockAppRoot(),
      })

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

      renderRouter(routerMock, {
        initialUrl: '/collection/0',
        wrapper: mockAppRoot(),
      })

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledOnce()
      })
    })

    test('and there was an error fetching the collection, an error message is shown', async () => {
      // Suppress console error from the error mock
      jest.spyOn(console, 'error').mockImplementation()

      mockCollectionError(new Error('Mock Error'))

      renderRouter(routerMock, {
        initialUrl: '/collection/1',
        wrapper: mockAppRoot(),
      })

      expect(
        await screen.findByTestId('error-boundary-fallback-mock'),
      ).toBeOnTheScreen()
    })
  })
})
