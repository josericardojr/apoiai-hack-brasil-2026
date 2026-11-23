import { useEffect, useMemo, useRef, useState } from 'react'
import { Mic, MicOff, Sparkles, Send, Loader2, Clock, Gauge, Tags, HeartHandshake, ShieldAlert, PhoneCall, Lock, X, Wand2, CalendarClock, Check, HandHeart, MessageSquarePlus } from 'lucide-react'
import { useApp } from '../AppContext.js'
import { CATEGORIES, ME } from '../data.js'
import { CAT_ICON } from '../icons.js'
import { triage } from '../lib/triage.js'
import { fmtCredit, fmtMinutes } from '../lib/format.js'

const TEMPLATES = [
  { label: 'Regar as plantas', text: 'Vou viajar no fim de semana e preciso de alguém para regar as plantas da minha casa.', frequency: 'pontual' },
  { label: 'Passear com o cão', text: 'Preciso de ajuda toda segunda-feira para passear com o cão na praça aqui perto.', frequency: 'recorrente' },
  { label: 'Ir à farmácia', text: 'Preciso que alguém vá à farmácia buscar meu remédio de pressão hoje à tarde.', frequency: 'pontual' },
  { label: 'Ir a uma consulta', text: 'Preciso de companhia para ir a uma consulta médica amanhã de manhã.', frequency: 'pontual' },
  { label: 'Pegar carona', text: 'Preciso pegar uma carona solidária ida e volta para a fisioterapia na terça-feira às 9h.', frequency: 'pontual' },
  { label: 'Trocar lâmpada', text: 'Preciso de ajuda para trocar uma lâmpada queimada na sala esta semana.', frequency: 'pontual' },
]

const EXAMPLE = 'Preciso de ajuda para configurar o aplicativo do banco no meu celular novo hoje à tarde'
const URGENCIES = ['Baixa', 'Moderada', 'Alta']

export function detectFrequencyFromText(raw = '') {
  const s = String(raw || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

  if (!s) return 'pontual'

  const recurringRegex =
    /(tod[oa]s?\s+(as\s+|os\s+)?(segunda|terca|quarta|quinta|sexta|sabado|domingo|semanas?|meses?|manhas?|tardes?|noites?|dias?)|toda\s+(segunda|terca|quarta|quinta|sexta)(\s|-)?feira|recorrente|regularmente|diariamente|semanalmente|mensalmente|quinzenal|todo\s+fim\s+de\s+semana|todos?\s+os\s+finais\s+de\s+semana|sempre\s+que|toda\s+vez\s+que|de\s+rotina)/i

  return recurringRegex.test(s) ? 'recorrente' : 'pontual'
}

function getSpeechRecognitionCtor() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

export default function Pedir() {
  const { publishRequest, notify } = useApp()
  const [mode, setMode] = useState('pedir')

  const [text, setText] = useState('')
  const [submittedText, setSubmittedText] = useState('')
  const [frequency, setFrequency] = useState('pontual')
  const [freqManual, setFreqManual] = useState(false)
  const [listening, setListening] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [forceCat, setForceCat] = useState(null)
  const [forceUrg, setForceUrg] = useState(null)

  const [offerText, setOfferText] = useState('')
  const [offerCat, setOfferCat] = useState('companhia')
  const [offerCatManual, setOfferCatManual] = useState(false)
  const [offerFreqManual, setOfferFreqManual] = useState(false)
  const [offerFreq, setOfferFreq] = useState('pontual')
  const [offerListening, setOfferListening] = useState(false)

  const recognitionRef = useRef(null)
  const transcriptRef = useRef('')

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop()
      } catch {
        /* ignore */
      }
    }
  }, [])

  const handleTextChange = (val) => {
    setText(val)
    if (!val.trim()) {
      setFreqManual(false)
      setFrequency('pontual')
      return
    }
    const detected = detectFrequencyFromText(val)
    if (!freqManual || detected === 'recorrente') {
      setFrequency(detected)
      if (detected === 'recorrente') setFreqManual(false)
    }
  }

  const runAnalysis = (sourceText, freqValue, catOverride) => {
    const clean = sourceText.trim()
    if (clean.length < 4) {
      setAnalysis(null)
      setAnalyzing(false)
      return
    }
    setAnalyzing(true)
    setTimeout(() => {
      const base = triage(clean, false, catOverride)
      const unrecognized = !catOverride && (!base || base.lowConfidence || !base.category || base.category === 'outros')
      setAnalysis({
        ...base,
        cleanText: clean,
        category: catOverride || (unrecognized ? 'outros' : base.category),
        unrecognized,
        frequency: freqValue,
      })
      setAnalyzing(false)
    }, 250)
  }

  useEffect(() => {
    if (!submittedText) return
    runAnalysis(submittedText, frequency, forceCat)
  }, [submittedText, frequency, forceCat])

  const view = useMemo(() => (analysis ? { ...analysis, urgency: forceUrg ?? analysis.urgency } : null), [analysis, forceUrg])

  const reset = () => {
    try {
      recognitionRef.current?.stop()
    } catch {
      /* ignore */
    }
    transcriptRef.current = ''
    setListening(false)
    setText('')
    setSubmittedText('')
    setAnalysis(null)
    setForceCat(null)
    setForceUrg(null)
    setFrequency('pontual')
    setFreqManual(false)
  }

  const analyzeOfferText = (rawText, preserveManual = true) => {
    const clean = String(rawText || '').trim()
    if (clean.length < 3) return
    const res = triage(clean, false, null)
    const detectedFreq = detectFrequencyFromText(clean)
    if (!preserveManual || !offerCatManual) {
      setOfferCat(res.category || 'outros')
    }
    if (!preserveManual || !offerFreqManual || detectedFreq === 'recorrente') {
      setOfferFreq(detectedFreq)
      if (detectedFreq === 'recorrente') setOfferFreqManual(false)
    }
  }

  const handleOfferOk = () => {
    const clean = offerText.trim()
    if (!clean) return
    setOfferCatManual(false)
    setOfferFreqManual(false)
    analyzeOfferText(clean, false)
    notify('Categoria e frequência identificadas. Você pode ajustar se preferir.')
  }

  const handleOk = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    const detected = detectFrequencyFromText(trimmed)
    const nextFreq = detected === 'recorrente' ? 'recorrente' : freqManual ? frequency : detected
    setFrequency(nextFreq)
    setForceCat(null)
    setSubmittedText(trimmed)
  }

  const setNewText = (t, freq) => {
    setText(t)
    setForceCat(null)
    setForceUrg(null)
    const detected = detectFrequencyFromText(t)
    const nextFreq = freq || detected
    setFrequency(nextFreq)
    setFreqManual(!!freq)
    setSubmittedText(t.trim())
  }

  const stopMic = () => {
    try {
      recognitionRef.current?.stop()
    } catch {
      /* ignore */
    }
  }

  const startMic = (target = 'pedir') => {
    const isTargetOffer = target === 'ofertar'
    const currentlyListening = isTargetOffer ? offerListening : listening

    if (currentlyListening) {
      stopMic()
      return
    }

    const SpeechRec = getSpeechRecognitionCtor()
    if (!SpeechRec) {
      notify('Seu navegador não oferece reconhecimento de voz direto aqui. Digite o texto normalmente.')
      return
    }

    try {
      recognitionRef.current?.stop()
    } catch {
      /* ignore */
    }

    transcriptRef.current = ''
    if (!isTargetOffer) {
      setSubmittedText('')
      setAnalysis(null)
      setFreqManual(false)
    }

    const rec = new SpeechRec()
    rec.lang = 'pt-BR'
    rec.interimResults = true
    rec.maxAlternatives = 1

    rec.onstart = () => {
      if (isTargetOffer) setOfferListening(true)
      else setListening(true)
    }

    rec.onresult = (event) => {
      let finalChunk = ''
      let interimChunk = ''
      for (let i = 0; i < event.results.length; i++) {
        const res = event.results[i]
        const piece = res[0]?.transcript || ''
        if (res.isFinal) finalChunk += piece
        else interimChunk += piece
      }
      const combined = `${finalChunk} ${interimChunk}`.replace(/\s+/g, ' ').trim()
      transcriptRef.current = combined
      if (isTargetOffer) {
        setOfferText(combined)
      } else {
        setText(combined)
        if (combined) {
          setFrequency(detectFrequencyFromText(combined))
        }
      }
    }

    rec.onerror = (event) => {
      setListening(false)
      setOfferListening(false)
      if (event?.error === 'not-allowed' || event?.error === 'service-not-allowed') {
        notify('Permissão de microfone negada. Ative o microfone no navegador ou digite o texto.')
      } else if (event?.error === 'no-speech') {
        notify('Nenhuma fala detectada. Tente falar novamente ou digite o texto.')
      } else {
        notify('Não foi possível capturar a fala agora. Você pode digitar normalmente.')
      }
    }

    rec.onend = () => {
      setListening(false)
      setOfferListening(false)
      const spoken = transcriptRef.current.trim()
      if (!isTargetOffer && spoken.length >= 4) {
        const detected = detectFrequencyFromText(spoken)
        setFrequency(detected)
        setForceCat(null)
        setSubmittedText(spoken)
        notify('Fala transcrita. Confira a organização ou toque em OK.')
      } else if (isTargetOffer && spoken.length >= 4) {
        setOfferCatManual(false)
        setOfferFreqManual(false)
        analyzeOfferText(spoken, false)
        notify('Fala transcrita e categoria identificada.')
      }
    }

    recognitionRef.current = rec
    try {
      rec.start()
    } catch {
      setListening(false)
      setOfferListening(false)
      notify('Não foi possível iniciar o microfone. Verifique as permissões do navegador.')
    }
  }

  const publish = () => {
    if (!view) return
    publishRequest({
      kind: 'pedido',
      frequency,
      text: view.cleanText,
      category: view.category,
      urgency: view.urgency,
      when: view.when ?? (frequency === 'recorrente' ? 'Apoio recorrente combinado' : 'Quando alguém puder'),
      minutes: view.minutes,
      hours: view.credits,
    })
    reset()
  }

  const publishOffer = (e) => {
    e.preventDefault()
    const cleanOffer = offerText.trim()
    if (cleanOffer.length < 4) return
    const info = triage(cleanOffer, false, offerCat)
    publishRequest({
      kind: 'oferta',
      frequency: offerFreq,
      text: cleanOffer,
      category: offerCat || 'outros',
      urgency: 'Baixa',
      when: 'Disponibilidade conforme o perfil',
      minutes: info.minutes || 40,
      hours: info.credits || 0.75,
    })
    setOfferText('')
    setMode('pedir')
  }

  const CatIcon = view ? CAT_ICON[view.category] || Sparkles : null
  const OfferCatIcon = CAT_ICON[offerCat] || HandHeart

  return (
    <div className="space-y-5 px-4 pb-8 pt-4">
      <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Escolher entre pedir ou ofertar ajuda">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'pedir'}
          onClick={() => {
            stopMic()
            setMode('pedir')
          }}
          className={`flex min-h-[2.85rem] w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-[1rem] font-bold transition-colors ${
            mode === 'pedir'
              ? 'bg-primary-strong text-on-primary'
              : 'bg-surface text-ink hover:bg-primary-soft'
          }`}
          style={{ border: 'var(--bw) solid rgb(var(--c-line))' }}
        >
          <MessageSquarePlus size={19} aria-hidden="true" /> Pedir
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'ofertar'}
          onClick={() => {
            stopMic()
            setMode('ofertar')
          }}
          className={`flex min-h-[2.85rem] w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-[1rem] font-bold transition-colors ${
            mode === 'ofertar'
              ? 'bg-secondary text-on-secondary'
              : 'bg-surface text-ink hover:bg-secondary-soft'
          }`}
          style={{ border: 'var(--bw) solid rgb(var(--c-line))' }}
        >
          <HandHeart size={19} aria-hidden="true" /> Ofertar
        </button>
      </div>

      {mode === 'ofertar' ? (
        <section className="space-y-4" aria-label="Ofertar ajuda na vizinhança">
          <header>
            <h1 className="font-display text-[1.7rem] font-bold leading-tight">Ofertar ajuda</h1>
            <p className="mt-1 text-[1.02rem] leading-snug text-muted">
              Compartilhe o que você pode oferecer para os vizinhos no mural do bairro.
            </p>
          </header>

          <form onSubmit={publishOffer} className="card space-y-4 p-4">
            <div>
              <label htmlFor="oferta-texto" className="mb-2 block text-[1.1rem] font-bold">
                Como você pode ajudar?
              </label>
              <div className="relative">
                <textarea
                  id="oferta-texto"
                  rows={4}
                  value={offerText}
                  onChange={(e) => {
                    const v = e.target.value
                    setOfferText(v)
                    if (!v.trim()) {
                      setOfferCatManual(false)
                      setOfferFreqManual(false)
                      setOfferFreq('pontual')
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleOfferOk()
                    }
                  }}
                  placeholder="Ex.: Posso dar carona à tarde ou ajudar com celular e WhatsApp..."
                  className="field resize-none text-[1.05rem] leading-relaxed"
                  readOnly={offerListening}
                />
                {offerText && !offerListening && (
                  <button
                    type="button"
                    onClick={() => {
                      setOfferText('')
                      setOfferCatManual(false)
                      setOfferFreqManual(false)
                      setOfferFreq('pontual')
                    }}
                    aria-label="Limpar oferta"
                    className="absolute right-2 top-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface hover:bg-primary-soft"
                    style={{ border: '1px solid rgb(var(--c-edge))' }}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleOfferOk}
                disabled={!offerText.trim() || offerListening}
                className="btn btn-primary mt-3 w-full !min-h-[3.25rem] text-[1.05rem]"
              >
                <Check size={20} aria-hidden="true" /> OK — analisar oferta
              </button>

              <button
                type="button"
                onClick={() => startMic('ofertar')}
                aria-pressed={offerListening}
                className={`btn mt-2.5 w-full text-[1.05rem] ${offerListening ? 'btn-danger animate-ring' : 'btn-secondary'} !min-h-[3.25rem]`}
              >
                {offerListening ? (
                  <>
                    <MicOff size={20} aria-hidden="true" /> Ouvindo sua oferta... toque para encerrar
                  </>
                ) : (
                  <>
                    <Mic size={22} aria-hidden="true" /> Falar minha oferta
                  </>
                )}
              </button>
            </div>

            <div>
              <label htmlFor="oferta-cat" className="mb-1.5 block text-sm font-bold uppercase tracking-wide text-muted">
                Categoria
              </label>
              <div className="flex items-center gap-2">
                <OfferCatIcon size={22} className="shrink-0 text-secondary" aria-hidden="true" />
                <select
                  id="oferta-cat"
                  value={offerCat}
                  onChange={(e) => { setOfferCat(e.target.value); setOfferCatManual(true) }}
                  className="field !py-2 text-[1rem] font-bold"
                >
                  {CATEGORIES.filter((c) => !['todos', 'urgente'].includes(c.id)).map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-sm font-bold uppercase tracking-wide text-muted">Frequência da oferta</p>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Frequência da oferta">
                <button
                  type="button"
                  role="radio"
                  aria-checked={offerFreq === 'pontual'}
                  onClick={() => { setOfferFreq('pontual'); setOfferFreqManual(true) }}
                  className={`chip justify-center ${offerFreq === 'pontual' ? 'chip-on' : ''}`}
                >
                  Ajuda pontual
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={offerFreq === 'recorrente'}
                  onClick={() => { setOfferFreq('recorrente'); setOfferFreqManual(true) }}
                  className={`chip justify-center ${offerFreq === 'recorrente' ? 'chip-on' : ''}`}
                >
                  Apoio recorrente
                </button>
              </div>
            </div>


            <p className="flex items-center gap-2 text-sm text-muted">
              <Lock size={15} className="shrink-0" aria-hidden="true" /> Vizinhos veem distância aproximada e o bloco de {ME.first} - nunca o endereço exato.
            </p>

            <button
              type="submit"
              disabled={offerText.trim().length < 4 || offerListening}
              className="btn btn-secondary w-full !min-h-[3.5rem] text-[1.1rem]"
            >
              <Send size={22} aria-hidden="true" /> Publicar oferta no mural
            </button>
          </form>
        </section>
      ) : (
        <>
          <header className="flex items-center gap-2.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary-strong" style={{ border: 'var(--bw) solid rgb(var(--c-primary) / .35)' }}>
              <MessageSquarePlus size={22} aria-hidden="true" />
            </span>
            <div>
              <h1 className="font-display text-[1.7rem] font-bold leading-tight">Pedir ajuda</h1>
              <p className="mt-0.5 text-[1rem] leading-snug text-muted">
                Escreva ou fale o que precisa e toque em OK. Identificamos se é ajuda pontual ou apoio recorrente e você pode ajustar se quiser.
              </p>
            </div>
          </header>

          <section className="card p-4" aria-label="Descreva seu pedido">
            <label htmlFor="pedido" className="mb-2 block text-[1.1rem] font-bold">
              O que você precisa?
            </label>
            <div className="relative">
              <textarea
                id="pedido"
                rows={5}
                value={text}
                onChange={(e) => handleTextChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleOk()
                  }
                }}
                placeholder="Ex.: Preciso de ajuda toda segunda-feira para passear com o cão..."
                className="field resize-none text-[1.1rem] leading-relaxed"
                readOnly={listening}
              />
              {text && !listening && (
                <button type="button" onClick={reset} aria-label="Limpar texto" className="absolute right-2 top-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface hover:bg-primary-soft" style={{ border: '1px solid rgb(var(--c-edge))' }}>
                  <X size={18} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleOk}
              disabled={!text.trim() || listening}
              className="btn btn-primary mt-3 w-full !min-h-[3.25rem] text-[1.08rem]"
            >
              <Check size={22} aria-hidden="true" /> OK — analisar pedido
            </button>

            <button
              type="button"
              onClick={() => startMic('pedir')}
              aria-pressed={listening}
              aria-label={listening ? 'Parar gravação de voz' : 'Falar meu pedido'}
              className={`btn mt-2.5 w-full text-[1.1rem] ${listening ? 'btn-danger animate-ring' : 'btn-secondary'} !min-h-[3.5rem]`}
            >
              {listening ? (
                <>
                  <span className="flex h-6 items-center gap-1" aria-hidden="true">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span key={i} className="h-full w-1 origin-center animate-wave rounded bg-current" style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </span>
                  Ouvindo sua fala... toque para encerrar
                  <MicOff size={20} aria-hidden="true" />
                </>
              ) : (
                <>
                  <Mic size={26} aria-hidden="true" /> Falar meu pedido
                </>
              )}
            </button>

            <div className="mt-4 flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-muted">Frequência do pedido:</span>
              <div className="flex gap-1.5" role="radiogroup" aria-label="Frequência do pedido">
                <button
                  type="button"
                  role="radio"
                  aria-checked={frequency === 'pontual'}
                  onClick={() => {
                    setFrequency('pontual')
                    setFreqManual(true)
                  }}
                  className={`chip !min-h-[2.25rem] !px-3 text-xs ${frequency === 'pontual' ? 'chip-on' : ''}`}
                >
                  Ajuda pontual
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={frequency === 'recorrente'}
                  onClick={() => {
                    setFrequency('recorrente')
                    setFreqManual(true)
                  }}
                  className={`chip !min-h-[2.25rem] !px-3 text-xs ${frequency === 'recorrente' ? 'chip-on' : ''}`}
                >
                  Apoio recorrente
                </button>
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">Exemplo rápido</p>
              <button type="button" className="chip !h-auto !min-h-[2.75rem] w-full !justify-start !whitespace-normal !rounded-2xl py-2 text-left" onClick={() => setNewText(EXAMPLE, 'pontual')}>
                <Wand2 size={18} className="shrink-0 text-primary-strong" aria-hidden="true" />
                "{EXAMPLE}"
              </button>
            </div>
          </section>

          <section aria-label="Modelos prontos">
            <h2 className="mb-2 text-[1.1rem] font-bold">Modelos prontos <span className="font-normal text-muted">(1 toque)</span></h2>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <button key={t.label} type="button" className="chip" onClick={() => setNewText(t.text, t.frequency)}>
                  {t.label}
                </button>
              ))}
            </div>
          </section>

          {(analysis || analyzing) && (
            <section className="card animate-fade-up overflow-hidden !border-primary-strong" style={{ borderWidth: '2px' }} aria-label="Prévia do pedido" aria-live="polite">
              <div className="flex items-center gap-2 bg-primary-strong px-4 py-2.5 text-on-primary">
                <Sparkles size={20} aria-hidden="true" />
                <h2 className="font-bold">Organização do pedido</h2>
                {analyzing && <Loader2 size={18} className="ml-auto animate-spin" aria-label="Analisando" />}
              </div>

              {!view ? (
                <div className="space-y-2 p-4" aria-hidden="true">
                  {[70, 55, 85].map((w) => (
                    <div key={w} className="h-6 animate-pulse rounded bg-edge/30" style={{ width: `${w}%` }} />
                  ))}
                </div>
              ) : (
                <div className={`space-y-4 p-4 transition-opacity ${analyzing ? 'opacity-60' : ''}`}>
                  {view.emergency && (
                    <div role="alert" className="rounded-xl bg-danger p-3 text-on-danger">
                      <p className="flex items-center gap-2 font-bold">
                        <ShieldAlert size={20} aria-hidden="true" /> Isso parece uma emergência de saúde.
                      </p>
                      <p className="mt-1 text-[0.95rem]">
                        O Apoiaí não substitui atendimento médico. Ligue agora: <b>SAMU 192</b> · <b>Bombeiros 193</b> · <b>Polícia 190</b>.
                      </p>
                      <a href="tel:192" className="btn mt-2 w-full bg-on-danger text-danger">
                        <PhoneCall size={20} aria-hidden="true" /> Ligar para o SAMU (192)
                      </a>
                    </div>
                  )}

                  <dl className="grid gap-3">
                    <div>
                      <dt className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted">
                        <Tags size={16} aria-hidden="true" /> Categoria
                      </dt>
                      <dd className="mt-1.5">
                        <label className="sr-only" htmlFor="cat-sel">Alterar categoria</label>
                        <div className="flex items-center gap-2">
                          {CatIcon && <CatIcon size={24} className="shrink-0 text-primary-strong" aria-hidden="true" />}
                          <select
                            id="cat-sel"
                            className="field !py-2 text-[1.05rem] font-bold"
                            value={view.category}
                            onChange={(e) => setForceCat(e.target.value)}
                          >
                            {CATEGORIES.filter((c) => !['todos', 'urgente'].includes(c.id)).map((c) => (
                              <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                          </select>
                        </div>
                        <p className="mt-1 text-sm text-muted">
                          {view.category === 'outros'
                            ? 'Classificado em Outros: a descrição aberta ajuda quem vai prestar auxílio a entender exatamente o que você precisa.'
                            : 'Você pode ajustar a categoria se preferir.'}
                        </p>
                      </dd>
                    </div>

                    <div>
                      <dt className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted">
                        <Gauge size={16} aria-hidden="true" /> Urgência
                      </dt>
                      <dd className="mt-1.5 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Urgência">
                        {URGENCIES.map((u) => (
                          <button
                            key={u}
                            type="button"
                            role="radio"
                            aria-checked={view.urgency === u}
                            onClick={() => setForceUrg(u)}
                            className={`chip justify-center !px-2 ${view.urgency === u ? (u === 'Alta' ? '!bg-danger !text-on-danger !border-danger' : 'chip-on') : ''}`}
                          >
                            {u}
                          </button>
                        ))}
                      </dd>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-primary-soft p-3">
                        <dt className="flex items-center gap-1.5 text-sm font-bold text-muted">
                          <Clock size={16} aria-hidden="true" /> Tempo estimado
                        </dt>
                        <dd className="mt-1 text-xl font-bold leading-tight">{fmtMinutes(view.minutes)}</dd>
                      </div>
                      <div className="rounded-xl bg-secondary-soft p-3">
                        <dt className="flex items-center gap-1.5 text-sm font-bold text-muted">
                          <HeartHandshake size={16} aria-hidden="true" /> Reconhecimento
                        </dt>
                        <dd className="mt-1 text-xl font-bold leading-tight text-secondary">{fmtCredit(view.credits)}</dd>
                      </div>
                    </div>

                    <div>
                      <dt className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-muted">
                        <CalendarClock size={16} aria-hidden="true" /> Frequência e prazo
                      </dt>
                      <dd className="mt-1 flex flex-wrap items-center gap-2 text-[1.05rem] font-semibold">
                        <span className="pill pill-green">
                          {frequency === 'recorrente' ? 'Apoio recorrente' : 'Ajuda pontual'}
                        </span>
                        <span>{view.when ?? (frequency === 'recorrente' ? 'Combinado recorrente na vizinhança' : 'Quando alguém puder')}</span>
                      </dd>
                    </div>
                  </dl>

                  <p className="flex items-center gap-2 text-sm text-muted">
                    <Lock size={15} className="shrink-0" aria-hidden="true" /> Vizinhos veem distância aproximada e o bloco de {ME.first} - nunca o endereço exato.
                  </p>

                  <button type="button" className="btn btn-primary w-full !min-h-[3.5rem] text-[1.1rem]" onClick={publish} disabled={analyzing}>
                    <Send size={22} aria-hidden="true" /> Publicar no mural do bairro
                  </button>
                </div>
              )}
            </section>
          )}

          {!analysis && !analyzing && (
            <p className="rounded-xl p-4 text-center text-[0.95rem] text-muted" style={{ border: '2px dashed rgb(var(--c-edge))' }}>
              Escreva ou fale seu pedido e toque em OK para ver a organização antes de publicar.
            </p>
          )}
        </>
      )}
    </div>
  )
}