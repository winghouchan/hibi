import {
  and,
  asc,
  desc,
  eq,
  getTableColumns,
  gte,
  inArray,
  lte,
  sql,
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

  const notes = database.$with('notes').as(
    database
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
      .limit(limit + 1),
  )

  const noteFields = database.$with('note_fields').as(
    database
      .select({
        note: noteField.note,
        fields: sql`
        json_group_array(
          json_object(
            'id', ${noteField.id},
            'note', ${noteField.note},
            'side', ${noteField.side},
            'position', ${noteField.position},
            'value', ${noteField.value}
          )
        )
      `.as('fields'),
      })
      .from(noteField)
      .where(
        inArray(noteField.note, database.select({ id: notes.id }).from(notes)),
      )
      .groupBy(noteField.note, noteField.side)
      .orderBy(asc(noteField.side), asc(noteField.position)),
  )

  const notesWithFields = await database
    .with(notes, noteFields)
    .select({
      id: notes.id,
      reversible: notes.reversible,
      separable: notes.separable,
      createdAt: notes.createdAt,
      fields: sql`json_group_array(${noteFields.fields})`
        .mapWith({
          mapFromDriverValue: (value) =>
            (JSON.parse(value) as string[]).map((value) => JSON.parse(value)),
        })
        .as('fields'),
    })
    .from(notes)
    .innerJoin(noteFields, eq(notes.id, noteFields.note))
    .groupBy(noteFields.note)
    .orderBy(order?.id === 'desc' ? desc(notes.id) : asc(notes.id))

  return {
    cursor: {
      next:
        notesWithFields.length <= limit
          ? undefined
          : notesWithFields[notesWithFields.length - 1].id,
    },
    notes:
      notesWithFields.length <= limit
        ? notesWithFields
        : notesWithFields.toSpliced(-1),
  }
}

export default tracer.withSpan({ name: 'getNotes' }, getNotes)
