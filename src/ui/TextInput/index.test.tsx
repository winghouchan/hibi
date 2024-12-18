import { render, screen } from '@testing-library/react-native'
import TextInput from '.'

describe('<TextInput />', () => {
  test('when given a `testID`, it is appended with `.input`', () => {
    render(<TextInput accessibilityLabel="Test input field" testID="test" />)

    expect(screen.getByTestId('test.input')).toBeOnTheScreen()
  })
})
