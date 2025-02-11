import { screen, userEvent } from '@testing-library/react-native'
import { Stack, Tabs } from 'expo-router'
import { renderRouter } from 'expo-router/testing-library'
import { Alert } from 'react-native'
import { mockCreateCollectionError } from '@/collections/test'
import { mockAppRoot } from 'test/utils'
import NewCollectionScreen from '.'

jest.unmock('@react-navigation/elements')

describe('<NewCollectionScreen>', () => {
  test('when the user inputs the correct information then submits the form by pressing the button, the form submits successfully', async () => {
    const user = userEvent.setup()
    const input = {
      collectionName: 'Collection Name',
    }

    renderRouter(
      {
        '(app)/_layout': () => <Tabs />,
        '(app)/(tabs)/_layout': () => <Stack />,
        '(app)/collection/_layout': () => <Stack />,
        '(app)/collection/[id]': () => null,
        '(app)/collection/new': NewCollectionScreen,
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
    await user.press(screen.getByRole('button', { name: 'Create collection' }))

    expect(screen).toHavePathname('/collection/1')
  })

  test('when the user inputs the correct information then submits the form by pressing enter on the keyboard, the form submits successfully', async () => {
    const user = userEvent.setup()
    const input = {
      collectionName: 'Collection Name',
    }

    renderRouter(
      {
        '(app)/_layout': () => <Tabs />,
        '(app)/(tabs)/_layout': () => <Stack />,
        '(app)/collection/_layout': () => <Stack />,
        '(app)/collection/[id]': () => null,
        '(app)/collection/new': NewCollectionScreen,
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

  test('when the user inputs incorrect information then submits the form, errors are shown to the user', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert')
    const user = userEvent.setup()

    mockCreateCollectionError(new Error('Mock Error'))

    renderRouter(
      {
        '(app)/_layout': () => <Tabs />,
        '(app)/(tabs)/_layout': () => <Stack />,
        '(app)/collection/_layout': () => <Stack />,
        '(app)/collection/[id]': () => null,
        '(app)/collection/new': NewCollectionScreen,
      },
      {
        initialUrl: 'collection/new',
        wrapper: mockAppRoot(),
      },
    )

    await user.press(screen.getByRole('button', { name: 'Create collection' }))

    expect(alertSpy).toHaveBeenCalledOnce()
  })
})
