// Shown while admin/applications/page.tsx fetches paginated data.
export default function AdminApplicationsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-7 w-36 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-64 bg-gray-100 rounded" />
      </div>

      {/* Filter tabs + search */}
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 w-20 bg-gray-100 rounded-full" />
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 10 }).map((_, r) => (
            <div key={r} className="px-6 py-4 grid grid-cols-7 gap-4">
              {Array.from({ length: 7 }).map((_, c) => (
                <div key={c} className="h-4 bg-gray-100 rounded" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
