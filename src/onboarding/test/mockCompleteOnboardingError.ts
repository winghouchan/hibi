import { completeOnboarding } from '../operations/completeOnboarding'

jest.mock('@/onboarding/operations/completeOnboarding/completeOnboarding')

const fn = completeOnboarding as jest.MockedFunction<typeof completeOnboarding>

export default function mockOnboardedState(error: Error) {
  fn.mockRejectedValueOnce(error)
}
