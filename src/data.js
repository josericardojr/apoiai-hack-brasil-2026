export const ME = { name: 'Marina Alves', age: 32, first: 'Marina', block: 'Bloco C', area: 'Vila Mariana' }

export const CATEGORIES = [
  { id: 'todos', label: 'Todos' },
  { id: 'compras', label: 'Compras' },
  { id: 'companhia', label: 'Companhia' },
  { id: 'pet_plantas', label: 'Pet e plantas' },
  { id: 'carona', label: 'Carona' },
  { id: 'tecnologia', label: 'Tecnologia' },
  { id: 'passeio', label: 'Passeio' },
  { id: 'saude', label: 'Apoio em saúde' },
  { id: 'reparos', label: 'Pequenos reparos' },
  { id: 'entretenimento', label: 'Entretenimento' },
  { id: 'urgente', label: 'Urgente' },
  { id: 'outros', label: 'Outros' },
]

export const CAT_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]))

export const RADIUS_OPTIONS = [
  { m: 200, label: 'Até 200m' },
  { m: 500, label: 'Até 500m' },
  { m: 1000, label: 'Até 1 km' },
]

export const SEALS = {
  pontual: { label: 'Pontual', desc: 'Chega no horário combinado', icon: 'Clock' },
  paciencia: { label: 'Paciência Digital', desc: 'Ensina tecnologia com calma', icon: 'Smartphone' },
  mao: { label: 'Mão na Roda', desc: 'Resolve compras, caronas e recados', icon: 'Footprints' },
  coracao: { label: 'Coração de Vizinho', desc: 'Faz companhia e acolhe', icon: 'Heart' },
  cuidador: { label: 'Cuidador de Confiança', desc: 'Cuida de plantas, pets e pessoas', icon: 'ShieldCheck' },
  gentil: { label: 'Gentil', desc: 'Sempre trata todos com carinho', icon: 'Smile' },
}

export const SEAL_BY_CATEGORY = {
  tecnologia: 'paciencia',
  compras: 'mao',
  carona: 'mao',
  passeio: 'coracao',
  companhia: 'coracao',
  pet_plantas: 'cuidador',
  saude: 'cuidador',
  reparos: 'mao',
  entretenimento: 'gentil',
}

export const INITIAL_BADGES = { pontual: 3, gentil: 2 }

export const INITIAL_REQUESTS = [
  { id: 'r1', kind: 'pedido', frequency: 'pontual', name: 'Helena Prado', age: 74, f: true, hue: 14, verified: true, validators: ['Roberto Dias', 'Beatriz Campos', 'Carlos Menezes'], seals: ['Pontual', 'Confirmado por 3 vizinhos'], distance: 200, place: 'Bloco B', category: 'tecnologia', urgency: 'Moderada', text: 'Comprei um celular novo e preciso de ajuda para configurar o aplicativo do banco. Tenho medo de errar e perder dinheiro, então quero alguém com paciência.', when: 'Hoje, entre 15h e 17h', minutes: 30, hours: 0.5 },
  { id: 'r2', kind: 'pedido', frequency: 'pontual', name: 'Antônio Mendes', age: 81, f: false, hue: 200, verified: true, validators: ['Helena Prado', 'Lucas Rocha', 'Marta Souza', 'Roberto Dias', 'Beatriz Campos'], seals: ['Confirmado por 5 vizinhos', 'Pontual'], distance: 350, place: 'Rua residencial próxima', category: 'saude', urgency: 'Alta', text: 'Preciso buscar meu remédio de pressão na farmácia e a farmácia fecha às 19h. Minha perna está inchada e não consigo ir até lá hoje.', when: 'Hoje, até as 18h30', minutes: 30, hours: 0.5 },
  { id: 'r3', kind: 'pedido', frequency: 'pontual', name: 'Lucas Rocha', age: 24, f: false, hue: 150, verified: true, validators: ['Helena Prado', 'Beatriz Campos'], seals: ['Paciência Digital', 'Confirmado por 2 vizinhos'], distance: 450, place: 'Bloco D', category: 'pet_plantas', urgency: 'Baixa', text: 'Vou viajar no fim de semana. Alguém pode regar minhas plantas no sábado e domingo e dar comida para o meu gato, o Pipoca? Ele é bem manso.', when: 'Sábado e domingo, de manhã', minutes: 30, hours: 0.5, offers: 1 },
  { id: 'r4', kind: 'pedido', frequency: 'recorrente', name: 'Marta Souza', age: 79, f: true, hue: 330, verified: true, validators: ['Helena Prado', 'Antônio Mendes', 'Lucas Rocha', 'Roberto Dias', 'Beatriz Campos', 'Carlos Menezes', 'Cláudia Nogueira', 'Zilda Costa'], seals: ['Confirmado por 8 vizinhos', 'Coração de Vizinho'], distance: 120, place: 'Bloco A', category: 'companhia', urgency: 'Baixa', text: 'Moro sozinha desde que meu marido partiu. Gostaria de companhia para tomar um café e dar uma volta na praça aqui perto. Adoro conversar e contar histórias!', when: 'Amanhã, às 16h', minutes: 60, hours: 1 },
  { id: 'r5', kind: 'pedido', frequency: 'pontual', name: 'Joaquim Ferreira', age: 86, f: false, hue: 40, verified: true, validators: ['Marta Souza', 'Antônio Mendes', 'Lucas Rocha', 'Beatriz Campos'], seals: ['Confirmado por 4 vizinhos'], distance: 120, place: 'Bloco A', category: 'reparos', urgency: 'Moderada', text: 'A torneira da cozinha está pingando e a lâmpada da sala queimou. Não alcanço o soquete sem escada. Alguém com uma ferramentinha e um pouco de jeito?', when: 'Esta semana, de manhã', minutes: 40, hours: 0.75 },
  { id: 'r6', kind: 'pedido', frequency: 'recorrente', name: 'Cláudia Nogueira', age: 52, f: true, hue: 280, verified: true, validators: ['Helena Prado', 'Roberto Dias', 'Beatriz Campos'], seals: ['Pontual', 'Confirmada por 3 vizinhos'], distance: 600, place: 'Edifício vizinho', category: 'carona', urgency: 'Moderada', text: 'Preciso de uma carona solidária, ida e volta, para a minha sessão de fisioterapia na terça de manhã. Estou com o joelho machucado e não posso dirigir.', when: 'Terça-feira, às 9h', minutes: 90, hours: 1.5 },
  { id: 'r7', kind: 'pedido', frequency: 'pontual', name: 'Zilda Costa', age: 77, f: true, hue: 100, verified: true, validators: ['Marta Souza', 'Beatriz Campos'], seals: ['Confirmada por 2 vizinhos'], distance: 800, place: 'Edifício vizinho', category: 'tecnologia', urgency: 'Baixa', text: 'Quero aprender a fazer videochamada com minha neta Júlia, que mora em Recife. Já tenho o tablet, só falta alguém me ensinar o passo a passo.', when: 'Domingo, às 10h', minutes: 45, hours: 0.75 },
  { id: 'r8', kind: 'pedido', frequency: 'pontual', name: 'Mariana Lima', age: 38, f: true, hue: 20, verified: true, validators: ['Helena Prado', 'Marta Souza', 'Lucas Rocha', 'Beatriz Campos'], seals: ['Cuidadora de Confiança', 'Confirmada por 4 vizinhos'], distance: 300, place: 'Bloco E', category: 'saude', urgency: 'Moderada', text: 'Preciso de alguém para ficar 2 horas com a minha mãe, que tem 80 anos, enquanto resolvo um compromisso. Ela só precisa de companhia e uma xícara de chá.', when: 'Amanhã, de manhã', minutes: 120, hours: 2 },
  { id: 'r9', kind: 'pedido', frequency: 'recorrente', name: 'Raimundo Alves', age: 70, f: false, hue: 175, verified: true, validators: ['Antônio Mendes', 'Joaquim Ferreira', 'Roberto Dias'], seals: ['Confirmado por 3 vizinhos'], distance: 900, place: 'Rua residencial próxima', category: 'compras', urgency: 'Baixa', text: 'Faço a compra do mês no mercado todo sábado, mas agora não consigo carregar as sacolas pesadas. Preciso de apoio para levar as compras do mercado até em casa.', when: 'Sábado, às 9h', minutes: 60, hours: 1 },
  { id: 'r10', kind: 'pedido', frequency: 'pontual', name: 'Neide Vasconcelos', age: 83, f: true, hue: 0, verified: true, validators: ['Helena Prado', 'Marta Souza', 'Antônio Mendes', 'Joaquim Ferreira', 'Lucas Rocha', 'Beatriz Campos'], seals: ['Confirmada por 6 vizinhos', 'Pontual'], distance: 90, place: 'Bloco A', category: 'passeio', urgency: 'Alta', text: 'Minha bengala quebrou. Preciso de ajuda para ir até a padaria da esquina comprar pão e leite, e voltar com segurança. Pode ser de braço dado, sem pressa.', when: 'Agora (nas próximas 2 horas)', minutes: 20, hours: 0.5 },
  { id: 'of1', kind: 'oferta', frequency: 'recorrente', name: 'Marta Souza', age: 79, f: true, hue: 330, verified: true, validators: ['Helena Prado', 'Lucas Rocha', 'Beatriz Campos'], seals: ['Confirmado por 3 vizinhos', 'Coração de Vizinho'], distance: 120, place: 'Bloco A', category: 'entretenimento', urgency: 'Baixa', text: 'Ofereço leitura de livros, jogos de tabuleiro e troca de receitas de família no período da tarde para quem quiser companhia.', when: 'Terças e quintas, às 15h', minutes: 60, hours: 1 },
  { id: 'of2', kind: 'oferta', frequency: 'recorrente', name: 'Lucas Rocha', age: 24, f: false, hue: 150, verified: true, validators: ['Helena Prado', 'Zilda Costa', 'Beatriz Campos'], seals: ['Paciência Digital', 'Confirmado por 3 vizinhos'], distance: 450, place: 'Bloco D', category: 'tecnologia', urgency: 'Baixa', text: 'Ofereço ajuda calma para configurar WhatsApp, chamadas de vídeo, contas digitais e checar mensagens suspeitas no celular ou tablet.', when: 'Sábados, das 14h às 17h', minutes: 45, hours: 0.75 },
]

export const INITIAL_GRATITUDE = [
  { id: 'g1', from: 'Zilda Costa', to: 'Beatriz Campos', seal: 'paciencia', text: 'A Beatriz me ensinou a mandar áudio para a minha neta sem pressa nenhuma. Hoje chorei de felicidade ouvindo a voz dela. Muito obrigada, minha querida!', ago: 'há 2 horas', hours: 1 },
  { id: 'g2', from: 'Roberto Dias', to: 'Lucas Rocha', seal: 'mao', text: 'O Lucas carregou minhas compras escada acima e ainda ficou para um café. Gente boa demais!', ago: 'ontem', hours: 0.5 },
  { id: 'g3', from: 'Marta Souza', to: 'Carlos Menezes', seal: 'coracao', text: 'Carlos veio tomar café comigo e trouxe um bolo de fubá. Falamos de samba por duas horas. Que tarde linda.', ago: 'há 3 dias', hours: 2 },
]

export const EVENTS = [
  { id: 'e1', title: 'Roda de Receitas de Família com Marta Souza', host: 'Marta Souza, 79 anos', when: 'Sábado, 16h às 18h', place: 'Salão de festas do Bloco A', spots: 12, going: 7, gens: ['Idosos', 'Jovens', 'Crianças'], icon: 'ChefHat', desc: 'Traga a receita que passou de geração em geração. Vamos cozinhar bolo de fubá juntos e contar a história de cada prato.' },
  { id: 'e2', title: 'Oficina de Celular sem Medo com estudantes do bairro', host: 'Estudantes voluntários (Lucas Rocha e equipe)', when: 'Quinta, 15h às 16h30', place: 'Biblioteca comunitária da Associação de Moradores', spots: 10, going: 8, gens: ['Idosos', 'Estudantes'], icon: 'Smartphone', desc: 'WhatsApp, videochamada, Pix com segurança e como identificar golpes. Cada aluno aprende no seu ritmo.' },
  { id: 'e3', title: 'Contos do Bairro de Antigamente com Joaquim Ferreira', host: 'Joaquim Ferreira, 86 anos', when: 'Domingo, 10h às 11h30', place: 'Praça da Vila (banco da sombra)', spots: 20, going: 11, gens: ['Idosos', 'Crianças', 'Famílias'], icon: 'BookOpenText', desc: 'Joaquim conta como era a Vila Mariana nos anos 60. As crianças fazem desenhos e perguntas.' },
  { id: 'e4', title: 'Horta Comunitária: plantio e troca de mudas', host: 'Grupo Raízes (moradores de todas as idades)', when: 'Próximo sábado, 9h', place: 'Pátio verde do condomínio', spots: 15, going: 6, gens: ['Todas as idades'], icon: 'Sprout', desc: 'Aprenda a plantar temperos com quem tem mão boa para isso. Cada pessoa leva uma muda para casa.' },
]

export const OBJECTS = [
  { id: 'o1', name: 'Furadeira', gender: 'f', owner: 'Roberto Dias', place: 'Bloco C', cond: 'Ótima', icon: 'Drill', note: 'Acompanha brocas' },
  { id: 'o2', name: 'Cadeira de rodas dobrável', gender: 'f', owner: 'Marta Souza', place: 'Bloco A', cond: 'Boa', icon: 'Accessibility', note: 'Ideal para consultas' },
  { id: 'o3', name: 'Escada de 5 degraus', gender: 'f', owner: 'Lucas Rocha', place: 'Bloco D', cond: 'Ótima', icon: 'ArrowUpFromLine', note: 'Retirar no hall' },
  { id: 'o4', name: 'Andador', gender: 'm', owner: 'Cláudia Nogueira', place: 'Edifício vizinho', cond: 'Boa', icon: 'Footprints', note: 'Empréstimo de curto prazo' },
  { id: 'o5', name: 'Carrinho de feira', gender: 'm', owner: 'Zilda Costa', place: 'Edifício vizinho', cond: 'Ótima', icon: 'ShoppingCart', note: 'Rodas silenciosas' },
  { id: 'o6', name: 'Caixa de ferramentas', gender: 'f', owner: 'Antônio Mendes', place: 'Rua próxima', cond: 'Boa', icon: 'Wrench', note: 'Chaves e alicates básicos' },
]

export const SKILLS = ['Tecnologia e celular', 'Compras e farmácia', 'Carona', 'Pequenos reparos', 'Companhia e conversa', 'Cozinha', 'Plantas e pets', 'Acompanhar em consultas', 'Costura']
export const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
export const PERIODS = ['Manhã', 'Tarde', 'Noite']

export const HELPER_POOL = [
  {
    name: 'Lucas Rocha',
    age: 24,
    f: false,
    hue: 150,
    validators: ['Helena Prado', 'Beatriz Campos'],
    seals: ['Paciência Digital', 'Pontual'],
    place: 'Bloco D',
    rating: 4.9,
    helpedCount: 11,
    since: 'Na rede há 8 meses',
    bio: 'Estudante de computação, mora no Bloco D há 3 anos. Ajuda com celular, compras e pequenos recados.',
    reviews: [
      { id: 'rev-l1', from: 'Helena Prado', text: 'Me ajudou a organizar as fotos dos meus netos no celular e anotou tudo no papel para eu não esquecer.', ago: 'há 1 semana' },
      { id: 'rev-l2', from: 'Joaquim Ferreira', text: 'Trocou a lâmpada da minha cozinha rapidinho e ainda conferiu se o interruptor estava seguro.', ago: 'há 2 semanas' },
      { id: 'rev-l3', from: 'Zilda Costa', text: 'Configurou o Wi-Fi do meu tablet com muita calma e educação. Recomendo demais!', ago: 'há 1 mês' },
      { id: 'rev-l4', from: 'Antônio Mendes', text: 'Buscou meu remédio na farmácia num dia de chuva e não quis aceitar nada em troca.', ago: 'há 2 meses' },
    ],
  },
  {
    name: 'Beatriz Campos',
    age: 29,
    f: true,
    hue: 330,
    validators: ['Helena Prado', 'Marta Souza', 'Zilda Costa', 'Cláudia Nogueira'],
    seals: ['Gentil', 'Paciência Digital', 'Confirmada por 4 vizinhos'],
    place: 'Bloco A',
    rating: 5.0,
    helpedCount: 16,
    since: 'Na rede há 1 ano',
    bio: 'Professora e moradora do Bloco A. Tem muita paciência para ensinar tecnologia e fazer companhia.',
    reviews: [
      { id: 'rev-b1', from: 'Marta Souza', text: 'Veio tomar chá comigo e me ensinou a usar a videochamada. Uma querida!', ago: 'há 5 dias' },
      { id: 'rev-b2', from: 'Cláudia Nogueira', text: 'Me acompanhou até a clínica de fisioterapia e esperou comigo na recepção.', ago: 'há 2 semanas' },
      { id: 'rev-b3', from: 'Helena Prado', text: 'Muito pontual e atenciosa. Me ajudou a identificar uma mensagem falsa no WhatsApp.', ago: 'há 1 mês' },
      { id: 'rev-b4', from: 'Neide Vasconcelos', text: 'Foi comigo à padaria de braço dado, sem nenhuma pressa. Me senti muito segura.', ago: 'há 2 meses' },
    ],
  },
  {
    name: 'Carlos Menezes',
    age: 45,
    f: false,
    hue: 210,
    validators: ['Marta Souza', 'Helena Prado', 'Antônio Mendes', 'Joaquim Ferreira', 'Roberto Dias', 'Beatriz Campos'],
    seals: ['Pontual', 'Coração de Vizinho', 'Confirmado por 6 vizinhos'],
    place: 'Bloco B',
    rating: 5.0,
    helpedCount: 23,
    since: 'Na rede há 2 anos',
    bio: 'Morador do Bloco B há 9 anos. Ajuda com reparos, caronas solidárias e visitas na vizinhança.',
    reviews: [
      { id: 'rev-c1', from: 'Joaquim Ferreira', text: 'Consertou o vazamento da pia em 20 minutos e deixou tudo limpinho.', ago: 'há 1 semana' },
      { id: 'rev-c2', from: 'Raimundo Alves', text: 'Me deu carona na volta do supermercado e ajudou a subir todas as sacolas.', ago: 'há 3 semanas' },
      { id: 'rev-c3', from: 'Antônio Mendes', text: 'Vizinho de ouro. Sempre chega no horário combinado e trata todo mundo com respeito.', ago: 'há 1 mês' },
      { id: 'rev-c4', from: 'Helena Prado', text: 'Montou a estante pequena da minha sala e ainda ajustou a porta do armário.', ago: 'há 2 meses' },
    ],
  },
]

export const REPLIES = {
  accept: ['Que bom ter você por aqui! Aceito sim, muito obrigada pela ajuda.', 'Oi! Que alegria, aceito a sua ajuda. Muito obrigado pelo apoio.'],
  generic: ['Combinado, pode deixar!', 'Que maravilha! Isso já ajuda demais.', 'Perfeito, vou ficar aguardando então.', 'Sem pressa! O importante é combinarmos com tranquilidade.'],
}

export const IMPACT_STATS = [
  { value: '+26%', label: 'risco de mortalidade associado à solidão' },
  { value: '+29%', label: 'risco de mortalidade com isolamento social' },
  { value: '+32%', label: 'risco de mortalidade em quem mora sozinho' },
  { value: '16,8%', label: 'dos idosos brasileiros relatam sentir solidão sempre' },
]

export const COMMUNITY_PERKS = [
  { id: 'p1', partner: 'Padaria Pão da Vila', benefit: '15% de desconto no café com bolo', minHours: 2, category: 'Alimentação local' },
  { id: 'p2', partner: 'Farmácia Bem Cuidar', benefit: '10% de desconto em itens de cuidado pessoal', minHours: 3, category: 'Saúde e bem-estar' },
  { id: 'p3', partner: 'Hortifruti Terra Boa', benefit: '12% de desconto na cesta de frutas e legumes', minHours: 4, category: 'Feira do bairro' },
  { id: 'p4', partner: 'Papelaria & Armarinho Central', benefit: '15% de desconto em materiais para oficinas', minHours: 6, category: 'Cultura e artesanato' },
]

export const GOOGLE_AI_PILLARS = [
  { title: 'Triagem semântica com Gemini', desc: 'Classifica o pedido em linguagem natural, identifica urgência e diferencia demandas cotidianas de emergências clínicas (SAMU 192).' },
  { title: 'Acessibilidade multimodal (Speech-to-Text e TTS)', desc: 'Permite ditar pedidos por voz e ouvir publicações do mural em voz alta, reduzindo barreiras digitais para pessoas idosas.' },
  { title: 'Proteção de dados e privacidade', desc: 'Oculta telefone e documentos no chat seguro e exibe apenas distância aproximada e bloco (sem endereço exato); integração com serviços públicos prevista para etapas futuras.' },
]