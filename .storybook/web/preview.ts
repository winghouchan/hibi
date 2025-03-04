import type { Preview } from '@storybook/react'
import preview from '../shared/preview/index'

export default {
  ...preview,

  /**
   * Disable component stories. Styles on web are very broken. As a result, the
   * web Storybook is only showing design tokens. To view component stories, open
   * Storybook inside the app running in dev mode.
   */
  tags: ['!dev'],
} satisfies Preview
