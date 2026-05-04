import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useConversations, useStartConversation } from '../../hooks/useMessages'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardBody } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { formatDate } from '../../lib/utils'
import { MessageSquare } from 'lucide-react'

export function MessagesPage() {
  const { user } = useAuth()
  const { data, isLoading } = useConversations()
  const startConversation = useStartConversation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const composeUserId = searchParams.get('compose')

  useEffect(() => {
    if (!composeUserId || !user) return
    const recipientId = Number(composeUserId)
    if (isNaN(recipientId) || recipientId === user.id) return

    startConversation.mutate(recipientId, {
      onSuccess: (conv) => {
        navigate(`/messages/${conv.id}`, { replace: true })
      },
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [composeUserId])

  const conversations = data?.conversations ?? []

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-200" />)}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Messages</h1>

      {conversations.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center">
            <MessageSquare className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-gray-500">No conversations yet. Message a professional or organization contact to get started.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const other = conv.participants.find((p) => p.id !== user?.id) ?? conv.participants[0]
            return (
              <Link key={conv.id} to={`/messages/${conv.id}`}>
                <Card className="transition-shadow hover:shadow-md cursor-pointer">
                  <CardBody className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{other?.name ?? 'Unknown'}</p>
                        {conv.unread_count > 0 && (
                          <Badge variant="info">{conv.unread_count} new</Badge>
                        )}
                      </div>
                      {conv.last_message && (
                        <p className="mt-0.5 text-sm text-gray-500 truncate">{conv.last_message.body}</p>
                      )}
                    </div>
                    {conv.last_message && (
                      <p className="shrink-0 text-xs text-gray-400">{formatDate(conv.last_message.created_at)}</p>
                    )}
                  </CardBody>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
