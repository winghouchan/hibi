import { schema as collectionSchema } from '@/collections'
import { schema as noteSchema } from '@/notes'
import { schema as reviewSchema } from '@/reviews'

/**
 * Database schema. Import and spread individual schemas into the object below.
 * Example:
 *
 * ```
 * import { schema as featureASchema } from '@/featureA'
 * import { schema as featureBSchema } from '@/featureB'
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
