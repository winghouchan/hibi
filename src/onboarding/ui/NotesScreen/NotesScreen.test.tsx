import { screen, userEvent, waitFor } from '@testing-library/react-native'
import { Stack } from 'expo-router'
import { renderRouter } from 'expo-router/testing-library'
import { ErrorBoundary } from 'react-error-boundary'
import { Alert, View } from 'react-native'
import hashNoteFieldValue from '@/notes/hashNoteFieldValue'
import { mockNotes } from '@/notes/test'
import {
  mockCompleteOnboardingError,
  mockOnboardingCollection,
  mockOnboardingCollectionError,
} from '@/onboarding/test'
import { mockAppRoot } from 'test/utils'
import NotesScreen from './NotesScreen'

const routerMock = {
  '(onboarded)/_layout': () => <Stack />,
  '(onboarded)/(tabs)/_layout': () => <Stack />,
  '(onboarded)/(tabs)/index': () => null,
  'onboarding/notes': NotesScreen,
  'onboarding/notes/[id]/edit': () => null,
  'onboarding/notes/new': () => null,
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
  index: () => null,
} satisfies Parameters<typeof renderRouter>[0]

describe('<NotesScreen />', () => {
  describe('when there are 0 collections', () => {
    test('redirects to the welcome screen', async () => {
      const fixture = {
        collection: null,
        notes: [],
      }

      mockOnboardingCollection(fixture.collection)

      await renderRouter(routerMock, {
        initialUrl: 'onboarding/notes',
        wrapper: mockAppRoot(),
      })

      await waitFor(() => {
        expect(screen).toHavePathname('/')
      })
    })
  })

  describe('when there is 1 collection', () => {
    describe('with 0 notes', () => {
      test('pressing the button to add a note opens the note editor', async () => {
        const user = userEvent.setup()
        const fixture = {
          collection: {
            id: 1,
            name: 'Collection Name',
            createdAt: new Date(),
          },
          notes: [],
        }

        mockOnboardingCollection(fixture.collection)
        mockNotes({ cursor: { next: undefined }, notes: fixture.notes })

        await renderRouter(routerMock, {
          initialUrl: 'onboarding/notes',
          wrapper: mockAppRoot(),
        })

        const newNoteButton = await screen.findByRole('link', {
          name: 'New note',
        })

        expect(
          screen.queryByRole('button', { name: 'Finish' }),
        ).not.toBeOnTheScreen()

        await user.press(newNoteButton)

        expect(screen).toHavePathname('/onboarding/notes/new')
      })
    })

    describe('with at least 1 note', () => {
      test('shows the notes', async () => {
        const fixture = {
          collection: {
            id: 1,
            name: 'Collection Name',
            createdAt: new Date(),
          },
          notes: [
            {
              id: 1,
              createdAt: new Date(),
              fields: [
                [
                  {
                    id: 1,
                    createdAt: new Date(),
                    note: 1,
                    value: 'Front 1',
                    hash: hashNoteFieldValue('Front 1'),
                    side: 0,
                    position: 0,
                    archived: false,
                  },
                ],
                [
                  {
                    id: 2,
                    createdAt: new Date(),
                    note: 1,
                    value: 'Back 1',
                    hash: hashNoteFieldValue('Back 1'),
                    side: 1,
                    position: 0,
                    archived: false,
                  },
                ],
              ],
              reversible: false,
              separable: false,
            },
          ],
        }

        mockOnboardingCollection(fixture.collection)
        mockNotes({ cursor: { next: undefined }, notes: fixture.notes })

        await renderRouter(routerMock, {
          initialUrl: 'onboarding/notes',
          wrapper: mockAppRoot(),
        })

        expect(
          await screen.findByRole('link', { name: /(Front 1|Back 1)/s }),
        ).toBeOnTheScreen()
      })

      test('pressing a note opens the note editor', async () => {
        const user = userEvent.setup()
        const fixture = {
          collection: {
            id: 1,
            name: 'Collection Name',
            createdAt: new Date(),
          },
          notes: [
            {
              id: 1,
              createdAt: new Date(),
              fields: [
                [
                  {
                    id: 1,
                    createdAt: new Date(),
                    note: 1,
                    value: 'Front 1',
                    hash: hashNoteFieldValue('Front 1'),
                    side: 0,
                    position: 0,
                    archived: false,
                  },
                ],
                [
                  {
                    id: 2,
                    createdAt: new Date(),
                    note: 1,
                    value: 'Back 1',
                    hash: hashNoteFieldValue('Back 1'),
                    side: 1,
                    position: 0,
                    archived: false,
                  },
                ],
              ],
              reversible: false,
              separable: false,
            },
          ],
        }

        mockOnboardingCollection(fixture.collection)
        mockNotes({ cursor: { next: undefined }, notes: fixture.notes })

        await renderRouter(routerMock, {
          initialUrl: 'onboarding/notes',
          wrapper: mockAppRoot(),
        })

        await user.press(
          await screen.findByRole('link', { name: /(Front 1|Back 1)/s }),
        )

        expect(screen).toHavePathname('/onboarding/notes/1/edit')
      })

      test('pressing the button to complete onboarding navigates to the home screen', async () => {
        const user = userEvent.setup()
        const fixture = {
          collection: {
            id: 1,
            name: 'Collection Name',
            createdAt: new Date(),
          },
          notes: [
            {
              id: 1,
              createdAt: new Date(),
              fields: [
                [
                  {
                    id: 1,
                    createdAt: new Date(),
                    note: 1,
                    value: 'Front 1',
                    hash: hashNoteFieldValue('Front 1'),
                    side: 0,
                    position: 0,
                    archived: false,
                  },
                ],
                [
                  {
                    id: 2,
                    createdAt: new Date(),
                    note: 1,
                    value: 'Back 1',
                    hash: hashNoteFieldValue('Back 1'),
                    side: 1,
                    position: 0,
                    archived: false,
                  },
                ],
              ],
              reversible: false,
              separable: false,
            },
          ],
        }

        mockOnboardingCollection(fixture.collection)
        mockNotes({ cursor: { next: undefined }, notes: fixture.notes })

        await renderRouter(routerMock, {
          initialUrl: 'onboarding/notes',
          wrapper: mockAppRoot(),
        })

        await user.press(await screen.findByRole('button', { name: 'Finish' }))

        await waitFor(() => {
          expect(screen).toHaveRouterState(
            expect.objectContaining({
              routes: [
                expect.objectContaining({
                  state: expect.objectContaining({
                    index: 0,
                    routes: [
                      expect.objectContaining({
                        name: '(onboarded)',
                        state: expect.objectContaining({
                          index: 0,
                          routes: [
                            expect.objectContaining({
                              name: '(tabs)',
                              params: {
                                screen: 'index',
                              },
                            }),
                          ],
                        }),
                      }),
                    ],
                  }),
                }),
              ],
            }),
          )
        })
      })
    })
  })

  describe('when there is an error fetching the onboarding collection', () => {
    test('an error message is shown', async () => {
      // Suppress console error from the error mock
      jest.spyOn(console, 'error').mockImplementation()

      mockOnboardingCollectionError(new Error('Mock Error'))

      await renderRouter(routerMock, {
        initialUrl: 'onboarding/notes',
        wrapper: mockAppRoot(),
      })

      expect(
        await screen.findByTestId('error-boundary-fallback-mock'),
      ).toBeOnTheScreen()
    })
  })

  describe('when there is an error completing onboarding', () => {
    test('the user is alerted', async () => {
      const user = userEvent.setup()
      const alertSpy = jest.spyOn(Alert, 'alert')
      const fixture = {
        collection: {
          id: 1,
          name: 'Collection Name',
          createdAt: new Date(),
        },
        notes: [
          {
            id: 1,
            createdAt: new Date(),
            fields: [
              [
                {
                  id: 1,
                  createdAt: new Date(),
                  note: 1,
                  value: 'Front 1',
                  hash: hashNoteFieldValue('Front 1'),
                  side: 0,
                  position: 0,
                  archived: false,
                },
              ],
              [
                {
                  id: 2,
                  createdAt: new Date(),
                  note: 1,
                  value: 'Back 1',
                  hash: hashNoteFieldValue('Back 1'),
                  side: 1,
                  position: 0,
                  archived: false,
                },
              ],
            ],
            reversible: false,
            separable: false,
          },
        ],
      }

      mockCompleteOnboardingError(new Error('Mock Error'))

      mockOnboardingCollection(fixture.collection)
      mockNotes({ cursor: { next: undefined }, notes: fixture.notes })

      await renderRouter(routerMock, {
        initialUrl: 'onboarding/notes',
        wrapper: mockAppRoot(),
      })

      await user.press(await screen.findByRole('button', { name: 'Finish' }))

      await waitFor(() => expect(alertSpy).toHaveBeenCalledOnce())
    })
  })
})
