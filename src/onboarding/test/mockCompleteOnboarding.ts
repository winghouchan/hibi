import { completeOnboarding } from '../operations/completeOnboarding'

jest.mock('@/onboarding/operations/completeOnboarding/completeOnboarding')

const fn = completeOnboarding as jest.MockedFunction<typeof completeOnboarding>

export default function mockOnboardedState(
  mock: Parameters<(typeof fn)['mockResolvedValueOnce']>[0],
) {
  fn.mockResolvedValueOnce(mock)
}
