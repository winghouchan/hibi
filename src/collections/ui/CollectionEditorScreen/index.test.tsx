import { screen, userEvent, waitFor } from '@testing-library/react-native'
import { Stack } from 'expo-router'
import { renderRouter } from 'expo-router/testing-library'
import { Alert } from 'react-native'
import { mockAppRoot } from 'test/utils'
import {
  mockCollection,
  mockCollectionError,
  mockCreateCollectionError,
} from '../../test'
import CollectionEditorScreen from '.'

// eslint-disable-next-line import/order -- These must be imported after they have been mocked
import { updateCollection } from '../../operations'

jest.unmock('@react-navigation/elements')
jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  router: {
    back: jest.fn(),
  },
}))

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
      mockCollection(fixture.collection)

      renderRouter(
        {
          '(app)/_layout': () => <Stack />,
          '(app)/(tabs)/_layout': () => <Stack />,
          '(app)/collection/_layout': () => <Stack />,
          '(app)/collection/[id]/edit': CollectionEditorScreen,
        },
        {
          initialUrl: `collection/${fixture.collection.id}/edit`,
          wrapper: mockAppRoot(),
        },
      )

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
      mockCollection(fixture.collection)

      renderRouter(
        {
          '(app)/_layout': () => <Stack />,
          '(app)/(tabs)/_layout': () => <Stack />,
          '(app)/collection/_layout': () => <Stack />,
          '(app)/collection/[id]/edit': CollectionEditorScreen,
        },
        {
          initialUrl: 'collection/0/edit',
          wrapper: mockAppRoot(),
        },
      )

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledOnce()
      })
    })

    test('and there is an error fetching the collection, an alert is displayed', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert')

      mockCollectionError(new Error('Mock Error'))

      renderRouter(
        {
          '(app)/_layout': () => <Stack />,
          '(app)/(tabs)/_layout': () => <Stack />,
          '(app)/collection/_layout': () => <Stack />,
          '(app)/collection/[id]/edit': CollectionEditorScreen,
        },
        {
          initialUrl: 'collection/1/edit',
          wrapper: mockAppRoot(),
        },
      )

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledOnce()
      })
    })
  })

  describe('when there is no collection ID', () => {
    test('a collection can be created by completing the form and submitting by pressing the submit button', async () => {
      const user = userEvent.setup()
      const input = {
        collectionName: 'Collection Name',
      }

      renderRouter(
        {
          '(app)/_layout': () => <Stack />,
          '(app)/(tabs)/_layout': () => <Stack />,
          '(app)/collection/_layout': () => <Stack />,
          '(app)/collection/[id]/index': () => null,
          '(app)/collection/new': CollectionEditorScreen,
        },
        {
          initialUrl: 'collection/new',
          wrapper: mockAppRoot(),
        },
      )

      await user.type(
        screen.getByLabelText('Enter a collection name'),
        input.collectionName,
      )
      await user.press(
        screen.getByRole('button', { name: 'Create collection' }),
      )

      expect(screen).toHavePathname('/collection/1')
    })

    test('a collection can be created by completing the form and submitting by pressing the enter key on the keyboard', async () => {
      const user = userEvent.setup()
      const input = {
        collectionName: 'Collection Name',
      }

      renderRouter(
        {
          '(app)/_layout': () => <Stack />,
          '(app)/(tabs)/_layout': () => <Stack />,
          '(app)/collection/_layout': () => <Stack />,
          '(app)/collection/[id]/index': () => null,
          '(app)/collection/new': CollectionEditorScreen,
        },
        {
          initialUrl: 'collection/new',
          wrapper: mockAppRoot(),
        },
      )

      await user.type(
        screen.getByLabelText('Enter a collection name'),
        input.collectionName,
        { submitEditing: true },
      )

      expect(screen).toHavePathname('/collection/1')
    })

    test('and invalid information is submitted, an alert is shown', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert')
      const user = userEvent.setup()

      mockCreateCollectionError(new Error('Mock Error'))

      renderRouter(
        {
          '(app)/_layout': () => <Stack />,
          '(app)/(tabs)/_layout': () => <Stack />,
          '(app)/collection/_layout': () => <Stack />,
          '(app)/collection/[id]/index': () => null,
          '(app)/collection/new': CollectionEditorScreen,
        },
        {
          initialUrl: 'collection/new',
          wrapper: mockAppRoot(),
        },
      )

      await user.press(
        screen.getByRole('button', { name: 'Create collection' }),
      )

      expect(alertSpy).toHaveBeenCalledOnce()
    })
  })
})
