export default function DashboardApplicationsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-40 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-32 bg-gray-100 rounded" />
        </div>
        <div className="h-10 w-36 bg-gray-200 rounded-lg" />
      </div>
      <div className="card overflow-hidden">
        <div className="divide-y divide-gray-100">
          <div className="px-6 py-3 bg-gray-50 grid grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, c) => (
              <div key={c} className="h-3 bg-gray-200 rounded" />
            ))}
          </div>
          {Array.from({ length: 10 }).map((_, r) => (
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
