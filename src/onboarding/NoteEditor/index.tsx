import { createNoteMutation } from '@/notes'
import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Redirect, useRouter } from 'expo-router'
import { FieldArray, Formik, type FormikConfig } from 'formik'
import { useEffect } from 'react'
import { Alert, Pressable, TextInput, View } from 'react-native'
import { onboardingCollectionQuery } from '../onboardingCollection'

export default function NoteEditor() {
  const { i18n } = useLingui()
  const queryClient = useQueryClient()
  const router = useRouter()
  const {
    data: collection,
    error,
    isFetching,
    refetch: refetchOnboardingCollection,
  } = useQuery(onboardingCollectionQuery)
  const { mutateAsync: createNote } = useMutation(createNoteMutation)

  const initialValues = {
    collections: collection?.id ? [collection.id] : [],
    fields: [[{ value: '' }], [{ value: '' }]],
    config: {
      reversible: false,
      separable: false,
    },
  }

  const onSubmit: FormikConfig<typeof initialValues>['onSubmit'] = async (
    values,
  ) => {
    try {
      await createNote(values)
      queryClient.invalidateQueries({
        queryKey: onboardingCollectionQuery.queryKey,
      })
      router.back()
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (!isFetching && error) {
      // @todo Handle error
      Alert.alert(
        i18n.t(msg`Something went wrong`),
        i18n.t(msg`There was a failure getting your onboarding collection`),
        [
          {
            text: i18n.t(msg`Try again`),
            style: 'default',
            isPreferred: true,
            onPress: () => {
              refetchOnboardingCollection()
            },
          },
          {
            text: i18n.t(msg`Cancel`),
            style: 'cancel',
            onPress: () => {
              router.back()
            },
          },
        ],
      )
      console.error(error)
    }
  }, [error, i18n, isFetching, refetchOnboardingCollection, router])

  return collection && !isFetching ? (
    <View testID="onboarding.note-editor.screen">
      <Formik
        enableReinitialize
        initialValues={initialValues}
        onSubmit={onSubmit}
      >
        {({ handleChange, handleSubmit, values }) => (
          <>
            {values.fields.map((side, sideIndex) => (
              <FieldArray key={sideIndex} name={`fields.${sideIndex}`}>
                {({ push }) => (
                  <View>
                    <Trans>Side {sideIndex}</Trans>
                    <View>
                      {side.map((field, fieldIndex) => (
                        <TextInput
                          key={fieldIndex}
                          accessibilityLabel={i18n.t(
                            msg`Enter field data for side ${sideIndex + 1} field ${fieldIndex + 1}`,
                          )}
                          placeholder={i18n.t(
                            msg`Field data for field side ${sideIndex + 1} ${fieldIndex + 1}`,
                          )}
                          onChangeText={handleChange(
                            `fields.${sideIndex}.${fieldIndex}.value`,
                          )}
                          testID={`onboarding.note-editor.side-${sideIndex}.field-${fieldIndex}.input`}
                          value={field.value}
                        />
                      ))}
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        push({ value: '' })
                      }}
                    >
                      <Trans>Add field</Trans>
                    </Pressable>
                  </View>
                )}
              </FieldArray>
            ))}
            <Pressable
              accessibilityRole="button"
              onPress={() => handleSubmit()}
              testID="onboarding.note-editor.cta.button"
            >
              <Trans>Add note</Trans>
            </Pressable>
          </>
        )}
      </Formik>
    </View>
  ) : !collection && !isFetching ? (
    <Redirect href="/" />
  ) : null
}
