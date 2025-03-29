import { screen, userEvent, waitFor } from '@testing-library/react-native'
import { Stack } from 'expo-router'
import { renderRouter } from 'expo-router/testing-library'
import { ErrorBoundary } from 'react-error-boundary'
import { Alert, View } from 'react-native'
import { mockCollections } from '@/collections/test'
import hashNoteFieldValue from '@/notes/hashNoteFieldValue'
import {
  mockCreateNote,
  mockCreateNoteError,
  mockGetNote,
  mockGetNoteError,
  mockUpdateNote,
} from '@/notes/test'
import { mockAppRoot } from 'test/utils'
import NoteEditorScreen from '.'

// eslint-disable-next-line import/order -- These must be imported after they have been mocked
import { createNote, updateNote } from '@/notes/operations'

jest.mock('@/ui/RichTextInput')

const routerMock = {
  '(app)/_layout': () => <Stack />,
  '(app)/(tabs)/_layout': () => <Stack />,
  '(app)/note/_layout': () => (
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
  '(app)/note/[id]/_layout': {
    unstable_settings: { initialRouteName: 'index' },
    default: () => <Stack />,
  },
  '(app)/note/[id]/edit': NoteEditorScreen,
  '(app)/note/[id]/index': () => null,
  '(app)/note/new': NoteEditorScreen,
} satisfies Parameters<typeof renderRouter>[0]

describe('<NoteEditorScreen />', () => {
  describe('when there is a note ID', () => {
    test('and the note exists, the note can be edited', async () => {
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
      const noteMock = {
        id: fixture.note.id,
        collections: [fixture.collection.id],
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

      mockGetNote(noteMock)
      mockCollections({
        cursor: { next: undefined },
        collections: [fixture.collection],
      })
      mockUpdateNote({
        id: fixture.note.id,
        ...input.note.config,
        collections: [fixture.collection],
        fields: [], // Empty because value is not significant for this test
      })

      renderRouter(routerMock, {
        initialUrl: 'note/1/edit',
        wrapper: mockAppRoot(),
      })

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
      await user.press(await screen.findByRole('switch', { name: 'Separable' }))
      await user.press(await screen.findByRole('button', { name: 'Update' }))

      expect(updateNote).toHaveBeenCalledExactlyOnceWith({
        collections: [fixture.collection.id],
        ...fixture.note,
        ...input.note,
      })
    })

    test('and the note does not exist, an alert is displayed', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert')

      mockGetNote(null)

      renderRouter(routerMock, {
        initialUrl: 'note/1/edit',
        wrapper: mockAppRoot(),
      })

      await waitFor(async () => {
        expect(alertSpy).toHaveBeenCalledOnce()
      })
    })

    test('and there is an error fetching the note, an error message is shown', async () => {
      // Suppress console error from the error mock
      jest.spyOn(console, 'error').mockImplementation()

      mockGetNoteError(new Error('Mock Error'))

      renderRouter(routerMock, {
        initialUrl: 'note/1/edit',
        wrapper: mockAppRoot(),
      })

      expect(
        await screen.findByTestId('error-boundary-fallback-mock'),
      ).toBeOnTheScreen()
    })
  })

  describe('when there is no note ID', () => {
    test('a note can be created by completing the form', async () => {
      const fixture = {
        collections: [
          {
            id: 1,
            name: 'Collection Name',
            createdAt: new Date(),
            notes: [],
          },
        ],
      }
      const user = userEvent.setup()
      const input = {
        note: {
          collections: [fixture.collections[0].id],
          fields: [[{ value: 'Front' }], [{ value: 'Back' }]],
          config: {
            reversible: true,
            separable: true,
          },
        },
      } as const

      mockCollections({
        cursor: { next: undefined },
        collections: fixture.collections,
      })
      mockCollections({
        cursor: { next: undefined },
        collections: fixture.collections,
      })
      mockCreateNote({
        id: 1,
        collections: fixture.collections,
        fields: [], // Empty because value is not significant for this test
        reviewables: [], // Empty because value is not significant for this test
        createdAt: new Date(),
        ...input.note.config,
      })

      renderRouter(routerMock, {
        initialUrl: 'note/new',
        wrapper: mockAppRoot(),
      })

      await user.type(
        await screen.findByTestId('note.note-editor.side-0.editor.input'),
        input.note.fields[0][0].value,
      )
      await user.type(
        await screen.findByTestId('note.note-editor.side-1.editor.input'),
        input.note.fields[1][0].value,
      )
      await user.press(
        await screen.findByRole('button', {
          name: 'Select collections',
        }),
      )
      await user.press(
        await screen.findByRole('button', {
          name: fixture.collections[0].name,
        }),
      )
      await user.press(
        await screen.findByRole('button', {
          name: 'Done',
        }),
      )
      await user.press(
        await screen.findByRole('switch', { name: 'Reversible' }),
      )
      await user.press(await screen.findByRole('switch', { name: 'Separable' }))
      await user.press(await screen.findByRole('button', { name: 'Add' }))

      expect(createNote).toHaveBeenCalledExactlyOnceWith({
        ...input.note,
      })
    })

    test('and invalid information is submitted, an alert is displayed', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert')
      const user = userEvent.setup()

      mockCreateNoteError(new Error('Mock Error'))

      renderRouter(routerMock, {
        initialUrl: 'note/new',
        wrapper: mockAppRoot(),
      })

      await user.press(await screen.findByRole('button', { name: 'Add' }))

      expect(alertSpy).toHaveBeenCalledOnce()
    })
  })
})
