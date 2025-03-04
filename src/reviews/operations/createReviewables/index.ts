import * as schema from '@/notes/schema'

interface Note extends Pick<typeof schema.note.$inferSelect, 'id'> {
  fields: (typeof schema.noteField.$inferSelect)[]
}

interface CreateReviewablesParameters {
  config: {
    reversible: boolean
    separable: boolean
  }
  note: Note
}

type CreateReviewablesReturn = {
  note: (typeof schema.note.$inferSelect)['id']
  fields: {
    field: (typeof schema.noteField.$inferSelect)['id']
    side: (typeof schema.noteField.$inferSelect)['side']
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
 * - `separable`: when set to `true`, every field can be combined with another
 *   field in a prompt/answer relationship.
 *
 * Examples below, where each letter represents a field, the left hand side of
 * the arrow represents the note to create reviewables from, the right hand side
 * of the arrow represents the reviewables created from the note, the first
 * position of each tuple represents the prompt and the second position of each
 * tuple represents the answer:
 *
 * ```
 * // reversible: false, separable: false
 * [A, B]   -> [A, B]
 * [A, BC]  -> [A, BC]
 * [A, BCD] -> [A, BCD]
 * [AB, CD] -> [AB, CD]
 *
 * // reversible: true, separable: false
 * [A, B]   -> [A, B] [B, A]
 * [A, BC]  -> [A, BC] [BC, A]
 * [A, BCD] -> [A, BCD] [BCD, A]
 * [AB, CD] -> [AB, CD] [CD, AB]
 *
 * // reversible: false, separable: true
 * [A, B]   -> [A, B]
 * [A, BC]  -> [A, B] [A, C]
 * [A, BCD] -> [A, B] [A, C] [A, D]
 * [AB, CD] -> [AB, C] [AB, D]
 *
 * // reversible: true, separable: true
 * [A, B]   -> [A, B] [B, A]
 * [A, BC]  -> [A, B] [A, C] [B, A] [B, C] [C, A] [C, B]
 * [A, BCD] -> [A, B] [A, C] [A, D] [B, A] [B, C] [B, D] [C, A] [C, B] [C, D] [D, A] [D, B] [D, C]
 * [AB, CD] -> [AB, C] [AB, D] [C, AB] [C, D] [D, AB] [D, C]
 * ```
 */
export default function createReviewables({
  config: { reversible, separable },
  note: { id, fields },
}: CreateReviewablesParameters): CreateReviewablesReturn {
  const [front, back] = fields.reduce<
    (typeof schema.noteField.$inferSelect)[][]
  >((state, field) => {
    state[field.side] = [...(state[field.side] ?? []), field]

    return state
  }, [])

  if (separable) {
    return back.flatMap((field) => [
      {
        note: id,
        fields: [
          ...front.map((field) => ({ field: field.id, side: 0 })),
          { field: field.id, side: 1 },
        ],
      },
      ...(reversible
        ? [
            {
              note: id,
              fields: [
                { field: field.id, side: 0 },
                ...front.map((field) => ({ field: field.id, side: 1 })),
              ],
            },
            ...back.reduce<CreateReviewablesReturn>(
              (state, field2) =>
                field.id !== field2.id
                  ? [
                      ...state,
                      {
                        note: id,
                        fields: [
                          { field: field.id, side: 0 },
                          { field: field2.id, side: 1 },
                        ],
                      },
                    ]
                  : state,
              [],
            ),
          ]
        : []),
    ])
  } else {
    return [
      {
        note: id,
        fields: fields.map((field) => ({ field: field.id, side: field.side })),
      },
      ...(reversible
        ? [
            {
              note: id,
              fields: [
                ...back.map((field) => ({ field: field.id, side: 0 })),
                ...front.map((field) => ({ field: field.id, side: 1 })),
              ],
            },
          ]
        : []),
    ]
  }
}
