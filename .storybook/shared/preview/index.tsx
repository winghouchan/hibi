import type { Preview } from '@storybook/react'
import Container from './Container'

const preview = {
  decorators: [Container],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
} satisfies Preview

export default preview
