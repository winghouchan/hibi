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
        options: ['primary', 'neutral', 'success', 'danger'],
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
      <Button priority="high" action="success">
        High: Success
      </Button>
      <Button priority="high" action="danger">
        High: Danger
      </Button>
      <Button priority="medium" action="primary">
        Medium: Primary
      </Button>
      <Button priority="medium" action="neutral">
        Medium: Neutral
      </Button>
      <Button priority="medium" action="success">
        Medium: Success
      </Button>
      <Button priority="medium" action="danger">
        Medium: Danger
      </Button>
      <Button priority="low" action="primary">
        Low: Primary
      </Button>
      <Button priority="low" action="neutral">
        Low: Neutral
      </Button>
      <Button priority="low" action="success">
        Low: Success
      </Button>
      <Button priority="low" action="danger">
        Low: Danger
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

export const MediumPriority = {
  args: {
    priority: 'medium',
    action: 'primary',
  },
} satisfies Story

export const LowPriority = {
  args: {
    priority: 'low',
    action: 'primary',
  },
} satisfies Story
