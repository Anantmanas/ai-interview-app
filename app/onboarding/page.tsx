import type { Metadata } from 'next'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'

export const metadata: Metadata = {
  title: 'Welcome — Set Up Your Profile | InterviewAI',
  description: 'Tell us about your target role and companies so we can personalise your interview experience.',
}

export default function OnboardingPage() {
  return <OnboardingWizard />
}
