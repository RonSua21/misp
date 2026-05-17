export default function DashboardApplicationsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-40 bg-white/15 rounded mb-2" />
          <div className="h-4 w-32 bg-white/10 rounded" />
        </div>
        <div className="h-10 w-36 bg-white/15 rounded-lg" />
      </div>
      <div className="card overflow-hidden">
        <div className="divide-y divide-white/10">
          <div className="px-6 py-3 bg-white/5 grid grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, c) => (
              <div key={c} className="h-3 bg-white/15 rounded" />
            ))}
          </div>
          {Array.from({ length: 10 }).map((_, r) => (
            <div key={r} className="px-6 py-4 grid grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, c) => (
                <div key={c} className="h-4 bg-white/10 rounded" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


