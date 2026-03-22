import type { ConversionResult } from '@/types/conversion'
import ConversionItem from '@/components/conversion-item'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface HistoryListProps {
  history: ConversionResult[]
}

export default function HistoryList({ history }: HistoryListProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Recent History</CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No conversion history yet. Start by converting some units!
          </p>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <ConversionItem key={item.id} item={item} showDelete={true} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
