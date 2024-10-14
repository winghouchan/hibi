import { TransRenderProps } from '@lingui/react'
import { PropsWithChildren } from 'react'
import { Text } from 'react-native'

/**
 * The default component the internationalization library uses to wrap localized text.
 *
 * @see {@link https://lingui.dev/tutorials/react-native#rendering-and-styling-of-translations}
 */
export default function DefaultComponent({
  children,
}: PropsWithChildren<TransRenderProps>) {
  return <Text>{children}</Text>
}
