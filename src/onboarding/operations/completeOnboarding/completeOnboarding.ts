import { eq } from 'drizzle-orm'
import { database, tracer } from '@/data/database'
import { user } from '@/user/schema'

async function completeOnboarding() {
  return await database.transaction(async (transaction) => {
    const { id: userId } =
      (await transaction.query.user.findFirst({ columns: { id: true } })) ?? {}

    if (userId === undefined) {
      return await transaction
        .insert(user)
        .values({ onboarded: true })
        .returning()
    }

    return await transaction
      .update(user)
      .set({ onboarded: true })
      .where(eq(user.id, userId))
      .returning()
  })
}

export default tracer.withSpan(
  { name: 'completeOnboarding' },
  completeOnboarding,
)
