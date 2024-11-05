import { screen, waitFor } from '@testing-library/react-native'
import { renderRouter } from 'expo-router/testing-library'
import { mockAppRoot } from 'test/utils'
import { onboardingCollectionQuery } from '../../operations'
import Index from '.'

jest.mock(
  '@/onboarding/operations/onboardingCollection/getOnboardingCollection',
)

const onboardingCollectionMock =
  onboardingCollectionQuery.queryFn as jest.MockedFunction<
    Exclude<typeof onboardingCollectionQuery.queryFn, symbol | undefined>
  >

describe('<IndexScreen />', () => {
  describe('when a collection exists', () => {
    it('redirects to the onboarding note creation screen', async () => {
      onboardingCollectionMock.mockResolvedValue({
        id: 1,
        name: 'Collection Name',
        createdAt: new Date(),
        notes: [],
      })

      renderRouter(
        {
          onboarding: Index,
          'onboarding/notes': () => null,
        },
        {
          initialUrl: 'onboarding',
          wrapper: mockAppRoot(),
        },
      )

      await waitFor(() => {
        expect(screen).toHavePathname('/onboarding/notes')
      })
    })
  })

  describe('when does not collection exist', () => {
    it('redirects to the welcome screen', async () => {
      onboardingCollectionMock.mockResolvedValue(null)

      renderRouter(
        {
          index: () => null,
          onboarding: Index,
          'onboarding/notes': () => null,
        },
        {
          initialUrl: 'onboarding',
          wrapper: mockAppRoot(),
        },
      )

      await waitFor(() => {
        expect(screen).toHavePathname('/')
      })
    })
  })
})
