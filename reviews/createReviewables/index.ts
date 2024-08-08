import { schema } from '@/notes'
import { InferSelectModel } from 'drizzle-orm'

interface Note extends Pick<InferSelectModel<typeof schema.note>, 'id'> {
  fields: InferSelectModel<typeof schema.noteField>[]
}

interface CreateReviewablesParameters {
  config: {
    reversible: boolean
    reviewFieldsSeparately: boolean
  }
  note: Note
}

type CreateReviewablesReturn = {
  note: InferSelectModel<typeof schema.note>['id']
  fields: {
    field: InferSelectModel<typeof schema.noteField>['id']
  }[]
}[]

/**
 * Creates 'reviewables' from a note.
 *
 * Reviewables are a combination of the note's fields where one field is shown
 * as a prompt and the other field(s) are the answer. The combinations created
 * are dependent on two variables in the configuration:
 *
 * - `reversible`: when set to `true`, the field(s) designated as the 'back' can
 *   be used as a prompt.
 * - `reviewFieldsSeparately`: when set to `true`,  very field can be combined
 *   with another field in a prompt/answer relationship.
 *
 * Examples below, where each letter represents a field, the left hand side of
 * the arrow represents the note to create reviewables from, the right hand side
 * of the arrow represents the reviewables created from the note, the first
 * position of each tuple represents the prompt and the second position of each
 * tuple represents the answer:
 *
 * ```
 * // reversible: false, reviewFieldsSeparately: false
 * [A, B]   -> [A, B]
 * [A, BC]  -> [A, BC]
 * [A, BCD] -> [A, BCD]
 *
 * // reversible: true, reviewFieldsSeparately: false
 * [A, B]   -> [A, B] [B, A]
 * [A, BC]  -> [A, BC] [BC, A]
 * [A, BCD] -> [A, BCD] [BCD, A]
 *
 * // reversible: false, reviewFieldsSeparately: true
 * [A, B]   -> [A, B]
 * [A, BC]  -> [A, B] [A, C]
 * [A, BCD] -> [A, B] [A, C] [A, D]
 *
 * // reversible: true, reviewFieldsSeparately: true
 * [A, B]   -> [A, B] [B, A]
 * [A, BC]  -> [A, B] [A, C] [B, A] [B, C] [C, A] [C, B]
 * [A, BCD] -> [A, B] [A, C] [A, D] [B, A] [B, C] [B, D] [C, A] [C, B] [C, D] [D, A] [D, B] [D, C]
 * ```
 */
export default function createReviewables({
  config: { reversible, reviewFieldsSeparately },
  note: { id, fields },
}: CreateReviewablesParameters): CreateReviewablesReturn {
  if (reviewFieldsSeparately) {
    if (reversible) {
      return fields.reduce<CreateReviewablesReturn>(
        (accumulator, current, _, array) => [
          ...accumulator,
          ...array.reduce<CreateReviewablesReturn>(
            (accumulator2, current2) =>
              current.id === current2.id
                ? accumulator2
                : [
                    ...accumulator2,
                    {
                      note: id,
                      fields: [{ field: current.id }, { field: current2.id }],
                    },
                  ],
            [],
          ),
        ],
        [],
      )
    } else {
      const [front, ...back] = fields

      return back.map((field) => ({
        note: id,
        fields: [{ field: front.id }, { field: field.id }],
      }))
    }
  } else {
    const [front, ...back] = fields

    return [
      {
        note: id,
        fields: fields.map((field) => ({ field: field.id })),
      },
      ...(reversible
        ? [
            {
              note: id,
              fields: [
                ...back.map((field) => ({ field: field.id })),
                { field: front.id },
              ],
            },
          ]
        : []),
    ]
  }
}
