import { getOnboardingCollection } from '../operations/onboardingCollection'

jest.mock(
  '@/onboarding/operations/onboardingCollection/getOnboardingCollection',
)

const fn = getOnboardingCollection as jest.MockedFunction<
  typeof getOnboardingCollection
>

export default function mockOnboardingCollection(
  mock: Parameters<(typeof fn)['mockResolvedValueOnce']>[0],
) {
  fn.mockResolvedValueOnce(mock)
}
