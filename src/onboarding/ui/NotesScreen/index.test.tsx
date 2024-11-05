import { screen, userEvent, waitFor } from '@testing-library/react-native'
import { renderRouter } from 'expo-router/testing-library'
import { Alert } from 'react-native'
import hashNoteFieldValue from '@/notes/hashNoteFieldValue'
import { mockAppRoot } from 'test/utils'
import { completeOnboarding } from '../../completeOnboarding'
import { onboardingCollectionQuery } from '../../onboardingCollection'
import NotesScreen from '.'

jest.mock('@/onboarding/completeOnboarding/completeOnboarding')
jest.mock('@/onboarding/onboardingCollection/getOnboardingCollection')

const onboardingCollectionMock =
  onboardingCollectionQuery.queryFn as jest.MockedFunction<
    Exclude<typeof onboardingCollectionQuery.queryFn, symbol | undefined>
  >

describe('<NotesScreen />', () => {
  describe('when there are 0 collections', () => {
    test('redirects to the welcome screen', async () => {
      onboardingCollectionMock.mockResolvedValue(null)

      renderRouter(
        {
          'onboarding/notes': NotesScreen,
        },
        {
          initialUrl: 'onboarding/notes',
          wrapper: mockAppRoot(),
        },
      )

      await waitFor(() => {
        expect(screen).toHavePathname('/')
      })
    })
  })

  describe('when there is 1 collection', () => {
    describe('with 0 notes', () => {
      test('pressing the button to add a note opens the note editor', async () => {
        const user = userEvent.setup()

        onboardingCollectionMock.mockResolvedValue({
          id: 1,
          name: 'Collection Name',
          createdAt: new Date(),
          notes: [],
        })

        renderRouter(
          {
            'onboarding/notes': NotesScreen,
            'onboarding/notes/new': () => null,
          },
          {
            initialUrl: 'onboarding/notes',
            wrapper: mockAppRoot(),
          },
        )

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
        onboardingCollectionMock.mockResolvedValue({
          id: 1,
          name: 'Collection Name',
          createdAt: new Date(),
          notes: [
            {
              id: 1,
              createdAt: new Date(),
              fields: [
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
              reversible: false,
              separable: false,
            },
          ],
        })

        renderRouter(
          {
            'onboarding/notes': NotesScreen,
          },
          {
            initialUrl: 'onboarding/notes',
            wrapper: mockAppRoot(),
          },
        )

        expect(
          await screen.findByRole('link', { name: /Front 1.*Back 1/s }),
        ).toBeOnTheScreen()
      })

      test('pressing a note opens the note editor', async () => {
        const user = userEvent.setup()

        onboardingCollectionMock.mockResolvedValue({
          id: 1,
          name: 'Collection Name',
          createdAt: new Date(),
          notes: [
            {
              id: 1,
              createdAt: new Date(),
              fields: [
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
              reversible: false,
              separable: false,
            },
          ],
        })

        renderRouter(
          {
            'onboarding/notes': NotesScreen,
            'onboarding/notes/edit/[id]': () => null,
          },
          {
            initialUrl: 'onboarding/notes',
            wrapper: mockAppRoot(),
          },
        )

        await user.press(
          await screen.findByRole('link', { name: /Front 1.*Back 1/s }),
        )

        expect(screen).toHavePathname('/onboarding/notes/edit/1')
      })

      test('pressing the button to complete onboarding navigates to the home screen', async () => {
        const user = userEvent.setup()

        onboardingCollectionMock.mockResolvedValue({
          id: 1,
          name: 'Collection Name',
          createdAt: new Date(),
          notes: [
            {
              id: 1,
              createdAt: new Date(),
              fields: [
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
              reversible: false,
              separable: false,
            },
          ],
        })

        renderRouter(
          {
            '(app)/_layout': () => null,
            '(app)/index': () => null,
            'onboarding/notes': NotesScreen,
          },
          {
            initialUrl: 'onboarding/notes',
            wrapper: mockAppRoot(),
          },
        )

        await user.press(await screen.findByRole('button', { name: 'Finish' }))

        await waitFor(() => {
          expect(screen).toHavePathname('/')
        })
      })
    })
  })

  describe('when there is an error fetching the onboarding collection', () => {
    test('the user is alerted', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert')

      onboardingCollectionMock.mockRejectedValue(new Error('Mock Error'))

      renderRouter(
        {
          'onboarding/notes': NotesScreen,
        },
        {
          initialUrl: 'onboarding/notes',
          wrapper: mockAppRoot(),
        },
      )

      await waitFor(() => expect(alertSpy).toHaveBeenCalledOnce())
    })
  })

  describe('when there is an error completing onboarding', () => {
    test('the user is alerted', async () => {
      const user = userEvent.setup()
      const alertSpy = jest.spyOn(Alert, 'alert')

      ;(
        completeOnboarding as jest.MockedFunction<typeof completeOnboarding>
      ).mockRejectedValue(new Error('Mock Error'))

      onboardingCollectionMock.mockResolvedValue({
        id: 1,
        name: 'Collection Name',
        createdAt: new Date(),
        notes: [
          {
            id: 1,
            createdAt: new Date(),
            fields: [
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
            reversible: false,
            separable: false,
          },
        ],
      })

      renderRouter(
        {
          'onboarding/notes': NotesScreen,
        },
        {
          initialUrl: 'onboarding/notes',
          wrapper: mockAppRoot(),
        },
      )

      await user.press(await screen.findByRole('button', { name: 'Finish' }))

      await waitFor(() => expect(alertSpy).toHaveBeenCalledOnce())
    })
  })
})
