'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface UseSpeechRecognitionOptions {
  onResult?: (transcript: string) => void
  onError?: (error: string) => void
  continuous?: boolean
  interimResults?: boolean
  language?: string
}

interface SpeechRecognitionHook {
  isListening: boolean
  isSupported: boolean
  transcript: string
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
}

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

export function useSpeechRecognition({
  onResult,
  onError,
  continuous = true,
  interimResults = true,
  language = 'en-US',
}: UseSpeechRecognitionOptions = {}): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Check if browser supports speech recognition
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    setIsSupported(!!SpeechRecognitionAPI)

    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI()
      recognitionRef.current.continuous = continuous
      recognitionRef.current.interimResults = interimResults
      recognitionRef.current.lang = language
    }
  }, [continuous, interimResults, language])

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      onError?.('Speech recognition not supported')
      return
    }

    setTranscript('')

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interimTranscript += result[0].transcript
        }
      }

      const currentTranscript = finalTranscript || interimTranscript
      setTranscript(currentTranscript)
      
      if (finalTranscript && onResult) {
        onResult(finalTranscript)
      }
    }

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false)
      onError?.(event.error || 'Speech recognition error')
    }

    recognitionRef.current.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current.onstart = () => {
      setIsListening(true)
    }

    try {
      recognitionRef.current.start()
    } catch (error) {
      onError?.('Failed to start speech recognition')
    }
  }, [onResult, onError])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
  }, [])

  return {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
  }
}
