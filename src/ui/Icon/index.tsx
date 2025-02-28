import feather, { FeatherAttributes } from 'feather-icons'
import { kebabCase } from 'lodash'
import { SvgXml } from 'react-native-svg'
import { CamelCasedProperties } from 'type-fest'

interface Props
  extends Omit<
    Partial<CamelCasedProperties<FeatherAttributes>>,
    'height' | 'width'
  > {
  name: keyof typeof feather.icons
  size: number
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

export default function Icon({ name, size = 24, ...props }: Props) {
  return (
    <SvgXml
      xml={feather.icons[name].toSvg({
        height: size,
        width: size,
        ...Object.entries(props).reduce(kebabCaseProperty, {}),
      })}
    />
  )
}
