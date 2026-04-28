export default function Loading() {
  return (
    <div className="flex flex-col gap-4 p-10 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48" />
      <div className="h-4 bg-gray-100 rounded w-64" />
      <div className="mt-4">
        <div className="h-[52px] bg-gray-200 rounded-[12px] w-full mb-4" />
        <div className="h-[300px] bg-gray-100 rounded-[16px] w-full" />
      </div>
    </div>
  );
}