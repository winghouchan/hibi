import { Card, Text } from '@/ui'
import { noteField } from '../../schema'

type Props = {
  fields: (typeof noteField.$inferSelect)[][]
}

export default function ListItem({ fields }: Props) {
  return (
    <Card>
      {fields[0].map((field) => (
        <Text key={field.id}>{field.value}</Text>
      ))}
      {fields[1].map((field) => (
        <Text key={field.id}>{field.value}</Text>
      ))}
    </Card>
  )
}
