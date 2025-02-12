import { screen, waitFor } from '@testing-library/react-native'
import { renderRouter } from 'expo-router/testing-library'
import { Alert } from 'react-native'
import { mockGetNote } from '@/notes/test'
import { mockAppRoot } from 'test/utils'
import NoteScreen from '.'

describe('<NoteScreen />', () => {
  test('when there is a note ID and the note exists, the note is displayed', async () => {
    const fixture = {
      note: {
        id: 1,
        reversible: false,
        separable: false,
        fields: [],
        createdAt: new Date(),
      },
    }

    mockGetNote(fixture.note)

    renderRouter(
      {
        'note/[id]': NoteScreen,
      },
      {
        initialUrl: '/note/1',
        wrapper: mockAppRoot(),
      },
    )

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

    renderRouter(
      {
        'note/[id]': NoteScreen,
      },
      {
        initialUrl: '/note/0',
        wrapper: mockAppRoot(),
      },
    )

    await waitFor(async () => {
      expect(alertSpy).toHaveBeenCalledOnce()
    })
  })
})
