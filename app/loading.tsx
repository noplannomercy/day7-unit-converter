export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Skeleton */}
        <header className="mb-8 text-center">
          <div className="h-10 w-64 bg-gray-300 dark:bg-gray-700 rounded-lg mx-auto mb-2 animate-pulse" />
          <div className="h-6 w-96 bg-gray-200 dark:bg-gray-600 rounded-lg mx-auto animate-pulse" />
        </header>

        {/* Main Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Converter Form Skeleton */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse">
              <div className="h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded mb-6" />
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 dark:bg-gray-600 rounded" />
                <div className="h-10 bg-gray-200 dark:bg-gray-600 rounded" />
                <div className="h-10 bg-gray-200 dark:bg-gray-600 rounded" />
                <div className="h-10 bg-gray-200 dark:bg-gray-600 rounded" />
                <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse">
              <div className="h-6 w-32 bg-gray-300 dark:bg-gray-700 rounded mb-4" />
              <div className="space-y-3">
                <div className="h-20 bg-gray-200 dark:bg-gray-600 rounded" />
                <div className="h-20 bg-gray-200 dark:bg-gray-600 rounded" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse">
              <div className="h-6 w-32 bg-gray-300 dark:bg-gray-700 rounded mb-4" />
              <div className="space-y-3">
                <div className="h-20 bg-gray-200 dark:bg-gray-600 rounded" />
                <div className="h-20 bg-gray-200 dark:bg-gray-600 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
