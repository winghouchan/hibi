import feather, { FeatherAttributes } from 'feather-icons'
import { kebabCase } from 'lodash'
import { SvgXml as NativeSvgXml } from 'react-native-svg'
import { withUnistyles } from 'react-native-unistyles'
import { CamelCasedProperties } from 'type-fest'

interface Props
  extends Omit<
    Partial<CamelCasedProperties<FeatherAttributes>>,
    'height' | 'width'
  > {
  name: keyof typeof feather.icons
  size?: number
}

function kebabCaseProperty<T>(
  object: { [key: string]: T } | ArrayLike<T>,
  [key, value]: [string, T],
) {
  return {
    ...object,
    [kebabCase(key)]: value,
  }
}

export const names = Object.keys(feather.icons)

const SvgXml = withUnistyles(NativeSvgXml)

export default function Icon({ name, size = 24, ...props }: Props) {
  return (
    <SvgXml
      uniProps={(theme, runtime) => ({
        xml: feather.icons[name].toSvg({
          color: theme.color.foreground.default,
          ...Object.entries(props).reduce(kebabCaseProperty, {}),
        }),
        height: size * runtime.fontScale,
        width: size * runtime.fontScale,
      })}
    />
  )
}
