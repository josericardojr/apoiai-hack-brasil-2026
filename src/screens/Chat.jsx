import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Lock, Send, ShieldCheck, Share2, Flag, Siren, Check, CalendarClock, PhoneCall, CheckCircle2, UserCheck, XCircle, Scale, BellRing, MapPin } from 'lucide-react'
import { useApp } from '../AppContext.js'
import { Avatar, Sheet } from '../components/ui.jsx'
import { CAT_LABEL } from '../data.js'
import { fmtCredit } from '../lib/format.js'

const STEPS = ['Aceite', 'Horário', 'Conclusão']
const QUICK = ['Posso ir agora?', 'Tudo certo por aí?', 'Obrigada!', 'Chego em 10 minutos']
const PLACES = ['Hall do prédio', 'Portaria', 'Área comum']
const REASONS = ['Pediu dinheiro ou pagamento', 'Pediu telefone ou endereço exato', 'Comportamento desrespeitoso', 'Não compareceu ao combinado', 'Outro motivo']

function timeOptions(r) {
  return r.urgency === 'Alta' ? ['Agora mesmo', 'Em 30 minutos', 'Em 1 hora'] : ['Hoje às 16h', 'Amanhã às 10h', 'Sábado às 9h']
}

export default function Chat({ chat, request }) {
  const { closeChat, chatSend, chatSchedule, chatShare, chatReport, chatSOS, requestFinish, profile } = useApp()
  const [draft, setDraft] = useState('')
  const [sheet, setSheet] = useState(null) // 'time' | 'report' | 'sos'
  const [time, setTime] = useState('')
  const [customTime, setCustomTime] = useState('')
  const [place, setPlace] = useState(PLACES[0])
  const [customPlace, setCustomPlace] = useState('')
  const [reason, setReason] = useState(null)
  const endRef = useRef(null)

  const helper = chat.role === 'helper'
  const who = helper ? { name: request.name, age: request.age, f: request.f, hue: request.hue } : chat.helper
  const trusted = profile.trusted.split(/[,(]/)[0].trim() || 'seu contato de confiança'

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [chat.messages.length, chat.typing])

  const submit = (e) => {
    e.preventDefault()
    if (!draft.trim()) return
    chatSend(chat.reqId, draft.trim())
    setDraft('')
  }

  const finalTime = customTime.trim() || time
  const finalPlace = customPlace.trim() || place

  const cta = (() => {
    if (chat.declined) return { label: request?.kind === 'oferta' ? 'Oferta não aceita' : 'Ajuda não aceita', disabled: true }
    if (chat.step === 0)
      return helper
        ? { label: `Aguardando ${who.name} aceitar…`, disabled: true }
        : { label: (request?.kind === 'oferta' ? `Confirmar oferta para ${who.name}` : `Aceitar ajuda de ${who.name}`), run: () => chatSchedule(chat.reqId, { accept: true }), icon: UserCheck }
    if (chat.step === 1) return { label: 'Combinar horário e local', run: () => setSheet('time'), icon: CalendarClock }
    return { label: helper ? 'Concluir ajuda' : 'Confirmar que a ajuda foi concluída', run: () => requestFinish(chat.reqId), icon: CheckCircle2 }
  })()

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-bg" role="dialog" aria-modal="true" aria-label={`Chat seguro com ${who.name}`}>
      <header className="flex shrink-0 items-center gap-2 bg-surface px-2 py-2" style={{ borderBottom: '2px solid rgb(var(--c-line))' }}>
        <button type="button" onClick={closeChat} aria-label="Voltar" className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full hover:bg-primary-soft">
          <ArrowLeft size={26} />
        </button>
        <Avatar name={who.name} hue={who.hue} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold leading-tight">{who.name}, {who.age}</p>
          <p className="flex items-center gap-1 text-[0.8rem] text-secondary"><Lock size={12} aria-hidden="true" /> Chat seguro</p>
        </div>
        <button
          type="button"
          onClick={() => setSheet('sos')}
          aria-label="Emergência"
          className="inline-flex min-h-[2.75rem] shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-bold text-danger hover:bg-danger-soft"
          style={{ border: '2px solid rgb(var(--c-danger))' }}
        >
          <Siren size={18} aria-hidden="true" /> Emergência
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="m-3 rounded-xl bg-primary-soft p-3 text-[0.92rem] leading-snug" style={{ border: 'var(--bw) solid rgb(var(--c-primary) / .5)' }}>
          <p className="font-bold">{CAT_LABEL[request.category] || 'Outro'} • {fmtCredit(request.hours)}</p>
          <p className="mt-0.5 line-clamp-3">{request.text}</p>
          <p className="mt-1 flex items-center gap-1 font-semibold"><MapPin size={14} aria-hidden="true" /> {request.when}</p>
        </div>

        <ol className="mx-3 mb-2 flex items-start justify-between" aria-label="Passos do combinado">
          {STEPS.map((s, i) => {
            const done = chat.step > i
            const current = chat.step === i
            return (
              <li key={s} className="relative flex flex-1 flex-col items-center gap-1 text-center" aria-current={current ? 'step' : undefined}>
                {i > 0 && <span className={`absolute right-1/2 top-[1.1rem] -z-0 h-1 w-full ${chat.step >= i ? 'bg-secondary' : 'bg-edge/40'}`} aria-hidden="true" />}
                <span className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full font-bold ${done ? 'bg-secondary text-on-secondary' : current ? 'bg-primary-strong text-on-primary ring-4 ring-primary/30' : 'bg-surface text-muted'}`} style={{ border: '2px solid rgb(var(--c-edge))' }}>
                  {done ? <Check size={20} /> : i + 1}
                </span>
                <span className={`text-[0.8rem] leading-tight ${current ? 'font-bold' : done ? 'font-semibold text-secondary' : 'text-muted'}`}>
                  {s}
                  {i === 1 && chat.time && <span className="block font-normal">{chat.time}</span>}
                </span>
              </li>
            )
          })}
        </ol>

        <div className="mx-3 mb-3 grid grid-cols-[1fr_auto] gap-2" role="group" aria-label="Opções de segurança">
          <button
            type="button"
            aria-pressed={chat.shared}
            onClick={() => chatShare(chat.reqId, trusted)}
            className={`btn !justify-start text-left text-[0.88rem] ${chat.shared ? 'btn-secondary' : 'btn-outline'}`}
          >
            <Share2 size={20} className="shrink-0" aria-hidden="true" />
            <span>{chat.shared ? `Alerta de emergência ativo para ${trusted} ✓` : 'Compartilhar emergência com contato de confiança'}</span>
          </button>
          <button type="button" onClick={() => setSheet('report')} className="btn btn-outline flex-col !gap-0.5 !px-3 text-[0.8rem]">
            <Flag size={18} aria-hidden="true" /> Reportar
          </button>
        </div>

        <ul className="space-y-2 px-3 pb-3" aria-live="polite" aria-label="Mensagens">
          {chat.messages.map((m) =>
            m.from === 'sys' ? (
              <li key={m.id} className="flex justify-center">
                <p className="flex max-w-[92%] items-start gap-1.5 rounded-xl bg-secondary-soft px-3 py-1.5 text-center text-[0.82rem] font-semibold leading-snug text-secondary" style={{ border: 'var(--bw) solid rgb(var(--c-secondary) / .4)' }}>
                  <ShieldCheck size={14} className="mt-0.5 shrink-0" aria-hidden="true" /> {m.text}
                </p>
              </li>
            ) : (
              <li key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[84%] rounded-2xl px-3.5 py-2 text-[1.02rem] leading-snug ${m.from === 'me' ? 'rounded-br-md bg-primary-strong text-on-primary' : 'rounded-bl-md bg-surface'}`} style={m.from === 'me' ? undefined : { border: 'var(--bw) solid rgb(var(--c-line))' }}>
                  {m.text}
                  <span className="mt-0.5 block text-right text-[0.7rem] opacity-70">{m.t}</span>
                </div>
              </li>
            ),
          )}
          {chat.typing && (
            <li className="flex justify-start" aria-label={`${who.name} está digitando`}>
              <span className="flex gap-1 rounded-2xl rounded-bl-md bg-surface px-4 py-3" style={{ border: 'var(--bw) solid rgb(var(--c-line))' }}>
                {[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-muted" style={{ animationDelay: `${i * 0.15}s` }} />)}
              </span>
            </li>
          )}
          <li ref={endRef} aria-hidden="true" />
        </ul>
      </div>

      <footer className="shrink-0 space-y-2 bg-surface p-3 pb-safe" style={{ borderTop: '2px solid rgb(var(--c-line))' }}>
        <div className={`grid gap-2 ${!helper && chat.step === 0 && !chat.declined ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <button type="button" disabled={cta.disabled} onClick={cta.run} className={`btn w-full !min-h-[3.25rem] text-[1rem] ${cta.disabled ? 'btn-outline' : chat.step === 2 ? 'btn-secondary' : 'btn-primary'}`}>
            {cta.icon && <cta.icon size={20} aria-hidden="true" />}
            {cta.label}
          </button>
          {!helper && chat.step === 0 && !chat.declined && (
            <button
              type="button"
              onClick={() => chatSchedule(chat.reqId, { decline: true })}
              className="btn btn-outline w-full !min-h-[3.25rem] text-[1rem]"
            >
              <XCircle size={20} aria-hidden="true" /> {request?.kind === 'oferta' ? 'Recusar' : 'Não aceitar ajuda'}
            </button>
          )}
        </div>

        <div className="-mx-3 overflow-x-auto px-3 no-scrollbar">
          <div className="flex gap-2">
            {QUICK.map((q) => (
              <button key={q} type="button" className="chip !min-h-[2.25rem] text-sm" onClick={() => chatSend(chat.reqId, q)}>{q}</button>
            ))}
          </div>
        </div>
        <form onSubmit={submit} className="flex gap-2">
          <label htmlFor="msg" className="sr-only">Escreva uma mensagem</label>
          <input id="msg" className="field" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Escreva aqui sua mensagem livre…" autoComplete="off" />
          <button type="submit" className="btn btn-primary shrink-0 !px-4" disabled={!draft.trim()} aria-label="Enviar mensagem"><Send size={22} /></button>
        </form>
        <p className="flex items-center justify-center gap-1.5 text-center text-[0.72rem] leading-tight text-muted">
          <Lock size={11} aria-hidden="true" /> Telefone e endereço exato não aparecem. O contato de confiança recebe apenas alertas de emergência.
        </p>
      </footer>

      {sheet === 'time' && (
        <Sheet title="Combinar data, horário e local" onClose={() => setSheet(null)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="custom-time" className="block font-bold">Data e horário</label>
              <input
                id="custom-time"
                className="field mt-1.5"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                placeholder="Ex.: Segunda-feira às 17h30, 30/11 às 10h…"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {timeOptions(request).map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={time === t && !customTime.trim()}
                    onClick={() => {
                      setTime(t)
                      setCustomTime(t)
                    }}
                    className={`chip !min-h-[2.25rem] text-xs ${customTime === t ? 'chip-on' : ''}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="custom-place" className="block font-bold">Local do encontro</label>
              <input
                id="custom-place"
                className="field mt-1.5"
                value={customPlace}
                onChange={(e) => setCustomPlace(e.target.value)}
                placeholder="Ex.: Banco da praça, portaria do Bloco B, salão térreo…"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {PLACES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={customPlace === p || (!customPlace.trim() && place === p)}
                    onClick={() => {
                      setPlace(p)
                      setCustomPlace(p)
                    }}
                    className={`chip !min-h-[2.25rem] text-xs ${customPlace === p ? 'chip-on' : ''}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={!finalTime}
              className="btn btn-primary mt-2 w-full"
              onClick={() => {
                chatSchedule(chat.reqId, { time: `${finalTime} • ${finalPlace}` })
                setSheet(null)
                setTime('')
                setCustomTime('')
                setCustomPlace('')
              }}
            >
              <CalendarClock size={20} aria-hidden="true" /> Confirmar combinado
            </button>
          </div>
        </Sheet>
      )}

      {sheet === 'report' && (
        <Sheet title="Reportar para a mediação" onClose={() => setSheet(null)}>
          <p className="flex items-start gap-2 text-[0.98rem] leading-snug">
            <Scale size={22} className="mt-0.5 shrink-0 text-primary-strong" aria-hidden="true" />
            Se algo não correu bem, a mediação local analisa o relato em até 2 horas e encerra a conversa com a pessoa.
          </p>
          <div className="mt-4 space-y-2" role="radiogroup" aria-label="Motivo">
            {REASONS.map((r) => (
              <button key={r} type="button" role="radio" aria-checked={reason === r} onClick={() => setReason(r)} className={`btn w-full !justify-start text-left ${reason === r ? 'btn-primary' : 'btn-outline'}`}>
                {r}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={!reason}
            className="btn btn-danger mt-4 w-full"
            onClick={() => {
              chatReport(chat.reqId, reason)
              setSheet(null)
              setReason(null)
            }}
          >
            <Flag size={20} aria-hidden="true" /> Enviar relato e encerrar conversa
          </button>
        </Sheet>
      )}

      {sheet === 'sos' && (
        <Sheet title="Emergência" tone="danger" onClose={() => setSheet(null)}>
          <p className="text-[1.02rem] font-semibold leading-snug">Em caso de urgência médica ou risco imediato, ligue agora.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <a href="tel:192" className="btn btn-danger flex-col !gap-0"><PhoneCall size={22} aria-hidden="true" /> SAMU 192</a>
            <a href="tel:190" className="btn btn-danger flex-col !gap-0"><PhoneCall size={22} aria-hidden="true" /> Polícia 190</a>
          </div>
          <button
            type="button"
            className="btn btn-outline mt-3 w-full text-left"
            onClick={() => {
              chatSOS(chat.reqId, trusted)
              setSheet(null)
            }}
          >
            <BellRing size={20} className="shrink-0" aria-hidden="true" />
            Enviar alerta de emergência para {trusted} e moderação com localização aproximada
          </button>
          <button type="button" className="btn mt-2 w-full text-muted underline" onClick={() => setSheet(null)}>Voltar</button>
        </Sheet>
      )}
    </div>
  )
}