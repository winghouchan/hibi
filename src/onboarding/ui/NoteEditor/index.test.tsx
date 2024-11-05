import { screen, userEvent, waitFor } from '@testing-library/react-native'
import { useRouter } from 'expo-router'
import { renderRouter } from 'expo-router/testing-library'
import { Alert } from 'react-native'
import { getNote } from '@/notes'
import hashNoteFieldValue from '@/notes/hashNoteFieldValue'
import { mockAppRoot } from 'test/utils'
import { onboardingCollectionQuery } from '../../onboardingCollection'
import NoteEditor from '.'

jest.mock('@/notes/createNote/createNote')
jest.mock('@/notes/getNote/getNote')
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

const onboardingNoteMock = getNote as jest.MockedFunction<typeof getNote>

const onboardingCollectionMock =
  onboardingCollectionQuery.queryFn as jest.MockedFunction<
    Exclude<typeof onboardingCollectionQuery.queryFn, symbol | undefined>
  >

describe('<NoteEditor />', () => {
  describe('when there is an onboarding collection', () => {
    describe('and there is no note ID', () => {
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
        await user.press(
          await screen.findByRole('button', { name: 'Add note' }),
        )

        expect(backMock).toHaveBeenCalled()
      })
    })

    describe('and there is a note ID', () => {
      test('the form is pre-populated with the note', async () => {
        const input = {
          note: {
            fields: [[{ value: 'Front' }], [{ value: 'Back' }]],
          },
        } as const

        onboardingCollectionMock.mockResolvedValue({
          id: 1,
          name: 'Collection Name',
          createdAt: new Date(),
          notes: [],
        })

        onboardingNoteMock.mockResolvedValue({
          id: 1,
          fields: [
            [
              {
                value: input.note.fields[0][0].value,
                id: 1,
                createdAt: new Date(),
                note: 1,
                hash: hashNoteFieldValue(input.note.fields[0][0].value),
                side: 0,
                position: 0,
                archived: false,
              },
            ],
            [
              {
                value: input.note.fields[1][0].value,
                id: 2,
                createdAt: new Date(),
                note: 1,
                hash: hashNoteFieldValue(input.note.fields[1][0].value),
                side: 1,
                position: 0,
                archived: false,
              },
            ],
          ],
          reversible: false,
          separable: false,
          createdAt: new Date(),
        })

        renderRouter(
          {
            'onboarding/notes/edit/[id]': NoteEditor,
          },
          {
            initialUrl: 'onboarding/notes/edit/1',
            wrapper: mockAppRoot(),
          },
        )

        expect(
          await screen.findByDisplayValue(input.note.fields[0][0].value),
        ).toBeOnTheScreen()
        expect(
          await screen.findByDisplayValue(input.note.fields[1][0].value),
        ).toBeOnTheScreen()
      })
    })

    describe('and the note does not exist', () => {
      test('the user is alerted', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert')

        onboardingCollectionMock.mockResolvedValue({
          id: 1,
          name: 'Collection Name',
          createdAt: new Date(),
          notes: [],
        })

        onboardingNoteMock.mockResolvedValue(null)

        renderRouter(
          {
            'onboarding/notes/edit/[id]': NoteEditor,
          },
          {
            initialUrl: 'onboarding/notes/edit/1',
            wrapper: mockAppRoot(),
          },
        )

        await waitFor(async () => {
          expect(alertSpy).toHaveBeenCalledOnce()
        })
      })
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

  describe('when there is an error fetching the note', () => {
    test('the user is alerted', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert')

      onboardingCollectionMock.mockResolvedValue({
        id: 1,
        name: 'Collection Name',
        createdAt: new Date(),
        notes: [],
      })

      onboardingNoteMock.mockRejectedValue(new Error('Mock Error'))

      renderRouter(
        {
          'onboarding/notes/edit/[id]': NoteEditor,
        },
        {
          initialUrl: 'onboarding/notes/edit/1',
          wrapper: mockAppRoot(),
        },
      )

      await waitFor(async () => {
        expect(alertSpy).toHaveBeenCalledOnce()
      })
    })
  })
})
