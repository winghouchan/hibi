import { action } from '@storybook/addon-actions'
import type { Meta, StoryObj } from '@storybook/react'
import Button from './Button'

const meta: Meta<typeof Button> = {
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
}

export default meta

type Story = StoryObj<typeof Button>

export const Overview: Story = {
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
}

export const HighPriority: Story = {
  args: {
    priority: 'high',
    action: 'primary',
  },
}

export const MediumPriority: Story = {
  args: {
    priority: 'medium',
    action: 'primary',
  },
}

export const LowPriority: Story = {
  args: {
    priority: 'low',
    action: 'primary',
  },
}
