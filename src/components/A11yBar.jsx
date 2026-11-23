import { Volume2, VolumeX, Contrast } from 'lucide-react'
import { useApp } from '../AppContext.js'

export const FONT_LEVELS = [
  { label: 'Padrão', px: 16 },
  { label: 'Grande', px: 18.5 },
  { label: 'Muito grande', px: 21 },
]

const CONTRASTS = [
  { id: 'padrao', label: 'Padrão' },
  { id: 'alto', label: 'Alto contraste' },
  { id: 'escuro', label: 'Noturno' },
]

export default function A11yBar({ a11y, setA11y, speech }) {
  const { tab } = useApp()
  const nextFont = () => setA11y((s) => ({ ...s, font: (s.font + 1) % FONT_LEVELS.length }))
  const nextContrast = () => {
    const i = CONTRASTS.findIndex((c) => c.id === a11y.contrast)
    setA11y((s) => ({ ...s, contrast: CONTRASTS[(i + 1) % CONTRASTS.length].id }))
  }
  const cLabel = CONTRASTS.find((c) => c.id === a11y.contrast)?.label || 'Padrão'
  const fLabel = FONT_LEVELS[a11y.font]?.label || 'Padrão'

  return (
    <div className="flex shrink-0 items-center justify-between gap-1.5 bg-bg px-3 py-1.5 text-xs" style={{ borderBottom: '1px solid rgb(var(--c-line))' }} aria-label="Acessibilidade">
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={nextFont} aria-label={`Tamanho do texto: ${fLabel}. Toque para alterar`} className="chip !min-h-[2rem] !px-2.5 text-xs font-bold">
          <span>A-</span>
          <span>A+</span>
          <span className="text-muted">· {fLabel}</span>
        </button>
        <button type="button" onClick={nextContrast} aria-label={`Contraste: ${cLabel}. Toque para alterar`} className="chip !min-h-[2rem] !px-2.5 text-xs font-bold">
          <Contrast size={14} aria-hidden="true" />
          <span>{cLabel}</span>
        </button>
      </div>

      {speech.supported && (
        <button
          type="button"
          onClick={() => speech.toggle(document.getElementById('conteudo')?.innerText || '', `tela-${tab}`)}
          aria-pressed={speech.speaking}
          className={`chip !min-h-[2rem] !px-2.5 text-xs font-bold ${speech.speaking ? 'chip-on' : ''}`}
        >
          {speech.speaking ? <VolumeX size={14} aria-hidden="true" /> : <Volume2 size={14} aria-hidden="true" />}
          <span>{speech.speaking ? 'Parar áudio' : 'Áudio'}</span>
        </button>
      )}
    </div>
  )
}