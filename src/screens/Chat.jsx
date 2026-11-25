import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Lock, Send, ShieldCheck, Share2, Flag, Siren, Check, CalendarClock, PhoneCall, CheckCircle2, UserCheck, XCircle, Scale, BellRing, MapPin, Star, Award, Users, FileCheck2, Phone, Home as HomeIcon, ChevronRight, Heart } from 'lucide-react'
import { useApp } from '../AppContext.js'
import { Avatar, Sheet, VerifiedBadge } from '../components/ui.jsx'
import { CAT_LABEL } from '../data.js'
import { fmtCredit, phoneDigits } from '../lib/format.js'

const STEPS = ['Aceite', 'Horário', 'Conclusão']
const QUICK = ['Posso ir agora?', 'Tudo certo por aí?', 'Obrigada!', 'Chego em 10 minutos']
const PLACES = ['Hall do prédio', 'Portaria', 'Área comum']
const REASONS = ['Pediu dinheiro ou pagamento', 'Pediu telefone ou endereço exato', 'Comportamento desrespeitoso', 'Não compareceu ao combinado', 'Outro motivo']

function timeOptions(r) {
  return r.urgency === 'Alta' ? ['Agora mesmo', 'Em 30 minutos', 'Em 1 hora'] : ['Hoje às 16h', 'Amanhã às 10h', 'Sábado às 9h']
}

export default function Chat({ chat, request }) {
  const { closeChat, chatSend, chatSchedule, chatShare, chatReport, chatSOS, requestFinish, profile, gratitude } = useApp()
  const [draft, setDraft] = useState('')
  const [sheet, setSheet] = useState(null) // 'time' | 'report' | 'sos' | 'profile'
  const [reviewsLimit, setReviewsLimit] = useState(2)
  const openProfile = () => {
    setReviewsLimit(2)
    setSheet('profile')
  }
  const [time, setTime] = useState('')
  const [customTime, setCustomTime] = useState('')
  const [place, setPlace] = useState(PLACES[0])
  const [customPlace, setCustomPlace] = useState('')
  const [reason, setReason] = useState(null)
  const endRef = useRef(null)

  const helper = chat.role === 'helper'
  const who = helper
    ? {
        name: request.name,
        age: request.age,
        f: request.f,
        hue: request.hue,
        place: request.place,
        validators: request.validators || [],
        seals: request.seals || [],
      }
    : chat.helper
  const muralReviews = (gratitude || []).filter((g) => g.to === who.name)
  const extraReviews = (who.reviews || []).filter((r) => !muralReviews.some((m) => m.text === r.text))
  const whoReviews = [...muralReviews, ...extraReviews]
  const visibleReviews = whoReviews.slice(0, reviewsLimit)
  const remainingReviews = Math.max(0, whoReviews.length - visibleReviews.length)
  const whoValidators = who.validators || []
  const whoSeals = who.seals || []
  const whoRating = who.rating ?? 4.9
  const whoHelpedCount = who.helpedCount ?? Math.max(3, whoValidators.length * 2)
  const canDecide = !helper && chat.step === 0 && !chat.declined
  const trusted = profile.trusted.split(/[,(]/)[0].trim() || 'seu contato de confiança'
  const trustedTel = phoneDigits(profile.trustedPhone)
  const hasTrustedPhone = trustedTel.length >= 10

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
        <button
          type="button"
          onClick={openProfile}
          aria-label={`Ver perfil e verificações de ${who.name}`}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-1 py-1 text-left hover:bg-primary-soft"
        >
          <Avatar name={who.name} hue={who.hue} size={40} age={who.age} female={who.f} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold leading-tight">{who.name}, {who.age}</p>
            <p className="flex items-center gap-1 text-[0.78rem] font-semibold text-primary-strong">
              <ShieldCheck size={12} aria-hidden="true" /> Ver perfil e verificações
            </p>
          </div>
        </button>
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

        {canDecide && (
          <button
            type="button"
            onClick={openProfile}
            className="mx-3 mb-3 flex w-[calc(100%-1.5rem)] items-center gap-3 rounded-xl bg-secondary-soft p-3 text-left transition hover:brightness-95"
            style={{ border: 'var(--bw) solid rgb(var(--c-secondary) / .5)' }}
          >
            <Avatar name={who.name} hue={who.hue} size={44} age={who.age} female={who.f} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-secondary">Conheça quem quer ajudar antes de aceitar</p>
              <p className="mt-0.5 text-[0.85rem] leading-snug text-ink">
                <b>{who.name}</b> • {who.place || 'Vizinhança próxima'} • ★ {String(whoRating).replace('.', ',')} • {whoValidators.length} {whoValidators.length === 1 ? 'validação' : 'validações'}
              </p>
            </div>
            <ChevronRight size={20} className="shrink-0 text-secondary" aria-hidden="true" />
          </button>
        )}

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

      {sheet === 'profile' && (
        <Sheet title={`Perfil de ${who.name}`} onClose={() => setSheet(null)}>
          <div className="space-y-4">
            <div className="flex items-center gap-3.5 rounded-2xl bg-primary-soft p-3.5">
              <Avatar name={who.name} hue={who.hue} size={64} age={who.age} female={who.f} />
              <div className="min-w-0 flex-1">
                <p className="font-display text-xl font-bold leading-tight">{who.name}, {who.age} anos</p>
                <p className="mt-0.5 flex items-center gap-1 text-sm text-muted">
                  <MapPin size={14} aria-hidden="true" /> {who.place || 'Vizinhança próxima'}{who.since ? ` • ${who.since}` : ''}
                </p>
                <div className="mt-1.5">
                  <VerifiedBadge f={who.f} />
                </div>
              </div>
            </div>

            {who.bio && (
              <p className="text-[0.96rem] leading-relaxed text-ink">{who.bio}</p>
            )}

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-surface p-2.5" style={{ border: 'var(--bw) solid rgb(var(--c-line))' }}>
                <p className="flex items-center justify-center gap-1 text-lg font-bold text-primary-strong">
                  <Star size={16} className="fill-current" aria-hidden="true" /> {String(whoRating).replace('.', ',')}
                </p>
                <p className="text-xs text-muted">Avaliação</p>
              </div>
              <div className="rounded-xl bg-surface p-2.5" style={{ border: 'var(--bw) solid rgb(var(--c-line))' }}>
                <p className="text-lg font-bold text-secondary">{whoHelpedCount}</p>
                <p className="text-xs text-muted">Ajudas feitas</p>
              </div>
              <div className="rounded-xl bg-surface p-2.5" style={{ border: 'var(--bw) solid rgb(var(--c-line))' }}>
                <p className="text-lg font-bold text-ink">{whoValidators.length}</p>
                <p className="text-xs text-muted">Validações</p>
              </div>
            </div>

            <div className="rounded-xl bg-surface p-3" style={{ border: 'var(--bw) solid rgb(var(--c-line))' }}>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted">
                <ShieldCheck size={14} className="text-secondary" aria-hidden="true" /> Verificações de segurança
              </p>
              <ul className="divide-y divide-line text-[0.9rem]">
                {[
                  ['Documento com foto conferido', FileCheck2],
                  ['Telefone validado por código SMS', Phone],
                  ['Morador confirmado na vizinhança', HomeIcon],
                ].map(([label, Icon]) => (
                  <li key={label} className="flex items-center gap-2 py-2">
                    <Icon size={16} className="shrink-0 text-secondary" aria-hidden="true" />
                    <span className="flex-1">{label}</span>
                    <Check size={16} className="text-secondary" aria-label="concluído" />
                  </li>
                ))}
              </ul>
            </div>

            {whoSeals.length > 0 && (
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted">
                  <Award size={14} aria-hidden="true" /> Selos de confiança
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {whoSeals.map((s) => (
                    <span key={s} className="pill pill-green">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {whoValidators.length > 0 && (
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted">
                  <Users size={14} aria-hidden="true" /> Validado por {whoValidators.length} vizinhos
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {whoValidators.map((v) => (
                    <span key={v} className="rounded-full bg-surface px-2.5 py-1 text-xs font-semibold" style={{ border: '1px solid rgb(var(--c-line))' }}>
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {whoReviews.length > 0 && (
              <div>
                <p className="mb-1.5 flex items-center justify-between gap-1.5 text-xs font-bold uppercase tracking-wide text-muted">
                  <span className="flex items-center gap-1.5">
                    <Heart size={14} aria-hidden="true" /> Agradecimentos recentes na vizinhança
                  </span>
                  <span className="font-normal normal-case">
                    {visibleReviews.length} de {whoReviews.length}
                  </span>
                </p>
                <ul className="space-y-2">
                  {visibleReviews.map((g) => (
                    <li key={g.id} className="rounded-xl bg-secondary-soft p-3 text-[0.9rem] leading-snug">
                      <p>"{g.text}"</p>
                      <p className="mt-1 text-xs font-semibold text-secondary">— {g.from} • {g.ago}</p>
                    </li>
                  ))}
                </ul>
                {remainingReviews > 0 ? (
                  <button
                    type="button"
                    onClick={() => setReviewsLimit((n) => n + 2)}
                    className="btn btn-outline mt-2.5 w-full !min-h-[2.75rem] text-sm"
                  >
                    Carregar agradecimentos mais antigos ({remainingReviews} {remainingReviews === 1 ? 'restante' : 'restantes'})
                  </button>
                ) : (
                  whoReviews.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setReviewsLimit(2)}
                      className="mt-2 block w-full text-center text-xs font-bold text-muted underline"
                    >
                      Mostrar apenas os mais recentes
                    </button>
                  )
                )}
              </div>
            )}

            <p className="flex items-center gap-1.5 text-xs text-muted">
              <Lock size={13} className="shrink-0" aria-hidden="true" /> Por privacidade, telefone e endereço exato não são exibidos.
            </p>

            {canDecide ? (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  className="btn btn-primary w-full"
                  onClick={() => {
                    chatSchedule(chat.reqId, { accept: true })
                    setSheet(null)
                  }}
                >
                  <UserCheck size={18} aria-hidden="true" /> Aceitar ajuda
                </button>
                <button
                  type="button"
                  className="btn btn-outline w-full"
                  onClick={() => {
                    chatSchedule(chat.reqId, { decline: true })
                    setSheet(null)
                  }}
                >
                  <XCircle size={18} aria-hidden="true" /> Não aceitar
                </button>
              </div>
            ) : (
              <button type="button" className="btn btn-outline w-full" onClick={() => setSheet(null)}>
                Voltar ao chat
              </button>
            )}
          </div>
        </Sheet>
      )}

      {sheet === 'sos' && (
        <Sheet title="Emergência" tone="danger" onClose={() => setSheet(null)}>
          <p className="text-[1.02rem] font-semibold leading-snug">Em caso de urgência médica ou risco imediato, ligue agora.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <a href="tel:192" className="btn btn-danger flex-col !gap-0"><PhoneCall size={22} aria-hidden="true" /> SAMU 192</a>
            <a href="tel:190" className="btn btn-danger flex-col !gap-0"><PhoneCall size={22} aria-hidden="true" /> Polícia 190</a>
          </div>
          {hasTrustedPhone && (
            <a href={`tel:${trustedTel}`} className="btn btn-primary mt-3 w-full">
              <PhoneCall size={20} className="shrink-0" aria-hidden="true" />
              Ligar para {trusted} ({profile.trustedPhone})
            </a>
          )}
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