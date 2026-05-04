import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useConversation, useSendMessage } from '../../hooks/useMessages'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { ArrowLeft, Send } from 'lucide-react'
import { formatDate } from '../../lib/utils'

export function ConversationPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { data, isLoading } = useConversation(id)
  const send = useSendMessage(id!)
  const [body, setBody] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const messages = data?.messages ?? []
  const conversation = data?.conversation

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = () => {
    const trimmed = body.trim()
    if (!trimmed) return
    send.mutate(trimmed, {
      onSuccess: () => setBody(''),
    })
  }

  const other = conversation?.participants.find((p) => p.id !== user?.id) ?? conversation?.participants[0]

  if (isLoading) return <div className="h-48 animate-pulse rounded-xl bg-gray-200" />
  if (!conversation) return <div className="py-16 text-center text-gray-500">Conversation not found.</div>

  return (
    <div className="mx-auto flex max-w-2xl flex-col" style={{ height: 'calc(100vh - 10rem)' }}>
      <div className="mb-4 flex items-center gap-3">
        <Link to="/messages" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">{other?.name ?? 'Conversation'}</h1>
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-gray-400">No messages yet. Say hello!</p>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender.id === user?.id
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-indigo-600 text-white' : 'bg-white text-gray-900 border border-gray-200'}`}>
                {!isMe && <p className="mb-0.5 text-xs font-medium text-gray-500">{msg.sender.name}</p>}
                <p className="whitespace-pre-wrap">{msg.body}</p>
                <p className={`mt-0.5 text-xs ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>{formatDate(msg.created_at)}</p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 flex gap-2">
        <textarea
          className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
          rows={2}
          placeholder="Type a message…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
        />
        <Button disabled={!body.trim() || send.isPending} onClick={handleSend}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
