import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCaseloads, useAddToCaseload, useUpdateCaseload, useRemoveFromCaseload } from '../../hooks/useCaseloads'
import { useUserSearch } from '../../hooks/useUserSearch'
import { useStartConversation } from '../../hooks/useMessages'
import { useSendReferral } from '../../hooks/useReferrals'
import { usePrograms } from '../../hooks/usePrograms'
import { useOrganizations } from '../../hooks/useOrganizations'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardBody } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { MapPin, Search, X, MessageSquare, Plus, Archive, Send } from 'lucide-react'
import type { Caseload } from '../../hooks/useCaseloads'

function ReferPanel({ clientId, navigatorOrgId, onClose }: { clientId: number; navigatorOrgId: number; onClose: () => void }) {
  const [targetType, setTargetType] = useState<'program' | 'organization'>('program')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedName, setSelectedName] = useState('')
  const [message, setMessage] = useState('')
  const send = useSendReferral(navigatorOrgId)

  const { data: progsData } = usePrograms({ q: query } as never, )
  const { data: orgsData } = useOrganizations({ q: query })
  const results = targetType === 'program'
    ? (progsData?.programs ?? []).map((p) => ({ id: p.id, name: p.title }))
    : (orgsData?.organizations ?? []).map((o) => ({ id: o.id, name: o.name }))

  function handleSelect(id: number, name: string) {
    setSelectedId(id)
    setSelectedName(name)
    setQuery('')
  }

  function handleSubmit() {
    if (!selectedId) return
    send.mutate(
      { referred_user_id: clientId, target_type: targetType, target_id: selectedId, message: message || undefined },
      { onSuccess: onClose }
    )
  }

  return (
    <div className="mt-3 space-y-3 border-t border-border pt-3">
      <p className="text-xs font-semibold text-heading">Refer to…</p>
      <div className="flex gap-1.5">
        {(['program', 'organization'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTargetType(t); setSelectedId(null); setSelectedName(''); setQuery('') }}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
              targetType === t ? 'border-primary bg-primary text-white' : 'border-border text-secondary hover:border-primary hover:text-primary'
            }`}
          >
            {t === 'program' ? 'Program' : 'Organization'}
          </button>
        ))}
      </div>

      {selectedId ? (
        <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-sm">
          <span className="text-heading">{selectedName}</span>
          <button onClick={() => { setSelectedId(null); setSelectedName('') }} className="text-muted hover:text-heading">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${targetType === 'program' ? 'programs' : 'organizations'}…`}
            className="w-full rounded-lg border border-border bg-surface py-1.5 pl-8 pr-3 text-sm text-heading placeholder:text-muted focus:border-primary focus:outline-none"
          />
          {query.length >= 2 && results.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-white shadow-md">
              {results.slice(0, 6).map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleSelect(r.id, r.name)}
                  className="w-full px-3 py-2 text-left text-sm text-heading hover:bg-surface"
                >
                  {r.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={2}
        placeholder="Optional message for the client…"
        className="w-full rounded-lg border border-border bg-bg px-2.5 py-1.5 text-sm text-heading placeholder:text-muted focus:border-primary focus:outline-none"
      />

      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={!selectedId || send.isPending}>
          <Send className="mr-1 h-3.5 w-3.5" />
          Send referral
        </Button>
        <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  )
}

function CaseloadCard({ caseload, navigatorOrgId, onMessage }: { caseload: Caseload; navigatorOrgId: number; onMessage: (userId: number) => void }) {
  const update = useUpdateCaseload()
  const remove = useRemoveFromCaseload()
  const [editingNotes, setEditingNotes] = useState(false)
  const [notes, setNotes] = useState(caseload.notes ?? '')
  const [showRefer, setShowRefer] = useState(false)
  const location = [caseload.client.city, caseload.client.state].filter(Boolean).join(', ')

  const saveNotes = () => {
    update.mutate({ id: caseload.id, notes })
    setEditingNotes(false)
  }

  return (
    <Card>
      <CardBody className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-heading">{caseload.client.name}</p>
            <p className="text-xs text-muted">{caseload.client.email}</p>
            {location && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                <MapPin className="h-3 w-3" />{location}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Badge variant={caseload.status === 'active' ? 'success' : 'default'}>
              {caseload.status}
            </Badge>
          </div>
        </div>

        {editingNotes ? (
          <div className="space-y-2">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded border border-border bg-bg px-2.5 py-1.5 text-sm text-heading placeholder:text-muted focus:border-primary focus:outline-none"
              placeholder="Add notes about this client…"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={saveNotes} disabled={update.isPending}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => { setNotes(caseload.notes ?? ''); setEditingNotes(false) }}>Cancel</Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setEditingNotes(true)}
            className="block w-full rounded border border-dashed border-border px-2.5 py-1.5 text-left text-xs text-muted hover:border-primary hover:text-primary"
          >
            {caseload.notes || 'Add notes…'}
          </button>
        )}

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onMessage(caseload.client.id)}>
            <MessageSquare className="mr-1 h-3.5 w-3.5" />
            Message
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowRefer(!showRefer)}>
            <Send className="mr-1 h-3.5 w-3.5" />
            Refer
          </Button>
          {caseload.status === 'active' ? (
            <Button size="sm" variant="outline" disabled={update.isPending}
              onClick={() => update.mutate({ id: caseload.id, status: 'closed' })}>
              <Archive className="mr-1 h-3.5 w-3.5" />
              Close
            </Button>
          ) : (
            <Button size="sm" variant="outline" disabled={update.isPending}
              onClick={() => update.mutate({ id: caseload.id, status: 'active' })}>
              Reopen
            </Button>
          )}
          <Button size="sm" variant="outline" disabled={remove.isPending}
            onClick={() => remove.mutate(caseload.id)}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        {showRefer && (
          <ReferPanel
            clientId={caseload.client.id}
            navigatorOrgId={navigatorOrgId}
            onClose={() => setShowRefer(false)}
          />
        )}
      </CardBody>
    </Card>
  )
}

function AddClientPanel({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const { data } = useUserSearch(query)
  const addToCaseload = useAddToCaseload()
  const suggestions = data?.users ?? []

  const handleAdd = (clientId: number) => {
    addToCaseload.mutate({ clientId }, { onSuccess: onClose })
  }

  return (
    <Card>
      <CardBody className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-heading">Add client to caseload</p>
          <button onClick={onClose} className="text-muted hover:text-heading"><X className="h-4 w-4" /></button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-heading placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            autoFocus
          />
        </div>
        {suggestions.length > 0 && (
          <div className="space-y-1">
            {suggestions.map((u) => (
              <button
                key={u.id}
                onClick={() => handleAdd(u.id)}
                className="flex w-full items-center justify-between rounded-lg border border-border bg-bg px-3 py-2 text-left transition hover:border-primary"
              >
                <div>
                  <p className="text-sm font-medium text-heading">{u.name}</p>
                  <p className="text-xs text-muted">{u.email}</p>
                </div>
                <Plus className="h-4 w-4 text-primary" />
              </button>
            ))}
          </div>
        )}
        {query.length >= 2 && suggestions.length === 0 && (
          <p className="text-xs text-muted">No users found.</p>
        )}
      </CardBody>
    </Card>
  )
}

export function CaseloadPage() {
  const { data, isLoading } = useCaseloads(true)
  const caseloads = data?.caseloads ?? []
  const [showAdd, setShowAdd] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'active' | 'closed' | 'all'>('active')
  const startConversation = useStartConversation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const navigatorOrgId = user?.organizations?.[0]?.id ?? 0

  const handleMessage = (userId: number) => {
    startConversation.mutate(userId, {
      onSuccess: (conv) => navigate(`/messages/${conv.id}`),
    })
  }

  const filtered = caseloads.filter((c) => statusFilter === 'all' || c.status === statusFilter)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-heading">My Caseload</h1>
          <p className="mt-1 text-secondary">Track clients you're actively supporting.</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add client
        </Button>
      </div>

      {showAdd && <AddClientPanel onClose={() => setShowAdd(false)} />}

      <div className="flex gap-1.5">
        {(['active', 'closed', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              statusFilter === f
                ? 'bg-primary text-white border-primary'
                : 'border-border text-secondary hover:border-primary hover:text-primary'
            }`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            {' '}
            <span className="opacity-70">
              ({caseloads.filter((c) => f === 'all' || c.status === f).length})
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-card bg-border" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center">
            <p className="text-secondary">
              {statusFilter === 'active'
                ? 'No active clients. Add a client to get started.'
                : 'No clients in this category.'}
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <CaseloadCard key={c.id} caseload={c} navigatorOrgId={navigatorOrgId} onMessage={handleMessage} />
          ))}
        </div>
      )}
    </div>
  )
}
