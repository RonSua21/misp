// Shown instantly while admin/page.tsx fetches its 7 parallel DB queries.
export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Page title */}
      <div>
        <div className="h-7 w-48 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-72 bg-gray-100 rounded" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card p-5">
            <div className="w-10 h-10 rounded-xl bg-gray-200 mb-3" />
            <div className="h-7 w-12 bg-gray-200 rounded mb-1.5" />
            <div className="h-3 w-full bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      {/* Recent applications table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="h-5 w-40 bg-gray-200 rounded" />
        </div>
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 5 }).map((_, r) => (
            <div key={r} className="px-6 py-4 grid grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, c) => (
                <div key={c} className="h-4 bg-gray-100 rounded" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
