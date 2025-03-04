import type { Decorator } from '@storybook/react'
import { ScrollView } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import configureStyleSheet from '@/ui/configureStyleSheet'

configureStyleSheet()

const style = StyleSheet.create(({ spacing }) => ({
  view: {
    flex: 1,
  },
  content: {
    gap: spacing[4],

    variants: {
      /**
       * Storybook for React Native does not respond to the `layout` parameter.
       * These styles add support for the `layout` parameter.
       *
       * @see {@link https://storybook.js.org/docs/configure/story-layout}
       */
      layout: {
        default: {
          padding: spacing[4],
        },

        centered: {
          alignItems: 'center',
          flexGrow: 1,
          justifyContent: 'center',
        },

        fullscreen: {
          padding: spacing[0],
        },

        padded: {
          padding: spacing[4],
        },
      },
    },
  },
}))

const Container: Decorator = (Story, context) => {
  style.useVariants({ layout: context.parameters.layout })

  return (
    <ScrollView
      alwaysBounceVertical={false}
      contentContainerStyle={style.content}
      style={style.view}
    >
      <Story />
    </ScrollView>
  )
}

export default Container
