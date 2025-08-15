import { render, screen } from '@testing-library/react-native'
import Navigator from './Navigator'

jest.mock('@/data')
jest.mock('@/dev')
jest.mock('./Navigator', () => ({
  __esModule: true,
  default: jest.fn(),
}))

const NavigatorMock = Navigator as jest.MockedFunction<typeof Navigator>

describe('<RootLayout />', () => {
  test('when there is an error from the navigator, shows an error message and button to try again', async () => {
    // Suppress console error from the error mock
    jest.spyOn(console, 'error').mockImplementation()

    NavigatorMock.mockImplementation(() => {
      throw new Error('Mock Error')
    })

    const { default: Layout } = await import('./Layout')

    render(<Layout />)

    expect(screen.getByText('Something went wrong')).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeOnTheScreen()
  })
})
