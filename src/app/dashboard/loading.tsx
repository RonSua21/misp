// Shown while dashboard/page.tsx fetches user profile + applications.
export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-56 bg-white/15 rounded mb-2" />
          <div className="h-4 w-72 bg-white/10 rounded" />
        </div>
        <div className="h-10 w-36 bg-white/15 rounded-lg" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/15 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-7 w-10 bg-white/15 rounded" />
              <div className="h-3 w-full bg-white/10 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent applications table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <div className="h-5 w-40 bg-white/15 rounded" />
        </div>
        <div className="divide-y divide-white/10">
          {Array.from({ length: 5 }).map((_, r) => (
            <div key={r} className="px-6 py-4 grid grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, c) => (
                <div key={c} className="h-4 bg-white/10 rounded" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

