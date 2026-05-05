import { useState, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

interface MultiSelectChipInputProps {
  label?: string
  value: string[]
  onChange: (val: string[]) => void
  options?: string[]
  placeholder?: string
  error?: string
  id?: string
}

export function MultiSelectChipInput({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  id,
}: MultiSelectChipInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  const filtered = (options ?? []).filter(
    (opt) =>
      !value.includes(opt) &&
      opt.toLowerCase().includes(inputValue.toLowerCase())
  )

  function addChip(raw: string) {
    const trimmed = raw.trim()
    if (!trimmed || value.includes(trimmed)) return
    onChange([...value, trimmed])
    setInputValue('')
    setIsOpen(false)
    setActiveIndex(-1)
  }

  function removeChip(chip: string) {
    onChange(value.filter((v) => v !== chip))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && filtered[activeIndex]) {
        addChip(filtered[activeIndex])
      } else {
        addChip(inputValue)
      }
    } else if (e.key === ',') {
      e.preventDefault()
      addChip(inputValue)
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (options && filtered.length > 0) {
        setIsOpen(true)
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setInputValue(val)
    setIsOpen(val.length > 0 && (options?.length ?? 0) > 0)
    setActiveIndex(-1)
  }

  function handleContainerBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsOpen(false)
      setActiveIndex(-1)
      if (inputValue.trim()) addChip(inputValue)
    }
  }

  function handleOptionMouseDown(opt: string) {
    addChip(opt)
  }

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-secondary">
          {label}
        </label>
      )}
      <div
        ref={containerRef}
        onBlur={handleContainerBlur}
        onClick={() => inputRef.current?.focus()}
        className={cn(
          'relative flex min-h-[38px] w-full flex-wrap items-center gap-1.5 rounded-lg border border-border px-2 py-1.5 shadow-sm',
          'cursor-text focus-within:border-primary focus-within:ring-1 focus-within:ring-primary',
          error && 'border-danger focus-within:border-danger focus-within:ring-danger'
        )}
      >
        {value.map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center gap-1 rounded-full bg-primary-subtle px-2.5 py-0.5 text-xs font-medium text-primary"
          >
            {chip}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeChip(chip) }}
              aria-label={`Remove ${chip}`}
              className="rounded-full hover:text-indigo-900 focus:outline-none"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id={inputId}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className="min-w-[120px] flex-1 bg-transparent text-sm placeholder:text-muted focus:outline-none"
        />

        {isOpen && filtered.length > 0 && (
          <ul
            role="listbox"
            className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-auto rounded-lg border border-border bg-surface shadow-dropdown"
          >
            {filtered.map((opt, i) => (
              <li
                key={opt}
                role="option"
                aria-selected={i === activeIndex}
                onMouseDown={() => handleOptionMouseDown(opt)}
                className={cn(
                  'cursor-pointer px-3 py-2 text-sm',
                  i === activeIndex ? 'bg-primary-subtle text-primary' : 'text-secondary hover:bg-bg'
                )}
              >
                {opt}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-danger-text">{error}</p>}
    </div>
  )
}
