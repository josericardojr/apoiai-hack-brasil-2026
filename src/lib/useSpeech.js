import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Leitura em áudio (TTS) com a Web Speech API.
 * Quando o navegador não oferece voz, simula a leitura (estado visual + legenda).
 */
export function useSpeech(onFallback) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [speakingId, setSpeakingId] = useState(null)
  const idRef = useRef(null)
  const timer = useRef(null)

  const stop = useCallback(() => {
    if (supported) window.speechSynthesis.cancel()
    clearTimeout(timer.current)
    idRef.current = null
    setSpeakingId(null)
  }, [supported])

  const speak = useCallback(
    (id, text) => {
      if (idRef.current === id) return stop()
      stop()
      idRef.current = id
      setSpeakingId(id)

      if (supported) {
        const u = new SpeechSynthesisUtterance(text)
        u.lang = 'pt-BR'
        u.rate = 0.9
        const voice = window.speechSynthesis
          .getVoices()
          .find((v) => v.lang?.toLowerCase().startsWith('pt-br')) ??
          window.speechSynthesis.getVoices().find((v) => v.lang?.toLowerCase().startsWith('pt'))
        if (voice) u.voice = voice
        const done = () => {
          if (idRef.current === id) {
            idRef.current = null
            setSpeakingId(null)
          }
        }
        u.onend = done
        u.onerror = done
        window.speechSynthesis.speak(u)
      } else {
        onFallback?.(text)
        timer.current = setTimeout(() => {
          idRef.current = null
          setSpeakingId(null)
        }, Math.min(9000, 1500 + text.length * 45))
      }
    },
    [supported, stop, onFallback],
  )

  useEffect(() => () => stop(), [stop])

  return { speakingId, speak, stop, supported }
}
