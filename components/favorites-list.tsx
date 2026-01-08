import type { ConversionResult } from '@/types/conversion'
import ConversionItem from '@/components/conversion-item'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface FavoritesListProps {
  favorites: ConversionResult[]
}

export default function FavoritesList({ favorites }: FavoritesListProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Favorites</CardTitle>
      </CardHeader>
      <CardContent>
        {favorites.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No favorites yet. Star a conversion to add it to your favorites!
          </p>
        ) : (
          <div className="space-y-3">
            {favorites.map((item) => (
              <ConversionItem key={item.id} item={item} showDelete={false} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
