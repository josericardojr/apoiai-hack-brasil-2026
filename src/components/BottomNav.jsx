import { LayoutGrid, MessageCircle, CalendarHeart, UserRound, HandHelping } from 'lucide-react'

const ITEMS = [
  { id: 'pedir', label: 'Pedir / Ofertar', Icon: HandHelping },
  { id: 'mural', label: 'Mural', Icon: LayoutGrid },
  { id: 'chat', label: 'Chat seguro', Icon: MessageCircle },
  { id: 'oficinas', label: 'Oficinas', Icon: CalendarHeart },
  { id: 'perfil', label: 'Meu perfil', Icon: UserRound },
]

export default function BottomNav({ tab, onChange, badge = 0 }) {
  return (
    <nav aria-label="Navegação principal" className="shrink-0 bg-surface" style={{ borderTop: '2px solid rgb(var(--c-line))' }}>
      <ul className="grid grid-cols-5">
        {ITEMS.map(({ id, label, Icon }) => {
          const active = tab === id
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => onChange(id)}
                aria-current={active ? 'page' : undefined}
                className={`relative flex min-h-[4.25rem] w-full flex-col items-center justify-center gap-1 px-1 py-1.5 text-[0.68rem] leading-tight transition-colors ${
                  active ? 'bg-primary-soft font-bold text-primary-strong' : 'text-muted hover:bg-primary-soft/50 hover:text-ink'
                }`}
              >
                {active && (
                  <span className="absolute top-0 h-[3px] w-10 rounded-full bg-primary-strong" aria-hidden="true" />
                )}
                <span className="relative inline-flex">
                  <Icon size={21} aria-hidden="true" />
                  {id === 'chat' && badge > 0 && (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-danger px-1 text-[0.65rem] font-bold text-on-danger">
                      {badge}
                    </span>
                  )}
                </span>
                <span className="text-center leading-[1.15]">{label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}