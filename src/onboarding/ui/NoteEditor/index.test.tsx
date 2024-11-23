import { screen, userEvent, waitFor } from '@testing-library/react-native'
import { useRouter } from 'expo-router'
import { renderRouter } from 'expo-router/testing-library'
import { Alert } from 'react-native'
import hashNoteFieldValue from '@/notes/hashNoteFieldValue'
import {
  mockCreateNoteError,
  mockGetNote,
  mockGetNoteError,
  mockUpdateNoteError,
} from '@/notes/test'
import {
  mockOnboardingCollection,
  mockOnboardingCollectionError,
} from '@/onboarding/test'
import { mockAppRoot } from 'test/utils'
import NoteEditor from '.'

jest.mock('expo-linking')

const backMock = jest.fn()

;(useRouter as jest.MockedFunction<typeof useRouter>).mockReturnValue({
  back: backMock,
  canDismiss: jest.fn(),
  canGoBack: jest.fn(),
  dismiss: jest.fn(),
  dismissAll: jest.fn(),
  dismissTo: jest.fn(),
  navigate: jest.fn(),
  push: jest.fn(),
  reload: jest.fn(),
  replace: jest.fn(),
  setParams: jest.fn(),
})

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

        mockGetNote({
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

        mockGetNote({
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

        mockGetNote(null)

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

      mockGetNoteError(new Error('Mock Error'))

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
