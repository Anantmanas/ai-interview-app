'use client'

import { useState, useCallback } from 'react'

interface UseSpeechSynthesisOptions {
  rate?: number
  pitch?: number
  volume?: number
  voice?: string
}

interface SpeechSynthesisHook {
  isSpeaking: boolean
  isSupported: boolean
  speak: (text: string) => void
  stop: () => void
  pause: () => void
  resume: () => void
}

export function useSpeechSynthesis({
  rate = 1,
  pitch = 1,
  volume = 1,
  voice: preferredVoice,
}: UseSpeechSynthesisOptions = {}): SpeechSynthesisHook {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const getVoice = useCallback(() => {
    if (!isSupported) return null
    
    const voices = window.speechSynthesis.getVoices()
    
    // Try to find the preferred voice
    if (preferredVoice) {
      const found = voices.find(v => v.name.toLowerCase().includes(preferredVoice.toLowerCase()))
      if (found) return found
    }
    
    // Default to an English voice
    const englishVoice = voices.find(v => v.lang.startsWith('en'))
    return englishVoice || voices[0] || null
  }, [isSupported, preferredVoice])

  const speak = useCallback((text: string) => {
    if (!isSupported) return

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = volume

    const selectedVoice = getVoice()
    if (selectedVoice) {
      utterance.voice = selectedVoice
    }

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }, [isSupported, rate, pitch, volume, getVoice])

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [isSupported])

  const pause = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.pause()
    }
  }, [isSupported])

  const resume = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.resume()
    }
  }, [isSupported])

  return {
    isSpeaking,
    isSupported,
    speak,
    stop,
    pause,
    resume,
  }
}
