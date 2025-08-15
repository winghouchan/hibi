import { render, screen, userEvent } from '@testing-library/react-native'
import { Text } from 'react-native'
import Button from './Button'

describe('<Button />', () => {
  it('renders text children', () => {
    render(
      <Button>
        <Text>Button</Text>
      </Button>,
    )

    expect(screen.getByRole('button', { name: 'Button' })).toBeOnTheScreen()
  })

  it('renders function children', () => {
    render(<Button>{() => <Text>Button</Text>}</Button>)

    expect(screen.getByRole('button', { name: 'Button' })).toBeOnTheScreen()
  })

  it('calls press handlers', async () => {
    const user = userEvent.setup()

    const onPress = jest.fn()
    const onPressIn = jest.fn()
    const onPressOut = jest.fn()
    const onLongPress = jest.fn()

    render(
      <Button
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onLongPress={onLongPress}
      >
        <Text>Button</Text>
      </Button>,
    )

    await user.press(screen.getByRole('button', { name: 'Button' }))

    expect(onPress).toHaveBeenCalledOnce()
    expect(onPressIn).toHaveBeenCalledOnce()
    expect(onPressOut).toHaveBeenCalledOnce()

    await user.longPress(screen.getByRole('button', { name: 'Button' }))

    expect(onLongPress).toHaveBeenCalledOnce()
  })

  it('can have a custom accessibility role', () => {
    render(
      <Button accessibilityRole="link">
        <Text>Link</Text>
      </Button>,
    )

    expect(screen.queryByRole('button')).not.toBeOnTheScreen()
    expect(screen.getByRole('link', { name: 'Link' })).toBeOnTheScreen()
  })

  it('can have a custom role', () => {
    render(
      <Button role="link">
        <Text>Link</Text>
      </Button>,
    )

    expect(screen.queryByRole('button')).not.toBeOnTheScreen()
    expect(screen.getByRole('link', { name: 'Link' })).toBeOnTheScreen()
  })

  test('when given a `testID`, it is appended with `.button`', () => {
    render(
      <Button testID="test">
        <Text>Button</Text>
      </Button>,
    )

    expect(screen.getByTestId('test.button')).toBeOnTheScreen()
  })
})
