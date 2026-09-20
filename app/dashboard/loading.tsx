/**
 * Dashboard loading skeleton — displayed by Next.js Suspense while
 * the server component fetches data. Uses the .skeleton shimmer utility.
 */
export default function DashboardLoading() {
  return (
    <div className="p-6 md:p-8 max-w-[1400px] space-y-6">
      {/* Header row skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="skeleton h-2.5 w-40" />
          <div className="skeleton h-9 w-72" />
          <div className="skeleton h-3.5 w-56" />
        </div>
        <div className="skeleton h-10 w-36 rounded-[6px]" />
      </div>

      {/* Resume card skeleton */}
      <div className="card-console p-5">
        <div className="skeleton h-3 w-32 mb-4" />
        <div className="skeleton h-16 w-full" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card-console p-5">
            <div className="skeleton h-3 w-24 mb-4" />
            <div className="skeleton h-8 w-16 mb-2" />
            <div className="skeleton h-2.5 w-20" />
          </div>
        ))}
      </div>

      {/* Two-column section skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent interviews skeleton (2/3 width) */}
        <div className="lg:col-span-2 card-console">
          <div className="flex items-center justify-between p-5 border-b border-[#1a191b]">
            <div className="skeleton h-3 w-32" />
            <div className="skeleton h-3 w-16" />
          </div>
          <div className="space-y-px">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4 border-b border-[#1a191b]">
                <div className="skeleton h-7 w-7 rounded-[4px] flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3 w-48" />
                  <div className="skeleton h-2.5 w-24" />
                </div>
                <div className="skeleton h-5 w-20 rounded-[2px]" />
              </div>
            ))}
          </div>
        </div>

        {/* Right panels skeleton (1/3 width) */}
        <div className="lg:col-span-1 space-y-5">
          {/* Weaknesses skeleton */}
          <div className="card-console">
            <div className="flex items-center justify-between p-5 border-b border-[#1a191b]">
              <div className="skeleton h-3 w-28" />
              <div className="skeleton h-3 w-14" />
            </div>
            <div className="space-y-px">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5 border-b border-[#1a191b]">
                  <div className="flex items-center gap-3">
                    <div className="skeleton h-4 w-4 rounded" />
                    <div className="space-y-1.5">
                      <div className="skeleton h-3 w-28" />
                      <div className="skeleton h-2.5 w-16" />
                    </div>
                  </div>
                  <div className="skeleton h-5 w-14 rounded-[4px]" />
                </div>
              ))}
            </div>
          </div>

          {/* Learning progress skeleton */}
          <div className="card-console p-5 space-y-4">
            <div className="skeleton h-3 w-32 mb-4" />
            <div className="flex items-center justify-between">
              <div className="skeleton h-3 w-28" />
              <div className="skeleton h-3 w-10" />
            </div>
            <div className="skeleton h-2 w-full rounded-full" />
            <div className="skeleton h-2.5 w-36" />
          </div>
        </div>
      </div>
    </div>
  )
}
