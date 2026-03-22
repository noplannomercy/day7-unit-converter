'use client'

import { useTransition } from 'react'
import { toggleFavorite, deleteConversion } from '@/app/actions/conversions'
import type { ConversionResult } from '@/types/conversion'
import { Button } from '@/components/ui/button'

interface ConversionItemProps {
  item: ConversionResult
  showDelete?: boolean
}

export default function ConversionItem({
  item,
  showDelete = true,
}: ConversionItemProps) {
  const [isPending, startTransition] = useTransition()

  // Handle toggle favorite
  const handleToggleFavorite = () => {
    startTransition(async () => {
      await toggleFavorite(item.id)
    })
  }

  // Handle delete
  const handleDelete = () => {
    startTransition(async () => {
      await deleteConversion(item.id)
    })
  }

  // Format timestamp
  const formattedDate = new Date(item.createdAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-1">
          {/* Conversion Display */}
          <div className="font-medium text-lg">
            {item.value} {item.fromUnit} → {item.result.toFixed(6)} {item.toUnit}
          </div>

          {/* Formula */}
          <div className="text-sm text-gray-600">{item.formula}</div>

          {/* Category and Timestamp */}
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <span className="capitalize">{item.category}</span>
            <span>•</span>
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleFavorite}
            disabled={isPending}
            aria-label={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className="hover:scale-110 transition-transform"
          >
            {item.isFavorite ? '⭐' : '☆'}
          </Button>

          {/* Delete Button */}
          {showDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isPending}
              aria-label="Delete conversion"
              className="hover:text-red-600 transition-colors"
            >
              🗑️
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
