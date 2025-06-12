import { action } from '@storybook/addon-actions'
import type { Meta, StoryObj } from '@storybook/react'
import Button from './Button'

type Config = Meta<typeof Button>
type Story = StoryObj<Config>

export default {
  component: Button,
  args: {
    children: 'Button',
    onLongPress: action('onLongPress'),
    onPress: action('onPress'),
    onPressIn: action('onPressIn'),
    onPressOut: action('onPressOut'),
  },
  argTypes: {
    action: {
      control: {
        type: 'radio',
        options: ['primary', 'neutral'],
      },
    },
    size: {
      control: {
        type: 'radio',
        options: ['small', 'medium', 'default'],
      },
    },
  },
  parameters: {
    controls: {
      exclude: ['priority'],
    },
  },
} satisfies Config

export const Overview = {
  render: () => (
    <>
      <Button priority="high" action="primary">
        High: Primary
      </Button>
      <Button priority="high" action="neutral">
        High: Neutral
      </Button>
      <Button priority="low" action="primary">
        Low: Primary
      </Button>
      <Button priority="low" action="neutral">
        Low: Neutral
      </Button>
    </>
  ),
} satisfies Story

export const HighPriority = {
  args: {
    priority: 'high',
    action: 'primary',
  },
} satisfies Story

export const LowPriority = {
  args: {
    priority: 'low',
    action: 'primary',
  },
} satisfies Story
