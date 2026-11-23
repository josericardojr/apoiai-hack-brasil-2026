import { useEffect } from 'react'
import { BadgeCheck, X, Volume2, Square, CheckCircle2, Info } from 'lucide-react'
import { initials } from '../lib/format.js'

// Retratos fotográficos curados por faixa etária e gênero para corresponder à identificação de cada pessoa
const PORTRAITS_BY_NAME = {
  // Mulheres idosas (74–83 anos)
  'Helena Prado': 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=320&q=80',
  'Marta Souza': 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=320&q=80',
  'Zilda Costa': 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=320&q=80',
  'Neide Vasconcelos': 'https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&w=320&q=80',

  // Homens idosos (70–86 anos)
  'Antônio Mendes': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=320&q=80',
  'Joaquim Ferreira': 'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=320&q=80',
  'Raimundo Alves': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=320&q=80',

  // Mulheres jovens e adultas (29–52 anos)
  'Marina Alves': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=320&q=80',
  'Beatriz Campos': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=320&q=80',
  'Mariana Lima': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80',
  'Cláudia Nogueira': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=320&q=80',

  // Homens jovens e adultos (24–48 anos)
  'Lucas Rocha': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80',
  'Carlos Menezes': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=320&q=80',
  'Roberto Dias': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=320&q=80',
}

const FALLBACK_BY_COHORT = {
  seniorFemale: [
    'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=320&q=80',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=320&q=80',
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=320&q=80',
  ],
  seniorMale: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=320&q=80',
    'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=320&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=320&q=80',
  ],
  adultFemale: [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=320&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=320&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80',
  ],
  adultMale: [
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=320&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=320&q=80',
  ],
}

const SENIOR_WOMEN_NAMES = new Set(['Helena Prado', 'Marta Souza', 'Zilda Costa', 'Neide Vasconcelos'])
const SENIOR_MEN_NAMES = new Set(['Antônio Mendes', 'Joaquim Ferreira', 'Raimundo Alves'])
const ADULT_WOMEN_NAMES = new Set(['Marina Alves', 'Beatriz Campos', 'Mariana Lima', 'Cláudia Nogueira'])

function resolvePortraitUrl(cleanName, age, female) {
  if (PORTRAITS_BY_NAME[cleanName]) return PORTRAITS_BY_NAME[cleanName]

  const isFemale =
    typeof female === 'boolean'
      ? female
      : SENIOR_WOMEN_NAMES.has(cleanName) || ADULT_WOMEN_NAMES.has(cleanName)

  const isSenior =
    typeof age === 'number'
      ? age >= 65
      : SENIOR_WOMEN_NAMES.has(cleanName) || SENIOR_MEN_NAMES.has(cleanName)

  const pool = isSenior
    ? (isFemale ? FALLBACK_BY_COHORT.seniorFemale : FALLBACK_BY_COHORT.seniorMale)
    : (isFemale ? FALLBACK_BY_COHORT.adultFemale : FALLBACK_BY_COHORT.adultMale)

  let hash = 0
  for (let i = 0; i < cleanName.length; i += 1) {
    hash = (hash * 31 + cleanName.charCodeAt(i)) % pool.length
  }
  return pool[Math.abs(hash) % pool.length]
}

export function Avatar({ name = 'Vizinho', hue = 20, size = 48, age, female, photo }) {
  const cleanName = String(name || '').replace(/\s*\(você\)\s*/gi, '').trim()
  const photoUrl = photo || resolvePortraitUrl(cleanName, age, female)
  const parts = cleanName.split(/\s+/).filter(Boolean)
  const initialsText = parts.slice(0, 2).map((n) => n[0]?.toUpperCase() || '').join('') || 'V'

  return (
    <span
      aria-hidden="true"
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold text-ink"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.36),
        background: `hsl(${hue} 65% 86%)`,
        border: '2px solid rgb(var(--c-line))',
      }}
    >
      <span>{initialsText}</span>
      {photoUrl && (
        <img
          src={photoUrl}
          alt={cleanName}
          width={size}
          height={size}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
      )}
    </span>
  )
}
export function VerifiedBadge({ f }) {
  return (
    <span className="pill pill-green">
      <BadgeCheck size={15} aria-hidden="true" />
      {f ? 'Vizinha Verificada' : 'Vizinho Verificado'}
    </span>
  )
}

export function Switch({ checked, onChange, label, desc, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex min-h-[3.25rem] w-full items-center justify-between gap-3 rounded-xl py-2 text-left disabled:opacity-60"
    >
      <span className="min-w-0">
        <span className="block font-bold leading-snug">{label}</span>
        {desc && <span className="block text-sm leading-snug text-muted">{desc}</span>}
      </span>
      <span
        aria-hidden="true"
        className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors ${
          checked ? 'bg-secondary' : 'bg-edge/60'
        }`}
        style={{ border: '2px solid rgb(var(--c-edge))' }}
      >
        <span
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full bg-surface text-secondary shadow transition-transform ${
            checked ? 'translate-x-[1.65rem]' : 'translate-x-0.5'
          }`}
          style={{ border: '1px solid rgb(var(--c-edge))' }}
        >
          {checked && <CheckCircle2 size={14} />}
        </span>
      </span>
    </button>
  )
}

/** Painel deslizante que cobre apenas o "celular" (App), não a página toda */
export function Sheet({ title, onClose, children, tone = 'default', full = false }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/60"
        tabIndex={-1}
      />
      <div
        className={`relative flex animate-sheet-up flex-col overflow-hidden rounded-t-3xl bg-bg ${
          full ? 'h-full rounded-none' : 'max-h-[88%]'
        }`}
        style={{ border: 'var(--bw) solid rgb(var(--c-line))' }}
      >
        <div
          className={`flex items-center justify-between gap-3 px-5 py-3 ${
            tone === 'danger' ? 'bg-danger text-on-danger' : 'bg-surface'
          }`}
          style={{ borderBottom: 'var(--bw) solid rgb(var(--c-line))' }}
        >
          <h2 className="text-lg font-bold leading-tight">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-primary-soft"
            style={tone === 'danger' ? { color: 'inherit' } : undefined}
          >
            <X size={24} />
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}

export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onClose, toast.action ? 9000 : 3800)
    return () => clearTimeout(t)
  }, [toast, onClose])

  if (!toast) return null
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-24 z-[60] flex justify-center px-4" aria-live="polite" role="status">
      <div
        className="pointer-events-auto flex w-full max-w-sm animate-fade-up items-start gap-3 rounded-2xl bg-ink px-4 py-3 text-bg shadow-2xl"
        style={{ border: '2px solid rgb(var(--c-bg))' }}
      >
        <Info size={22} className="mt-0.5 shrink-0" aria-hidden="true" />
        <p className="min-w-0 flex-1 text-[0.95rem] font-semibold leading-snug">{toast.msg}</p>
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action.run()
              onClose()
            }}
            className="shrink-0 rounded-lg bg-bg px-3 py-1.5 text-sm font-bold text-ink"
          >
            {toast.action.label}
          </button>
        )}
      </div>
    </div>
  )
}

export function SpeakButton({ id, text, speech, label = 'Ouvir pedido', className = '' }) {
  const on = speech.speakingId === id
  return (
    <button
      type="button"
      onClick={() => speech.speak(id, text)}
      aria-pressed={on}
      aria-label={on ? 'Parar leitura em áudio' : `${label} em voz alta`}
      className={`btn btn-outline ${on ? '!bg-secondary !text-on-secondary' : ''} ${className}`}
    >
      {on ? (
        <>
          <span className="flex h-5 items-center gap-[3px]" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="h-full w-[3px] origin-center animate-wave rounded bg-current" style={{ animationDelay: `${i * 0.12}s` }} />
            ))}
          </span>
          <Square size={14} fill="currentColor" aria-hidden="true" />
          Parar
        </>
      ) : (
        <>
          <Volume2 size={22} aria-hidden="true" />
          <span>Ouvir</span>
        </>
      )}
    </button>
  )
}

export function SectionTitle({ icon: Icon, children, aside }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 className="flex items-center gap-2 font-display text-[1.35rem] font-bold leading-tight">
        {Icon && <Icon size={24} className="shrink-0 text-primary-strong" aria-hidden="true" />}
        {children}
      </h2>
      {aside}
    </div>
  )
}
