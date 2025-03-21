import { useLingui } from '@lingui/react/macro'
import { useEffect, useRef } from 'react'
import { Alert } from 'react-native'

export default function useHandleNonExistentNote(
  noteExists: boolean,
  onAcknowledgement?: () => void,
) {
  const { t: translate } = useLingui()
  const alertVisible = useRef(false)

  useEffect(() => {
    if (!noteExists && !alertVisible.current) {
      alertVisible.current = true

      Alert.alert(translate`The note doesn't exist`, '', [
        {
          text: translate`OK`,
          style: 'default',
          onPress: () => {
            onAcknowledgement?.()
          },
        },
      ])
    }
  }, [noteExists, onAcknowledgement, translate])
}
