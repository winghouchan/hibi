import { action } from '@storybook/addon-actions'
import type { Meta, StoryObj } from '@storybook/react'
import TextField from '.'

const meta: Meta<typeof TextField> = {
  component: TextField,
  args: {
    onBlur: action('onBlur'),
    onChange: action('onChange'),
    onFocus: action('onFocus'),
    onSubmitEditing: action('onSubmitEditing'),
    placeholder: 'Placeholder',
    error: '',
  },
}

export default meta

type Story = StoryObj<typeof TextField>

export const Default: Story = {}
