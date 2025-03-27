import {
  and,
  asc,
  desc,
  eq,
  getTableColumns,
  gt,
  gte,
  inArray,
  lt,
  lte,
} from 'drizzle-orm'
import { collection, collectionToNote } from '@/collections/schema'
import { database, tracer } from '@/data/database'
import { note, noteField } from '../../schema'

type Collection = typeof collection.$inferSelect
type CollectionToNote = typeof collectionToNote.$inferSelect
type Note = typeof note.$inferSelect

function isNoteColumn(column: string): column is keyof Note {
  return column in note
}

function isCollectionToNoteColumn(
  column: string,
): column is keyof CollectionToNote {
  return column in collectionToNote
}

type Options = {
  filter?: {
    [Key in keyof Note]?: Note[Key][]
  } & {
    collection?: Collection['id'][]
  }
  order?: {
    id?: 'asc' | 'desc'
  }
  pagination?: {
    cursor?: number
    limit?: number
  }
}

const PAGINATION_DEFAULT_LIMIT = 10

async function getNotes({ filter, order, pagination }: Options = {}) {
  const filterConditions = filter
    ? Object.entries(filter).reduce<ReturnType<typeof inArray | typeof eq>[]>(
        (conditions, [key, value]) => {
          if (isNoteColumn(key)) {
            return [...conditions, inArray(note[key], value)]
          } else if (isCollectionToNoteColumn(key)) {
            return [
              ...conditions,
              inArray(collectionToNote[key], value as number[]),
            ]
          } else {
            return conditions
          }
        },
        [],
      )
    : []

  const notes = await database
    .select(getTableColumns(note))
    .from(note)
    .innerJoin(collectionToNote, eq(note.id, collectionToNote.note))
    .where(
      and(
        pagination?.cursor
          ? order?.id === 'desc'
            ? lte(note.id, pagination.cursor)
            : gte(note.id, pagination.cursor)
          : undefined,
        ...filterConditions,
      ),
    )
    .limit(pagination?.limit ?? PAGINATION_DEFAULT_LIMIT)
    .orderBy(order?.id === 'desc' ? desc(note.id) : asc(note.id))

  return {
    cursor: {
      next:
        notes.length > 0
          ? (
              await database
                .select({ id: note.id })
                .from(note)
                .innerJoin(collectionToNote, eq(note.id, collectionToNote.note))
                .where(
                  and(
                    order?.id === 'desc'
                      ? lt(note.id, notes[notes.length - 1].id)
                      : gt(note.id, notes[notes.length - 1].id),
                    ...filterConditions,
                  ),
                )
                .orderBy(order?.id === 'desc' ? desc(note.id) : asc(note.id))
                .limit(1)
            ).at(0)?.id
          : undefined,
    },
    notes: await Promise.all(
      notes.map(async (noteData) => {
        const noteFieldData = await database
          .select()
          .from(noteField)
          .where(eq(noteField.note, noteData.id))

        return {
          ...noteData,
          fields: noteFieldData.reduce<(typeof noteFieldData)[]>(
            (state, field) => {
              const newState = [...state]

              if (newState[field.side]) {
                newState[field.side].push(field)
              } else {
                newState[field.side] = [field]
              }

              return newState
            },
            [],
          ),
        }
      }),
    ),
  }
}

export default tracer.withSpan({ name: 'getNotes' }, getNotes)
