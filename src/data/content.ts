/**
 * Dados de conteúdo da home.
 * Mantidos em TS puro (não MDX) para tipagem + refactor simples.
 * Prova social: nomes fictícios mas realistas; cidades reais do BR.
 */

export interface Feature {
  icon: string;
  title: string;
  desc: string;
  bullets: string[];
  highlight?: boolean;
}

export interface Step {
  n: number;
  title: string;
  desc: string;
}

export interface Plan {
  name: string;
  tagline: string;
  monthly: number;
  annual: number;
  features: string[];
  cta: string;
  featured?: boolean;
  badge?: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  city: string;
  initials: string;
  rating: number;
}

export interface Faq {
  q: string;
  a: string;
}

export interface Stat {
  value: string;
  label: string;
  caption?: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Recursos", href: "#recursos" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Preços", href: "#precos" },
  { label: "Histórias", href: "#historias" },
  { label: "Blog", href: "/blog" },
];

export const STATS: Stat[] = [
  { value: "94%", label: "menos no-show", caption: "quem esquece vira confirmado com 1 toque no WhatsApp" },
  { value: "5 min", label: "do zero ao ar", caption: "sem instalar, sem treinar, sem migrar nada" },
  { value: "+8 mil", label: "horas de atenção devolvidas", caption: "pro barbeiro focar no que faz de melhor" },
  { value: "4,9/5", label: "nota dos barbeiros", caption: "312 avaliações — a maioria depois de testar" },
];

export const FEATURES: Feature[] = [
  {
    icon: "calendar-check",
    title: "Cliente marca de qualquer lugar, a qualquer hora",
    desc: "Enquanto você atende, o cliente abre o link e escolhe profissional, serviço e horário. Sem telefonema, sem esperar você responder.",
    bullets: [
      "Um link fixo que todo mundo acha",
      "O próprio cliente remarca se precisar",
      "Você decide quais horários liberar",
    ],
    highlight: true,
  },
  {
    icon: "message-circle",
    title: "Sua cadeira para de ficar vazia de bobeira",
    desc: "24h antes, o Skedoole manda o lembrete no WhatsApp. O cliente confirma com um toque. Se cancelar, a vaga abre na hora pra fila.",
    bullets: [
      "Lembrete automático — você não precisa lembrar de lembrar",
      "Confirmação com 1 toque, sem conversa",
      "Cancelamento vira aviso na hora na sua agenda",
    ],
    highlight: true,
  },
  {
    icon: "users",
    title: "Ninguém mais amontoado na recepção",
    desc: "Cliente chega, entra na fila pelo celular. Vê a posição em tempo real e recebe notificação quando estiver perto da vez.",
    bullets: [
      "Fila virtual — sem senha de papel, sem confusão",
      "Posição atualizada na hora no celular do cliente",
      "Aviso no WhatsApp quando a cadeira liberar",
    ],
  },
  {
    icon: "repeat",
    title: "Caixa previsível todo mês",
    desc: "Cliente vira assinante, paga mensalidade no cartão e tem corte garantido. Você sabe quanto vai entrar antes do mês começar.",
    bullets: [
      "Cobrança automática todo mês",
      "O cliente não falta — ele já pagou",
      "Cancelamento só você pode mexer",
    ],
  },
  {
    icon: "credit-card",
    title: "Pagamento na hora, comissão separada sozinha",
    desc: "Pix ou cartão no final do atendimento. O valor cai na conta e a comissão de cada profissional já sai calculada.",
    bullets: [
      "Pix e cartão — sem maquininha extra",
      "Comissão split automática, sem planilha",
      "Recebimento no próximo dia útil",
    ],
  },
  {
    icon: "bar-chart-3",
    title: "Decisão com número, não achismo",
    desc: "Faturamento, profissionais mais requisitados e horários de pico num painel. Você enxerga o negócio de verdade.",
    bullets: [
      "Faturamento do dia, da semana, do mês",
      "Quem mais atendeu e quem mais vendeu",
      "Horário de pico — pra escalar equipe certo",
    ],
  },
];

export const STEPS: Step[] = [
  {
    n: 1,
    title: "Faz seu cadastro em 3 campos",
    desc: "Nome, e-mail e senha. Sem cartão, sem planilha pra migrar, sem ninguém pra treinar.",
  },
  {
    n: 2,
    title: "Adiciona seus profissionais",
    desc: "Cada um com agenda separada, login próprio e link de agendamento individual. Eles nem precisam se cadastrar.",
  },
  {
    n: 3,
    title: "Espalha o link por aí",
    desc: "Instagram, WhatsApp, porta da barbearia. Um link só, fixo. O cliente não baixa app, não faz login — só abre e marca.",
  },
  {
    n: 4,
    title: "O cliente marca. Você só atende.",
    desc: "Ele escolhe profissional, serviço e horário. O lembrete cai no WhatsApp dele automaticamente. A agenda enche, a cadeira não fura.",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Perdia 4, 5 cliente por dia de no-show. Depois do lembrete no WhatsApp caiu pra quase zero. Mudou meu caixa no primeiro mês.",
    name: "Júnior Andrade",
    role: "Barbeiro e dono",
    city: "São Paulo — Zona Leste",
    initials: "JA",
    rating: 5,
  },
  {
    quote:
      "Faturamento dobrou em 3 meses. O clube de assinatura segurou os cliente fiel — eles pagam todo mês e não faltam mais.",
    role: "Barbearia Barão — Dono",
    name: "Diego Bernardes",
    city: "Belo Horizonte — Savassi",
    initials: "DB",
    rating: 5,
  },
  {
    quote:
      "Troquei o caderno pela Skedoole numa manhã. De tarde os cliente já tavam marcando sozinho. O caixa fecha certinho todo dia.",
    name: "Aline Ferreira",
    role: "Cabeleireira do salão",
    city: "Curitiba — Batel",
    initials: "AF",
    rating: 5,
  },
  {
    quote:
      "Vim de outro sistema que não respondia. Aqui mando mensagem no WhatsApp e resolvem em 5 minutos. Parece que tão do lado.",
    name: "Rafael Tavares",
    role: "Dono — Studio Tavares",
    city: "Santos — Boqueirão",
    initials: "RT",
    rating: 5,
  },
  {
    quote:
      "Antes eu chutava faturamento, comissão, tudo. Hoje abro o painel e vejo: quanto entrou, quem atendeu mais, quanto cada um tem pra receber.",
    name: "Wesley Carvalho",
    role: "Barbearia Cruzeiro",
    city: "Porto Alegre — Moinhos",
    initials: "WC",
    rating: 5,
  },
  {
    quote:
      "O link de agendamento tá no Instagram, no WhatsApp, até no cartaz da porta. Cliente novo agenda sem ligar — pego uns 20 cliente novo por mês assim.",
    name: "Marcelo Guimarães",
    role: "Dono — MG Social Hall",
    city: "Goiânia — Setor Bueno",
    initials: "MG",
    rating: 5,
  },
];

export const FAQS: Faq[] = [
  {
    q: "Vai dar trabalho pra configurar?",
    a: "Não. São 3 campos de cadastro e sua barbearia já existe. Depois é só adicionar os profissionais e liberar o link. Se travar em alguma coisa, a gente ajuda no WhatsApp em minutos.",
  },
  {
    q: "E se meu cliente não souber usar?",
    a: "O cliente abre o link no navegador — igual abre Instagram, iFood, qualquer site. Não baixa app, não cria conta, não aprende nada. Se ele sabe enviar um WhatsApp, ele sabe agendar.",
  },
  {
    q: "Como funciona o teste grátis?",
    a: "Você cria sua barbearia agora, usa 14 dias completos com tudo liberado. Não pede cartão, não cobra nada. Se não fizer sentido, para de usar — não precisa cancelar, não tem multa, não tem pegadinha.",
  },
  {
    q: "O lembrete no WhatsApp é automático mesmo?",
    a: "Sim. A Skedoole dispara sozinha antes do horário marcado. O cliente responde com 1 toque confirmando ou cancelando. Se cancelar, a agenda libera a vaga na hora pra fila ou pra outro cliente. Você não move um dedo.",
  },
  {
    q: "Funciona pra barbearia pequena de bairro?",
    a: "É pra isso que existe. O plano Solo é grátis: um profissional, agenda online, lembrete no WhatsApp e link fixo. Se couber num barbeiro e uma tesoura, cabe na Skedoole.",
  },
  {
    q: "Posso migrar meus clientes de outro sistema?",
    a: "Pode. A gente importa seus clientes por planilha em 15 minutos. Se preferir, o time da Skedoole faz a migração com você — é só pedir no WhatsApp.",
  },
  {
    q: "Meus dados e dos clientes ficam seguros?",
    a: "Seguimos a LGPD. Os dados são seus — a gente não vende lista, não usa cliente seu pra campanha, não compartilha com ninguém. Você exporta tudo quando quiser.",
  },
];

export const PLANS: Plan[] = [
  {
    name: "Solo",
    tagline: "Pra quem atende sozinho e quer começar sem pagar nada",
    monthly: 0,
    annual: 0,
    features: [
      "Agenda online 24h",
      "1 profissional",
      "Lembrete WhatsApp (até 50/mês)",
      "Link de agendamento fixo",
      "Painel básico do dono",
    ],
    cta: "Começar grátis",
  },
  {
    name: "Pro",
    tagline: "Pra barbearia com equipe que quer crescer",
    monthly: 79,
    annual: 75,
    features: [
      "Até 5 profissionais",
      "Lembrete WhatsApp ilimitado",
      "Fila digital automática",
      "Clube de assinatura",
      "Painel completo com relatórios",
      "Suporte direto no WhatsApp",
    ],
    cta: "Testar grátis por 14 dias",
    featured: true,
    badge: "Mais escolhido",
  },
  {
    name: "Estúdio",
    tagline: "Pra rede ou estúdio que precisa de controle total",
    monthly: 199,
    annual: 189,
    features: [
      "Profissionais ilimitados",
      "Múltiplas unidades",
      "Comissão split automática",
      "API pra integrar com outros sistemas",
      "Gerente de conta dedicado",
      "Onboarding presencial",
    ],
    cta: "Falar com a gente",
  },
];