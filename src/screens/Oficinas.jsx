import { useState } from 'react'
import { CalendarCheck, CalendarPlus, MapPin, Users, Check, Package, HandHeart, Plus, Undo2, Repeat2, Trash2 } from 'lucide-react'
import { useApp } from '../AppContext.js'
import { SectionTitle } from '../components/ui.jsx'
import { EVENT_ICON, OBJECT_ICON } from '../icons.js'
import { OBJECTS, EVENTS, ME } from '../data.js'

const GEN_COLORS = ['pill-terra', 'pill-green']

function guessGender(name = '') {
  const firstWord = String(name).trim().split(/\s+/)[0]?.toLowerCase() || ''
  if (!firstWord) return 'm'
  if (/(mapa|sofá|dia|clima|problema|sistema|pijama|grama)/.test(firstWord)) return 'm'
  if (/(a|ã|ção|são|dade|gem)$/.test(firstWord)) return 'f'
  return 'm'
}

function withArticle(name, gender = 'm') {
  const art = gender === 'f' ? 'a' : 'o'
  return `${art} ${name}`
}

export default function Oficinas() {
  const { eventsGoing, toggleEvent, objectsReq, toggleObject, ownObjects, addObject, removeObject } = useApp()
  const [customEvents, setCustomEvents] = useState([])
  const [creatingEvent, setCreatingEvent] = useState(false)
  const [evTitle, setEvTitle] = useState('')
  const [evWhen, setEvWhen] = useState('')
  const [evPlace, setEvPlace] = useState('')
  const [evDesc, setEvDesc] = useState('')
  const [evSpots, setEvSpots] = useState('8')

  const [newObj, setNewObj] = useState('')
  const [objGender, setObjGender] = useState('f')
  const [genderTouched, setGenderTouched] = useState(false)
  const [adding, setAdding] = useState(false)

  const handleObjInput = (value) => {
    setNewObj(value)
    if (!genderTouched) {
      setObjGender(guessGender(value))
    }
  }

  const submitEvent = (e) => {
    e.preventDefault()
    if (!evTitle.trim()) return
    setCustomEvents((prev) => [
      {
        id: `ev-${Date.now()}`,
        title: evTitle.trim(),
        host: `${ME.name}, ${ME.age} anos`,
        when: evWhen.trim() || 'A combinar com a vizinhança',
        place: evPlace.trim() || ME.block,
        spots: Math.max(1, Math.min(50, Number(evSpots) || 8)) + 1,
        going: 1,
        gens: ['Vizinhos', 'Todas as idades'],
        icon: 'Sprout',
        desc: evDesc.trim() || 'Encontro comunitário aberto para troca de experiências entre vizinhos.',
      },
      ...prev,
    ])
    setEvTitle('')
    setEvWhen('')
    setEvPlace('')
    setEvDesc('')
    setEvSpots('8')
    setCreatingEvent(false)
  }

  const submitObj = (e) => {
    e.preventDefault()
    if (!newObj.trim()) return
    addObject(newObj.trim(), objGender)
    setNewObj('')
    setObjGender('f')
    setGenderTouched(false)
    setAdding(false)
  }

  const allEvents = [...customEvents, ...EVENTS]
  const objects = [...ownObjects, ...OBJECTS]

  return (
    <div className="space-y-6 px-4 pb-8 pt-4">
      <header>
        <h1 className="font-display text-[1.7rem] font-bold leading-tight">Oficinas & Trocas</h1>
        <p className="mt-1 text-[1.02rem] leading-snug text-muted">
          Troca de saberes entre gerações e empréstimo solidário de objetos na vizinhança, sem cobrança.
        </p>
      </header>

      <section aria-label="Encontros intergeracionais" className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <SectionTitle icon={Repeat2}>Encontros entre gerações</SectionTitle>
          <button type="button" className="btn btn-outline !min-h-[2.5rem] !px-3 text-sm" onClick={() => setCreatingEvent((v) => !v)}>
            <Plus size={16} aria-hidden="true" /> Criar oficina
          </button>
        </div>

        {creatingEvent && (
          <form onSubmit={submitEvent} className="card space-y-3 p-4">
            <p className="font-bold">Nova oficina comunitária</p>
            <div>
              <label htmlFor="ev-title" className="mb-1 block text-sm font-bold">Título da oficina</label>
              <input id="ev-title" className="field" value={evTitle} onChange={(e) => setEvTitle(e.target.value)} placeholder="Ex.: Roda de leitura e histórias" required />
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <label htmlFor="ev-when" className="mb-1 block text-sm font-bold">Dia e horário</label>
                <input id="ev-when" className="field" value={evWhen} onChange={(e) => setEvWhen(e.target.value)} placeholder="Ex.: Quarta, 15h às 16h30" />
              </div>
              <div>
                <label htmlFor="ev-place" className="mb-1 block text-sm font-bold">Local</label>
                <input id="ev-place" className="field" value={evPlace} onChange={(e) => setEvPlace(e.target.value)} placeholder="Ex.: Salão de convivência" />
              </div>
            </div>
                    <div>
          <label htmlFor="ev-spots" className="mb-1 block text-sm font-bold">Quantas vagas você oferece?</label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              id="ev-spots"
              type="number"
              min={1}
              max={50}
              className="field !w-24 text-center font-bold"
              value={evSpots}
              onChange={(e) => setEvSpots(e.target.value)}
              required
            />
            {[5, 8, 12, 15, 20].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setEvSpots(String(n))}
                className={`chip !min-h-[2.25rem] text-sm ${Number(evSpots) === n ? 'chip-on' : ''}`}
              >
                {n} vagas
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="ev-desc" className="mb-1 block text-sm font-bold">Descrição</label>
              <textarea id="ev-desc" rows={2} className="field resize-none" value={evDesc} onChange={(e) => setEvDesc(e.target.value)} placeholder="Do que se trata o encontro?" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" className="btn btn-outline" onClick={() => setCreatingEvent(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary">Publicar oficina</button>
            </div>
          </form>
        )}

        {allEvents.map((e, i) => {
          const going = !!eventsGoing[e.id]
          const Icon = EVENT_ICON[e.icon] || Repeat2
          const total = e.going + (going ? 1 : 0)
          const left = e.spots - total
          return (
            <article key={e.id} className="card animate-fade-up overflow-hidden" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start gap-3 bg-gradient-to-br from-primary-soft to-surface p-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-strong text-on-primary" aria-hidden="true">
                  <Icon size={30} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[1.15rem] font-bold leading-snug">{e.title}</h3>
                  <p className="mt-0.5 text-[0.95rem] text-muted">com {e.host}</p>
                </div>
              </div>
              <div className="space-y-3 p-4">
                <p className="text-[1.02rem] leading-relaxed">{e.desc}</p>
                <ul className="space-y-1.5 text-[0.95rem]">
                  <li className="flex items-start gap-2"><CalendarCheck size={18} className="mt-0.5 shrink-0 text-primary-strong" aria-hidden="true" /> <b>{e.when}</b></li>
                  <li className="flex items-start gap-2"><MapPin size={18} className="mt-0.5 shrink-0 text-primary-strong" aria-hidden="true" /> {e.place}</li>
                </ul>
                <div className="flex flex-wrap items-center gap-1.5">
                  {e.gens.map((g, gi) => (
                    <span key={g} className={`pill ${GEN_COLORS[gi % 2]}`}>{g}</span>
                  ))}
                  <span className="pill pill-green"><Users size={13} aria-hidden="true" /> {total} confirmados • {left > 0 ? `${left} vagas` : 'lotado'}</span>
                </div>
                <button
                  type="button"
                  aria-pressed={going}
                  disabled={!going && left <= 0}
                  onClick={() => toggleEvent(e)}
                  className={`btn w-full text-[1.05rem] ${going ? 'btn-secondary' : 'btn-primary'}`}
                >
                  {going ? (
                    <>
                      <Check size={22} aria-hidden="true" /> Presença confirmada — toque para cancelar
                    </>
                  ) : (
                    <>
                      <CalendarPlus size={22} aria-hidden="true" /> Confirmar presença
                    </>
                  )}
                </button>
              </div>
            </article>
          )
        })}
      </section>

      <section aria-label="Banco de Objetos" className="space-y-3">
        <SectionTitle icon={Package}>Banco de Objetos</SectionTitle>
        <p className="-mt-1 text-[0.98rem] text-muted">
          Empréstimo solidário entre vizinhos. Combine a retirada pelo chat seguro.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {objects.map((o) => {
            const Icon = o.own ? Package : OBJECT_ICON[o.icon] || Package
            const asked = !!objectsReq[o.id]
            const gender = o.gender || guessGender(o.name)
            return (
              <article key={o.id} className={`card flex flex-col p-3 ${o.own ? '!border-secondary' : ''}`}>
                <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-soft text-secondary" aria-hidden="true">
                  <Icon size={26} />
                </span>
                <h3 className="font-bold leading-tight">{o.name}</h3>
                <p className="mt-1 text-[0.85rem] leading-snug text-muted">
                  {o.own ? 'Seu objeto • disponível' : `${o.owner} • ${o.place}`}
                </p>
                <p className="mt-1 text-[0.85rem] leading-snug text-muted">Estado: {o.cond} • {o.note}</p>
                {o.own ? (
                  <div className="mt-3 flex flex-col gap-1.5">
                    <span className="pill pill-green self-start">Disponível</span>
                    <button
                      type="button"
                      onClick={() => removeObject(o.id)}
                      className="btn btn-outline w-full !min-h-[2.5rem] text-xs text-danger"
                    >
                      <Trash2 size={15} aria-hidden="true" /> Remover {withArticle(o.name, gender)}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleObject(o)}
                    aria-pressed={asked}
                    className={`btn mt-3 w-full !min-h-[2.75rem] text-sm ${asked ? 'btn-outline' : 'btn-secondary'}`}
                  >
                    {asked ? (<><Undo2 size={16} aria-hidden="true" /> Pedido enviado</>) : (<><HandHeart size={18} aria-hidden="true" /> Pedir {withArticle(o.name, gender)} emprestad{gender === 'f' ? 'a' : 'o'}</>)}
                  </button>
                )}
              </article>
            )
          })}
        </div>

        {adding ? (
          <form onSubmit={submitObj} className="card space-y-3 p-4">
            <label htmlFor="obj" className="block font-bold">Qual objeto você quer disponibilizar?</label>
            <input id="obj" className="field" value={newObj} onChange={(e) => handleObjInput(e.target.value)} placeholder="Ex.: Bicicleta, furadeira, escada, mala" autoFocus />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold">Concordância:</span>
              <button type="button" onClick={() => { setObjGender('f'); setGenderTouched(true) }} className={`chip !min-h-[2.25rem] text-sm ${objGender === 'f' ? 'chip-on' : ''}`}>a {newObj.trim() || 'objeto'} (feminino)</button>
              <button type="button" onClick={() => { setObjGender('m'); setGenderTouched(true) }} className={`chip !min-h-[2.25rem] text-sm ${objGender === 'm' ? 'chip-on' : ''}`}>o {newObj.trim() || 'objeto'} (masculino)</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" className="btn btn-outline" onClick={() => { setAdding(false); setGenderTouched(false) }}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={!newObj.trim()}>Disponibilizar</button>
            </div>
          </form>
        ) : (
          <button type="button" className="btn btn-outline w-full" onClick={() => setAdding(true)}>
            <Plus size={20} aria-hidden="true" /> Disponibilizar objeto
          </button>
        )}
      </section>
    </div>
  )
}