import type { Meta, StoryObj } from '@storybook/react'
import Icon, { names } from '.'

const meta: Meta<typeof Icon> = {
  component: Icon,
  args: {
    name: 'activity',
    color: 'black',
    size: 128,
    strokeWidth: 1,
  },
  argTypes: {
    name: {
      control: 'select',
      options: names,
    },
    size: {
      control: {
        type: 'range',
        min: 1,
        max: 256,
      },
    },
    strokeWidth: {
      control: {
        type: 'range',
        min: 0.1,
        max: 2,
        step: 0.1,
      },
    },
  },
}

export default meta

type Story = StoryObj<typeof Icon>

export const Overview: Story = {}
