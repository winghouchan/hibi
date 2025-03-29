import { action } from '@storybook/addon-actions'
import type { Meta, StoryObj } from '@storybook/react'
import TextField from './TextField'

type Config = Meta<typeof TextField>
type Story = StoryObj<Config>

export default {
  component: TextField,
  args: {
    onBlur: action('onBlur'),
    onChange: action('onChange'),
    onFocus: action('onFocus'),
    onSubmitEditing: action('onSubmitEditing'),
    placeholder: 'Placeholder',
    error: '',
  },
} satisfies Config

export const Default = {} satisfies Story
