import hash from 'sha.js'
import { noteField } from '../schema'

const ALGORITHM = 'sha256'
const ENCODING = 'base64'

export default function hashNoteFieldValue(
  value: (typeof noteField.$inferInsert)['value'],
) {
  return hash(ALGORITHM).update(value).digest(ENCODING)
}
