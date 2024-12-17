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

// eslint-disable-next-line import/order -- These must be imported after they have been mocked
import { createNote, updateNote } from '@/notes/operations'

jest.mock('expo-linking')
jest.mock('./Editor')

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
        const fixture = {
          collection: {
            id: 1,
            name: 'Collection Name',
            createdAt: new Date(),
            notes: [],
          },
        }
        const input = {
          note: {
            collections: [fixture.collection.id],
            fields: [[{ value: 'Front 1' }], [{ value: 'Back 1' }]],
            config: {
              reversible: true,
              separable: true,
            },
          },
        }
        const user = userEvent.setup()

        mockOnboardingCollection(fixture.collection)

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
          await screen.findByTestId(
            'onboarding.note-editor.side-0.editor.input',
          ),
          input.note.fields[0][0].value,
        )
        await user.type(
          await screen.findByTestId(
            'onboarding.note-editor.side-1.editor.input',
          ),
          input.note.fields[1][0].value,
        )
        await user.press(
          await screen.findByRole('switch', { name: 'Reversible' }),
        )
        await user.press(
          await screen.findByRole('switch', { name: 'Separable' }),
        )
        await user.press(
          await screen.findByRole('button', { name: 'Add note' }),
        )

        expect(backMock).toHaveBeenCalled()
        expect(createNote).toHaveBeenCalledExactlyOnceWith(input.note)
      })

      test('the user is alerted when there is an error creating the note', async () => {
        const fixture = {
          collection: {
            id: 1,
            name: 'Collection Name',
            createdAt: new Date(),
            notes: [],
          },
        }
        const input = {
          note: {
            fields: [[{ value: 'Front 1' }], [{ value: 'Back 1' }]],
          },
        }
        const user = userEvent.setup()
        const alertSpy = jest.spyOn(Alert, 'alert')

        mockOnboardingCollection(fixture.collection)

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
          await screen.findByTestId(
            'onboarding.note-editor.side-0.editor.input',
          ),
          input.note.fields[0][0].value,
        )
        await user.type(
          await screen.findByTestId(
            'onboarding.note-editor.side-1.editor.input',
          ),
          input.note.fields[1][0].value,
        )
        await user.press(
          await screen.findByRole('button', { name: 'Add note' }),
        )

        expect(alertSpy).toHaveBeenCalledOnce()
      })
    })

    describe('and there is a note ID', () => {
      test('the form is pre-populated with the note and can be updated', async () => {
        const fixture = {
          collection: {
            id: 1,
            name: 'Collection Name',
            createdAt: new Date(),
            notes: [],
          },
          note: {
            id: 1,
            fields: [[{ value: 'Front' }], [{ value: 'Back' }]],
            config: {
              reversible: false,
              separable: false,
            },
          },
        }
        const user = userEvent.setup()
        const input = {
          note: {
            fields: [[{ value: 'New Front' }], [{ value: 'New Back' }]],
            config: {
              reversible: true,
              separable: true,
            },
          },
        } as const

        mockOnboardingCollection(fixture.collection)

        mockGetNote({
          id: fixture.note.id,
          fields: [
            [
              {
                value: fixture.note.fields[0][0].value,
                id: 1,
                createdAt: new Date(),
                note: 1,
                hash: hashNoteFieldValue(fixture.note.fields[0][0].value),
                side: 0,
                position: 0,
                archived: false,
              },
            ],
            [
              {
                value: fixture.note.fields[1][0].value,
                id: 2,
                createdAt: new Date(),
                note: 1,
                hash: hashNoteFieldValue(fixture.note.fields[1][0].value),
                side: 1,
                position: 0,
                archived: false,
              },
            ],
          ],
          createdAt: new Date(),
          ...fixture.note.config,
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

        const frontEditor = await screen.findByDisplayValue(
          fixture.note.fields[0][0].value,
        )
        const backEditor = await screen.findByDisplayValue(
          fixture.note.fields[1][0].value,
        )

        await user.clear(frontEditor)
        await user.type(frontEditor, input.note.fields[0][0].value)
        await user.clear(backEditor)
        await user.type(backEditor, input.note.fields[1][0].value)
        await user.press(
          await screen.findByRole('switch', { name: 'Reversible' }),
        )
        await user.press(
          await screen.findByRole('switch', { name: 'Separable' }),
        )
        await user.press(
          await screen.findByRole('button', { name: 'Update note' }),
        )

        expect(backMock).toHaveBeenCalled()
        expect(updateNote).toHaveBeenCalledExactlyOnceWith({
          collections: [fixture.collection.id],
          ...fixture.note,
          ...input.note,
        })
      })

      test('the user is alerted when there is an error updating the note', async () => {
        const fixture = {
          collection: {
            id: 1,
            name: 'Collection Name',
            createdAt: new Date(),
            notes: [],
          },
          note: {
            id: 1,
            fields: [[{ value: 'Front' }], [{ value: 'Back' }]],
            config: {
              reversible: false,
              separable: false,
            },
          },
        }
        const alertSpy = jest.spyOn(Alert, 'alert')
        const user = userEvent.setup()

        mockOnboardingCollection(fixture.collection)

        mockGetNote({
          id: 1,
          fields: [
            [
              {
                value: fixture.note.fields[0][0].value,
                id: 1,
                createdAt: new Date(),
                note: 1,
                hash: hashNoteFieldValue(fixture.note.fields[0][0].value),
                side: 0,
                position: 0,
                archived: false,
              },
            ],
            [
              {
                value: fixture.note.fields[1][0].value,
                id: 2,
                createdAt: new Date(),
                note: 1,
                hash: hashNoteFieldValue(fixture.note.fields[1][0].value),
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
          await screen.findByDisplayValue(fixture.note.fields[0][0].value),
        ).toBeOnTheScreen()
        expect(
          await screen.findByDisplayValue(fixture.note.fields[1][0].value),
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
