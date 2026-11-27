export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="skeleton h-9 w-56" />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="skeleton hidden h-96 lg:block" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:col-span-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="skeleton aspect-square !rounded-none" />
              <div className="space-y-2 p-4">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
                <div className="skeleton h-5 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
