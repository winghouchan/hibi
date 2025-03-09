import { Link, LinkProps } from 'expo-router'
import { ComponentProps } from 'react'
import { View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'
import { Icon } from '@/ui'

type Props = LinkProps & {
  icon: ComponentProps<typeof Icon>['name']
}

const styles = StyleSheet.create(({ colors, radii, spacing }) => ({
  item: {
    backgroundColor: colors.neutral[1].background,
    borderRadius: radii[4],
    padding: spacing[2],
    flex: 1,
  },

  content: {
    gap: spacing[2],
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
