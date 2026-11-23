import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { useApp } from '../AppContext.js'

const VALIDATORS = [
  {
    id: 'carlos',
    name: 'Carlos Menezes',
    role: 'Vizinho de prédio',
    text: 'Carlos Menezes mora no mesmo prédio há 9 anos e validou seu cadastro na vizinhança.',
  },
  {
    id: 'marta',
    name: 'Marta Souza',
    role: 'Vizinha apoiada',
    text: 'Marta Souza confirmou sua presença e gentileza após encontros e ajudas na vizinhança.',
  },
  {
    id: 'lucas',
    name: 'Lucas Rocha',
    role: 'Vizinho da comunidade',
    text: 'Lucas Rocha também validou sua participação nas atividades locais.',
  },
]

export default function TrustGraph() {
  const [sel, setSel] = useState('carlos')
  const { notify } = useApp()
  const current = VALIDATORS.find((v) => v.id === sel) || VALIDATORS[0]

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-secondary-soft p-3.5" style={{ border: 'var(--bw) solid rgb(var(--c-secondary) / .5)' }}>
        <p className="text-sm font-bold uppercase tracking-wide text-secondary">Quem validou você</p>
        <p className="mt-0.5 text-lg font-bold">Validado por {VALIDATORS.length} vizinhos</p>
        <p className="mt-1 text-[0.95rem] text-muted">Toque em um nome abaixo para ver quem fez a validação.</p>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Vizinhos que validaram você">
        {VALIDATORS.map((v) => {
          const active = v.id === sel
          return (
            <button
              key={v.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSel(v.id)}
              className={`chip ${active ? 'chip-on' : ''}`}
            >
              {v.name}
            </button>
          )
        })}
      </div>

      <div className="rounded-xl bg-surface p-3.5" aria-live="polite" style={{ border: 'var(--bw) solid rgb(var(--c-line))' }}>
        <p className="font-bold">{current.name} • <span className="font-normal text-secondary">{current.role}</span></p>
        <p className="mt-1 text-[0.98rem] leading-snug text-muted">{current.text}</p>
      </div>

      <ul className="space-y-1.5 text-[0.98rem]">
        {VALIDATORS.map((v) => (
          <li key={v.id} className="flex items-center justify-between rounded-lg bg-bg px-3 py-2">
            <b>{v.name}</b>
            <span className="pill pill-green">{v.role}</span>
          </li>
        ))}
      </ul>

      <button type="button" className="btn btn-outline w-full" onClick={() => notify('Convite enviado! Vizinhos que você indicar poderão validar seu perfil.')}>
        <UserPlus size={20} aria-hidden="true" /> Convidar vizinho para validar meu perfil
      </button>
    </div>
  )
}