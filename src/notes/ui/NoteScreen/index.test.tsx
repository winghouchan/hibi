import { screen, waitFor } from '@testing-library/react-native'
import { Stack } from 'expo-router'
import { renderRouter } from 'expo-router/testing-library'
import { ErrorBoundary } from 'react-error-boundary'
import { Alert, View } from 'react-native'
import { mockGetNote, mockGetNoteError } from '@/notes/test'
import { mockAppRoot } from 'test/utils'
import NoteScreen from '.'

const routerMock = {
  'note/_layout': () => (
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
  'note/[id]': NoteScreen,
} satisfies Parameters<typeof renderRouter>[0]

describe('<NoteScreen />', () => {
  test('when there is a note ID and the note exists, the note is displayed', async () => {
    const fixture = {
      note: {
        id: 1,
        collections: [1],
        reversible: false,
        separable: false,
        fields: [],
        createdAt: new Date(),
      },
    }

    mockGetNote(fixture.note)

    renderRouter(routerMock, {
      initialUrl: '/note/1',
      wrapper: mockAppRoot(),
    })

    await waitFor(async () => {
      expect(await screen.findByText(`${fixture.note.id}`)).toBeOnTheScreen()
    })
  })

  test('when there is a note ID and the note does not exist, the user is alerted', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert')
    const fixture = {
      note: null,
    }

    mockGetNote(fixture.note)

    renderRouter(routerMock, {
      initialUrl: '/note/0',
      wrapper: mockAppRoot(),
    })

    await waitFor(async () => {
      expect(alertSpy).toHaveBeenCalledOnce()
    })
  })

  test('when there is an error fetching the note, an error message is shown', async () => {
    // Suppress console error from the error mock
    jest.spyOn(console, 'error').mockImplementation()

    mockGetNoteError(new Error('Mock Error'))

    renderRouter(routerMock, {
      initialUrl: '/note/1',
      wrapper: mockAppRoot(),
    })

    expect(
      await screen.findByTestId('error-boundary-fallback-mock'),
    ).toBeOnTheScreen()
  })
})
