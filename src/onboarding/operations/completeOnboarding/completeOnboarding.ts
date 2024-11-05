import { eq } from 'drizzle-orm'
import { database } from '@/data'
import { user } from '@/user/schema'

export default async function completeOnboarding() {
  return database.transaction((transaction) => {
    const { id: userId } =
      transaction.query.user.findFirst({ columns: { id: true } }).sync() ?? {}

    if (userId === undefined) {
      return transaction.insert(user).values({ onboarded: true }).returning()
    }

    return transaction
      .update(user)
      .set({ onboarded: true })
      .where(eq(user.id, userId))
      .returning()
  })
}
