import { getOnboardingCollection } from '../operations/onboardingCollection'

jest.mock(
  '@/onboarding/operations/onboardingCollection/getOnboardingCollection',
)

const fn = getOnboardingCollection as jest.MockedFunction<
  typeof getOnboardingCollection
>

export default function mockOnboardingCollectionError(error: Error) {
  fn.mockRejectedValueOnce(error)
}
