import { ComponentProps } from 'react'
import Text from '../Text'

const heading = 'heading'

type TextProps = ComponentProps<typeof Text>

type HeadingSizes<Sizes> = Sizes extends `${typeof heading}.${infer Size}`
  ? Size
  : never

type Props = Omit<TextProps, 'size'> & {
  size: HeadingSizes<TextProps['size']>
}

export default function Heading({
  children,
  size,

  /**
   * The accessibility role for a heading is always `header`. Destructuring these
   * props prevent them from being spread onto the underlying text component and
   * overwriting the accessibility role.
   */
  accessibilityRole,
  role,

  ...props
}: Props) {
  return (
    <Text accessibilityRole="header" size={`${heading}.${size}`} {...props}>
      {children}
    </Text>
  )
}
