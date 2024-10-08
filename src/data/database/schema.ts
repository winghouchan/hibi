import * as collectionSchema from '@/collections/schema'
import * as noteSchema from '@/notes/schema'
import * as reviewSchema from '@/reviews/schema'

/**
 * Database schema. Import and spread individual schemas into the object below.
 * Example:
 *
 * ```
 * import * as featureASchema from '@/featureA/schema'
 * import * as featureBSchema from '@/featureB/schema'
 *
 * const schema = {
 *   ...featureASchema,
 *   ...featureBSchema,
 * }
 * ```
 */
const schema = {
  ...collectionSchema,
  ...noteSchema,
  ...reviewSchema,
} satisfies Record<string, unknown>

export default schema
