export function initials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'VA'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function fmtDist(meters = 500) {
  if (meters >= 1000) {
    const km = Math.round((meters / 1000) * 10) / 10
    return `${String(km).replace('.', ',')} km`
  }
  return `${meters} m`
}

export function fmtHours(h = 0) {
  const n = Number(h) || 0
  return `${String(n).replace('.', ',')} h`
}

export function fmtCredit(h = 0) {
  return `${fmtHours(h)} solidárias`
}

export function fmtMinutes(m = 30) {
  return `${m} min`
}

export function maskSensitive(text = '') {
  const phoneRegex = /(\+?\d{2}\s?)?\(?\d{2}\)?\s?\d{4,5}-?\d{4}/g
  let masked = false
  const cleaned = String(text).replace(phoneRegex, () => {
    masked = true
    return '[dado oculto no chat seguro]'
  })
  return { text: cleaned, masked }
}