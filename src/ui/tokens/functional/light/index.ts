import { merge } from 'lodash'
import common from '../common'
import color from './color'

const light = {
  color,
} as const

export default merge(common, light)
