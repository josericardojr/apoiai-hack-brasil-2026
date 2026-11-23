import { useState } from 'react'
import { PartyPopper, HeartHandshake, Award, Quote, Sparkles, ArrowRight, Check, Send, Lock } from 'lucide-react'
import { useApp } from '../AppContext.js'
import { Avatar, Switch } from '../components/ui.jsx'
import { SEALS, ME } from '../data.js'
import { SEAL_ICON } from '../icons.js'
import { fmtHours } from '../lib/format.js'

const OFFERABLE = ['pontual', 'gentil', 'paciencia', 'mao', 'coracao', 'cuidador']

export default function Conclusao({ completion, request, chat }) {
  const { commitCompletion, closeCompletion, goGratitude } = useApp()
  const requester = completion.role === 'requester'
  const s = completion.summary
  const helperName = chat.helper?.name ?? ''
  const [seal, setSeal] = useState('gentil')
  const [thanks, setThanks] = useState(`Obrigada, ${helperName}! Você chegou no horário, foi muito gentil e resolveu tudo com carinho.`)
  const [publish, setPublish] = useState(true)

  const sealMeta = s ? SEALS[s.sealId] : null
  const SealIcon = sealMeta ? SEAL_ICON[sealMeta.icon] : null

  return (
    <div className="absolute inset-0 z-50 overflow-y-auto bg-bg" role="dialog" aria-modal="true" aria-label="Ajuda concluída">
      <div className="mx-auto flex min-h-full max-w-md flex-col gap-4 p-5 pb-8">
        {!s ? (
          <>
            <div className="pt-4 text-center">
              <span className="mx-auto mb-3 flex h-20 w-20 animate-pop items-center justify-center rounded-full bg-secondary text-on-secondary" aria-hidden="true">
                <Check size={44} />
              </span>
              <h1 className="font-display text-[1.7rem] font-bold leading-tight">Que bom que deu certo!</h1>
              <p className="mt-1 text-muted">Agradeça {helperName} publicamente: a troca mútua fortalece a vizinhança.</p>
            </div>
            <fieldset className="card p-4">
              <legend className="sr-only">Escolha um selo</legend>
              <p className="mb-2 font-bold">Que selo {helperName} merece?</p>
              <div className="flex flex-wrap gap-2">
                {OFFERABLE.map((id) => {
                  const Icon = SEAL_ICON[SEALS[id].icon]
                  return (
                    <button key={id} type="button" aria-pressed={seal === id} onClick={() => setSeal(id)} className={`chip ${seal === id ? 'chip-on' : ''}`}>
                      <Icon size={16} aria-hidden="true" /> {SEALS[id].label}
                    </button>
                  )
                })}
              </div>
            </fieldset>
            <div className="card p-4">
              <label htmlFor="thanks" className="mb-2 block font-bold">Sua mensagem de agradecimento</label>
              <textarea id="thanks" rows={4} className="field resize-none text-[1.05rem]" value={thanks} onChange={(e) => setThanks(e.target.value)} />
              <div className="mt-2">
                <Switch checked={publish} onChange={setPublish} label="Publicar no Mural de Gratidão" desc="Mostra os nomes dos vizinhos. Você pode desligar." />
              </div>
            </div>
            <button type="button" className="btn btn-primary !min-h-[3.5rem] text-[1.1rem]" disabled={!thanks.trim()} onClick={() => commitCompletion({ reqId: completion.reqId, role: 'requester', thanks: thanks.trim(), sealId: seal, publish })}>
              <Send size={22} aria-hidden="true" /> Enviar agradecimento
            </button>
          </>
        ) : (
          <>
            <div className="pt-4 text-center">
              <span className="mx-auto mb-3 flex h-24 w-24 animate-pop items-center justify-center rounded-full bg-primary-strong text-on-primary" aria-hidden="true">
                <PartyPopper size={48} />
              </span>
              <h1 className="font-display text-[1.8rem] font-bold leading-tight">
                {requester ? 'Ajuda recebida!' : 'Ajuda concluída!'}
              </h1>
              <p className="mt-1 text-[1.05rem] text-muted">
                {requester ? `Você e ${helperName} deixaram a vizinhança mais forte.` : `Obrigada, ${ME.first}! ${request.name} agradece de coração.`}
              </p>
            </div>

            <section className="card overflow-hidden" aria-label="Participação em horas solidárias">
              <div className="flex items-center justify-between gap-3 bg-secondary p-4 text-on-secondary">
                <span className="flex items-center gap-2 font-bold"><HeartHandshake size={24} aria-hidden="true" /> Horas solidárias</span>
                <span className="animate-pop rounded-full bg-on-secondary px-3 py-1 text-lg font-bold text-secondary">
                  {requester ? `${fmtHours(s.hours)} recebidas` : `+${fmtHours(s.hours)}`}
                </span>
              </div>
              <div className="p-4 text-center">
                <p className="text-[1.15rem] font-bold">Você ajudou {fmtHours(s.given)} este mês • Recebeu {fmtHours(s.received)}</p>
                <p className="mt-1 text-[0.9rem] text-muted">Não há débito negativo por pedir ajuda; horas solidárias podem apoiar benefícios em estabelecimentos da comunidade.</p>
              </div>
            </section>

            {sealMeta && (
              <section className="card animate-pop p-4" aria-label="Selo">
                <div className="flex items-center gap-3">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-strong text-on-primary" aria-hidden="true">
                    <SealIcon size={32} />
                  </span>
                  <div>
                    <p className="flex items-center gap-1 text-sm font-bold uppercase tracking-wide text-secondary">
                      <Award size={16} aria-hidden="true" /> {requester ? `Selo para ${helperName}` : s.isNew ? 'Novo selo conquistado!' : 'Selo reforçado!'}
                    </p>
                    <p className="text-[1.2rem] font-bold leading-tight">{sealMeta.label}</p>
                    <p className="text-[0.9rem] text-muted">{sealMeta.desc}{!requester && !s.isNew ? ` • agora ${s.count}×` : ''}</p>
                  </div>
                </div>
              </section>
            )}

            <section className="card relative p-4" aria-label="Agradecimento público">
              <Quote size={30} className="absolute right-3 top-3 text-primary/30" aria-hidden="true" />
              <p className="mb-2 flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-muted"><Sparkles size={15} aria-hidden="true" /> Mural de Gratidão</p>
              <div className="flex items-start gap-3">
                <Avatar name={s.fromName} hue={s.fromHue} size="sm" />
                <div className="min-w-0">
                  <p className="font-bold leading-tight">{s.fromName}</p>
                  <p className="mt-1 pr-6 text-[1.02rem] leading-relaxed">“{s.text}”</p>
                </div>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[0.85rem] text-muted">
                <Lock size={13} aria-hidden="true" />
                {s.published ? 'Publicado no mural para a vizinhança.' : 'Mantido em privado, conforme sua preferência.'}
              </p>
            </section>

            <div className="mt-auto grid gap-2 pt-2">
              {s.published && (
                <button type="button" className="btn btn-primary !min-h-[3.25rem]" onClick={goGratitude}>
                  Ver no Mural de Gratidão <ArrowRight size={20} aria-hidden="true" />
                </button>
              )}
              <button type="button" className="btn btn-outline" onClick={closeCompletion}>Voltar ao mural do bairro</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}