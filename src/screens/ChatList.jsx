import { MessageCircle, ChevronRight, Lock } from 'lucide-react'
import { useApp } from '../AppContext.js'
import { Avatar } from '../components/ui.jsx'
import { CAT_LABEL } from '../data.js'

export default function ChatList() {
  const { chats, requests, openChat, setTab } = useApp()
  const entries = Object.values(chats)

  return (
    <div className="space-y-4 px-4 pb-8 pt-4">
      <header>
        <h1 className="font-display text-[1.7rem] font-bold leading-tight">Chat seguro</h1>
        <p className="mt-1 text-[1rem] leading-snug text-muted">
          Conversas iniciadas ao oferecer ou aceitar ajuda no mural. Telefone e endereço exato ficam ocultos.
        </p>
      </header>

      {entries.length === 0 ? (
        <div className="card p-7 text-center">
          <MessageCircle size={38} className="mx-auto mb-2 text-muted" aria-hidden="true" />
          <p className="text-lg font-bold">Nenhuma conversa iniciada ainda</p>
          <p className="mt-1 text-[0.95rem] text-muted">
            Quando você tocar em “Posso ajudar” em um pedido ou oferta no Mural do bairro, a conversa aparecerá aqui.
          </p>
          <button type="button" className="btn btn-primary mt-4" onClick={() => setTab('mural')}>
            Ir para o Mural do bairro
          </button>
        </div>
      ) : (
        <ul className="space-y-2.5" aria-label="Conversas ativas no chat seguro">
          {entries.map((c) => {
            const req = requests.find((r) => r.id === c.reqId)
            const whoName = c.role === 'helper' ? req?.name : c.helper?.name
            const whoHue = c.role === 'helper' ? req?.hue : c.helper?.hue
            const lastMsg = [...(c.messages || [])].reverse().find((m) => m.from !== 'sys')
            const statusText = c.done
              ? 'Concluída'
              : c.declined
              ? 'Não aceita'
              : c.time
              ? `Combinado: ${c.time}`
              : ['Aguardando aceite', 'Horário a combinar', 'Pronta para concluir'][c.step] || 'Em andamento'

            return (
              <li key={c.reqId}>
                <button
                  type="button"
                  onClick={() => openChat(c.reqId)}
                  className="card flex w-full items-center gap-3 p-3.5 text-left transition hover:bg-primary-soft/30"
                >
                  <Avatar name={whoName || 'Vizinho'} hue={whoHue || 20} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[1.08rem] font-bold">{whoName}</span>
                      <span className="shrink-0 text-xs text-muted">{lastMsg?.t || ''}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs font-semibold text-secondary">
                      {CAT_LABEL[req?.category] || 'Apoio'} • {statusText}
                    </p>
                    <p className="mt-1 truncate text-[0.92rem] text-muted">
                      {lastMsg?.text || 'Conversa aberta no chat seguro.'}
                    </p>
                  </div>
                  {c.unread && (
                    <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-danger px-1.5 text-xs font-bold text-on-danger">
                      1
                    </span>
                  )}
                  <ChevronRight size={20} className="shrink-0 text-muted" aria-hidden="true" />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted">
        <Lock size={12} aria-hidden="true" /> Você pode acompanhar várias ajudas combinadas ao mesmo tempo.
      </p>
    </div>
  )
}