import { render, screen, userEvent } from '@testing-library/react-native'
import TextInput from '.'

describe('<TextInput />', () => {
  test('when given a `testID`, it is appended with `.input`', () => {
    render(<TextInput accessibilityLabel="Test input field" testID="test" />)

    expect(screen.getByTestId('test.input')).toBeOnTheScreen()
  })

  test('calls event handlers', async () => {
    const user = userEvent.setup()
    const input = 'Input'

    const handlers = {
      onBlur: jest.fn(),
      onChange: jest.fn(),
      onChangeText: jest.fn(),
      onFocus: jest.fn(),
      onSubmitEditing: jest.fn(),
    }

    render(<TextInput accessibilityLabel="Input" {...handlers} />)

    await user.type(screen.getByLabelText('Input'), input, {
      submitEditing: true,
    })

    expect(handlers.onBlur).toHaveBeenCalledOnce()
    expect(handlers.onChange).toHaveBeenCalledTimes(input.length)
    expect(handlers.onChangeText).toHaveBeenCalledTimes(input.length)
    expect(handlers.onFocus).toHaveBeenCalledOnce()
    expect(handlers.onSubmitEditing).toHaveBeenCalledOnce()
  })
})
