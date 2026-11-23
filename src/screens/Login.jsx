import { useEffect, useRef, useState } from 'react'
import { HeartHandshake, ShieldCheck, Lock, ArrowLeft, UserPlus, Info } from 'lucide-react'
import { Avatar } from '../components/ui.jsx'
import { AUTH_MODE, GOOGLE_CLIENT_ID, MOCK_ACCOUNTS, decodeJwt, loadGoogleScript, ageFromBirthDate } from '../lib/auth.js'

const PROFILES_KEY = 'apoiai:profiles'
const BLOCKS = ['Bloco A', 'Bloco B', 'Bloco C', 'Bloco D', 'Bloco E', 'Edifício vizinho', 'Rua residencial próxima']
const ROLES = [
  { id: 'ambos', label: 'Pedir e oferecer ajuda' },
  { id: 'pedir', label: 'Principalmente pedir ajuda' },
  { id: 'ofertar', label: 'Principalmente oferecer ajuda' },
]

const loadProfiles = () => {
  try {
    return JSON.parse(localStorage.getItem(PROFILES_KEY)) || {}
  } catch {
    return {}
  }
}

function GoogleG() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  )
}

export default function Login({ onDone }) {
  const [account, setAccount] = useState(null)
  const [picker, setPicker] = useState(false)
  const [gisError, setGisError] = useState('')
  const [form, setForm] = useState({ birthDate: '', block: 'Bloco C', area: 'Vila Mariana', f: true, role: 'ambos', accept: false })
  const gisBtn = useRef(null)
  const age = ageFromBirthDate(form.birthDate)
  const ageOk = age !== null && age >= 16 && age <= 120
  const maxBirth = new Date().toISOString().slice(0, 10)

  const handleAccount = (acc) => {
    setPicker(false)
    const existing = loadProfiles()[acc.sub]
    if (existing) onDone({ account: acc, profile: existing, mode: AUTH_MODE })
    else setAccount(acc)
  }

  // Botão oficial do Google (modo real)
  useEffect(() => {
    if (AUTH_MODE !== 'google' || account) return
    let cancelled = false
    loadGoogleScript()
      .then(() => {
        if (cancelled || !gisBtn.current) return
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (res) => handleAccount(decodeJwt(res.credential)),
        })
        window.google.accounts.id.renderButton(gisBtn.current, { theme: 'outline', size: 'large', text: 'continue_with', shape: 'pill', locale: 'pt-BR', width: 300 })
      })
      .catch((e) => setGisError(e.message))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

  const submitProfile = (e) => {
    e.preventDefault()
    if (!form.accept || !ageOk) return
    const profile = { birthDate: form.birthDate, block: form.block, area: form.area.trim() || 'Vila Mariana', f: form.f, role: form.role }
    localStorage.setItem(PROFILES_KEY, JSON.stringify({ ...loadProfiles(), [account.sub]: profile }))
    onDone({ account, profile, mode: AUTH_MODE })
  }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-8">
      {!account ? (
        <>
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <span className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-primary-strong text-on-primary">
              <HeartHandshake size={44} aria-hidden="true" />
            </span>
            <h1 className="mt-5 font-display text-[2rem] font-bold">Apoiaí</h1>
            <p className="mt-2 text-[1.1rem] text-muted">Rede de ajuda mútua entre vizinhos de todas as idades.</p>

            <div className="mt-10 flex w-full flex-col items-center gap-3">
              {AUTH_MODE === 'google' ? (
                <>
                  <div ref={gisBtn} className="min-h-[44px]" />
                  {gisError && <p role="alert" className="text-sm text-danger">{gisError}. Verifique sua conexão.</p>}
                </>
              ) : (
                <button type="button" onClick={() => setPicker(true)} className="btn w-full !min-h-[3.5rem] bg-surface text-[1.08rem] font-bold text-ink" style={{ border: '1px solid rgb(var(--c-edge))' }}>
                  <GoogleG /> Continuar com o Google
                </button>
              )}
              <p className="flex items-center gap-2 text-sm text-muted">
                <Lock size={14} aria-hidden="true" /> Usamos apenas nome, e-mail e foto. Nunca publicamos seu endereço.
              </p>
            </div>
          </div>
          {AUTH_MODE === 'simulado' && (
            <p className="mt-6 flex items-start gap-2 rounded-xl bg-primary-soft p-3 text-left text-sm text-muted">
              <Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              Modo demonstração: o login com Google é simulado. Configure VITE_GOOGLE_CLIENT_ID para usar contas reais.
            </p>
          )}
        </>
      ) : (
        <form onSubmit={submitProfile} className="space-y-5">
          <button type="button" onClick={() => setAccount(null)} className="inline-flex items-center gap-1 text-sm font-bold text-muted">
            <ArrowLeft size={16} aria-hidden="true" /> Trocar conta
          </button>
          <div className="flex items-center gap-3">
            <Avatar name={account.name} hue={14} size={56} photo={account.picture} />
            <div className="min-w-0">
              <h1 className="font-display text-[1.4rem] font-bold leading-tight">Bem-vindo(a), {account.name.split(' ')[0]}!</h1>
              <p className="truncate text-sm text-muted">{account.email}</p>
            </div>
          </div>
          <p className="text-[1.02rem]">Falta pouco. Conte um pouco sobre você para conectarmos com vizinhos próximos.</p>

          <label className="block">
            <span className="mb-1 block font-bold">Data de nascimento</span>
            <input type="date" required min="1900-01-01" max={maxBirth} value={form.birthDate} onChange={(e) => set('birthDate', e.target.value)} className="field" />
            {age !== null && (
              <span className={`mt-1 block text-sm ${ageOk ? 'text-muted' : 'text-danger'}`}>
                {ageOk ? `${age} anos — exibido no seu perfil (a data não é mostrada aos vizinhos).` : 'É preciso ter pelo menos 16 anos para participar.'}
              </span>
            )}
          </label>

          <fieldset>
            <legend className="mb-1 font-bold">Como prefere ser tratado(a)?</legend>
            <div className="flex gap-2">
              {[[true, 'Vizinha'], [false, 'Vizinho']].map(([v, l]) => (
                <button key={l} type="button" aria-pressed={form.f === v} onClick={() => set('f', v)} className={`chip flex-1 justify-center ${form.f === v ? 'chip-on' : ''}`}>
                  {l}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="mb-1 block font-bold">Onde você mora</span>
            <select value={form.block} onChange={(e) => set('block', e.target.value)} className="field">
              {BLOCKS.map((b) => <option key={b}>{b}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block font-bold">Bairro</span>
            <input value={form.area} onChange={(e) => set('area', e.target.value)} className="field" />
          </label>

          <fieldset>
            <legend className="mb-1 font-bold">Como quer participar?</legend>
            <div className="flex flex-col gap-2">
              {ROLES.map((r) => (
                <button key={r.id} type="button" aria-pressed={form.role === r.id} onClick={() => set('role', r.id)} className={`chip !justify-start ${form.role === r.id ? 'chip-on' : ''}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={form.accept} onChange={(e) => set('accept', e.target.checked)} className="mt-1 h-5 w-5" />
            <span>
              <ShieldCheck size={14} className="inline text-secondary" aria-hidden="true" /> Concordo com as regras de convivência: sem dinheiro envolvido, encontros em áreas comuns e respeito entre gerações.
            </span>
          </label>

          <button type="submit" disabled={!form.accept || !ageOk} className="btn btn-primary w-full !min-h-[3.5rem] text-[1.1rem]">
            <UserPlus size={22} aria-hidden="true" /> Criar meu perfil
          </button>
        </form>
      )}

      {picker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={() => setPicker(false)} role="dialog" aria-modal="true" aria-label="Escolher conta Google">
          <div className="w-full max-w-sm rounded-t-3xl bg-surface p-5 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-1 flex items-center justify-center gap-2"><GoogleG /><span className="font-bold">Fazer login com o Google</span></div>
            <p className="mb-4 text-center text-sm text-muted">Escolha uma conta para continuar no Apoiaí</p>
            <ul className="divide-y divide-line">
              {MOCK_ACCOUNTS.map((a) => (
                <li key={a.sub}>
                  <button type="button" onClick={() => handleAccount(a)} className="flex w-full items-center gap-3 py-3 text-left hover:bg-primary-soft">
                    <Avatar name={a.name} hue={200} size={40} />
                    <span className="min-w-0">
                      <span className="block font-bold">{a.name}</span>
                      <span className="block truncate text-sm text-muted">{a.email}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
