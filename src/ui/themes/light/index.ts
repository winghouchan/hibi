import { merge } from 'lodash'
import base from '../base'
import colors from './colors'

const light = {
  colors,
} as const

export default merge(base, light)
