import { screen } from '@testing-library/react-native'
import { renderRouter } from 'expo-router/testing-library'
import { mockOnboardedState } from '@/onboarding/test'
import { mockAppRoot } from 'test/utils'
import Navigator from './Navigator'

describe('<RootNavigator />', () => {
  describe('when there is an error from a screen in the navigator', () => {
    it('shows an error message and button to try again', async () => {
      // Suppress console error from the error mock
      jest.spyOn(console, 'error').mockImplementation()

      mockOnboardedState(true)

      await renderRouter(
        {
          _layout: Navigator,
          index: () => {
            throw new Error('Mock Error')
          },
          onboarding: () => null,
          storybook: () => null,
        },
        { wrapper: mockAppRoot() },
      )

      expect(await screen.findByText('Something went wrong')).toBeOnTheScreen()
      expect(
        await screen.findByRole('button', { name: 'Try again' }),
      ).toBeOnTheScreen()
    })
  })
})
