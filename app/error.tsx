'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">
            Something went wrong!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            An error occurred while loading the Unit Converter. Please try again.
          </p>
          {error.message && (
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <p className="text-sm font-mono text-gray-700 dark:text-gray-300">
                {error.message}
              </p>
            </div>
          )}
          <Button
            onClick={reset}
            className="w-full"
            aria-label="Try again"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
