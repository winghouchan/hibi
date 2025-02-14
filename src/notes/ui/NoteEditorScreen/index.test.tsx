import { screen, userEvent, waitFor } from '@testing-library/react-native'
import { Stack, useRouter } from 'expo-router'
import { renderRouter } from 'expo-router/testing-library'
import { Alert } from 'react-native'
import hashNoteFieldValue from '@/notes/hashNoteFieldValue'
import { mockGetNote, mockGetNoteError } from '@/notes/test'
import { mockAppRoot } from 'test/utils'
import NoteEditorScreen from '.'

// eslint-disable-next-line import/order -- These must be imported after they have been mocked
import { updateNote } from '@/notes/operations'

jest.unmock('@react-navigation/elements')
jest.mock('expo-linking')
jest.mock('@/ui/RichTextInput')

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

describe('<NoteEditorScreen />', () => {
  test('when the note exists, the note can be edited', async () => {
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

    mockGetNote({
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
    })

    renderRouter(
      {
        '(app)/_layout': () => <Stack />,
        '(app)/(tabs)/_layout': () => <Stack />,
        '(app)/note/_layout': () => <Stack />,
        '(app)/note/[id]/edit': NoteEditorScreen,
      },
      {
        initialUrl: 'note/1/edit',
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
    await user.press(await screen.findByRole('switch', { name: 'Reversible' }))
    await user.press(await screen.findByRole('switch', { name: 'Separable' }))
    await user.press(await screen.findByRole('button', { name: 'Update note' }))

    expect(updateNote).toHaveBeenCalledExactlyOnceWith({
      collections: [fixture.collection.id],
      ...fixture.note,
      ...input.note,
    })
  })

  test('when the note does not exist, the user is alerted', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert')

    mockGetNote(null)

    renderRouter(
      {
        '(app)/_layout': () => <Stack />,
        '(app)/(tabs)/_layout': () => <Stack />,
        '(app)/note/_layout': () => <Stack />,
        '(app)/note/[id]/edit': NoteEditorScreen,
      },
      {
        initialUrl: 'note/1/edit',
        wrapper: mockAppRoot(),
      },
    )

    await waitFor(async () => {
      expect(alertSpy).toHaveBeenCalledOnce()
    })
  })

  test('when there is an error fetching the note, the user is alerted', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert')

    mockGetNoteError(new Error('Mock Error'))

    renderRouter(
      {
        '(app)/_layout': () => <Stack />,
        '(app)/(tabs)/_layout': () => <Stack />,
        '(app)/note/_layout': () => <Stack />,
        '(app)/note/[id]/edit': NoteEditorScreen,
      },
      {
        initialUrl: 'note/1/edit',
        wrapper: mockAppRoot(),
      },
    )

    await waitFor(async () => {
      expect(alertSpy).toHaveBeenCalledOnce()
    })
  })
})
