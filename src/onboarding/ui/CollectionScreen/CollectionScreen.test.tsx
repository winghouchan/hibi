import { screen, userEvent } from '@testing-library/react-native'
import { Stack } from 'expo-router'
import { renderRouter } from 'expo-router/testing-library'
import { ErrorBoundary } from 'react-error-boundary'
import { Alert, View } from 'react-native'
import {
  mockCreateCollectionError,
  mockUpdateCollectionError,
} from '@/collections/test'
import {
  mockOnboardingCollection,
  mockOnboardingCollectionError,
} from '@/onboarding/test'
import { mockAppRoot } from 'test/utils'
import CollectionScreen from '.'

const routerMock = {
  'onboarding/_layout': () => (
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
  'onboarding/collection': CollectionScreen,
  'onboarding/notes': () => null,
} satisfies Parameters<typeof renderRouter>[0]

describe('<CollectionScreen />', () => {
  describe('when the user has not created a collection during onboarding before', () => {
    test('and inputs the correct information then submits the form by pressing the button, the form submits successfully', async () => {
      const user = userEvent.setup()
      const input = {
        collectionName: 'Collection Name',
      }

      await renderRouter(routerMock, {
        initialUrl: 'onboarding/collection',
        wrapper: mockAppRoot(),
      })

      const collectionNameInput = await screen.findByLabelText(
        'Enter a collection name',
      )
      const createCollectionButton = await screen.findByRole('button', {
        name: 'Create collection',
      })

      await user.type(collectionNameInput, input.collectionName)
      await user.press(createCollectionButton)

      expect(screen).toHavePathname('/onboarding/notes')
    })

    test('and inputs the correct information then submits the form by pressing enter on the keyboard, the form submits successfully', async () => {
      const user = userEvent.setup()
      const input = {
        collectionName: 'Collection Name',
      }

      await renderRouter(routerMock, {
        initialUrl: 'onboarding/collection',
        wrapper: mockAppRoot(),
      })

      const collectionNameInput = await screen.findByLabelText(
        'Enter a collection name',
      )

      await user.type(collectionNameInput, input.collectionName, {
        submitEditing: true,
      })

      expect(screen).toHavePathname('/onboarding/notes')
    })

    test('and inputs incorrect information then submits the form, errors are shown to the user', async () => {
      const user = userEvent.setup()

      mockCreateCollectionError(new Error('Mock Error'))

      await renderRouter(routerMock, {
        initialUrl: 'onboarding/collection',
        wrapper: mockAppRoot(),
      })

      const createCollectionButton = await screen.findByRole('button', {
        name: 'Create collection',
      })

      await user.press(createCollectionButton)

      expect(screen.getByText('Your collection needs a name')).toBeOnTheScreen()
    })
  })

  describe('when the user has created a collection during onboarding before', () => {
    test('the form is pre-populated with the previously submitted information and can be updated', async () => {
      const user = userEvent.setup()
      const fixture = {
        collection: {
          id: 1,
          name: 'Collection Name',
          createdAt: new Date(),
        },
      }
      const input = {
        collectionName: 'New Collection Name',
      }

      mockOnboardingCollection(fixture.collection)

      await renderRouter(routerMock, {
        initialUrl: 'onboarding/collection',
        wrapper: mockAppRoot(),
      })

      const collectionNameInput = await screen.findByDisplayValue(
        fixture.collection.name,
      )
      const updateCollectionButton = await screen.findByRole('button', {
        name: 'Update collection',
      })

      expect(collectionNameInput).toBeOnTheScreen()
      expect(updateCollectionButton).toBeOnTheScreen()

      await user.clear(collectionNameInput)
      await user.type(collectionNameInput, input.collectionName)
      await user.press(updateCollectionButton)

      expect(screen).toHavePathname('/onboarding/notes')
    })

    test('and there is an error updating the collection, the user is alerted', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert')
      const user = userEvent.setup()
      const fixture = {
        collection: {
          id: 1,
          name: 'Collection Name',
          createdAt: new Date(),
        },
      }
      const input = {
        collectionName: 'New Collection Name',
      }

      mockOnboardingCollection(fixture.collection)
      mockUpdateCollectionError(new Error('Mock Error'))

      await renderRouter(routerMock, {
        initialUrl: 'onboarding/collection',
        wrapper: mockAppRoot(),
      })

      const collectionNameInput = await screen.findByDisplayValue(
        fixture.collection.name,
      )
      const updateCollectionButton = await screen.findByRole('button', {
        name: 'Update collection',
      })

      expect(collectionNameInput).toBeOnTheScreen()
      expect(updateCollectionButton).toBeOnTheScreen()

      await user.clear(collectionNameInput)
      await user.type(collectionNameInput, input.collectionName)
      await user.press(updateCollectionButton)

      expect(alertSpy).toHaveBeenCalledOnce()
    })
  })

  describe('when there is an error fetching the onboarding collection', () => {
    test('an error message is shown', async () => {
      // Suppress console error from the error mock
      jest.spyOn(console, 'error').mockImplementation()

      mockOnboardingCollectionError(new Error('Mock Error'))

      await renderRouter(routerMock, {
        initialUrl: 'onboarding/collection',
        wrapper: mockAppRoot(),
      })

      expect(
        await screen.findByTestId('error-boundary-fallback-mock'),
      ).toBeOnTheScreen()
    })
  })
})
