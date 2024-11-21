import { screen, userEvent, waitFor } from '@testing-library/react-native'
import { renderRouter } from 'expo-router/testing-library'
import { Alert } from 'react-native'
import { createCollection } from '@/collections'
import { mockAppRoot } from 'test/utils'
import { getOnboardingCollection } from '../../operations'
import CollectionScreen from '.'

jest.mock('@/collections/createCollection/createCollection')
jest.mock(
  '@/onboarding/operations/onboardingCollection/getOnboardingCollection',
)

const createCollectionMock = createCollection as jest.MockedFunction<
  typeof createCollection
>
const onboardingCollectionMock = getOnboardingCollection as jest.MockedFunction<
  typeof getOnboardingCollection
>

function mockCreateCollectionError(error: Error) {
  createCollectionMock.mockRejectedValueOnce(error)
}

function mockOnboardingCollection(
  mock: Parameters<typeof onboardingCollectionMock.mockResolvedValueOnce>[0],
) {
  onboardingCollectionMock.mockResolvedValueOnce(mock)
}

function mockOnboardingCollectionError(error: Error) {
  onboardingCollectionMock.mockRejectedValueOnce(error)
}

describe('<CollectionScreen />', () => {
  describe('when the user has not created a collection during onboarding before', () => {
    test('and inputs the correct information then submits the form, the form submits successfully', async () => {
      const user = userEvent.setup()
      const input = {
        collectionName: 'Collection Name',
      }

      renderRouter(
        {
          'onboarding/collection': CollectionScreen,
          'onboarding/notes': () => null,
        },
        {
          initialUrl: 'onboarding/collection',
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

      expect(screen).toHavePathname('/onboarding/notes')
    })

    test('and inputs incorrect information then submits the form, errors are shown to the user', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert')
      const user = userEvent.setup()

      mockCreateCollectionError(new Error('Mock Error'))

      renderRouter(
        {
          'onboarding/collection': CollectionScreen,
        },
        {
          initialUrl: 'onboarding/collection',
          wrapper: mockAppRoot(),
        },
      )

      await user.press(
        screen.getByRole('button', { name: 'Create collection' }),
      )

      expect(alertSpy).toHaveBeenCalledOnce()
    })
  })

  describe('when the user has created a collection during onboarding before', () => {
    test('the form is pre-populated with the previously submitted information', async () => {
      const input = {
        collectionName: 'Collection Name',
      }

      mockOnboardingCollection({
        id: 1,
        name: input.collectionName,
        createdAt: new Date(),
        notes: [],
      })

      renderRouter(
        {
          'onboarding/collection': CollectionScreen,
        },
        {
          initialUrl: 'onboarding/collection',
          wrapper: mockAppRoot(),
        },
      )

      expect(
        await screen.findByDisplayValue(input.collectionName),
      ).toBeOnTheScreen()
      expect(
        await screen.findByRole('button', { name: 'Update collection' }),
      ).toBeOnTheScreen()
    })
  })

  describe('when there is an error fetching the onboarding collection', () => {
    test('the user is alerted', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert')

      mockOnboardingCollectionError(new Error('Mock Error'))

      renderRouter(
        {
          'onboarding/collection': CollectionScreen,
        },
        {
          initialUrl: 'onboarding/collection',
          wrapper: mockAppRoot(),
        },
      )

      await waitFor(() => expect(alertSpy).toHaveBeenCalledOnce())
    })
  })
})
