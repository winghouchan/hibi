import {
  and,
  asc,
  desc,
  eq,
  getTableColumns,
  gte,
  inArray,
  lte,
} from 'drizzle-orm'
import { Collection, collectionToNote } from '@/collections/schema'
import { database, tracer } from '@/data/database'
import { Note, note, noteField } from '../../schema'

type CollectionToNote = typeof collectionToNote.$inferSelect

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

  const limit = pagination?.limit ?? PAGINATION_DEFAULT_LIMIT

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
    .orderBy(order?.id === 'desc' ? desc(note.id) : asc(note.id))
    .limit(limit + 1)

  return {
    cursor: {
      next: notes.length < limit ? undefined : notes[notes.length - 1].id,
    },
    notes: await Promise.all(
      notes
        .toSpliced(notes.length < limit ? notes.length : -1)
        .map(async (noteData) => {
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
