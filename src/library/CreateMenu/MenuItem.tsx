import { Link, LinkProps } from 'expo-router'
import { ComponentProps } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { Icon } from '@/ui'

type Props = LinkProps & {
  icon: ComponentProps<typeof Icon>['name']
}

const styles = StyleSheet.create(({ color, radius, spacing }) => ({
  item: {
    backgroundColor: color.background.default,
    borderRadius: radius[16],
    padding: spacing.condensed,
    flex: 1,
  },

  content: {
    gap: spacing.condensed,
    flexDirection: 'row',
  },

  icon: {
    alignItems: 'center',
    aspectRatio: 1,
    justifyContent: 'center',
    height: '100%',
  },

  description: {
    flex: 1,
    justifyContent: 'center',
  },
}))

export default function MenuItem({ children, icon, style, ...props }: Props) {
  return (
    <Link style={[styles.item, style]} {...props}>
      <View style={styles.content}>
        <View style={styles.icon}>
          <Icon name={icon} size={24} />
        </View>
        <View style={styles.description}>{children}</View>
      </View>
    </Link>
  )
}
