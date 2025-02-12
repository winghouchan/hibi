import { screen, userEvent, waitFor } from '@testing-library/react-native'
import { Stack } from 'expo-router'
import { renderRouter } from 'expo-router/testing-library'
import { Alert } from 'react-native'
import { mockAppRoot } from 'test/utils'
import { mockCollection } from '../../test'
import CollectionEditor from '.'

// eslint-disable-next-line import/order -- These must be imported after they have been mocked
import { updateCollection } from '../../operations'

jest.unmock('@react-navigation/elements')
jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  router: {
    back: jest.fn(),
  },
}))

describe('<CollectionEditor />', () => {
  test('when there is a collection ID, the collection can be edited', async () => {
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

    renderRouter(
      {
        '(app)/_layout': () => <Stack />,
        '(app)/(tabs)/_layout': () => <Stack />,
        '(app)/collection/_layout': () => <Stack />,
        '(app)/collection/[id]/edit': CollectionEditor,
      },
      {
        initialUrl: `collection/${fixture.collection.id}/edit`,
        wrapper: mockAppRoot(),
      },
    )

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

    await user.press(screen.getByRole('button', { name: 'Update collection' }))

    expect(updateCollection).toHaveBeenCalledExactlyOnceWith({
      id: fixture.collection.id,
      name: input.name,
    })
  })

  test('when the collection does not exist, the user is alerted', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert')
    const fixture = {
      collection: null,
    }

    mockCollection(fixture.collection)

    renderRouter(
      {
        '(app)/_layout': () => <Stack />,
        '(app)/(tabs)/_layout': () => <Stack />,
        '(app)/collection/_layout': () => <Stack />,
        '(app)/collection/[id]/edit': CollectionEditor,
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
})
