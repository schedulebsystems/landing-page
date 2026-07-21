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
  { value: "94%", label: "menos no-show", caption: "com lembrete via WhatsApp" },
  { value: "5 min", label: "pra começar", caption: "sem instalar nada, sem planilha" },
  { value: "+8 mil", label: "horas economizadas", caption: "por mês nas barbearias parceiras" },
  { value: "4,9/5", label: "nota dos clientes", caption: "em 312 avaliações" },
];

export const FEATURES: Feature[] = [
  {
    icon: "calendar-check",
    title: "Agenda online 24h",
    desc: "Seu cliente marca quando quiser. Você só abre o app e vê a agenda do dia pronta.",
    bullets: ["Link fixo pra agendar", "Reagendamento pelo cliente", "Bloqueio de horário por profissional"],
    highlight: true,
  },
  {
    icon: "message-circle",
    title: "Lembrete no WhatsApp",
    desc: "Manda lembrete automático antes do horário. Quem cancela avisa antes — sua agenda para de furar.",
    bullets: ["Lembrete automático", "Confirmação com 1 toque", "Resposta direta no seu WhatsApp"],
    highlight: true,
  },
  {
    icon: "users",
    title: "Fila digital",
    desc: "Cliente chega, entra na fila pelo celular. Sem batedor de fila na recepção, sem caderninho na portaria.",
    bullets: ["Senha pelo celular", "Posição na fila em tempo real", "Notificação quando chegar a vez"],
  },
  {
    icon: "repeat",
    title: "Clube de assinatura",
    desc: "Mensalidade automática no cartão: cabelo todo mês, cliente fixo, caixa previsível.",
    bullets: ["Cobrança recorrente", "Plano por serviço", "Cancelamento só pelo dono"],
  },
  {
    icon: "credit-card",
    title: "Pagamento integrado",
    desc: "Pix e cartão na hora do corte. O dinheiro cai na conta, a comissão do profissional separa sozinha.",
    bullets: ["Pix e cartão", "Comissão split automática", "Recebimento no próximo dia útil"],
  },
  {
    icon: "bar-chart-3",
    title: "Painel do dono",
    desc: "Faturamento, profissionais mais procurados e horários de pico numa tela só. Pra decidir com dado, não achismo.",
    bullets: ["Faturamento por dia", "Ranking de profissionais", "Horário de pico por dia da semana"],
  },
];

export const STEPS: Step[] = [
  {
    n: 1,
    title: "Crie sua barbearia na Skedoole",
    desc: "Cadastro de 3 campos. Sem cartão, sem migrar planilha, sem treinamento.",
  },
  {
    n: 2,
    title: "Convide seus profissionais",
    desc: "Cada um vê a agenda dele separada. Cada um tem login, foto e link próprio.",
  },
  {
    n: 3,
    title: "Divulgue seu link de agendamento",
    desc: "Cola no Instagram, no WhatsApp, na porta da loja. Um link fixo, sem app pra baixar.",
  },
  {
    n: 4,
    title: "O cliente marca sozinho",
    desc: "Escolhe serviço, profissional e horário. O lembrete cai no WhatsApp dele — e no seu também.",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Eu perdia 4, 5 clientes por dia por no-show. Com o lembrete no WhatsApp, isso caiu pra quase zero. Mudou meu caixa.",
    name: "Júnior Andrade",
    role: "Barbeiro e dono",
    city: "São Paulo — Zona Leste",
    initials: "JA",
    rating: 5,
  },
  {
    quote:
      "Faturamento dobrou em 3 meses. Os clientes adoram o clube — pagam plano mensal e não faltam mais.",
    role: "Barbearia Barão — Dono",
    name: "Diego Bernardes",
    city: "Belo Horizonte — Savassi",
    initials: "DB",
    rating: 5,
  },
  {
    quote:
      "Troquei o caderninho pela Skedoole numa manhã. Ninguém mais esquece horário, o caixa fecha certinho todo dia.",
    name: "Aline Ferreira",
    role: "Cabeleireira do salão",
    city: "Curitiba — Batel",
    initials: "AF",
    rating: 5,
  },
  {
    quote:
      "Migrei de outro sistema que não dava suporte. Aqui falo com a equipe em 5 minutos e resolvem na hora.",
    name: "Rafael Tavares",
    role: "Dono — Studio Tavares",
    city: "Santos — Boqueirão",
    initials: "RT",
    rating: 5,
  },
  {
    quote:
      "Antes eu não sabia o que cobrar nem quem cortou o quê. Hoje vejo no painel: faturamento, comissão, tudo organizado.",
    name: "Wesley Carvalho",
    role: "Barbearia Cruzeiro",
    city: "Porto Alegre — Moinhos",
    initials: "WC",
    rating: 5,
  },
  {
    quote:
      "O link funciona igual no Instagram e no cartaz. Novo cliente agenda sem ligar — tô pegando 20 clientes novos por mês.",
    name: "Marcelo Guimarães",
    role: "Dono — MG Social Hall",
    city: "Goiânia — Setor Bueno",
    initials: "MG",
    rating: 5,
  },
];

export const FAQS: Faq[] = [
  {
    q: "Preciso instalar algo na barbearia?",
    a: "Não. A Skedoole é 100% online. Abre no navegador do celular, computador ou tablet. Não tem app para baixar, não tem instalador, não tem placa pra tocar.",
  },
  {
    q: "Como funciona o teste grátis?",
    a: "Você cria sua barbearia em 5 minutos e usa por 14 dias sem cartão de crédito. Se fizer sentido, escolhe um plano. Se não, só sair — não precisa cancelar nada.",
  },
  {
    q: "O cliente precisa baixar algo?",
    a: "Não. O cliente agenda por um link fixo (estilo app.skedoole.com.br/agendar/sua-barbearia). Abre no navegador, marca pela tela mesmo. Funciona igual em qualquer celular.",
  },
  {
    q: "Como o lembrete no WhatsApp chega?",
    a: "A Skedoole manda automaticamente antes do horário. O cliente responde com 1 toque confirmando ou cancelando. Se cancelar, a agenda libera na hora pra outro cliente.",
  },
  {
    q: "Funciona para barbearia pequena também?",
    a: "Sim. Tem plano grátis para quem atende sozinho. Marca, recorta, bloqueia horário e usa o lembrete no WhatsApp sem pagar nada.",
  },
  {
    q: "Meus dados ficam seguros?",
    a: "A Skedoole segue a LGPD. Os dados do seu cliente são seus, ficam dentro da sua barbearia e você exporta a qualquer momento. Não usamos pra venda de lista.",
  },
  {
    q: "Posso migrar de outro sistema?",
    a: "Pode. Em 15 minutos cadastra seus profissionais, importa os clientes via planilha e já começa a atender. Se pedir, nosso time ajuda.",
  },
];

export const PLANS: Plan[] = [
  {
    name: "Solo",
    tagline: "Para quem atende sozinho",
    monthly: 0,
    annual: 0,
    features: [
      "Agenda online 24h",
      "1 profissional",
      "Lembrete no WhatsApp (50/mês)",
      "Link de agendamento",
      "Painel básico",
    ],
    cta: "Começar grátis",
  },
  {
    name: "Pro",
    tagline: "Barbearias e salões em crescimento",
    monthly: 79,
    annual: 75,
    features: [
      "Até 5 profissionais",
      "Lembrete no WhatsApp ilimitado",
      "Fila digital",
      "Clube de assinatura",
      "Painel completo do dono",
      "Suporte no WhatsApp",
    ],
    cta: "Testar por 14 dias",
    featured: true,
    badge: "Mais popular",
  },
  {
    name: "Estúdio",
    tagline: "Rede ou estúdio com filiais",
    monthly: 199,
    annual: 189,
    features: [
      "Profissionais ilimitados",
      "Filiais e unidades",
      "Comissão split + repasse automático",
      "API para integrações",
      "Gerente de conta dedicado",
      "Onboarding presencial",
    ],
    cta: "Falar com a gente",
  },
];