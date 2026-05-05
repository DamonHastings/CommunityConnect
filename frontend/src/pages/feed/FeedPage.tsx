import { useFeed } from '../../hooks/useFeed'
import { FeedItem } from '../../components/feed/FeedItem'
import { Activity } from 'lucide-react'

export function FeedPage() {
  const { data, isLoading } = useFeed()
  const items = data?.feed ?? []

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Activity className="h-6 w-6 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Activity Feed</h1>
      </div>

      {isLoading && (
        <div className="flex h-48 items-center justify-center text-gray-400">Loading feed…</div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center text-gray-400">
          <Activity className="mx-auto mb-2 h-8 w-8 opacity-40" />
          <p className="text-sm">No recent activity yet. Check back as the platform grows.</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {items.map(item => (
          <FeedItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
