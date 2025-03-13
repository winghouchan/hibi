import { and, eq, getTableColumns, inArray } from 'drizzle-orm'
import { RequireAtLeastOne } from 'type-fest'
import { collection, collectionToNote } from '@/collections/schema'
import { database } from '@/data'
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
  filter?: RequireAtLeastOne<
    {
      [Key in keyof Note]: Note[Key] | Note[Key][]
    } & {
      collection: Collection['id'] | Collection['id'][]
    }
  >
}

export default async function getNotes({ filter }: Options = {}) {
  const notes = await database
    .select({
      ...getTableColumns(note),
    })
    .from(note)
    .innerJoin(collectionToNote, eq(note.id, collectionToNote.note))
    .where(
      filter &&
        and(
          ...Object.entries(filter).reduce<
            ReturnType<typeof inArray | typeof eq>[]
          >((conditions, [key, value]) => {
            if (isNoteColumn(key)) {
              return [
                ...conditions,
                Array.isArray(value)
                  ? inArray(note[key], value)
                  : eq(note[key], value),
              ]
            } else if (isCollectionToNoteColumn(key)) {
              return [
                ...conditions,
                Array.isArray(value)
                  ? inArray(collectionToNote[key], value as number[])
                  : eq(collectionToNote[key], value as number),
              ]
            } else {
              return conditions
            }
          }, []),
        ),
    )

  return await Promise.all(
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
  )
}
