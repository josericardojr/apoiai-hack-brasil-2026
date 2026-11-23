import { useState } from 'react'
import { AlertTriangle, BadgeCheck, Clock, HandHeart, HeartHandshake, MapPin, MessageCircle, Repeat, Sparkles, Users, Volume2, VolumeX } from 'lucide-react'
import { Avatar } from './ui.jsx'
import { CAT_LABEL } from '../data.js'
import { CAT_ICON } from '../icons.js'
import { fmtCredit, fmtDist } from '../lib/format.js'

export default function RequestCard({ r, index = 0, speech, chat, onHelp, onOpenChat }) {
const [showValidators, setShowValidators] = useState(false)
const Icon = CAT_ICON[r.category] || Sparkles
const isOffer = r.kind === 'oferta'
const isRecurring = r.frequency === 'recorrente'
const urgent = !isOffer && r.urgency === 'Alta'
const speaking = speech?.speakingId === r.id
const validators = r.validators || []

const readText = () =>
speech?.toggle(
  `${isOffer ? 'Oferta de ajuda de' : 'Pedido de'} ${r.name}, ${r.age} anos, a ${fmtDist(r.distance)}. ${r.text}. Quando: ${r.when}.`,
  r.id,
)

return (
<article
  className={`card animate-fade-up overflow-hidden ${urgent ? '!border-danger' : isOffer ? '!border-secondary' : ''}`}
  style={{ animationDelay: `${Math.min(index, 6) * 50}ms`, borderWidth: urgent || isOffer ? '2px' : undefined }}
  aria-label={`${isOffer ? 'Oferta de' : 'Pedido de'} ${r.name}`}
>
  {urgent && (
    <div className="flex items-center gap-2 bg-danger px-4 py-1.5 text-[0.9rem] font-bold text-on-danger">
      <AlertTriangle size={18} aria-hidden="true" /> Urgente — precisa de ajuda ainda hoje
    </div>
  )}

  {isOffer && (
    <div className="flex items-center gap-2 bg-secondary px-4 py-1.5 text-[0.9rem] font-bold text-on-secondary">
      <HandHeart size={18} aria-hidden="true" /> Oferta de ajuda na vizinhança
    </div>
  )}

  <div className="space-y-3 p-4">
    <div className="flex items-start gap-3">
      <Avatar name={r.name} hue={r.hue} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`pill ${isOffer ? 'pill-green' : 'pill-terra'} !text-xs`}>
            {isOffer ? 'Oferece ajuda' : 'Pede ajuda'}
          </span>
          <span className={`pill ${isRecurring ? 'pill-plain' : 'pill-green'} !text-xs`}>
            {isRecurring ? <><Repeat size={12} aria-hidden="true" /> Apoio recorrente</> : <><Clock size={12} aria-hidden="true" /> Ajuda pontual</>}
          </span>
        </div>

        <h3 className="mt-1.5 text-[1.18rem] font-bold leading-snug">
          {r.name}, {r.age} anos
          {r.mine && <span className="pill pill-terra ml-2 align-middle">Seu pedido</span>}
        </h3>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[0.95rem] text-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin size={15} aria-hidden="true" /> {r.mine ? r.place : `${fmtDist(r.distance)} • ${r.place}`}
          </span>
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {r.verified && (
            <span className="pill pill-green">
              <BadgeCheck size={14} aria-hidden="true" /> {r.f ? 'Vizinha Verificada' : 'Vizinho Verificado'}
            </span>
          )}
          {validators.length > 0 && (
            <button
              type="button"
              onClick={() => setShowValidators((v) => !v)}
              aria-expanded={showValidators}
              className="pill pill-green cursor-pointer"
            >
              <Users size={14} aria-hidden="true" />
              {r.f ? `Confirmada por ${validators.length} vizinhos` : `Confirmado por ${validators.length} vizinhos`}
            </button>
          )}
        </div>

        {showValidators && validators.length > 0 && (
          <div className="mt-2 rounded-xl bg-secondary-soft p-2.5 text-sm leading-snug" style={{ border: '1px solid rgb(var(--c-secondary) / .4)' }}>
            <p className="font-bold text-secondary">Validado por {validators.length} vizinhos:</p>
            <p className="mt-0.5">{validators.join(', ')}</p>
          </div>
        )}
      </div>

      {speech?.supported && (
        <button
          type="button"
          onClick={readText}
          aria-pressed={speaking}
          aria-label={speaking ? 'Parar leitura' : `Ouvir ${isOffer ? 'oferta' : 'pedido'} de ${r.name}`}
          className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${speaking ? 'bg-primary-strong text-on-primary' : 'bg-primary-soft text-primary-strong'}`}
        >
          {speaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      )}
    </div>

    <p className="text-[1.08rem] leading-relaxed">{r.text}</p>

    <div className="flex flex-wrap items-center gap-2 text-[0.92rem]">
      <span className="pill pill-plain">
        <Icon size={15} aria-hidden="true" /> {CAT_LABEL[r.category] || 'Outro'}
      </span>
      <span className="pill pill-plain">
        <Clock size={15} aria-hidden="true" /> {r.when}
      </span>
      <span className="pill pill-green">
        <HeartHandshake size={15} aria-hidden="true" /> {fmtCredit(r.hours)}
      </span>
    </div>

    {!r.mine && (
      <div className="pt-1">
        {chat ? (
          <button type="button" onClick={onOpenChat} className="btn btn-secondary w-full">
            <MessageCircle size={22} aria-hidden="true" /> Abrir chat seguro
          </button>
        ) : (
          <button type="button" onClick={onHelp} className={`btn w-full text-[1.1rem] ${urgent ? 'btn-danger' : isOffer ? 'btn-secondary' : 'btn-primary'}`}>
            <HandHeart size={22} aria-hidden="true" /> {isOffer ? 'Aceitar oferta / conversar' : 'Posso ajudar'}
          </button>
        )}
      </div>
    )}
  </div>
</article>
)
}