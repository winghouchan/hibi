import type { Meta, StoryObj } from '@storybook/react'
import Icon, { names } from './Icon'

type Config = Meta<typeof Icon>
type Story = StoryObj<Config>

export default {
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
} satisfies Config

export const Overview = {} satisfies Story
