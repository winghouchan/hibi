import { isOnboardingComplete } from '../operations/isOnboardingComplete'

jest.mock('@/onboarding/operations/isOnboardingComplete/isOnboardingComplete')

const fn = isOnboardingComplete as jest.MockedFunction<
  typeof isOnboardingComplete
>

export default function mockOnboardedState(
  mock: Parameters<(typeof fn)['mockResolvedValueOnce']>[0],
) {
  return fn.mockResolvedValueOnce(mock)
}
