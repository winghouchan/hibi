import ReactNative, { TextInputProps } from 'react-native'

export default function TextInput({ testID, ...props }: TextInputProps) {
  return (
    <ReactNative.TextInput testID={testID && `${testID}.input`} {...props} />
  )
}
