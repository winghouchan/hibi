import List from './List'
import ListItem from './ListItem'

type NoteListWithItem = typeof List & { Item: typeof ListItem }

const NoteList = List as NoteListWithItem

NoteList.Item = ListItem

export default NoteList
