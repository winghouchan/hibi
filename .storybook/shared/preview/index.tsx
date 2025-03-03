import type { Preview } from '@storybook/react'
import Container from './Container'

const preview: Preview = {
  decorators: [Container],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
}

export default preview
