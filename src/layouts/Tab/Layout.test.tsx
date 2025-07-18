import { screen } from '@testing-library/react-native'
import { renderRouter } from 'expo-router/testing-library'
import { mockAppRoot } from 'test/utils'
import Layout from './Layout'

describe('<TabLayout />', () => {
  describe('when there is an error from a screen in the navigator', () => {
    it('shows an error message and button to try again', async () => {
      // Suppress console error from the error mock
      jest.spyOn(console, 'error').mockImplementation()

      await renderRouter(
        {
          _layout: Layout,
          index: () => {
            throw new Error('Mock Error')
          },
          library: () => null,
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
