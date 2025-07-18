import { act, screen, userEvent } from '@testing-library/react-native'
import { Stack } from 'expo-router'
import { renderRouter } from 'expo-router/testing-library'
import { ErrorBoundary } from 'react-error-boundary'
import { View } from 'react-native'
import { mockCollections, mockCollectionsError } from '@/collections/test'
import { mockNotes, mockNotesError } from '@/notes/test'
import { mockAppRoot } from 'test/utils'
import LibraryScreen from '.'

const routerMock = {
  _layout: () => (
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
  index: LibraryScreen,
} satisfies Parameters<typeof renderRouter>[0]

describe('<LibraryScreen />', () => {
  test('shows a list of collections and a list of notes', async () => {
    const fixture = {
      collections: [
        {
          id: 1,
          name: 'Collection Mock 1',
          createdAt: new Date(),
        },
      ],

      notes: [
        {
          id: 1,
          reversible: false,
          separable: false,
          createdAt: new Date(),
          fields: [
            [
              {
                id: 1,
                note: 1,
                value: 'Front',
                hash: '',
                side: 0,
                position: 0,
                archived: false,
                createdAt: new Date(),
              },
            ],
            [
              {
                id: 2,
                note: 1,
                value: 'Back',
                hash: '',
                side: 0,
                position: 0,
                archived: false,
                createdAt: new Date(),
              },
            ],
          ],
        },
      ],
    }

    mockCollections({
      cursor: { next: undefined },
      collections: fixture.collections,
    })
    mockNotes({ cursor: { next: undefined }, notes: fixture.notes })

    await renderRouter(routerMock, { wrapper: mockAppRoot() })

    expect(await screen.findByRole('tab', { name: 'All' })).toBeOnTheScreen()
    await Promise.all(
      fixture.collections.map(async ({ name }) => {
        expect(await screen.findByRole('tab', { name })).toBeOnTheScreen()
      }),
    )
    await Promise.all(
      fixture.notes.map(async ({ fields: sides }) => {
        await Promise.all(
          sides.map(async (fields) => {
            await Promise.all(
              fields.map(async (field) => await screen.findByText(field.value)),
            )
          }),
        )
      }),
    )
  })

  test('pressing a collection filters the list of notes to only notes for that collection', async () => {
    const user = userEvent.setup()
    const fixture = {
      collections: [
        {
          id: 1,
          name: 'Collection Mock 1',
          createdAt: new Date(),
        },
        {
          id: 2,
          name: 'Collection Mock 2',
          createdAt: new Date(),
        },
      ],

      notes: [
        {
          id: 1,
          reversible: false,
          separable: false,
          createdAt: new Date(),
          fields: [
            [
              {
                id: 1,
                note: 1,
                value: 'Collection 1 Note 1 Front',
                hash: '',
                side: 0,
                position: 0,
                archived: false,
                createdAt: new Date(),
              },
            ],
            [
              {
                id: 2,
                note: 1,
                value: 'Collection 1 Note 1 Back',
                hash: '',
                side: 0,
                position: 0,
                archived: false,
                createdAt: new Date(),
              },
            ],
          ],
        },
        {
          id: 2,
          reversible: false,
          separable: false,
          createdAt: new Date(),
          fields: [
            [
              {
                id: 3,
                note: 1,
                value: 'Collection 2 Note 1 Front',
                hash: '',
                side: 0,
                position: 0,
                archived: false,
                createdAt: new Date(),
              },
            ],
            [
              {
                id: 4,
                note: 1,
                value: 'Collection 2 Note 1 Back',
                hash: '',
                side: 0,
                position: 0,
                archived: false,
                createdAt: new Date(),
              },
            ],
          ],
        },
      ],
    }

    mockCollections({
      cursor: { next: undefined },
      collections: fixture.collections,
    })
    mockNotes({ cursor: { next: undefined }, notes: fixture.notes })

    await renderRouter(routerMock, { wrapper: mockAppRoot() })

    mockNotes({ cursor: { next: undefined }, notes: [fixture.notes[0]] })

    await user.press(
      await screen.findByRole('tab', { name: fixture.collections[0].name }),
    )

    fixture.notes[0].fields.map((side) => {
      side.map((field) => {
        expect(screen.getByText(field.value)).toBeOnTheScreen()
      })
    })

    fixture.notes[1].fields.map((side) => {
      side.map((field) => {
        expect(screen.queryByText(field.value)).not.toBeOnTheScreen()
      })
    })
  })

  test('when there is an error fetching the collections, an error message is shown', async () => {
    // Suppress console error from the error mock
    jest.spyOn(console, 'error').mockImplementation()

    mockCollectionsError(new Error('Mock Error'))
    mockNotes({ cursor: { next: undefined }, notes: [] })

    await renderRouter(routerMock, { wrapper: mockAppRoot() })

    expect(
      await screen.findByTestId('error-boundary-fallback-mock'),
    ).toBeOnTheScreen()
  })

  test('when there is an error fetching the notes, an error message is shown', async () => {
    // Suppress console error from the error mock
    jest.spyOn(console, 'error').mockImplementation()

    mockCollections({ cursor: { next: undefined }, collections: [] })
    mockNotesError(new Error('Mock Error'))

    await renderRouter(routerMock, { wrapper: mockAppRoot() })

    expect(
      await screen.findByTestId('error-boundary-fallback-mock'),
    ).toBeOnTheScreen()
  })
})
