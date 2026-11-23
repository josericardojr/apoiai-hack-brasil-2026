import { useState } from 'react'
import {
  BadgeCheck,
  HeartHandshake,
  Users,
  Wrench,
  CalendarClock,
  Phone,
  ShieldCheck,
  Trash2,
  Plus,
  Check,
  Award,
  History,
  Info,
  FileCheck2,
  Home as HomeIcon,
  Star,
  Store,
  Ticket,
  X,
  Send,
} from 'lucide-react'
import { useApp } from '../AppContext.js'
import { Avatar, Switch, SectionTitle } from '../components/ui.jsx'
import { SEALS, SKILLS, DAYS, PERIODS, ME, COMMUNITY_PERKS } from '../data.js'
import { SEAL_ICON } from '../icons.js'
import { fmtHours } from '../lib/format.js'

const VALIDATED_BY = [
  { name: 'Carlos Menezes', role: 'Vizinho de prédio' },
  { name: 'Marta Souza', role: 'Vizinha da comunidade' },
  { name: 'Lucas Rocha', role: 'Vizinho da comunidade' },
]

export default function Perfil() {
  const { ledger, badges, profile, setProfile, notify, evaluateHelper, setGratitude, goGratitude, setTab } = useApp()
  const [custom, setCustom] = useState('')
  const [rating, setRating] = useState(5)
  const [ratingCount, setRatingCount] = useState(8)
  const [claimedPerks, setClaimedPerks] = useState({})
  const [receivedOpen, setReceivedOpen] = useState(false)
  const [selectedHelpId, setSelectedHelpId] = useState(null)
  const [helpStars, setHelpStars] = useState(5)
  const [helpSeal, setHelpSeal] = useState('gentil')
  const [helpThanks, setHelpThanks] = useState('')
  const [helpPublish, setHelpPublish] = useState(true)
  const [evaluatedIds, setEvaluatedIds] = useState({})
  const total = Math.max(ledger.given + ledger.received, 1)

  const toggleSkill = (s) =>
    setProfile((p) => ({ ...p, skills: p.skills.includes(s) ? p.skills.filter((x) => x !== s) : [...p.skills, s] }))
  const toggleSlot = (k) => setProfile((p) => ({ ...p, slots: { ...p.slots, [k]: !p.slots[k] } }))
  const setPriv = (k, v) => setProfile((p) => ({ ...p, privacy: { ...p.privacy, [k]: v } }))
  const addSkill = (e) => {
    e.preventDefault()
    const v = custom.trim()
    if (!v || profile.skills.includes(v)) return
    setProfile((p) => ({ ...p, skills: [...p.skills, v], extra: [...p.extra, v] }))
    setCustom('')
  }
  const selectRating = (star) => {
    setRating(star)
    setRatingCount((c) => c + 1)
    notify(`Avaliação de ${star} de 5 estrelas registrada.`)
  }
  const claimPerk = (perk) => {
    setClaimedPerks((prev) => ({ ...prev, [perk.id]: true }))
    notify(`Cupom comunitário gerado para ${perk.partner}! Apresente no balcão do estabelecimento.`)
  }

  const allSkills = [...SKILLS, ...profile.extra]
  const slotsCount = Object.values(profile.slots).filter(Boolean).length

  const receivedHelps = (() => {
    const fromHistory = (ledger.history || [])
      .filter((h) => h.type === 'get')
      .map((h, idx) => {
        const cleanName = String(h.label || '').split(/\s+(?:ajudou|buscou|fez|levou|comprou|ajudou você)\b/i)[0].trim() || 'Vizinho da comunidade'
        return {
          id: h.id || `help-${idx}`,
          name: cleanName,
          when: h.when || 'recentemente',
          hours: h.hours || 1,
        }
      })
    if (fromHistory.length > 0) return fromHistory
    return [
      { id: 'help-default-1', name: 'Lucas Rocha', when: 'ontem', hours: 1 },
      { id: 'help-default-2', name: 'Beatriz Campos', when: 'há 3 dias', hours: 2 },
    ]
  })()

  const activeHelp = receivedHelps.find((h) => h.id === selectedHelpId) || receivedHelps[0]

  const openReceivedModal = () => {
    const firstPending = receivedHelps.find((h) => !evaluatedIds[h.id]) || receivedHelps[0]
    if (firstPending) {
      setSelectedHelpId(firstPending.id)
      setHelpThanks(`Obrigada pela ajuda com muito carinho e atenção, ${firstPending.name}!`)
    }
    setHelpStars(5)
    setHelpSeal('gentil')
    setHelpPublish(true)
    setReceivedOpen(true)
  }

  const handleSelectHelp = (item) => {
    setSelectedHelpId(item.id)
    setHelpThanks(`Obrigada pela ajuda com muito carinho e atenção, ${item.name}!`)
  }

    const submitHelperEvaluation = (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault()
    if (!activeHelp) {
      setReceivedOpen(false)
      return
    }
    const helperName = activeHelp.name
    const cleanThanks = String(helpThanks || '').trim() || `Muito obrigada pela ajuda, ${helperName}!`
    const publish = !!helpPublish

    setEvaluatedIds((prev) => ({ ...prev, [activeHelp.id]: true }))
    setReceivedOpen(false)

    if (typeof evaluateHelper === 'function') {
      evaluateHelper({
        helperName,
        stars: helpStars,
        sealId: helpSeal,
        thanks: cleanThanks,
        publish,
      })
    } else {
      if (publish && typeof setGratitude === 'function') {
        setGratitude((g) => [
          {
            id: `g-${Date.now()}`,
            from: ME.name,
            to: helperName,
            seal: helpSeal,
            text: cleanThanks,
            ago: 'agora',
            hours: activeHelp.hours || 1,
            fresh: true,
          },
          ...g.map((x) => ({ ...x, fresh: false })),
        ])
      }
      if (typeof notify === 'function') {
        notify(`Avaliação de ${helpStars} estrelas e selo "${SEALS[helpSeal]?.label || 'Gentil'}" enviados para ${helperName}!`)
      }
      if (publish) {
        if (typeof goGratitude === 'function') goGratitude()
        else if (typeof setTab === 'function') setTab('mural')
      }
    }
  }

  return (
    <div className="space-y-5 px-4 pb-8 pt-4">
      <section className="card overflow-hidden">
        <div className="flex items-center gap-4 bg-gradient-to-br from-primary-soft to-surface p-4">
          <Avatar name={ME.name} hue={14} size="lg" />
          <div className="min-w-0">
            <h1 className="font-display text-[1.5rem] font-bold leading-tight">{ME.name}, {ME.age} anos</h1>
            <p className="text-[0.95rem] text-muted">{ME.block} • {ME.area}</p>
            <span className="pill pill-green mt-2"><BadgeCheck size={15} aria-hidden="true" /> Vizinha Verificada</span>
          </div>
        </div>
        <ul className="divide-y divide-line px-4 py-1 text-[0.95rem]" aria-label="Verificações concluídas">
          {[
            ['Documento com foto conferido', FileCheck2],
            ['Telefone validado por código SMS', Phone],
            ['Localização aproximada validada', HomeIcon],
          ].map(([t, Icon]) => (
            <li key={t} className="flex items-center gap-2 py-2.5">
              <Icon size={18} className="shrink-0 text-secondary" aria-hidden="true" />
              <span className="flex-1">{t}</span>
              <Check size={18} className="text-secondary" aria-label="concluído" />
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Avaliação de quem você ajudou" className="card p-4">
        <SectionTitle icon={Star} aside={<span className="pill pill-green">{rating}.0 / 5</span>}>
          Avaliação de quem você ajudou
        </SectionTitle>
        <p className="-mt-1 text-[0.95rem] text-muted">
          Nota dada por vizinhos que receberam ajuda sua ({ratingCount} avaliações). Toque nas estrelas para simular uma avaliação de 1 a 5:
        </p>
        <div className="mt-3 flex items-center gap-2" role="group" aria-label="Avaliar de 1 a 5 estrelas">
          {[1, 2, 3, 4, 5].map((n) => {
            const active = n <= rating
            return (
              <button
                key={n}
                type="button"
                onClick={() => selectRating(n)}
                aria-label={`${n} ${n === 1 ? 'estrela' : 'estrelas'}`}
                aria-pressed={active}
                className="flex h-11 w-11 items-center justify-center rounded-xl transition active:scale-95"
                style={{
                  border: '2px solid rgb(var(--c-edge))',
                  background: active ? 'rgb(var(--c-secondary-soft))' : 'rgb(var(--c-surface))',
                }}
              >
                <Star
                  size={22}
                  className={active ? 'fill-secondary text-secondary' : 'text-muted'}
                  aria-hidden="true"
                />
              </button>
            )
          })}
        </div>
        <div className="mt-4 border-t border-line pt-3">
          <button
            type="button"
            onClick={openReceivedModal}
            className="btn btn-primary w-full justify-center text-[0.95rem]"
          >
            <HeartHandshake size={18} aria-hidden="true" />
            Avaliar quem ajudou você
          </button>
        </div>
      </section>

      <section aria-label="Horas solidárias e benefícios na comunidade" className="card overflow-hidden">
        <div className="bg-secondary p-4 text-on-secondary">
          <h2 className="flex items-center gap-2 font-display text-[1.3rem] font-bold">
            <HeartHandshake size={24} aria-hidden="true" /> Horas solidárias
          </h2>
          <p className="text-[0.95rem] opacity-95">Auxílio mútuo e responsabilidade coletiva entre vizinhos, sem cobrança.</p>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-secondary-soft p-3">
              <p key={ledger.given} className="animate-pop text-3xl font-bold text-secondary">{fmtHours(ledger.given)}</p>
              <p className="text-[0.9rem] font-semibold">ajudadas este mês</p>
            </div>
            <div className="rounded-xl bg-primary-soft p-3">
              <p key={ledger.received} className="animate-pop text-3xl font-bold text-primary-strong">{fmtHours(ledger.received)}</p>
              <p className="text-[0.9rem] font-semibold">recebidas este mês</p>
            </div>
          </div>
          <div className="mt-4" role="img" aria-label={`Ajudadas ${fmtHours(ledger.given)}, recebidas ${fmtHours(ledger.received)}`}>
            <div className="flex h-4 overflow-hidden rounded-full bg-edge/30" style={{ border: '1px solid rgb(var(--c-edge))' }}>
              <div className="bg-secondary transition-all duration-700" style={{ width: `${(ledger.given / total) * 100}%` }} />
              <div className="bg-primary-strong transition-all duration-700" style={{ width: `${(ledger.received / total) * 100}%` }} />
            </div>
            <p className="mt-2 text-center text-[1.02rem] font-bold">
              Você ajudou {fmtHours(ledger.given)} este mês • Recebeu {fmtHours(ledger.received)}
            </p>
            <p className="text-center text-[0.95rem] text-muted">
              Apoio comunitário aberto: pedir ajuda quando necessário faz parte do cuidado coletivo.
            </p>
          </div>

          <div className="mt-4 rounded-xl bg-secondary-soft p-3.5" style={{ border: 'var(--bw) solid rgb(var(--c-secondary) / .5)' }}>
            <h3 className="flex items-center gap-2 font-bold text-secondary">
              <Store size={19} aria-hidden="true" /> Descontos em estabelecimentos da comunidade
            </h3>
            <p className="mt-1 text-[0.9rem] leading-snug text-muted">
              Horas solidárias acumuladas ao ajudar podem ser trocadas por descontos em parceiros locais:
            </p>
            <ul className="mt-3 space-y-2">
              {COMMUNITY_PERKS.map((perk) => {
                const unlocked = ledger.given >= perk.minHours
                const claimed = !!claimedPerks[perk.id]
                return (
                  <li
                    key={perk.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface p-2.5"
                    style={{ border: '1px solid rgb(var(--c-line))' }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[0.95rem] font-bold leading-tight">{perk.partner}</p>
                      <p className="text-[0.85rem] text-muted">{perk.benefit}</p>
                      <span className="mt-1 inline-block text-xs font-semibold text-secondary">
                        Meta: {fmtHours(perk.minHours)} ajudadas
                      </span>
                    </div>
                    {unlocked ? (
                      <button
                        type="button"
                        onClick={() => claimPerk(perk)}
                        className={`btn !min-h-[2.5rem] !px-3 text-xs ${claimed ? 'btn-outline' : 'btn-secondary'}`}
                      >
                        <Ticket size={15} aria-hidden="true" /> {claimed ? 'Cupom ativo' : 'Gerar desconto'}
                      </button>
                    ) : (
                      <span className="pill pill-plain !text-xs">Faltam {fmtHours(perk.minHours - ledger.given)}</span>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-xl bg-primary-soft p-3 text-[0.92rem] leading-snug" style={{ border: 'var(--bw) solid rgb(var(--c-primary) / .5)' }}>
            <Info size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
            <p>Não há cobrança em dinheiro no aplicativo; o foco é o auxílio mútuo e a responsabilidade coletiva no bairro.</p>
          </div>
          <details className="mt-3">
            <summary className="flex min-h-[2.75rem] cursor-pointer items-center gap-2 font-bold"><History size={18} aria-hidden="true" /> Histórico recente</summary>
            <ul className="mt-1 divide-y divide-line text-[0.95rem]">
              {ledger.history.map((h) => (
                <li key={h.id} className={`flex items-center justify-between gap-2 py-2 ${h.fresh ? 'animate-fade-up' : ''}`}>
                  <span>{h.label}<span className="block text-sm text-muted">{h.when}</span></span>
                  <b className={h.type === 'give' ? 'text-secondary' : 'text-primary-strong'}>{h.type === 'give' ? '+' : ''}{fmtHours(h.hours)}</b>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </section>

      <section aria-label="Selos de confiança e legenda" className="card p-4">
        <SectionTitle icon={Award}>Selos de confiança</SectionTitle>
        <p className="-mt-1 mb-3 text-[0.95rem] text-muted">
          Selos são reconhecimentos dados por vizinhos após ajudas concluídas na comunidade. Veja o significado de cada um:
        </p>
        <ul className="space-y-2.5">
          {Object.entries(SEALS).map(([id, s]) => {
            const n = badges[id] ?? 0
            const Icon = SEAL_ICON[s.icon]
            return (
              <li
                key={id}
                className={`flex items-start gap-3 rounded-xl p-2.5 ${badges._new === id ? 'bg-secondary-soft animate-pop' : 'bg-bg'}`}
                style={{ border: 'var(--bw) solid rgb(var(--c-line))' }}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${n ? 'bg-secondary text-on-secondary' : 'bg-edge/30 text-muted'}`} aria-hidden="true">
                  <Icon size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="font-bold leading-tight">{s.label}</span>
                    <span className={`pill ${n ? 'pill-green' : 'pill-plain'} !text-xs`}>
                      {n ? `${n}× recebido` : 'Ainda não recebido'}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[0.88rem] leading-snug text-muted">{s.desc}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-label="Quem validou você" className="card p-4">
        <SectionTitle icon={Users} aside={<span className="pill pill-green">{VALIDATED_BY.length} vizinhos</span>}>
          Quem validou você
        </SectionTitle>
        <p className="-mt-1 mb-3 text-[0.95rem] text-muted">
          Validado por <b>{VALIDATED_BY.length} vizinhos</b> da comunidade:
        </p>
        <ul className="space-y-2">
          {VALIDATED_BY.map((v) => (
            <li key={v.name} className="flex items-center justify-between gap-2 rounded-xl bg-secondary-soft px-3 py-2.5">
              <span className="font-bold text-secondary">{v.name}</span>
              <span className="text-sm text-muted">{v.role}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Habilidades" className="card p-4">
        <SectionTitle icon={Wrench}>Minhas habilidades</SectionTitle>
        <p className="-mt-1 mb-3 text-[0.95rem] text-muted">
          Marque o que você está disponível para fazer. O Apoiaí usa isso para avisar você de pedidos compatíveis.
        </p>
        <div className="flex flex-wrap gap-2">
          {allSkills.map((s) => {
            const on = profile.skills.includes(s)
            return (
              <button key={s} type="button" aria-pressed={on} onClick={() => toggleSkill(s)} className={`chip ${on ? 'chip-on' : ''}`}>
                {on && <Check size={16} aria-hidden="true" />}{s}
              </button>
            )
          })}
        </div>
        <form onSubmit={addSkill} className="mt-3 flex gap-2">
          <label htmlFor="skill" className="sr-only">Outra habilidade</label>
          <input id="skill" className="field !py-2" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Outra habilidade que você está disponível para fazer…" />
          <button type="submit" className="btn btn-outline shrink-0 !px-3" aria-label="Adicionar habilidade"><Plus size={22} /></button>
        </form>
      </section>

      <section aria-label="Horários disponíveis" className="card p-4">
        <SectionTitle icon={CalendarClock} aside={<span className="pill pill-green">{slotsCount} janelas</span>}>Horários livres</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[19rem] border-separate border-spacing-1 text-center">
            <thead>
              <tr>
                <th className="sr-only">Período</th>
                {DAYS.map((d) => <th key={d} className="pb-1 text-[0.8rem] font-bold">{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((p) => (
                <tr key={p}>
                  <th scope="row" className="pr-1 text-left text-[0.78rem] font-bold">{p}</th>
                  {DAYS.map((d) => {
                    const k = `${d}-${p}`
                    const on = !!profile.slots[k]
                    return (
                      <td key={k}>
                        <button
                          type="button"
                          aria-pressed={on}
                          aria-label={`${d} ${p}`}
                          onClick={() => toggleSlot(k)}
                          className={`flex h-11 w-full min-w-[2.25rem] items-center justify-center rounded-lg transition ${on ? 'bg-secondary text-on-secondary' : 'bg-surface'}`}
                          style={{ border: '2px solid rgb(var(--c-edge))' }}
                        >
                          {on && <Check size={18} aria-hidden="true" />}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-label="Segurança e contato de confiança" className="card p-4">
        <SectionTitle icon={ShieldCheck}>Segurança & contato de confiança</SectionTitle>
        <label htmlFor="trusted" className="block text-sm font-bold uppercase tracking-wide text-muted">Contato de confiança</label>
        <div className="mt-1 grid gap-2">
          <input id="trusted" className="field !py-2" value={profile.trusted} onChange={(e) => setProfile((p) => ({ ...p, trusted: e.target.value }))} placeholder="Nome e sobrenome (ex.: Ana Alves)" />
        </div>
        <p className="mt-1 text-[0.85rem] text-muted">Recebe apenas alertas de emergência. Não precisa ter o aplicativo.</p>
        <div className="mt-3 divide-y divide-line">
          <Switch checked={profile.privacy.wall} onChange={(v) => setPriv('wall', v)} label="Aparecer no Mural de Gratidão" desc="Agradecimentos públicos citam os nomes dos vizinhos." />
          <Switch checked={profile.privacy.alerts} onChange={(v) => setPriv('alerts', v)} label="Alertas de pedidos compatíveis" desc="Avisa quando alguém perto precisar do que você sabe fazer." />
          <Switch
            checked={!!profile.privacy.inactivityAlert}
            onChange={(v) => setPriv('inactivityAlert', v)}
            label="Cuidado preventivo em caso de ausência prolongada"
            desc="Avisa seu contato de confiança apenas se houver emergência ou ausência prolongada sem resposta."
          />
        </div>
        <div className="mt-3">
          <button type="button" className="btn btn-outline w-full text-sm" onClick={() => notify('Para excluir a conta, confirmaremos por SMS. Nada foi apagado ainda.')}>
            <Trash2 size={18} aria-hidden="true" /> Excluir conta
          </button>
        </div>
      </section>
      {receivedOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Ajudas recebidas e avaliação"
          className="absolute inset-0 z-50 flex items-center justify-center bg-ink/50 p-3"
        >
          <div className="max-h-[88dvh] w-full overflow-y-auto rounded-3xl bg-surface p-4 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-[1.3rem] font-bold text-ink">Ajudas recebidas</h2>
                <p className="text-[0.9rem] text-muted">
                  Escolha quem ajudou você, dê estrelas, atribua um selo e envie um agradecimento para o mural.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReceivedOpen(false)}
                aria-label="Fechar janela de ajudas recebidas"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-bg text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-[0.85rem] font-semibold uppercase tracking-wide text-muted">
                Quem ajudou você
              </p>
              <div className="space-y-2">
                {receivedHelps.map((item) => {
                  const isSelected = activeHelp?.id === item.id
                  const isDone = !!evaluatedIds[item.id]
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectHelp(item)}
                      className="flex w-full items-center justify-between rounded-2xl border px-3.5 py-2.5 text-left transition"
                      style={{
                        borderColor: isSelected ? 'rgb(var(--c-primary))' : 'rgb(var(--c-line))',
                        background: isSelected ? 'rgb(var(--c-primary-soft))' : 'rgb(var(--c-bg))',
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar name={item.name} hue={150} size="sm" />
                        <div>
                          <div className="font-semibold text-ink">{item.name}</div>
                          <div className="text-[0.82rem] text-muted">
                            Ajuda concluída {item.when} • {fmtHours(item.hours)}
                          </div>
                        </div>
                      </div>
                      <span className={`pill ${isDone ? 'pill-green' : ''}`}>
                        {isDone ? 'Avaliado' : 'Selecionar'}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {activeHelp && (
              <form onSubmit={submitHelperEvaluation} className="mt-4 space-y-4 border-t border-line pt-4">
                <div>
                  <label className="block text-[0.9rem] font-semibold text-ink">
                    Classificação em estrelas para {activeHelp.name}
                  </label>
                  <div className="mt-2 flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((n) => {
                      const active = n <= helpStars
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setHelpStars(n)}
                          aria-label={`${n} ${n === 1 ? 'estrela' : 'estrelas'}`}
                          className="flex h-10 w-10 items-center justify-center rounded-xl transition active:scale-95"
                          style={{
                            border: '2px solid rgb(var(--c-edge))',
                            background: active ? 'rgb(var(--c-secondary-soft))' : 'rgb(var(--c-surface))',
                          }}
                        >
                          <Star
                            size={20}
                            className={active ? 'fill-secondary text-secondary' : 'text-muted'}
                            aria-hidden="true"
                          />
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[0.9rem] font-semibold text-ink">
                    Escolha um selo de reconhecimento
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {Object.entries(SEALS).map(([id, s]) => {
                      const Icon = SEAL_ICON[id] || Award
                      const selected = helpSeal === id
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setHelpSeal(id)}
                          className="flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-[0.88rem] transition"
                          style={{
                            borderColor: selected ? 'rgb(var(--c-secondary))' : 'rgb(var(--c-line))',
                            background: selected ? 'rgb(var(--c-secondary-soft))' : 'rgb(var(--c-bg))',
                          }}
                        >
                          <Icon size={16} className="shrink-0 text-secondary" aria-hidden="true" />
                          <span className="font-medium text-ink">{s.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label htmlFor="helper-thanks-input" className="block text-[0.9rem] font-semibold text-ink">
                    Mensagem de agradecimento
                  </label>
                  <textarea
                    id="helper-thanks-input"
                    rows={2}
                    value={helpThanks}
                    onChange={(e) => setHelpThanks(e.target.value)}
                    placeholder={`Escreva um agradecimento para ${activeHelp.name}...`}
                    className="mt-1.5 w-full rounded-2xl border border-line bg-bg p-3 text-[0.95rem] text-ink focus:border-primary focus:outline-none"
                  />
                  <label className="mt-2 flex cursor-pointer items-center gap-2 text-[0.88rem] text-muted">
                    <input
                      type="checkbox"
                      checked={helpPublish}
                      onChange={(e) => setHelpPublish(e.target.checked)}
                      className="h-4 w-4 accent-secondary"
                    />
                    Publicar agradecimento no Mural da comunidade
                  </label>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setReceivedOpen(false)}
                    className="btn btn-outline flex-1 justify-center"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={submitHelperEvaluation}
                    className="btn btn-primary flex-1 justify-center"
                  >
                    <Send size={16} aria-hidden="true" />
                    Enviar avaliação
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}