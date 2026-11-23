import { ME } from '../data.js'

/**
 * Autenticação com Google em modo híbrido:
 * - Se VITE_GOOGLE_CLIENT_ID estiver definido (.env.local), usa o Google Identity Services real.
 * - Caso contrário, usa um seletor de contas simulado (demo offline).
 * Protótipo sem backend: o token do Google é apenas decodificado no navegador, NÃO verificado.
 */
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
export const AUTH_MODE = GOOGLE_CLIENT_ID ? 'google' : 'simulado'

const SESSION_KEY = 'apoiai:session'

export const MOCK_ACCOUNTS = [
  { sub: 'mock-1', name: 'Marina Alves', email: 'marina.alves@gmail.com', picture: '' },
  { sub: 'mock-2', name: 'Pedro Henrique Lima', email: 'pedro.lima@gmail.com', picture: '' },
  { sub: 'mock-3', name: 'Dona Lourdes Ribeiro', email: 'lourdes.ribeiro@gmail.com', picture: '' },
]

/** Decodifica o payload de um JWT (credential do Google) sem verificar assinatura. */
export function decodeJwt(token) {
  const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  const json = decodeURIComponent(
    atob(b64)
      .split('')
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join(''),
  )
  const p = JSON.parse(json)
  return { sub: p.sub, name: p.name, email: p.email, picture: p.picture }
}

export function loadSession() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY))
    return s?.account?.sub ? s : null
  } catch {
    return null
  }
}

export function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
  if (AUTH_MODE === 'google') window.google?.accounts?.id?.disableAutoSelect()
}

/** Calcula a idade completa a partir de uma data 'AAAA-MM-DD'. */
export function ageFromBirthDate(iso, today = new Date()) {
  const [y, m, d] = String(iso || '').split('-').map(Number)
  if (!y || !m || !d) return null
  let age = today.getFullYear() - y
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age -= 1
  return age
}

/** Aplica o usuário logado ao objeto ME compartilhado (usado em todas as telas). */
export function applySessionToMe({ account, profile }) {
  const name = account.name || 'Vizinho'
  Object.assign(ME, {
    name,
    first: name.split(/\s+/)[0],
    email: account.email,
    picture: account.picture || undefined,
    birthDate: profile.birthDate,
    age: ageFromBirthDate(profile.birthDate) ?? (Number(profile.age) || ME.age),
    block: profile.block || ME.block,
    area: profile.area || ME.area,
    f: profile.f,
    role: profile.role,
  })
}

let gisPromise = null
/** Carrega o script do Google Identity Services uma única vez. */
export function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve()
  gisPromise ??= new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.onload = resolve
    s.onerror = () => {
      gisPromise = null
      reject(new Error('Falha ao carregar o Google Identity Services'))
    }
    document.head.appendChild(s)
  })
  return gisPromise
}
