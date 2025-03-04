import { action } from '@storybook/addon-actions'
import { useArgs } from '@storybook/preview-api'
import type { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'
import Switch from '.'

type Config = Meta<typeof Switch>
type Story = StoryObj<Config>

export default {
  component: Switch,
  args: {
    label: 'Label',
    value: false,
    onChange: action('onChange'),
    onValueChange: action('onValueChange'),
  },
  decorators: [
    (Story, context) => {
      const [, setArgs] = useArgs()

      const onValueChange: ComponentProps<typeof Switch>['onValueChange'] = (
        value,
      ) => {
        context.args.onValueChange?.(value)

        if (context.args.value !== undefined) {
          setArgs({ value })
        }
      }

      return <Story args={{ ...context.args, onValueChange }} />
    },
  ],
} satisfies Config

export const Overview = {} satisfies Story
