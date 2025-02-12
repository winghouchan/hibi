import { useEffect, useState } from 'react'
import { TextInput, TextInputProps, View } from 'react-native'
import { type Props } from '..'

export default function Editor({
  autofocus,
  initialContent,
  name,
  onChange,
  testID,
}: Props) {
  const [contentInitialized, setContentInitialized] = useState(false)
  const [value, setValue] = useState<string>()

  const onChangeText: TextInputProps['onChangeText'] = (value) => {
    setValue(value)
    onChange?.(name, {
      type: 'doc',
      content: value.split('\n').map((text) => ({
        type: 'paragraph',
        content: [{ type: 'text', text }],
      })),
    })
  }

  useEffect(() => {
    if (
      !contentInitialized &&
      initialContent.content?.every(({ content }) =>
        content?.every(({ text }) => text !== ''),
      )
    ) {
      setContentInitialized(true)
      setValue(
        initialContent?.content
          ?.map(({ content }) => content?.map(({ text }) => text).join(''))
          .join('\n'),
      )
    }
  }, [contentInitialized, initialContent])

  return (
    <View testID={testID && `${testID}.editor`}>
      <TextInput
        autoFocus={autofocus}
        // eslint-disable-next-line lingui/no-unlocalized-strings
        accessibilityLabel="Editor"
        onChangeText={onChangeText}
        testID={testID && `${testID}.editor.input`}
        value={value}
      />
    </View>
  )
}
