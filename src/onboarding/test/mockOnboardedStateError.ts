import { isOnboardingComplete } from '../operations/isOnboardingComplete'

jest.mock('@/onboarding/operations/isOnboardingComplete/isOnboardingComplete')

const fn = isOnboardingComplete as jest.MockedFunction<
  typeof isOnboardingComplete
>

export default function mockOnboardedState(error: Error) {
  fn.mockRejectedValueOnce(error)
}
