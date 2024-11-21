import { screen, userEvent, waitFor } from '@testing-library/react-native'
import { useRouter } from 'expo-router'
import { renderRouter } from 'expo-router/testing-library'
import { Alert } from 'react-native'
import { createNote, getNote, updateNote } from '@/notes'
import hashNoteFieldValue from '@/notes/hashNoteFieldValue'
import { mockAppRoot } from 'test/utils'
import { getOnboardingCollection } from '../../operations'
import NoteEditor from '.'

jest.mock('expo-linking')
jest.mock('@/notes/createNote/createNote')
jest.mock('@/notes/getNote/getNote')
jest.mock('@/notes/updateNote/updateNote')
jest.mock(
  '@/onboarding/operations/onboardingCollection/getOnboardingCollection',
)

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

const onboardingCollectionMock = getOnboardingCollection as jest.MockedFunction<
  typeof getOnboardingCollection
>

const createNoteMock = createNote as jest.MockedFunction<typeof createNote>

const updateNoteMock = updateNote as jest.MockedFunction<typeof updateNote>

function mockOnboardingNote(
  mock: Parameters<typeof onboardingNoteMock.mockRejectedValueOnce>[0],
) {
  onboardingNoteMock.mockResolvedValueOnce(mock)
}

function mockOnboardingNoteError(error: Error) {
  onboardingNoteMock.mockRejectedValueOnce(error)
}

function mockOnboardingCollection(
  mock: Parameters<typeof onboardingCollectionMock.mockResolvedValueOnce>[0],
) {
  onboardingCollectionMock.mockResolvedValueOnce(mock)
}

function mockOnboardingCollectionError(error: Error) {
  onboardingCollectionMock.mockRejectedValueOnce(error)
}

function mockCreateNoteError(error: Error) {
  createNoteMock.mockRejectedValueOnce(error)
}

function mockUpdateNoteError(error: Error) {
  updateNoteMock.mockRejectedValueOnce(error)
}

describe('<NoteEditor />', () => {
  describe('when there is an onboarding collection', () => {
    describe('and there is no note ID', () => {
      test('a new note can be created', async () => {
        const user = userEvent.setup()

        mockOnboardingCollection({
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

      test('the user is alerted when there is an error creating the note', async () => {
        const user = userEvent.setup()
        const alertSpy = jest.spyOn(Alert, 'alert')

        mockOnboardingCollection({
          id: 1,
          name: 'Collection Name',
          createdAt: new Date(),
          notes: [],
        })

        mockCreateNoteError(new Error('Mock Error'))

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

        expect(alertSpy).toHaveBeenCalledOnce()
      })
    })

    describe('and there is a note ID', () => {
      test('the form is pre-populated with the note and can be updated', async () => {
        const user = userEvent.setup()
        const input = {
          existing: {
            note: {
              fields: [[{ value: 'Front' }], [{ value: 'Back' }]],
            },
          },
          new: {
            note: {
              fields: [[{ value: 'New Front' }], [{ value: 'New Back' }]],
            },
          },
        } as const

        mockOnboardingCollection({
          id: 1,
          name: 'Collection Name',
          createdAt: new Date(),
          notes: [],
        })

        mockOnboardingNote({
          id: 1,
          fields: [
            [
              {
                value: input.existing.note.fields[0][0].value,
                id: 1,
                createdAt: new Date(),
                note: 1,
                hash: hashNoteFieldValue(
                  input.existing.note.fields[0][0].value,
                ),
                side: 0,
                position: 0,
                archived: false,
              },
            ],
            [
              {
                value: input.existing.note.fields[1][0].value,
                id: 2,
                createdAt: new Date(),
                note: 1,
                hash: hashNoteFieldValue(
                  input.existing.note.fields[1][0].value,
                ),
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
          await screen.findByDisplayValue(
            input.existing.note.fields[0][0].value,
          ),
        ).toBeOnTheScreen()
        expect(
          await screen.findByDisplayValue(
            input.existing.note.fields[1][0].value,
          ),
        ).toBeOnTheScreen()

        await user.type(
          screen.getByDisplayValue(input.existing.note.fields[0][0].value),
          input.new.note.fields[0][0].value,
        )
        await user.type(
          screen.getByDisplayValue(input.existing.note.fields[1][0].value),
          input.new.note.fields[1][0].value,
        )
        await user.press(
          await screen.findByRole('button', { name: 'Update note' }),
        )

        expect(backMock).toHaveBeenCalled()
      })

      test('the user is alerted when there is an error updating the note', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert')
        const user = userEvent.setup()
        const input = {
          existing: {
            note: {
              fields: [[{ value: 'Front' }], [{ value: 'Back' }]],
            },
          },
          new: {
            note: {
              fields: [[{ value: 'New Front' }], [{ value: 'New Back' }]],
            },
          },
        } as const

        mockOnboardingCollection({
          id: 1,
          name: 'Collection Name',
          createdAt: new Date(),
          notes: [],
        })

        mockOnboardingNote({
          id: 1,
          fields: [
            [
              {
                value: input.existing.note.fields[0][0].value,
                id: 1,
                createdAt: new Date(),
                note: 1,
                hash: hashNoteFieldValue(
                  input.existing.note.fields[0][0].value,
                ),
                side: 0,
                position: 0,
                archived: false,
              },
            ],
            [
              {
                value: input.existing.note.fields[1][0].value,
                id: 2,
                createdAt: new Date(),
                note: 1,
                hash: hashNoteFieldValue(
                  input.existing.note.fields[1][0].value,
                ),
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

        mockUpdateNoteError(new Error('Mock Error'))

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
          await screen.findByDisplayValue(
            input.existing.note.fields[0][0].value,
          ),
        ).toBeOnTheScreen()
        expect(
          await screen.findByDisplayValue(
            input.existing.note.fields[1][0].value,
          ),
        ).toBeOnTheScreen()

        await user.press(
          await screen.findByRole('button', { name: 'Update note' }),
        )

        expect(alertSpy).toHaveBeenCalledOnce()
      })
    })

    describe('and the note does not exist', () => {
      test('the user is alerted', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert')

        mockOnboardingCollection({
          id: 1,
          name: 'Collection Name',
          createdAt: new Date(),
          notes: [],
        })

        mockOnboardingNote(null)

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
      mockOnboardingCollection(null)

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

    describe('and there is a note ID', () => {
      test('does not show an alert', async () => {
        const alertSpy = jest.spyOn(Alert, 'alert')

        mockOnboardingCollection(null)

        renderRouter(
          {
            'onboarding/notes/edit/[id]': NoteEditor,
          },
          {
            initialUrl: 'onboarding/notes/edit/1',
            wrapper: mockAppRoot(),
          },
        )

        await waitFor(() => {
          expect(screen).toHavePathname('/')
        })
        expect(alertSpy).not.toHaveBeenCalled()
      })
    })
  })

  describe('when there is an error fetching the onboarding collection', () => {
    test('the user is alerted', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert')

      mockOnboardingCollectionError(new Error('Mock Error'))

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

      mockOnboardingCollection({
        id: 1,
        name: 'Collection Name',
        createdAt: new Date(),
        notes: [],
      })

      mockOnboardingNoteError(new Error('Mock Error'))

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
