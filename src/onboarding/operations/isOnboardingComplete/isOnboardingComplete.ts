import { database, tracer } from '@/data/database'

async function isOnboardingComplete() {
  const { onboarded } =
    (await database.query.user.findFirst({
      columns: {
        onboarded: true,
      },
    })) ?? {}

  return Boolean(onboarded)
}

export default tracer.withSpan(
  { name: 'isOnboardingComplete' },
  isOnboardingComplete,
)
