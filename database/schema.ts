import { schema as collectionSchema } from '@/collections'

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
} satisfies Record<string, unknown>

export default schema
