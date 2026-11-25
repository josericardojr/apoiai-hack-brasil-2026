import { useMemo, useState } from 'react'
import { MessageCircle, HeartHandshake, Quote, ChevronRight, SearchX, Sparkles, Siren, Users, MapPin, UserCheck, Star, Award, ShieldCheck, Check, Heart, Search, Lock } from 'lucide-react'
import { useApp } from '../AppContext.js'
import RequestCard from '../components/RequestCard.jsx'
import { Avatar, SectionTitle, Sheet, VerifiedBadge } from '../components/ui.jsx'
import { CATEGORIES, RADIUS_OPTIONS, SEALS, ME, INITIAL_NEIGHBORS } from '../data.js'
import { CAT_ICON, SEAL_ICON } from '../icons.js'
import { fmtDist, fmtHours } from '../lib/format.js'

const KIND_FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'pedido', label: 'Pedidos' },
  { id: 'oferta', label: 'Ofertas' },
  { id: 'vizinhos', label: 'Vizinhos (1 km)' },
]

export default function Mural() {
  const { requests, chats, filters, setFilters, speech, ledger, openHelp, openChat, gratitude, setTab, gratitudeRef, isKnownPersonally, getKnownCount, toggleKnownPersonally } = useApp()
  const activeKind = filters.kind || 'todos'
  const [neighborQuery, setNeighborQuery] = useState('')
  const [selectedNeighbor, setSelectedNeighbor] = useState(null)

  const nearbyNeighbors = useMemo(() => {
    const q = neighborQuery.trim().toLowerCase()
    return INITIAL_NEIGHBORS
      .filter((n) => n.name !== ME.name && n.distance <= 1000)
      .filter((n) => !q || n.name.toLowerCase().includes(q) || n.place.toLowerCase().includes(q))
  }, [neighborQuery])

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
            <Avatar name={who} hue={c.role === 'helper' ? r.hue : c.helper.hue} size={36} />
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

    {activeKind !== 'vizinhos' && (
      <>
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
      </>
    )}
  </section>

  {activeKind === 'vizinhos' ? (
    <section aria-label="Vizinhos em um raio de 1 km" className="space-y-3">
      <div className="card p-3.5">
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 font-bold leading-tight">
            <Users size={18} className="text-primary-strong" aria-hidden="true" />
            Vizinhos até 1 km — {ME.area}
          </p>
          <span className="pill pill-green">{nearbyNeighbors.length} pessoas</span>
        </div>
        <p className="mt-1 text-sm leading-snug text-muted">
          Toque na ficha de um vizinho para ver seus dados e sinalizar se você o conhece pessoalmente.
        </p>
        <div className="relative mt-3">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
          <label htmlFor="neighbor-search" className="sr-only">Buscar vizinho por nome ou bloco</label>
          <input
            id="neighbor-search"
            className="field !py-2 !pl-9 text-sm"
            value={neighborQuery}
            onChange={(e) => setNeighborQuery(e.target.value)}
            placeholder="Buscar por nome ou bloco..."
          />
        </div>
      </div>

      {nearbyNeighbors.length === 0 ? (
        <div className="card p-8 text-center">
          <SearchX size={40} className="mx-auto mb-2 text-muted" aria-hidden="true" />
          <p className="text-lg font-bold">Nenhum vizinho encontrado</p>
          <p className="mt-1 text-muted">Tente buscar por outro nome ou bloco.</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {nearbyNeighbors.map((n) => {
            const knownCount = getKnownCount(n)
            const iKnow = isKnownPersonally(n.name)
            return (
              <li key={n.name}>
                <button
                  type="button"
                  onClick={() => setSelectedNeighbor(n)}
                  className="card flex w-full items-center gap-3 p-3.5 text-left transition hover:bg-primary-soft/40"
                >
                  <Avatar name={n.name} hue={n.hue} size={48} age={n.age} female={n.f} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold leading-tight">{n.name}, {n.age}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-muted">
                      <MapPin size={13} aria-hidden="true" /> {n.place} • {fmtDist(n.distance)}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className={`pill ${iKnow ? 'pill-green' : '!bg-primary-soft !text-primary-strong'}`}>
                        <UserCheck size={13} aria-hidden="true" />
                        {n.f ? 'Conhecida' : 'Conhecido'} por {knownCount} {knownCount === 1 ? 'pessoa' : 'pessoas'}
                      </span>
                      {iKnow && (
                        <span className="text-xs font-bold text-secondary">• Você conhece ✓</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={20} className="shrink-0 text-muted" aria-hidden="true" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  ) : (
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
  )}

  {selectedNeighbor && (() => {
    const n = selectedNeighbor
    const knownCount = getKnownCount(n)
    const iKnow = isKnownPersonally(n.name)
    const muralReviews = (gratitude || []).filter((g) => g.to === n.name)
    const extraReviews = (n.reviews || []).filter((r) => !muralReviews.some((m) => m.text === r.text))
    const reviews = [...muralReviews, ...extraReviews]
    return (
      <Sheet title={`Ficha de ${n.name}`} onClose={() => setSelectedNeighbor(null)}>
        <div className="space-y-4">
          <div className="flex items-center gap-3.5 rounded-2xl bg-primary-soft p-3.5">
            <Avatar name={n.name} hue={n.hue} size={64} age={n.age} female={n.f} />
            <div className="min-w-0 flex-1">
              <p className="font-display text-xl font-bold leading-tight">{n.name}, {n.age} anos</p>
              <p className="mt-0.5 flex items-center gap-1 text-sm text-muted">
                <MapPin size={14} aria-hidden="true" /> {n.place} • {fmtDist(n.distance)}
              </p>
              <div className="mt-1.5">
                <VerifiedBadge f={n.f} />
              </div>
            </div>
          </div>

          {n.bio && <p className="text-[0.96rem] leading-relaxed text-ink">{n.bio}</p>}

          <div className="rounded-2xl bg-secondary-soft p-3.5" style={{ border: 'var(--bw) solid rgb(var(--c-secondary) / .5)' }}>
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-sm font-bold text-secondary">
                <UserCheck size={18} aria-hidden="true" /> Conhecido pessoalmente
              </p>
              <span className="pill pill-green font-bold">
                {knownCount} {knownCount === 1 ? 'pessoa' : 'pessoas'}
              </span>
            </div>
            <p className="mt-1 text-[0.88rem] leading-snug text-ink">
              {iKnow
                ? `Você já sinalizou que conhece ${n.name} pessoalmente. Essa confirmação ajuda outros moradores a decidirem com mais segurança no chat.`
                : `Sinalize apenas se você conhece ${n.name} pessoalmente na vizinhança. Esse número aparece no cartão de apresentação no chat seguro.`}
            </p>
            <button
              type="button"
              aria-pressed={iKnow}
              onClick={() => toggleKnownPersonally(n.name)}
              className={`btn mt-3 w-full ${iKnow ? 'btn-secondary' : 'btn-primary'}`}
            >
              {iKnow ? (
                <>
                  <Check size={20} aria-hidden="true" /> Você conhece pessoalmente (tocar para remover)
                </>
              ) : (
                <>
                  <UserCheck size={20} aria-hidden="true" /> Conheço {n.name.split(' ')[0]} pessoalmente
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-surface p-2.5" style={{ border: 'var(--bw) solid rgb(var(--c-line))' }}>
              <p className="flex items-center justify-center gap-1 text-lg font-bold text-primary-strong">
                <Star size={16} className="fill-current" aria-hidden="true" /> {String(n.rating ?? 4.9).replace('.', ',')}
              </p>
              <p className="text-xs text-muted">Avaliação</p>
            </div>
            <div className="rounded-xl bg-surface p-2.5" style={{ border: 'var(--bw) solid rgb(var(--c-line))' }}>
              <p className="text-lg font-bold text-secondary">{n.helpedCount ?? 4}</p>
              <p className="text-xs text-muted">Ajudas feitas</p>
            </div>
            <div className="rounded-xl bg-surface p-2.5" style={{ border: 'var(--bw) solid rgb(var(--c-line))' }}>
              <p className="text-lg font-bold text-ink">{(n.validators || []).length}</p>
              <p className="text-xs text-muted">Validações</p>
            </div>
          </div>

          {(n.seals || []).length > 0 && (
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted">
                <Award size={14} aria-hidden="true" /> Selos de confiança
              </p>
              <div className="flex flex-wrap gap-1.5">
                {n.seals.map((s) => (
                  <span key={s} className="pill pill-green">{s}</span>
                ))}
              </div>
            </div>
          )}

          {reviews.length > 0 && (
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted">
                <Heart size={14} aria-hidden="true" /> Agradecimentos na vizinhança
              </p>
              <ul className="space-y-2">
                {reviews.slice(0, 2).map((g) => (
                  <li key={g.id} className="rounded-xl bg-surface p-3 text-[0.9rem] leading-snug" style={{ border: 'var(--bw) solid rgb(var(--c-line))' }}>
                    <p>"{g.text}"</p>
                    <p className="mt-1 text-xs font-semibold text-secondary">— {g.from} • {g.ago}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="flex items-center gap-1.5 text-xs text-muted">
            <Lock size={13} className="shrink-0" aria-hidden="true" /> Por privacidade, apenas a distância aproximada e o bloco são exibidos.
          </p>
        </div>
      </Sheet>
    )
  })()}

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