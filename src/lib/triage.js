import { CAT_LABEL } from '../data.js'

export const MIC_PHRASES = [
  'Preciso de ajuda para configurar o aplicativo do banco no meu celular novo hoje à tarde.',
  'Alguém pode ir à farmácia buscar meu remédio de pressão hoje antes das 18h?',
  'Gostaria de companhia para tomar um café e conversar amanhã à tarde.',
  'Preciso de ajuda toda segunda-feira para passear com o meu cachorro na praça.',
]

const RULES = [
  { cat: 'pet_plantas', words: ['planta', 'plantas', 'regar', 'cachorro', 'cao', 'gato', 'pet', 'racao', 'animal', 'bicho', 'jardim', 'vaso'], minutes: 30 },
  { cat: 'carona', words: ['carona', 'levar de carro', 'buscar de carro', 'dirigir', 'transporte', 'uber', 'taxi'], minutes: 60 },
  { cat: 'saude', words: ['farmacia', 'remedio', 'medicamento', 'consulta', 'exame', 'medico', 'hospital', 'posto de saude', 'ubs', 'fisioterapia', 'pressao', 'curativo'], minutes: 45 },
  { cat: 'reparos', words: ['lampada', 'torneira', 'consertar', 'reparo', 'ferramenta', 'chuveiro', 'tomada', 'porta', 'fechadura', 'escada', 'vazamento', 'montar'], minutes: 45 },
  { cat: 'tecnologia', words: ['celular', 'aplicativo', 'app', 'banco', 'pix', 'whatsapp', 'videochamada', 'tablet', 'computador', 'notebook', 'internet', 'wifi', 'senha', 'telefone'], minutes: 30 },
  { cat: 'passeio', words: ['passear', 'passeio', 'caminhar', 'caminhada', 'dar uma volta', 'praca', 'padaria', 'bengala', 'braco dado'], minutes: 40 },
  { cat: 'compras', words: ['compra', 'compras', 'mercado', 'supermercado', 'feira', 'sacola', 'sacolas', 'mantimento', 'pao', 'leite', 'encomenda'], minutes: 45 },
  { cat: 'entretenimento', words: ['jogo', 'jogos', 'baralho', 'xadrez', 'dama', 'musica', 'violao', 'filme', 'leitura', 'ler livro', 'pintura', 'artesanato', 'receita'], minutes: 60 },
  { cat: 'companhia', words: ['companhia', 'cafe', 'conversar', 'conversa', 'visita', 'sozinha', 'sozinho', 'ouvir', 'bater papo', 'cha'], minutes: 60 },
]

const EMERGENCY_RE = /(dor no peito|falta de ar|desmai|sangramento|convuls|infarto|avc|acidente grave|queda grave|nao consigo respirar)/i
const HIGH_URGENCY_RE = /(urgente|agora|hoje|ainda hoje|imediat|remedio|pressao|quebrou|sem luz|vazando)/i
const LOW_URGENCY_RE = /(semana que vem|proximo sabado|domingo|sem pressa|quando puder|fim de semana|toda segunda|toda terca|toda quarta|toda quinta|toda sexta)/i

function normalize(str = '') {
  return String(str).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function extractWhen(raw = '') {
  const s = normalize(raw)
  if (/agora|imediat/.test(s)) return 'Agora (nas próximas 2 horas)'
  if (/hoje.*tarde|esta tarde/.test(s)) return 'Hoje, à tarde'
  if (/hoje.*noite|esta noite/.test(s)) return 'Hoje, à noite'
  if (/hoje/.test(s)) return 'Ainda hoje'
  if (/amanha.*manha/.test(s)) return 'Amanhã, de manhã'
  if (/amanha.*tarde/.test(s)) return 'Amanhã, à tarde'
  if (/amanha/.test(s)) return 'Amanhã'
  if (/fim de semana/.test(s)) return 'Neste fim de semana'
  if (/segunda/.test(s)) return 'Segunda-feira'
  if (/terca/.test(s)) return 'Terça-feira'
  if (/quarta/.test(s)) return 'Quarta-feira'
  if (/quinta/.test(s)) return 'Quinta-feira'
  if (/sexta/.test(s)) return 'Sexta-feira'
  if (/sabado/.test(s)) return 'Sábado'
  if (/domingo/.test(s)) return 'Domingo'
  return null
}

export function triage(text = '', _unused = false, forceCategory = null) {
  const norm = normalize(text)
  const emergency = EMERGENCY_RE.test(norm)
  let bestCat = forceCategory || null
  let bestScore = 0
  let minutes = 40

  if (!bestCat) {
    for (const rule of RULES) {
      let score = 0
      for (const w of rule.words) if (norm.includes(w)) score += w.includes(' ') ? 2 : 1
      if (score > bestScore) { bestScore = score; bestCat = rule.cat; minutes = rule.minutes }
    }
  } else {
    const found = RULES.find((r) => r.cat === bestCat)
    if (found) minutes = found.minutes
  }

  const lowConfidence = !bestCat || bestScore === 0
  const category = bestCat || 'outros'
  let urgency = 'Moderada'
  if (emergency || HIGH_URGENCY_RE.test(norm)) urgency = 'Alta'
  else if (LOW_URGENCY_RE.test(norm)) urgency = 'Baixa'
  const credits = Math.max(0.5, Math.round((minutes / 60) * 2) / 2)

  return { category, affinity: CAT_LABEL[category] || 'Outros', urgency, minutes, credits, when: extractWhen(text), emergency, lowConfidence }
}