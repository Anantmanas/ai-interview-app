'use client'
import { useState, useEffect, useRef } from 'react'

interface TypewriterInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholders: string[]   // array of placeholder strings to cycle through
  typingSpeed?: number     // ms per character (default 60)
  pauseDuration?: number   // ms to hold complete string (default 1800)
}

export function TypewriterInput({
  placeholders,
  typingSpeed = 60,
  pauseDuration = 1800,
  className = '',
  onFocus,
  onBlur,
  ...props
}: TypewriterInputProps) {
  const [displayPlaceholder, setDisplayPlaceholder] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const phIndex = useRef(0)
  const charIndex = useRef(0)
  const isDeleting = useRef(false)
  const timer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isFocused) return // stop animation when user is typing
    if (!placeholders?.length) return

    const tick = () => {
      const current = placeholders[phIndex.current]
      if (!isDeleting.current) {
        // Typing
        charIndex.current++
        setDisplayPlaceholder(current.slice(0, charIndex.current))
        if (charIndex.current === current.length) {
          isDeleting.current = true
          timer.current = setTimeout(tick, pauseDuration)
          return
        }
      } else {
        // Deleting
        charIndex.current--
        setDisplayPlaceholder(current.slice(0, charIndex.current))
        if (charIndex.current === 0) {
          isDeleting.current = false
          phIndex.current = (phIndex.current + 1) % placeholders.length
        }
      }
      timer.current = setTimeout(tick, isDeleting.current ? typingSpeed / 2 : typingSpeed)
    }

    timer.current = setTimeout(tick, typingSpeed)
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [isFocused, placeholders, typingSpeed, pauseDuration])

  return (
    <div className="relative">
      <input
        {...props}
        placeholder={isFocused ? '' : displayPlaceholder}
        onFocus={(e) => { setIsFocused(true); onFocus?.(e) }}
        onBlur={(e) => { setIsFocused(false); onBlur?.(e) }}
        className={`w-full bg-[#232225] border border-[#2b292d] rounded-[6px] px-4 py-3 font-body text-[14px] text-[#eeeef0] transition-all duration-150 focus:outline-none focus:border-[#71d083] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(113,208,131,0.12)] placeholder:text-[#49474e] placeholder:font-mono placeholder:text-[13px] ${className}`}
      />
      {/* Cursor blink shown when focused and empty */}
      {isFocused && !(props.value as string)?.length && (
        <span
          aria-hidden="true"
          className="cursor-blink pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-[16px] w-[2px] rounded-full bg-[#71d083]"
        />
      )}
    </div>
  )
}
