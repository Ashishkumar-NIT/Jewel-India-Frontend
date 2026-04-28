export default function Loading() {
  return (
    <div className="flex flex-col gap-6 p-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48" />
      <div className="h-4 bg-gray-100 rounded w-64" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-[16px] border border-gray-200 bg-white overflow-hidden">
            <div className="aspect-square bg-gray-100" />
            <div className="p-4 flex flex-col gap-2">
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-3 bg-gray-50 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}