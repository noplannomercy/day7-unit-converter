import { getHistory, getFavorites } from '@/app/actions/conversions'
import ConverterForm from '@/components/converter-form'
import HistoryList from '@/components/history-list'
import FavoritesList from '@/components/favorites-list'

export default async function Home() {
  // IMPORTANT: Fetch data in parallel with Promise.all for better performance
  const [history, favorites] = await Promise.all([
    getHistory(),
    getFavorites(),
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Unit Converter
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Convert between length, weight, and temperature units
          </p>
        </header>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Converter Form (takes 2 columns on large screens) */}
          <div className="lg:col-span-2">
            <ConverterForm />
          </div>

          {/* Right Column - History and Favorites */}
          <div className="lg:col-span-1 space-y-6">
            <FavoritesList favorites={favorites} />
            <HistoryList history={history} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          Built with Next.js 16, Prisma, and shadcn/ui
        </footer>
      </div>
    </div>
  )
}
