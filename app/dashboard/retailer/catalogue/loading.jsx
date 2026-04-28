export default function Loading() {
  return (
    <div className="flex flex-col gap-8 p-10 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <div className="h-8 bg-gray-200 rounded w-56" />
          <div className="h-4 bg-gray-100 rounded w-40 mt-1" />
        </div>
        <div className="h-12 w-40 bg-gray-200 rounded-[10px]" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] bg-white rounded-[12px] border border-gray-100" />
        ))}
      </div>
    </div>
  );
}