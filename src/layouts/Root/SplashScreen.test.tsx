import { render, waitFor } from '@testing-library/react-native'

describe('<Splash />', () => {
  let mockOnboardedState: (onboarded: boolean) => void,
    mockOnboardedStateError: (error: Error) => void

  beforeEach(async () => {
    /**
     * Work around React error saying:
     *
     * > Warning: Invalid hook call. Hooks can only be called inside of the body of a function component.
     * > This could happen for one of the following reasons:
     * >
     * > 1. You might have mismatching versions of React and the renderer (such as React DOM)
     * > 2. You might be breaking the Rules of Hooks
     * > 3. You might have more than one copy of React in the same app
     *
     * The cause of this error is `jest.isolateModulesAsync` creating a sandbox
     * module registry in each test. A sandbox module registry is required because
     * each test needs at fresh import of the `Splash` component as a side effect
     * (running `SplashScreen.preventAutoHideAsync`) is under test. `jest.isolateModulesAsync`
     * allows for each test to freshly import the `Splash` component to run the
     * side effect, as opposed to reading the module registry cache. A side effect
     * of this is two copies of React existing – one from this test file (as JSX
     * is written) and the other from the `Splash` component (as it is imported
     * within the sandbox module registry).
     *
     * The following mock works around this by forcing Jest to look at a _mock_
     * of React (which actually returns the real implementation) when resolving
     * imports to React.
     */
    jest.doMock('react', () => jest.requireActual('react'))

    jest.doMock(
      '@/onboarding/operations/isOnboardingComplete/isOnboardingComplete',
    )

    const isOnboardingComplete = (await import('@/onboarding'))
      .isOnboardingComplete as jest.MockedFunction<
      (typeof import('@/onboarding'))['isOnboardingComplete']
    >

    mockOnboardedState = (onboarded: boolean) =>
      isOnboardingComplete.mockResolvedValueOnce(onboarded)

    mockOnboardedStateError = (error: Error) =>
      isOnboardingComplete.mockRejectedValueOnce(error)
  })

  describe('when dependencies are ready', () => {
    it('hides the splash screen', async () => {
      await jest.isolateModulesAsync(async () => {
        const { SplashScreen } = await import('expo-router')
        const { mockAppRoot } = await import('test/utils')
        const { default: Splash } = await import('./SplashScreen')

        mockOnboardedState(true)

        const { rerender } = render(<Splash ready={false} />, {
          wrapper: mockAppRoot(),
        })

        expect(SplashScreen.preventAutoHideAsync).toHaveBeenCalledOnce()
        expect(SplashScreen.hideAsync).not.toHaveBeenCalled()

        rerender(<Splash ready={true} />)

        await waitFor(() =>
          expect(SplashScreen.hideAsync).toHaveBeenCalledOnce(),
        )
      })
    })
  })

  describe('when a data dependency errors', () => {
    it('does not hide the splash screen', async () => {
      await jest.isolateModulesAsync(async () => {
        const { SplashScreen } = await import('expo-router')
        const { mockAppRoot } = await import('test/utils')
        const { default: Splash } = await import('./SplashScreen')

        mockOnboardedStateError(new Error('Mock Error'))

        const { rerender } = render(<Splash ready={false} />, {
          wrapper: mockAppRoot(),
        })

        expect(SplashScreen.preventAutoHideAsync).toHaveBeenCalledOnce()
        expect(SplashScreen.hideAsync).not.toHaveBeenCalled()

        rerender(<Splash ready={true} />)

        expect(SplashScreen.hideAsync).not.toHaveBeenCalled()
      })
    })
  })
})
