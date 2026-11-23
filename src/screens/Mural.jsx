import { useMemo } from 'react'
import { MessageCircle, HeartHandshake, Quote, ChevronRight, SearchX, Sparkles, Siren } from 'lucide-react'
import { useApp } from '../AppContext.js'
import RequestCard from '../components/RequestCard.jsx'
import { Avatar, SectionTitle } from '../components/ui.jsx'
import { CATEGORIES, RADIUS_OPTIONS, SEALS, ME } from '../data.js'
import { CAT_ICON, SEAL_ICON } from '../icons.js'
import { fmtDist, fmtHours } from '../lib/format.js'

const KIND_FILTERS = [
{ id: 'todos', label: 'Todos' },
{ id: 'pedido', label: 'Pedidos' },
{ id: 'oferta', label: 'Ofertas' },
]

export default function Mural() {
const { requests, chats, filters, setFilters, speech, ledger, openHelp, openChat, gratitude, setTab, gratitudeRef } = useApp()
const activeKind = filters.kind || 'todos'

const visible = useMemo(() => {
return requests
  .filter((r) => r.status !== 'done')
  .filter((r) => r.mine || r.distance <= filters.radius)
  .filter((r) => {
    if (activeKind === 'todos') return true
    return (r.kind || 'pedido') === activeKind
  })
  .filter((r) => {
    if (filters.cat === 'todos') return true
    if (filters.cat === 'urgente') return r.kind !== 'oferta' && r.urgency === 'Alta'
    return r.category === filters.cat
  })
  .sort((a, b) => (b.mine ? 1 : 0) - (a.mine ? 1 : 0) || (b.urgency === 'Alta') - (a.urgency === 'Alta') || a.distance - b.distance)
}, [requests, filters, activeKind])

const urgentCount = requests.filter((r) => r.status !== 'done' && r.kind !== 'oferta' && r.urgency === 'Alta' && !r.mine && r.distance <= filters.radius).length
const radiusLabel = RADIUS_OPTIONS.find((o) => o.m === filters.radius)?.label || 'Até 500m'
const activeChats = Object.values(chats).filter((c) => !c.done)
const countsByCat = (id) => {
const base = requests.filter((r) => r.status !== 'done' && (r.mine || r.distance <= filters.radius) && (activeKind === 'todos' || (r.kind || 'pedido') === activeKind))
if (id === 'todos') return base.length
if (id === 'urgente') return base.filter((r) => r.kind !== 'oferta' && r.urgency === 'Alta').length
return base.filter((r) => r.category === id).length
}

return (
<div className="space-y-5 px-4 pb-8 pt-4">
  <section className="card overflow-hidden" aria-label="Seu resumo">
    <div className="bg-gradient-to-br from-primary-soft to-surface p-4">
      <p className="font-display text-[1.45rem] font-bold leading-tight">Bom dia, {ME.first}!</p>
      <p className="mt-1 text-[1rem] leading-snug text-muted">
        {requests.filter((r) => r.status !== 'done' && !r.mine && r.distance <= filters.radius).length} pedidos e ofertas de vizinhos perto de você hoje.
      </p>
      <button
        type="button"
        onClick={() => setTab('perfil')}
        className="mt-3 flex w-full items-center justify-between gap-2 rounded-xl bg-surface px-3 py-2.5 text-left"
        style={{ border: 'var(--bw) solid rgb(var(--c-line))' }}
      >
        <span className="flex items-center gap-2">
          <HeartHandshake size={22} className="shrink-0 text-secondary" aria-hidden="true" />
          <span className="text-[0.95rem] leading-tight">
            <b>Participação solidária:</b> ajudou {fmtHours(ledger.given)} • recebeu {fmtHours(ledger.received)}
          </span>
        </span>
        <ChevronRight size={20} aria-hidden="true" />
      </button>
    </div>
  </section>

  {activeChats.length > 0 && (
    <section aria-label="Conversas no chat seguro" className="space-y-2">
      <SectionTitle icon={MessageCircle}>No chat seguro</SectionTitle>
      {activeChats.map((c) => {
        const r = requests.find((x) => x.id === c.reqId)
        if (!r) return null
        const who = c.role === 'helper' ? r.name : c.helper.name
        return (
          <button
            key={c.reqId}
            type="button"
            onClick={() => openChat(c.reqId)}
            className="card flex w-full items-center gap-3 p-3 text-left"
          >
            <Avatar name={who} hue={c.role === 'helper' ? r.hue : c.helper.hue} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-bold">
                {c.role === 'helper' ? `Conversa com ${who}` : `${who} respondeu seu pedido`}
              </span>
              <span className="block text-sm text-muted">
                {c.declined ? 'Ajuda não aceita' : ['Aguardando aceite', 'Combinar horário', c.time ? `Marcado: ${c.time}` : 'Combinado'][c.step]}
              </span>
            </span>
            {c.unread && <span className="h-3 w-3 rounded-full bg-danger" aria-label="Mensagem nova" />}
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        )
      })}
    </section>
  )}

  <section aria-label="Filtros do mural" className="space-y-3">
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tipo de publicação">
      {KIND_FILTERS.map((k) => (
        <button
          key={k.id}
          type="button"
          role="radio"
          aria-checked={activeKind === k.id}
          onClick={() => setFilters((f) => ({ ...f, kind: k.id }))}
          className={`chip flex-1 justify-center !px-3 text-sm ${activeKind === k.id ? 'chip-on' : ''}`}
        >
          {k.label}
        </button>
      ))}
    </div>

    <div className="card p-3">
      <p className="pb-2 font-bold leading-tight">
        {radiusLabel} — {ME.area}
      </p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Distância">
        {RADIUS_OPTIONS.map((o) => (
          <button
            key={o.m}
            type="button"
            role="radio"
            aria-checked={filters.radius === o.m}
            onClick={() => setFilters((f) => ({ ...f, radius: o.m }))}
            className={`chip flex-1 justify-center !px-2 text-sm ${filters.radius === o.m ? 'chip-on' : ''}`}
          >
            {o.label.replace('Até ', '')}
          </button>
        ))}
      </div>
    </div>

    <div className="-mx-4 overflow-x-auto px-4 no-scrollbar" role="group" aria-label="Filtrar por categoria">
      <div className="flex gap-2 pb-1">
        {CATEGORIES.map((c) => {
          const Icon = CAT_ICON[c.id] || Sparkles
          const on = filters.cat === c.id
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={on}
              onClick={() => setFilters((f) => ({ ...f, cat: c.id }))}
              className={`chip ${on ? 'chip-on' : ''} ${c.id === 'urgente' && !on ? '!border-danger !text-danger' : ''}`}
            >
              <Icon size={18} aria-hidden="true" />
              {c.label}
              <span className={`rounded-full px-1.5 text-xs ${on ? 'bg-on-primary/20' : 'bg-primary-soft'}`}>{countsByCat(c.id)}</span>
            </button>
          )
        })}
      </div>
    </div>

    {urgentCount > 0 && filters.cat !== 'urgente' && activeKind !== 'oferta' && (
      <button
        type="button"
        onClick={() => setFilters((f) => ({ ...f, cat: 'urgente', kind: 'todos' }))}
        className="flex w-full items-center gap-2 rounded-xl bg-danger-soft px-3 py-2.5 text-left font-bold leading-snug text-danger"
        style={{ border: 'var(--bw) solid rgb(var(--c-danger))' }}
      >
        <Siren size={20} className="shrink-0" aria-hidden="true" />
        <span>{urgentCount} {urgentCount === 1 ? 'pedido urgente' : 'pedidos urgentes'} perto de você — ver agora</span>
      </button>
    )}
  </section>

  <section aria-label="Pedidos e ofertas da vizinhança" className="space-y-4">
    {visible.length === 0 ? (
      <div className="card p-8 text-center">
        <SearchX size={40} className="mx-auto mb-2 text-muted" aria-hidden="true" />
        <p className="text-lg font-bold">Nada encontrado por aqui</p>
        <p className="mt-1 text-muted">Tente ampliar a distância ({fmtDist(1000)}) ou escolher outra categoria.</p>
        <button type="button" className="btn btn-outline mt-4" onClick={() => setFilters({ radius: 1000, cat: 'todos', kind: 'todos' })}>
          Ver todos até 1 km
        </button>
      </div>
    ) : (
      visible.map((r, i) => (
        <RequestCard
          key={r.id}
          r={r}
          index={i}
          speech={speech}
          chat={chats[r.id]}
          onHelp={() => openHelp(r)}
          onOpenChat={() => openChat(r.id)}
        />
      ))
    )}
  </section>

  <section ref={gratitudeRef} aria-label="Mural de Gratidão" className="scroll-mt-4 pt-2">
    <SectionTitle icon={Sparkles}>Mural de Gratidão</SectionTitle>
    <p className="-mt-1 mb-3 text-[0.95rem] text-muted">Agradecimentos públicos feitos pelos vizinhos nos últimos dias.</p>
    <div className="space-y-3">
      {gratitude.map((g) => {
        const seal = SEALS[g.seal]
        const SealIcon = seal ? SEAL_ICON[seal.icon] : null
        return (
          <figure key={g.id} className={`card relative p-4 ${g.fresh ? '!border-secondary animate-pop' : ''}`}>
            <Quote size={28} className="absolute right-3 top-3 text-primary/30" aria-hidden="true" />
            <blockquote className="pr-8 text-[1.02rem] leading-relaxed">“{g.text}”</blockquote>
            <figcaption className="mt-3 flex flex-wrap items-center gap-2 text-[0.9rem]">
              <b>{g.from}</b> <span className="text-muted">agradeceu</span> <b>{g.to}</b>
              {seal && (
                <span className="pill pill-green">
                  <SealIcon size={13} aria-hidden="true" /> {seal.label}
                </span>
              )}
              <span className="text-muted">• {g.ago}</span>
            </figcaption>
          </figure>
        )
      })}
    </div>
  </section>
</div>
)
}