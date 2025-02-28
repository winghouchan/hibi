import { action } from '@storybook/addon-actions'
import type { Meta, StoryObj } from '@storybook/react'
import TextInput from '.'

const meta: Meta<typeof TextInput> = {
  component: TextInput,
  args: {
    onBlur: action('onBlur'),
    onChange: action('onChange'),
    onFocus: action('onFocus'),
    onSubmitEditing: action('onSubmitEditing'),
    placeholder: 'Placeholder',
  },
}

export default meta

type Story = StoryObj<typeof TextInput>

export const Overview: Story = {}
