import { screen, userEvent, waitFor } from '@testing-library/react-native'
import { Stack } from 'expo-router'
import { renderRouter } from 'expo-router/testing-library'
import { ErrorBoundary } from 'react-error-boundary'
import { Alert, View } from 'react-native'
import { mockAppRoot } from 'test/utils'
import {
  mockCollection,
  mockCollectionError,
  mockCreateCollectionError,
} from '../../test'
import CollectionEditorScreen from '.'

// eslint-disable-next-line import/order -- These must be imported after they have been mocked
import { updateCollection } from '../../operations'

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
  '(app)/collection/[id]/_layout': {
    unstable_settings: { initialRouteName: 'index' },
    default: () => <Stack />,
  },
  '(app)/collection/[id]/edit': CollectionEditorScreen,
  '(app)/collection/[id]/index': () => null,
  '(app)/collection/new': CollectionEditorScreen,
} satisfies Parameters<typeof renderRouter>[0]

describe('<CollectionEditorScreen />', () => {
  describe('when there is a collection ID', () => {
    test('and the collection exists, the collection can be edited', async () => {
      const user = userEvent.setup()
      const fixture = {
        collection: {
          id: 1,
          name: 'Collection Name',
          createdAt: new Date(),
          notes: [],
        },
      }
      const input = {
        name: 'New Collection Name',
      }

      mockCollection(fixture.collection)

      renderRouter(routerMock, {
        initialUrl: `collection/${fixture.collection.id}/edit`,
        wrapper: mockAppRoot(),
      })

      await screen.findByTestId('collection.editor.screen')

      expect(
        await screen.findByDisplayValue(fixture.collection.name),
      ).toBeOnTheScreen()
      expect(
        await screen.findByRole('button', { name: 'Update collection' }),
      ).toBeOnTheScreen()

      await user.clear(screen.getByLabelText('Enter a collection name'))
      await user.type(
        screen.getByLabelText('Enter a collection name'),
        input.name,
      )

      mockCollection({ ...fixture.collection, name: input.name })

      await user.press(
        screen.getByRole('button', { name: 'Update collection' }),
      )

      expect(updateCollection).toHaveBeenCalledExactlyOnceWith({
        id: fixture.collection.id,
        name: input.name,
      })
    })

    test('and the collection does not exist, an alert is displayed', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert')
      const fixture = {
        collection: null,
      }

      mockCollection(fixture.collection)

      renderRouter(routerMock, {
        initialUrl: 'collection/0/edit',
        wrapper: mockAppRoot(),
      })

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledOnce()
      })
    })

    test('and there is an error fetching the collection, an error message is shown', async () => {
      // Suppress console error from the error mock
      jest.spyOn(console, 'error').mockImplementation()

      mockCollectionError(new Error('Mock Error'))

      renderRouter(routerMock, {
        initialUrl: 'collection/1/edit',
        wrapper: mockAppRoot(),
      })

      expect(
        await screen.findByTestId('error-boundary-fallback-mock'),
      ).toBeOnTheScreen()
    })
  })

  describe('when there is no collection ID', () => {
    test('a collection can be created by completing the form and submitting by pressing the submit button', async () => {
      const user = userEvent.setup()
      const input = {
        collectionName: 'Collection Name',
      }

      renderRouter(routerMock, {
        initialUrl: 'collection/new',
        wrapper: mockAppRoot(),
      })

      await user.type(
        await screen.findByLabelText('Enter a collection name'),
        input.collectionName,
      )
      await user.press(
        await screen.findByRole('button', { name: 'Create collection' }),
      )

      expect(screen).toHavePathname('/collection/1')
    })

    test('a collection can be created by completing the form and submitting by pressing the enter key on the keyboard', async () => {
      const user = userEvent.setup()
      const input = {
        collectionName: 'Collection Name',
      }

      renderRouter(routerMock, {
        initialUrl: 'collection/new',
        wrapper: mockAppRoot(),
      })

      await user.type(
        await screen.findByLabelText('Enter a collection name'),
        input.collectionName,
        { submitEditing: true },
      )

      expect(screen).toHavePathname('/collection/1')
    })

    test('and invalid information is submitted, an alert is shown', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert')
      const user = userEvent.setup()

      mockCreateCollectionError(new Error('Mock Error'))

      renderRouter(routerMock, {
        initialUrl: 'collection/new',
        wrapper: mockAppRoot(),
      })

      await user.press(
        await screen.findByRole('button', { name: 'Create collection' }),
      )

      expect(alertSpy).toHaveBeenCalledOnce()
    })
  })
})
