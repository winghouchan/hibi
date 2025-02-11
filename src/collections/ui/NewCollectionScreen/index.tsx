import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { type NavigationProp } from '@react-navigation/native'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigation } from 'expo-router'
import { Formik, type FormikConfig } from 'formik'
import { Alert, View } from 'react-native'
import { log } from '@/telemetry'
import { Button, TextInput } from '@/ui'
import { createCollectionMutation } from '../../operations'
import baseQueryKey from '../../operations/baseQueryKey'

export default function NewCollectionScreen() {
  const { i18n } = useLingui()
  const { mutateAsync: createCollection } = useMutation(
    createCollectionMutation,
  )
  const navigation = useNavigation<
    NavigationProp<{
      '(tabs)': undefined
      collection: undefined
    }>
  >('/(app)')
  const queryClient = useQueryClient()

  const initialValues = {
    name: '',
  }

  const onSubmit: FormikConfig<typeof initialValues>['onSubmit'] = async (
    values,
  ) => {
    const handlers: Parameters<typeof createCollection>[1] = {
      async onSuccess({ id }) {
        queryClient.invalidateQueries({ queryKey: [baseQueryKey] })

        /**
         * Navigate to the newly created collection but set the library screen
         * to be the screen to be navigated to upon a back navigation. Not doing
         * this means a back navigation would take the user back to this screen
         * (the collection creation screen) which is undesirable.
         */
        navigation.reset({
          index: 1,
          routes: [
            {
              name: '(tabs)',
              state: {
                index: 1,
                routes: [{ name: 'index' }, { name: 'library/index' }],
              },
            },
            {
              name: 'collection',
              state: {
                index: 0,
                routes: [{ name: '[id]', params: { id } }],
              },
            },
          ],
        })
      },
      onError(error) {
        // @todo Handle error
        Alert.alert(
          i18n.t(msg`Something went wrong`),
          i18n.t(msg`There was an error creating the collection`),
          [
            {
              text: i18n.t(msg`Try again`),
              style: 'default',
              isPreferred: true,
              onPress: async () => {
                await createCollection(values, handlers)
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
      await createCollection(values, handlers)
    } catch {
      // Errors handled by error handler above
    }
  }

  return (
    <View testID="collection.creator.screen">
      <Formik
        enableReinitialize
        initialValues={initialValues}
        onSubmit={onSubmit}
      >
        {({ handleChange, handleSubmit, isSubmitting, values }) => (
          <>
            <TextInput
              accessibilityLabel={i18n.t(msg`Enter a collection name`)}
              autoFocus
              onChangeText={(value) => handleChange('name')(value)}
              onSubmitEditing={() => handleSubmit()}
              placeholder={i18n.t(msg`Collection name`)}
              testID="collection.creator.name"
              value={values.name}
            />
            <Button
              testID="collection.creator.cta"
              onPress={() => handleSubmit()}
            >
              {isSubmitting ? (
                <Trans>Submitting</Trans>
              ) : (
                <Trans>Create collection</Trans>
              )}
            </Button>
          </>
        )}
      </Formik>
    </View>
  )
}
