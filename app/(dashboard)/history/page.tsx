import { redirect } from 'next/navigation'

export default function DeprecatedHistoryPage() {
  redirect('/dashboard/history')
}
