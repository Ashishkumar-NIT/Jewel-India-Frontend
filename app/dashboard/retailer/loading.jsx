export default function Loading() {
  return (
    <div className="flex flex-col gap-8 p-10 animate-pulse">
      <div className="flex flex-col gap-1">
        <div className="h-8 bg-gray-200 rounded w-56" />
        <div className="h-4 bg-gray-100 rounded w-72 mt-2" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-white rounded-[16px] border border-gray-100 shadow-sm" />
        ))}
      </div>
      <div className="h-64 bg-white rounded-[16px] border border-gray-100" />
    </div>
  );
}
