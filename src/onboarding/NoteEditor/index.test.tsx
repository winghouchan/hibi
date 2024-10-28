import { screen, userEvent, waitFor } from '@testing-library/react-native'
import { useRouter } from 'expo-router'
import { renderRouter } from 'expo-router/testing-library'
import { Alert } from 'react-native'
import { mockAppRoot } from 'test/utils'
import { onboardingCollectionQuery } from '../onboardingCollection'
import NoteEditor from '.'

jest.mock('@/notes/createNote/createNote')
jest.mock('@/onboarding/onboardingCollection/getOnboardingCollection')
jest.mock('expo-linking')

const backMock = jest.fn()

;(useRouter as jest.MockedFunction<typeof useRouter>).mockReturnValue({
  back: backMock,
  canGoBack: jest.fn(),
  push: jest.fn(),
  navigate: jest.fn(),
  replace: jest.fn(),
  dismiss: jest.fn(),
  dismissAll: jest.fn(),
  canDismiss: jest.fn(),
  setParams: jest.fn(),
})

const onboardingCollectionMock =
  onboardingCollectionQuery.queryFn as jest.MockedFunction<
    Exclude<typeof onboardingCollectionQuery.queryFn, symbol | undefined>
  >

describe('<NoteEditor />', () => {
  describe('when there is an onboarding collection', () => {
    test('a new note can be created', async () => {
      const user = userEvent.setup()

      onboardingCollectionMock.mockResolvedValue({
        id: 1,
        name: 'Collection Name',
        createdAt: new Date(),
        notes: [],
      })

      renderRouter(
        {
          'onboarding/notes/new': NoteEditor,
        },
        {
          initialUrl: 'onboarding/notes/new',
          wrapper: mockAppRoot(),
        },
      )

      await user.type(
        await screen.findByLabelText('Enter field data for side 1 field 1'),
        'Front 1',
      )
      await user.type(
        await screen.findByLabelText('Enter field data for side 2 field 1'),
        'Back 1',
      )
      await user.press(await screen.findByRole('button', { name: 'Add note' }))

      expect(backMock).toHaveBeenCalled()
    })
  })

  describe('when there is no onboarding collection', () => {
    test('redirects to the welcome screen', async () => {
      onboardingCollectionMock.mockResolvedValue(null)

      renderRouter(
        {
          'onboarding/notes/new': NoteEditor,
        },
        {
          initialUrl: 'onboarding/notes/new',
          wrapper: mockAppRoot(),
        },
      )

      await waitFor(() => {
        expect(screen).toHavePathname('/')
      })
    })
  })

  describe('when there is an error fetching the onboarding collection', () => {
    test('the user is alerted', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert')

      onboardingCollectionMock.mockRejectedValue(new Error('Mock Error'))

      renderRouter(
        {
          'onboarding/notes/new': NoteEditor,
        },
        {
          initialUrl: 'onboarding/notes/new',
          wrapper: mockAppRoot(),
        },
      )

      await waitFor(async () => {
        expect(alertSpy).toHaveBeenCalledOnce()
      })
    })
  })
})
