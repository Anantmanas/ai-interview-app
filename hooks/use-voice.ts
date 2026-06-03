'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseVoiceReturn {
  isRecording: boolean
  transcript: string
  startRecording: () => void
  stopRecording: () => void
  resetTranscript: () => void
  isSupported: boolean
}

export function useVoice(): UseVoiceReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(true)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setIsSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      let currentTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript
      }
      setTranscript(currentTranscript)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognitionRef.current = recognition
  }, [])

  const startRecording = useCallback(() => {
    if (recognitionRef.current && !isRecording) {
      setTranscript('')
      recognitionRef.current.start()
      setIsRecording(true)
    }
  }, [isRecording])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  const resetTranscript = useCallback(() => {
    setTranscript('')
  }, [])

  return {
    isRecording,
    transcript,
    startRecording,
    stopRecording,
    resetTranscript,
    isSupported
  }
}
