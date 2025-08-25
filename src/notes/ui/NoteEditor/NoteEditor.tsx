import { useLingui } from '@lingui/react/macro'
import { type FormikConfig, useFormik } from 'formik'
import {
  ComponentProps,
  ComponentRef,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react'
import { Pressable, View } from 'react-native'
import { Button, RichTextInput } from '@/ui'
import { createNote, getNote, updateNote } from '../../operations'
import { Note } from '../../schema'
import CollectionPicker from './CollectionPicker'
import styles from './NoteEditor.styles'

interface Ref {
  submit: () => void
}

interface Props {
  value?: Partial<Awaited<ReturnType<typeof getNote>>>
  onSubmit: <T>(
    ...args: T extends [{ id: Note['id'] }]
      ? Parameters<typeof updateNote>
      : Parameters<typeof createNote>
  ) => void
  testID?: string
}

function isTextField(
  type: Exclude<
    Exclude<Props['value'], null | undefined>['fields'],
    undefined
  >[number][number]['type'],
  value: Exclude<
    Exclude<Props['value'], null | undefined>['fields'],
    undefined
  >[number][number]['value'],
): value is string {
  return type === 'text/plain'
}

export default forwardRef<Ref, Props>(function NoteEditor(
  { value, onSubmit, testID },
  ref,
) {
  const { t: translate } = useLingui()
  const richTextInputRefs = useRef<
    (ComponentRef<typeof RichTextInput> | null)[]
  >([])

  const initialValues = {
    id: value?.id ?? undefined,
    collections: value?.collections ?? [],
    fields: value?.fields ?? [
      [{ type: 'text/plain', value: '' }],
      [{ type: 'text/plain', value: '' }],
    ],
    config: {
      reversible: value?.reversible ?? false,
      separable: value?.separable ?? false,
    },
  }

  const _onSubmit: FormikConfig<typeof initialValues>['onSubmit'] = (
    values,
  ) => {
    return onSubmit(values)
  }

  const { handleSubmit, setFieldValue, values } = useFormik({
    enableReinitialize: true,
    initialValues,
    onSubmit: _onSubmit,
  })

  /**
   * Handles changes from the editor
   *
   * This function needs to be memoized (using `useCallback`) otherwise it
   * causes an infinite re-render as it seems the reference to `setFieldValue`
   * is not stable.
   */
  const onChange = useCallback<
    Exclude<ComponentProps<typeof RichTextInput>['onChange'], undefined>
  >(
    (name: string, value) => {
      value?.content &&
        setFieldValue(
          name,
          value.content?.map(({ content }) => ({
            type: 'text/plain',
            value: content?.[0].text ?? '',
          })),
        )
    },
    [setFieldValue],
  )

  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
  }))

  return (
    <View style={styles.keyboardAvoidingView}>
      {values.fields.map((_, side) => (
        <RichTextInput
          autofocus={side === 0}
          initialContent={{
            type: 'doc',
            content: initialValues.fields[side].reduce<
              ComponentProps<typeof RichTextInput>['initialContent'][]
            >(
              (accumulator, field) =>
                // @todo: Handle other types of fields
                isTextField(field.type, field.value)
                  ? [
                      ...accumulator,
                      {
                        type: 'paragraph',
                        content: [{ type: 'text', text: field.value }],
                      },
                    ]
                  : accumulator,
              [],
            ),
          }}
          key={side}
          name={`fields.${side}`}
          onChange={onChange}
          placeholder={side === 0 ? translate`Front` : translate`Back`}
          ref={(ref) => {
            richTextInputRefs.current[side] = ref
          }}
          testID={testID && `${testID}.note-editor.side-${side}`}
        />
      ))}
      <Pressable
        accessible={false}
        accessibilityRole="button"
        onStartShouldSetResponderCapture={() => {
          richTextInputRefs.current?.forEach((ref) => ref?.blur())
          return false
        }}
        style={styles.settings}
      >
        <View style={styles.setting}>
          <Button
            accessibilityRole="switch"
            accessibilityState={{ checked: values.config.reversible }}
            priority={values.config.reversible ? 'high' : 'low'}
            onPress={() =>
              setFieldValue('config.reversible', !values.config.reversible)
            }
            testID={testID && `${testID}.note-editor.reversible`}
          >{translate`Make\nreversible`}</Button>
        </View>
        <View style={styles.setting}>
          <Button
            accessibilityRole="switch"
            accessibilityState={{ checked: values.config.reversible }}
            priority={values.config.separable ? 'high' : 'low'}
            onPress={() =>
              setFieldValue('config.separable', !values.config.separable)
            }
            testID={testID && `${testID}.note-editor.separable`}
          >{translate`Make\nseparable`}</Button>
        </View>
        <View style={styles.setting}>
          <CollectionPicker
            onChange={(value) => setFieldValue('collections', value)}
            testID={testID && `${testID}.note-editor.collection`}
            value={values.collections}
          />
        </View>
      </Pressable>
    </View>
  )
})
