export default function AdminUsersLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-7 w-24 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-64 bg-gray-100 rounded" />
      </div>
      {[4, 10].map((rows, idx) => (
        <div key={idx} className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="h-5 w-48 bg-gray-200 rounded mb-1" />
            <div className="h-3 w-24 bg-gray-100 rounded" />
          </div>
          <div className="divide-y divide-gray-100">
            {Array.from({ length: rows }).map((_, r) => (
              <div key={r} className="px-6 py-4 grid grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, c) => (
                  <div key={c} className="h-4 bg-gray-100 rounded" />
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
