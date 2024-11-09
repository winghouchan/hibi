import { useField } from 'formik'
import ReactNative, { TextInputProps } from 'react-native'

interface Props extends TextInputProps {
  name: string
}

export default function TextInput({
  name,
  onBlur,
  onChangeText,
  testID,
  value,
  ...props
}: Props) {
  const [field] = useField(name)

  const handleBlur: TextInputProps['onBlur'] = (event) => {
    onBlur?.(event)
    field.onBlur(name)(event)
  }

  const handleChangeText: TextInputProps['onChangeText'] = (text) => {
    onChangeText?.(text)
    field.onChange(name)(text)
  }

  return (
    <ReactNative.TextInput
      onBlur={handleBlur}
      onChangeText={handleChangeText}
      testID={testID && `${testID}.input`}
      value={field.value}
      {...props}
    />
  )
}
