import { database } from '@/data'

export default async function isOnboardingComplete() {
  const { onboarded } =
    (await database.query.user.findFirst({
      columns: {
        onboarded: true,
      },
    })) ?? {}

  return Boolean(onboarded)
}
