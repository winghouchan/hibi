import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useHeaderHeight } from '@react-navigation/elements'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useFormik, type FormikConfig } from 'formik'
import { ComponentProps, useCallback, useEffect } from 'react'
import { Alert, KeyboardAvoidingView, Platform, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { createNoteMutation, noteQuery, updateNoteMutation } from '@/notes'
import { log } from '@/telemetry'
import { Button, Switch } from '@/ui'
import { onboardingCollectionQuery } from '../../operations'
import Editor from './Editor'

export default function NoteEditor() {
  const { i18n } = useLingui()
  const { id: noteId } = useLocalSearchParams<{ id?: string }>()
  const queryClient = useQueryClient()
  const router = useRouter()
  const { data: collection, isFetching: isFetchingCollection } = useQuery(
    onboardingCollectionQuery,
  )
  const { data: note, isFetching: isFetchingNote } = useQuery(
    noteQuery(Number(noteId)),
  )
  const { mutateAsync: createNote } = useMutation(createNoteMutation)
  const { mutateAsync: updateNote } = useMutation(updateNoteMutation)
  const headerHeight = useHeaderHeight()
  const safeAreaInset = useSafeAreaInsets()

  const initialValues = {
    id: noteId && Number(noteId),
    collections: collection?.id ? [collection.id] : [],
    fields: note ? note.fields : [[{ value: '' }], [{ value: '' }]],
    config: {
      reversible: note?.reversible || false,
      separable: note?.separable || false,
    },
  }

  const onSubmit: FormikConfig<typeof initialValues>['onSubmit'] = async (
    values,
  ) => {
    type SubmitFunction<
      Values extends
        | Parameters<typeof updateNote>[0]
        | Parameters<typeof createNote>[0],
    > = Values extends Parameters<typeof updateNote>[0]
      ? typeof updateNote
      : typeof createNote

    const doesNoteExist = values.id !== undefined

    const submit = (doesNoteExist ? updateNote : createNote) as SubmitFunction<
      typeof values
    >

    const handlers: Parameters<typeof submit>[1] = {
      async onSuccess() {
        await queryClient.invalidateQueries({
          queryKey: onboardingCollectionQuery.queryKey,
        })

        router.back()
      },
      onError(error) {
        // @todo Handle error
        Alert.alert(
          i18n.t(msg`Something went wrong`),
          doesNoteExist
            ? i18n.t(msg`There was an error updating the note`)
            : i18n.t(msg`There was an error creating the note`),
          [
            {
              text: i18n.t(msg`Try again`),
              style: 'default',
              isPreferred: true,
              onPress: async () => {
                await submit(values, handlers)
              },
            },
            {
              text: i18n.t(msg`Cancel`),
              style: 'cancel',
            },
          ],
        )
        log.error(error)
      },
    }

    try {
      await submit(values, handlers)
    } catch {
      // Errors handled by `submit`'s error handler
    }
  }

  const { handleSubmit, setFieldValue, values } = useFormik({
    enableReinitialize: true,
    initialValues,
    onSubmit,
  })

  /**
   * Handles changes from the editor
   *
   * This function needs to be memoized (using `useCallback`) otherwise it
   * causes an infinite re-render as it seems the reference to `setFieldValue`
   * is not stable.
   */
  const onChange = useCallback<
    Exclude<ComponentProps<typeof Editor>['onChange'], undefined>
  >(
    (name: string, value) => {
      value?.content &&
        setFieldValue(
          name,
          value.content?.map(({ content }) => ({
            value: content?.[0].text ?? '',
          })),
        )
    },
    [setFieldValue],
  )

  const SubmitButton = () => (
    <Button onPress={() => handleSubmit()} testID="onboarding.note-editor.cta">
      {values.id ? <Trans>Update note</Trans> : <Trans>Add note</Trans>}
    </Button>
  )

  useEffect(() => {
    if (collection && !isFetchingNote && note === null) {
      Alert.alert(i18n.t(msg`The note doesn't exist`), '', [
        {
          text: i18n.t(msg`OK`),
          style: 'default',
          onPress: () => {
            router.back()
          },
        },
      ])
    }
  }, [collection, i18n, isFetchingNote, note, router])

  return collection && !isFetchingCollection ? (
    <>
      <Stack.Screen
        options={{
          headerRight: () => <SubmitButton />,
        }}
      />
      {
        /**
         * The header (and therefore submit button) will not be rendered in the
         * test environment. As a result, the submit button is rendered here in
         * the test environment.
         */
        process.env.NODE_ENV === 'test' && <SubmitButton />
      }
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={headerHeight}
        style={{ backgroundColor: 'white', flex: 1 }}
      >
        <View
          testID="onboarding.note-editor.screen"
          style={{ flex: 1, paddingBottom: safeAreaInset.bottom }}
        >
          {values.fields.map((_, side) => (
            <Editor
              autofocus={side === 0}
              initialContent={{
                type: 'doc',
                content: initialValues.fields[side].reduce<
                  ComponentProps<typeof Editor>['initialContent'][]
                >(
                  (accumulator, field) =>
                    // @todo: Handle other types of fields
                    typeof field.value === 'string'
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
              placeholder={side === 0 ? i18n.t(msg`Front`) : i18n.t(msg`Back`)}
              testID={`onboarding.note-editor.side-${side}`}
            />
          ))}
          <Switch
            label={i18n.t(msg`Reversible`)}
            onValueChange={(value) => {
              setFieldValue('config.reversible', value)
            }}
            testID="onboarding.note-editor.reversible"
            value={values.config.reversible}
          />
          <Switch
            label={i18n.t(msg`Separable`)}
            onValueChange={(value) => {
              setFieldValue('config.separable', value)
            }}
            testID="onboarding.note-editor.separable"
            value={values.config.separable}
          />
        </View>
      </KeyboardAvoidingView>
    </>
  ) : !collection && !isFetchingCollection ? (
    <Redirect href="/" />
  ) : null
}
