import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { HeartHandshake, MapPin, ShieldCheck, Smartphone, Lock, Mic, Users, Info, Cpu } from 'lucide-react'
import { AppCtx } from './AppContext.js'
import A11yBar, { FONT_LEVELS } from './components/A11yBar.jsx'
import BottomNav from './components/BottomNav.jsx'
import { Toast, Sheet } from './components/ui.jsx'
import Mural from './screens/Mural.jsx'
import Pedir from './screens/Pedir.jsx'
import Oficinas from './screens/Oficinas.jsx'
import Perfil from './screens/Perfil.jsx'
import ChatList from './screens/ChatList.jsx'
import Chat from './screens/Chat.jsx'
import Conclusao from './screens/Conclusao.jsx'
import { useSpeech } from './lib/useSpeech.js'
import { maskSensitive, fmtDist } from './lib/format.js'
import {
  ME, INITIAL_REQUESTS, INITIAL_BADGES, INITIAL_GRATITUDE, SEAL_BY_CATEGORY, HELPER_POOL, IMPACT_STATS, GOOGLE_AI_PILLARS, CAT_LABEL,
} from './data.js'

const A11Y_KEY = 'apoiai:a11y'
const nowT = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
const mid = () => Math.random().toString(36).slice(2, 10)
const msg = (from, text) => ({ id: mid(), from, text, t: nowT() })
const SYS_SAFE_CHAT = 'Chat seguro: telefone e endereço exato ficam ocultos. Combine encontros em áreas comuns.'

function loadA11y() {
  try {
    const v = JSON.parse(localStorage.getItem(A11Y_KEY))
    if (v && typeof v.font === 'number' && v.contrast) return v
  } catch {
    /* ignore */
  }
  return { font: 0, contrast: 'padrao' }
}

function buildContextualReply(incomingText = '', lastReplyText = '') {
  const s = String(incomingText || '').toLowerCase()
  let candidates = []

  if (/(minuto|hora|hoje|amanhã|amanha|sábado|sabado|domingo|segunda|terça|terca|quarta|quinta|sexta|encontr|horário|horario)/i.test(s)) {
    candidates = [
      'Esse horário fica bom para mim. Podemos nos encontrar na área comum combinada.',
      'Combinado! Vou anotar esse horário para nos encontrarmos com calma.',
      'Funciona bem por aqui. Se precisar ajustar o horário, me avise por aqui.',
    ]
  } else if (/(agora|cheg|indo|caminho|já estou|ja estou|pronto)/i.test(s)) {
    candidates = [
      'Ótimo, estou por aqui aguardando você com tranquilidade.',
      'Perfeito! Vou ficando atenta por aqui enquanto você chega.',
      'Certo, fico no aguardo. Sem pressa!',
    ]
  } else if (/(obrigad|valeu|gratid|ajud|muito bom|maravilha)/i.test(s)) {
    candidates = [
      'É isso que faz a vizinhança funcionar: um apoiando o outro no dia a dia.',
      'Fico feliz em poder ajudar! Se precisar de mais alguma coisa, conte comigo.',
      'Que bom que deu certo! A rede de vizinhos é para isso mesmo.',
    ]
  } else if (/(tudo certo|como está|como esta|alguma dúvida|alguma duvida|local|onde)/i.test(s)) {
    candidates = [
      'Tudo certo por aqui! Podemos combinar um ponto na área comum para facilitar.',
      'Tudo bem por aqui, obrigada por perguntar. Qual detalhe você quer combinar?',
      'Tudo certo! Se quiser, já definimos o melhor horário e local.',
    ]
  } else {
    candidates = [
      'Entendi perfeitamente. Como fica melhor para organizarmos isso?',
      'Faz sentido! Vamos alinhar o horário com calma para dar tudo certo.',
      'Anotado por aqui. Se quiser combinar um encontro no espaço comum, é só dizer.',
    ]
  }

  const filtered = candidates.filter((c) => c !== lastReplyText)
  const pool = filtered.length > 0 ? filtered : candidates
  return pool[Math.floor(Math.random() * pool.length)]
}

const THANKS = (r, a) => ({
  digital: `${a.ob}, ${ME.first}! Você teve toda a paciência do mundo e agora eu mesm${a.o} consigo usar tudo sozinh${a.o}.`,
  mobilidade: `${a.ob}, ${ME.first}! Chegou no horário, foi gentil e ainda ficou para conversar. Me sinto mais segur${a.o} com vizinhos assim.`,
  idosos: `${a.ob}, ${ME.first}! Sua companhia alegrou a minha semana inteira. Volte sempre!`,
  cuidados: `${a.ob}, ${ME.first}! Cuidou de tudo com tanto carinho que fiquei tranquil${a.o} o tempo todo.`,
  urgente: `${a.ob}, ${ME.first}! Agradeço muito pela atenção rápida e pelo cuidado nesse momento.`,
  outro: `${a.ob}, ${ME.first}! Agradeço pela ajuda e pela atenção no que precisei.`,
})[r.category] || `${a.ob}, ${ME.first}! Muito obrigada pela sua ajuda na vizinhança.`

export default function App() {
  const [tab, setTab] = useState('pedir')
  const [a11y, setA11y] = useState(loadA11y)
  const [toast, setToast] = useState(null)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [requests, setRequests] = useState(() => INITIAL_REQUESTS.map((r) => ({ ...r, status: 'open' })))
  const [chats, setChats] = useState({})
  const [activeChat, setActiveChat] = useState(null)
  const [completion, setCompletion] = useState(null)
  const [filters, setFilters] = useState({ radius: 500, cat: 'todos', kind: 'todos' })
  const [ledger, setLedger] = useState({
    given: 4,
    received: 2,
    history: [
      { id: 'h1', type: 'give', label: 'Compras do mês de Roberto Dias', hours: 1.5, when: 'há 3 dias' },
      { id: 'h2', type: 'get', label: 'Lucas Rocha ajudou com o notebook', hours: 1.5, when: 'há 5 dias' },
      { id: 'h3', type: 'give', label: 'Videochamada com Zilda Costa', hours: 1, when: 'há 1 semana' },
      { id: 'h4', type: 'give', label: 'Carona para Cláudia Nogueira (fisioterapia)', hours: 1.5, when: 'há 2 semanas' },
      { id: 'h5', type: 'get', label: 'Beatriz Campos buscou encomenda', hours: 0.5, when: 'há 2 semanas' },
    ],
  })
  const [badges, setBadges] = useState(INITIAL_BADGES)
  const [gratitude, setGratitude] = useState(INITIAL_GRATITUDE)
  const [eventsGoing, setEventsGoing] = useState({})
  const [objectsReq, setObjectsReq] = useState({})
  const [ownObjects, setOwnObjects] = useState([])
  const [profile, setProfile] = useState({
    skills: ['Tecnologia e celular', 'Compras e farmácia', 'Companhia e conversa'],
    extra: [],
    slots: { 'Seg-Tarde': true, 'Qua-Tarde': true, 'Ter-Noite': true, 'Sáb-Manhã': true },
    trusted: 'Ana Alves',
    privacy: { wall: true, alerts: true, inactivityAlert: true },
  })

  const mainRef = useRef(null)
  const gratitudeRef = useRef(null)
  const timers = useRef([])
  const later = useCallback((fn, ms) => {
    const t = setTimeout(fn, ms)
    timers.current.push(t)
  }, [])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  useEffect(() => {
    const root = document.documentElement
    root.style.fontSize = `${FONT_LEVELS[a11y.font].px}px`
    root.dataset.theme = a11y.contrast
    try {
      localStorage.setItem(A11Y_KEY, JSON.stringify(a11y))
    } catch {
      /* ignore */
    }
  }, [a11y])

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
  }, [tab])

  const notify = useCallback((m, action) => setToast({ msg: m, action, id: Date.now() }), [])
  const closeToast = useCallback(() => setToast(null), [])
  const speech = useSpeech(useCallback((t) => notify(`Leitura em áudio: "${t.slice(0, 80)}..."`), [notify]))

  const updateChat = useCallback((id, fn) => setChats((cs) => (cs[id] ? { ...cs, [id]: fn(cs[id]) } : cs)), [])
  const push = (c, from, text) => ({ ...c, messages: [...c.messages, msg(from, text)] })
  const typingThen = useCallback(
    (id, startMs, endMs, fn) => {
      later(() => updateChat(id, (c) => ({ ...c, typing: true })), startMs)
      later(() => updateChat(id, (c) => fn({ ...c, typing: false })), endMs)
    },
    [later, updateChat],
  )

  const openChat = useCallback((id) => {
    setChats((cs) => (cs[id] ? { ...cs, [id]: { ...cs[id], unread: false } } : cs))
    setActiveChat(id)
  }, [])
  const closeChat = useCallback(() => setActiveChat(null), [])

  const openHelp = (r) => {
    if (chats[r.id]) return openChat(r.id)
    const id = r.id
    const isOffer = r.kind === 'oferta'
    setChats((cs) => ({
      ...cs,
      [id]: {
        reqId: id,
        role: 'helper',
        step: 0,
        time: null,
        shared: false,
        declined: false,
        typing: false,
        unread: false,
        done: false,
        lastReply: '',
        messages: [
          msg('sys', SYS_SAFE_CHAT),
          msg(
            'me',
            isOffer
              ? `Olá, ${r.name}! Aqui é ${ME.first}, do ${ME.block}. Vi sua oferta no mural e gostaria de conversar.`
              : `Olá, ${r.name}! Aqui é ${ME.first}, do ${ME.block}. Posso ajudar com o que você precisa.`,
          ),
        ],
      },
    }))
    setActiveChat(id)
    typingThen(id, 900, 2200, (c) => ({
      ...push(
        push(c, 'them', r.f ? 'Que alegria ter você por aqui! Muito obrigada pela atenção.' : 'Que alegria ter você por aqui! Muito obrigado pela atenção.'),
        'sys',
        `${r.name} confirmou o contato no chat seguro.`,
      ),
      step: 1,
    }))
  }

  const chatSend = (id, text) => {
    const { text: clean, masked } = maskSensitive(text)
    const prevLastReply = chats[id]?.lastReply || ''
    updateChat(id, (c) => {
      let n = push(c, 'me', clean)
      if (masked) n = push(n, 'sys', 'Por segurança, ocultamos o número de telefone ou documento. Combine os detalhes pelo chat seguro.')
      return n
    })
    const replyText = buildContextualReply(clean, prevLastReply)
    typingThen(id, 700, 1700, (c) => ({
      ...push(c, 'them', replyText),
      lastReply: replyText,
    }))
  }

  const chatSchedule = (id, opts) => {
    if (opts.accept) {
      const replyText = 'Que bom! Vamos combinar o melhor horário e local na área comum.'
      updateChat(id, (c) => ({
        ...push(push(c, 'me', `Aceito a sua ajuda, ${c.helper.name}! Muito obrigada.`), 'sys', `Você aceitou a ajuda de ${c.helper.name}.`),
        step: 1,
      }))
      typingThen(id, 700, 1600, (c) => ({
        ...push(c, 'them', replyText),
        lastReply: replyText,
      }))
      return
    }
    if (opts.decline) {
      updateChat(id, (c) => ({
        ...push(push(c, 'me', `Agradeço muito, ${c.helper.name}, mas não vou aceitar esta ajuda no momento.`), 'sys', `Você optou por não aceitar a ajuda de ${c.helper.name}.`),
        declined: true,
      }))
      notify('Ajuda proposta não aceita.')
      return
    }
    const replyText = `Perfeito, anotei ${opts.time}. Nos vemos por lá!`
    updateChat(id, (c) => ({
      ...push(push(c, 'me', `Combinado: ${opts.time}.`), 'sys', `Horário combinado: ${opts.time}. Sugerimos encontro em área comum.`),
      step: 2,
      time: opts.time,
    }))
    typingThen(id, 700, 1600, (c) => ({
      ...push(c, 'them', replyText),
      lastReply: replyText,
    }))
  }

  const chatShare = (id, trusted) => {
    const on = !chats[id]?.shared
    updateChat(id, (c) => ({
      ...push(c, 'sys', on ? `Contato de confiança (${trusted}) ativado: recebe alerta apenas em caso de emergência.` : 'Alerta de emergência desativado.'),
      shared: on,
    }))
    notify(on ? `Contato de confiança (${trusted}) ativado para emergência` : 'Alerta de emergência desativado')
  }

  const chatReport = (id, reason) => {
    const reqId = id
    setActiveChat(null)
    setChats((cs) => {
      const { [id]: _removed, ...rest } = cs
      return rest
    })
    setRequests((rs) => rs.map((r) => (r.id === reqId && !r.mine ? { ...r, hidden: true } : r)))
    notify(`Relato enviado ("${reason}"). A mediação da vizinhança responde em até 2h. Conversa encerrada.`)
  }

  const chatSOS = (id, trusted) => {
    updateChat(id, (c) => push(c, 'sys', `Alerta de emergência enviado a ${trusted} e à moderação, com localização aproximada. Se houver risco, ligue 192 ou 190.`))
    notify(`Alerta de emergência enviado a ${trusted} e à moderação`)
  }

  const requestFinish = (id) => {
    const chat = chats[id]
    if (chat.role === 'helper') commitCompletion({ reqId: id, role: 'helper' }, true)
    else setCompletion({ reqId: id, role: 'requester', summary: null })
  }

  const commitCompletion = ({ reqId, role, thanks, sealId, publish }, direct = false) => {
    const r = requests.find((x) => x.id === reqId)
    const chat = chats[reqId]
    const hours = r.hours
    let summary
    if (role === 'helper') {
      const seal = SEAL_BY_CATEGORY[r.category] || 'gentil'
      const a = { ob: r.f ? 'Obrigada' : 'Obrigado', o: r.f ? 'a' : 'o' }
      const text = THANKS(r, a)
      const count = (badges[seal] ?? 0) + 1
      const published = profile.privacy.wall
      setLedger((l) => ({
        ...l,
        given: l.given + hours,
        history: [{ id: mid(), type: 'give', label: `${r.name} - ${CAT_LABEL[r.category] || 'Outro'}`, hours, when: 'agora', fresh: true }, ...l.history],
      }))
      setBadges((b) => ({ ...b, [seal]: count, _new: seal }))
      if (published)
        setGratitude((g) => [{ id: mid(), from: r.name, to: ME.name, seal, text, ago: 'agora', hours, fresh: true }, ...g.map((x) => ({ ...x, fresh: false }))])
      summary = { hours, sealId: seal, count, isNew: count === 1, text, fromName: r.name, fromHue: r.hue, published, given: ledger.given + hours, received: ledger.received }
    } else {
      const helper = chat.helper
      setLedger((l) => ({
        ...l,
        received: l.received + hours,
        history: [{ id: mid(), type: 'get', label: `${helper.name} ajudou você`, hours, when: 'agora', fresh: true }, ...l.history],
      }))
      if (publish)
        setGratitude((g) => [{ id: mid(), from: ME.name, to: helper.name, seal: sealId, text: thanks, ago: 'agora', hours, fresh: true }, ...g.map((x) => ({ ...x, fresh: false }))])
      summary = { hours, sealId, count: 1, isNew: true, text: thanks, fromName: `${ME.name} (você)`, fromHue: 14, published: publish, given: ledger.given, received: ledger.received + hours }
    }
    updateChat(reqId, (c) => ({ ...c, done: true }))
    setRequests((rs) => rs.map((x) => (x.id === reqId ? { ...x, status: 'done' } : x)))
    setCompletion({ reqId, role, summary })
    if (direct) setActiveChat(null)
  }

  const closeCompletion = () => {
    setCompletion(null)
    setActiveChat(null)
    setTab('mural')
  }
  const goGratitude = () => {
    closeCompletion()
    later(() => gratitudeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 250)
  }

  const publishRequest = (partial) => {
    const id = `mine-${mid()}`
    const req = {
      id,
      mine: true,
      kind: partial.kind || 'pedido',
      frequency: partial.frequency || 'pontual',
      status: 'open',
      name: ME.name,
      age: ME.age,
      f: true,
      hue: 14,
      verified: true,
      validators: ['Helena Prado', 'Marta Souza'],
      seals: ['Pontual', 'Confirmado por 2 vizinhos'],
      distance: 0,
      place: ME.block,
      ...partial,
    }
    setRequests((rs) => [req, ...rs])
    setFilters((f) => ({ ...f, cat: 'todos', kind: 'todos' }))
    setTab('mural')
    notify('Pedido publicado! Avisa vizinhos compatíveis...')
    later(() => {
      const h = HELPER_POOL[partial.category === 'digital' ? 0 : Math.floor(Math.random() * HELPER_POOL.length)]
      setChats((cs) => ({
        ...cs,
        [id]: {
          reqId: id,
          role: 'requester',
          helper: h,
          step: 0,
          time: null,
          shared: false,
          declined: false,
          typing: false,
          unread: true,
          done: false,
          lastReply: '',
          messages: [
            msg('sys', SYS_SAFE_CHAT),
            msg('them', `Oi, ${ME.first}! ${req.kind === 'oferta' ? 'Vi a sua oferta e gostaria de aceitar sua ajuda.' : 'Vi o seu pedido e posso ajudar.'} Sou ${h.name}, do ${h.place}. Qual horário fica bom para você?`),
          ],
        },
      }))
      notify(`${h.name}, ${h.age} anos, quer ajudar no seu pedido`, { label: 'Ver', run: () => openChat(id) })
    }, 5500)
  }

  const toggleEvent = (e) => {
    const on = !eventsGoing[e.id]
    setEventsGoing((s) => ({ ...s, [e.id]: on }))
    notify(on ? `Presença confirmada: ${e.title.split(' com ')[0]}` : 'Presença cancelada - a vaga foi liberada')
  }
  const toggleObject = (o) => {
    const on = !objectsReq[o.id]
    setObjectsReq((s) => ({ ...s, [o.id]: on }))
    notify(on ? `Pedido enviado a ${o.owner}. Combinem a retirada pelo chat seguro.` : 'Pedido de empréstimo cancelado')
  }
  const addObject = (name, gender = 'm') => {
    const art = gender === 'f' ? 'A' : 'O'
    setOwnObjects((os) => [{ id: mid(), own: true, name, gender, cond: 'Boa', note: 'Você combina a retirada' }, ...os])
    notify(`${art} ${name} agora está no Banco de Objetos do bairro`)
  }
  const removeObject = (id) => {
    setOwnObjects((os) => os.filter((item) => item.id !== id))
    notify('Item removido do Banco de Objetos')
  }

  const evaluateHelper = ({ helperName, stars = 5, sealId = 'gentil', thanks = '', publish = true }) => {
    const cleanThanks = String(thanks || '').trim() || `Muito obrigada pela ajuda, ${helperName}!`
    if (publish) {
      setGratitude((g) => [
        { id: mid(), from: ME.name, to: helperName, seal: sealId, text: cleanThanks, ago: 'agora', hours: 1, fresh: true },
        ...g.map((x) => ({ ...x, fresh: false })),
      ])
    }
    notify(`Avaliação de ${stars} estrelas e selo "${SEALS[sealId]?.label || 'Gentil'}" enviados para ${helperName}!`)
    if (publish && typeof goGratitude === 'function') {
      goGratitude()
    }
  }

  const unread = Object.values(chats).filter((c) => c.unread).length
  const ctx = {
    requests: requests.filter((r) => !r.hidden), chats, filters, setFilters, speech, ledger, badges, gratitude, profile, setProfile,
    openHelp, openChat, closeChat, chatSend, chatSchedule, chatShare, chatReport, chatSOS, requestFinish, commitCompletion,
    closeCompletion, goGratitude, evaluateHelper, publishRequest, eventsGoing, toggleEvent, objectsReq, toggleObject, ownObjects, addObject, removeObject,
    notify, setTab, gratitudeRef,
  }

  const chat = activeChat ? chats[activeChat] : null
  const chatReq = activeChat ? requests.find((r) => r.id === activeChat) : null
  const compReq = completion ? requests.find((r) => r.id === completion.reqId) : null
  const compChat = completion ? chats[completion.reqId] : null

  const Screen = useMemo(() => ({ pedir: Pedir, mural: Mural, chat: ChatList, oficinas: Oficinas, perfil: Perfil })[tab], [tab])

  return (
    <AppCtx.Provider value={ctx}>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[100] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-bg">
        Ir para o conteúdo
      </a>
      <div className="min-h-dvh lg:flex lg:items-center lg:justify-center lg:gap-14 lg:bg-primary-soft/50 lg:px-8 lg:py-6">
        <Aside />

        <div
          className="relative mx-auto flex h-dvh w-full max-w-[520px] flex-col overflow-hidden bg-bg lg:mx-0 lg:h-[min(900px,calc(100dvh-3rem))] lg:w-[430px] lg:rounded-[2.25rem] lg:shadow-2xl"
          style={{ ['--tw-ring-color']: 'rgb(var(--c-ink))' }}
        >
          <div className="pointer-events-none absolute inset-0 z-[70] hidden rounded-[2.25rem] lg:block" style={{ boxShadow: 'inset 0 0 0 6px rgb(var(--c-ink))' }} aria-hidden="true" />
          <A11yBar a11y={a11y} setA11y={setA11y} speech={speech} />

          <header className="flex shrink-0 items-center justify-between gap-2 bg-surface px-4 py-2.5" style={{ borderBottom: '2px solid rgb(var(--c-line))' }}>
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-strong text-on-primary" aria-hidden="true">
                <HeartHandshake size={24} />
              </span>
              <span className="font-display text-[1.55rem] font-bold leading-none tracking-tight">Apoiaí</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="pill pill-green !text-[0.75rem]">
                <MapPin size={12} aria-hidden="true" /> {ME.area} · {fmtDist(filters.radius)}
              </span>
              <button
                type="button"
                onClick={() => setAboutOpen(true)}
                aria-label="Explicação do aplicativo e dados de referência"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary-strong"
                style={{ border: '1px solid rgb(var(--c-primary) / .4)' }}
              >
                <Info size={18} aria-hidden="true" />
              </button>
            </div>
          </header>

          <div className="shrink-0 bg-secondary-soft px-4 py-1.5 text-center text-[0.78rem] font-semibold text-secondary" style={{ borderBottom: '1px solid rgb(var(--c-secondary) / .25)' }}>
            Comunidade, auxílio mútuo e responsabilidade coletiva entre vizinhos
          </div>

          <main id="conteudo" ref={mainRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain" tabIndex={-1}>
            <Screen />
          </main>

          <BottomNav tab={tab} onChange={setTab} badge={unread} />

          {chat && chatReq && <Chat key={chat.reqId} chat={chat} request={chatReq} />}
          {completion && compReq && compChat && <Conclusao key={completion.reqId} completion={completion} request={compReq} chat={compChat} />}

          {aboutOpen && (
            <Sheet title="Sobre o Apoiaí" onClose={() => setAboutOpen(false)}>
              <div className="space-y-4">
                <p className="font-display text-xl font-bold leading-snug">Comunidade, auxílio mútuo e responsabilidade coletiva.</p>
                <p className="text-[0.98rem] leading-relaxed text-muted">
                  O Apoiaí nasce para fortalecer os laços da vizinhança e a responsabilidade coletiva pelo cuidado, sem cobrança ou lógica financeira por pedir ajuda, alinhado à Política Nacional de Cuidados (Lei nº 15.069/2024).
                </p>

                <div className="rounded-xl bg-surface p-3.5" style={{ border: 'var(--bw) solid rgb(var(--c-line))' }}>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-muted">Por que combater a solidão na vizinhança</h3>
                  <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                    {IMPACT_STATS.map((s) => (
                      <div key={s.value} className="rounded-xl bg-primary-soft p-2.5">
                        <p className="text-xl font-bold text-primary-strong">{s.value}</p>
                        <p className="mt-0.5 text-[0.8rem] leading-snug">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2.5 text-xs leading-snug text-muted">
                    Dados de referência do projeto sobre risco de mortalidade associado à solidão (+26%), ao isolamento social (+29%) e a morar só (+32%), além da prevalência de solidão em idosos brasileiros (16,8% sempre e 31,7% algumas vezes - ELSI-Brasil).
                  </p>
                </div>

                <div className="rounded-xl bg-secondary-soft p-3.5" style={{ border: 'var(--bw) solid rgb(var(--c-secondary) / .4)' }}>
                  <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-secondary">
                    <Cpu size={14} aria-hidden="true" /> Arquitetura Google & IA
                  </h3>
                  <ul className="mt-2 space-y-2 text-[0.88rem] leading-snug">
                    {GOOGLE_AI_PILLARS.map((item) => (
                      <li key={item.title}>
                        <b>{item.title}:</b> <span className="text-muted">{item.desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Sheet>
          )}

          <Toast toast={toast} onClose={closeToast} />
        </div>
      </div>
    </AppCtx.Provider>
  )
}

function Aside() {
  const steps = [
    ['Pedir ajuda', 'Fale ou digite o que precisa e toque em OK: o pedido é organizado e avisa vizinhos disponíveis.'],
    ['Mural do bairro', 'Filtre por distância, pedidos ou ofertas, escolha um pedido e toque em "Posso ajudar".'],
    ['Chat seguro', 'Combine o horário da ajuda. Se precisar, acione emergência ou contato de confiança.'],
    ['Meu perfil', 'Acompanhe sua participação, quem validou você, avaliações e descontos na comunidade.'],
  ]
  return (
    <aside className="hidden w-[25rem] shrink-0 lg:block" aria-label="Explicação do aplicativo">
      <div className="flex items-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-strong text-on-primary"><HeartHandshake size={32} aria-hidden="true" /></span>
        <h1 className="font-display text-5xl font-bold tracking-tight">Apoiaí</h1>
      </div>
      <p className="mt-4 font-display text-2xl font-bold leading-snug">Comunidade, auxílio mútuo e responsabilidade coletiva.</p>
      <p className="mt-3 text-[1.02rem] leading-relaxed text-muted">
        Rede de vizinhança sem cobrança ou lógica financeira por pedir ajuda, com validação comunitária e chat seguro.
      </p>
      <ul className="mt-5 space-y-2 text-[0.95rem]">
        <li className="flex items-center gap-2"><ShieldCheck size={18} className="text-secondary" aria-hidden="true" /> Vizinhos verificados e selos de reconhecimento</li>
        <li className="flex items-center gap-2"><Lock size={18} className="text-secondary" aria-hidden="true" /> Chat seguro, sem expor telefone nem endereço exato</li>
        <li className="flex items-center gap-2"><Mic size={18} className="text-secondary" aria-hidden="true" /> Voz, texto ampliado e alto contraste</li>
        <li className="flex items-center gap-2"><Users size={18} className="text-secondary" aria-hidden="true" /> Oficinas intergeracionais e banco de objetos</li>
      </ul>
      <div className="card mt-6 p-4">
        <h2 className="flex items-center gap-2 font-bold"><Smartphone size={18} aria-hidden="true" /> Como usar na demonstração</h2>
        <ol className="mt-2 space-y-2 text-[0.9rem] leading-snug">
          {steps.map(([t, d], i) => (
            <li key={t} className="flex gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-strong text-xs font-bold text-on-primary">{i + 1}</span>
              <span><b>{t}.</b> {d}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-4 rounded-xl border border-line bg-surface p-3.5" aria-label="Evidências sobre solidão e envelhecimento">
        <h3 className="text-xs font-bold uppercase tracking-wide text-muted">Contexto de solidão e envelhecimento</h3>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {IMPACT_STATS.map((s) => (
            <div key={s.value} className="rounded-lg bg-bg p-2">
              <p className="text-lg font-bold text-primary-strong">{s.value}</p>
              <p className="text-[0.75rem] leading-tight text-muted">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs leading-snug text-muted">
          Dados de referência do projeto sobre risco de mortalidade (solidão, isolamento social, morar só) e prevalência de solidão em idosos brasileiros (ELSI-Brasil).
        </p>
      </div>
    </aside>
  )
}