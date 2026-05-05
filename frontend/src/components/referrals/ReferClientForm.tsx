import { useState, useEffect, useRef } from 'react'
import { useSendReferral } from '../../hooks/useReferrals'
import { useUserSearch } from '../../hooks/useUserSearch'
import { Button } from '../ui/Button'
import { UserCheck } from 'lucide-react'

interface Props {
  senderOrgId: number
  targetType: 'Program' | 'Organization'
  targetId: number
  targetName: string
}

export function ReferClientForm({ senderOrgId, targetType, targetId, targetName }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedEmail, setSelectedEmail] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [message, setMessage] = useState('')
  const send = useSendReferral(senderOrgId)
  const { data: searchData } = useUserSearch(query)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const suggestions = searchData?.users ?? []
  const email = selectedEmail || query

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSend = () => {
    if (!email.trim()) return
    send.mutate(
      { referred_user_email: email.trim(), message: message.trim() || undefined, target_type: targetType, target_id: targetId },
      {
        onSuccess: () => {
          setQuery(''); setSelectedEmail(''); setMessage(''); setOpen(false)
        },
      }
    )
  }

  const handleSelect = (userEmail: string, userName: string) => {
    setSelectedEmail(userEmail)
    setQuery(userName)
    setShowDropdown(false)
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <UserCheck className="mr-1.5 h-4 w-4" />
        Refer a client here
      </Button>
    )
  }

  return (
    <div className="rounded-card border border-border bg-surface p-4 shadow-card space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-heading">
          Refer client to <span className="text-primary">{targetName}</span>
        </p>
        <button onClick={() => setOpen(false)} className="text-xs text-muted hover:text-heading">Cancel</button>
      </div>

      <div className="relative" ref={dropdownRef}>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelectedEmail('')
            setShowDropdown(true)
          }}
          onFocus={() => query.length >= 2 && setShowDropdown(true)}
          placeholder="Search by name or email…"
          className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-heading placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-surface shadow-dropdown">
            {suggestions.map((u) => (
              <button
                key={u.id}
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-bg"
                onClick={() => handleSelect(u.email, u.name)}
              >
                <span className="font-medium text-heading">{u.name}</span>
                <span className="ml-2 text-muted">{u.email}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={2}
        placeholder="Optional message to the client…"
        className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-heading placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
      {send.isError && <p className="text-xs text-danger-text">User not found or referral failed.</p>}
      <Button size="sm" disabled={!email.trim() || send.isPending} onClick={handleSend}>
        {send.isPending ? 'Sending…' : 'Send Referral'}
      </Button>
    </div>
  )
}
