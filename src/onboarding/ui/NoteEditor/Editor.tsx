import {
  RichText,
  useEditorBridge,
  useEditorContent,
  TenTapStartKit as DefaultExtensions,
  PlaceholderBridge,
} from '@10play/tentap-editor'
import { ComponentProps, useEffect } from 'react'
import { View } from 'react-native'

interface Content {
  type: string
  content?: Content[]
  text?: string
}

interface Props
  extends Pick<ComponentProps<typeof RichText>, 'testID'>,
    Pick<
      Exclude<Parameters<typeof useEditorBridge>[0], undefined>,
      'autofocus' | 'initialContent'
    > {
  name: string
  onChange?: (name: string, content?: Content) => void
  placeholder?: string
}

export default function Editor({
  autofocus,
  initialContent,
  name,
  onChange,
  placeholder,
  testID,
}: Props) {
  const editor = useEditorBridge({
    bridgeExtensions: [
      ...DefaultExtensions,
      PlaceholderBridge.configureExtension({
        placeholder,
      }),
    ],
    autofocus,
    initialContent,
  })
  const content = useEditorContent(editor, { type: 'json' }) as Content

  useEffect(() => {
    onChange?.(name, content)
  }, [content, name, onChange])

  return (
    <View style={{ flex: 1 }} testID={testID && `${testID}.editor`}>
      <RichText editor={editor} testID={testID && `${testID}.editor.input`} />
    </View>
  )
}
