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
  monthly: number | null;
  annual: number | null;
  features: string[];
  cta: string;
  featured?: boolean;
  badge?: string;
  custom?: boolean;
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

export interface ChatMsg {
  from: "client" | "bot";
  text: string;
  time: string;
}

export const CHAT_MSGS: ChatMsg[] = [
  { from: "client", text: "Oi! Quero cortar hoje à tarde se tiver vaga.", time: "13:04" },
  { from: "bot", text: "Opa, tudo bem? 👋 Hoje temos horário com o Bruno às 15h e às 16h30. Qual prefere?", time: "13:04" },
  { from: "client", text: "15h com o Bruno.", time: "13:05" },
  { from: "bot", text: "Anotado! Corte de cabelo é R$ 45,00 e dura 1h. Confirma?", time: "13:05" },
  { from: "client", text: "Pode ser.", time: "13:05" },
  { from: "bot", text: "Prontinho! ✔️ Agendado pra hoje às 15h com o Bruno. Qualquer coisa é só chamar.", time: "13:06" },
];

export const NAV_LINKS: NavLink[] = [
  { label: "Funcionalidades", href: "#recursos" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Planos e preços", href: "#precos" },
  { label: "Histórias de clientes", href: "#historias" },
  { label: "Blog", href: "/blog" },
];

export const STATS: Stat[] = [
  { value: "94%", label: "menos no-show", caption: "quem esquece vira confirmado com 1 toque no WhatsApp" },
  { value: "24/7", label: "atendendo no WhatsApp", caption: "a IA responde e agenda mesmo de madrugada" },
  { value: "5 min", label: "do zero ao ar", caption: "sem instalar, sem treinar, sem migrar nada" },
  { value: "4,9/5", label: "nota dos barbeiros", caption: "312 avaliações — a maioria depois de testar" },
];

export const FEATURES: Feature[] = [
  {
    icon: "bot",
    title: "IA que agenda no WhatsApp por você",
    desc: "Cliente manda mensagem, a IA entende e agenda sozinha: escolhe serviço, profissional e horário na hora. Você não precisa nem olhar o celular.",
    bullets: [
      "Atende 24/7 — madrugada, domingo, feriado",
      "Consulta serviços, horários e remarca por conversa",
      "Cliente nem baixa app — só manda mensagem",
    ],
    highlight: true,
  },
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
    icon: "shield",
    title: "Reserva com sinal: quem não paga não fura",
    desc: "Ative o sinal PIX na reserva: o cliente garante o horário pagando uma parte adiantada. Menos cadeira vazia, mais previsibilidade.",
    bullets: [
      "Sinal PIX automático na confirmação",
      "Horário travado enquanto o pagamento não cai",
      "Sem no-show: quem investiu não falta",
    ],
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
    icon: "star",
    title: "Reputação que atrai cliente novo",
    desc: "Cliente avalia com 1 a 5 estrelas depois do corte. A nota aparece no seu perfil público — e vira motivo pra gente nova te escolher.",
    bullets: [
      "Pesquisa automática pós-atendimento no WhatsApp",
      "Nota estampada no seu link de agendamento",
      "Profissional bem avaliado vende mais",
    ],
  },
  {
    icon: "globe",
    title: "Sua marca, seu endereço, seu link",
    desc: "Você ganha um endereço próprio com seu nome, sua logo e suas cores. O cliente vê a sua barbearia, não um sistema genérico.",
    bullets: [
      "Endereço com o nome da sua barbearia",
      "Logo, favicon e cores da sua marca",
      "Permissões pra cada profissional da equipe",
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
    title: "Espalha o link e liga a IA no WhatsApp",
    desc: "Instagram, WhatsApp, porta da barbearia. Um link só, fixo. E a IA passa a atender quem manda mensagem — o cliente não baixa app, não faz login, só marca.",
  },
  {
    n: 4,
    title: "O cliente marca. Você só atende.",
    desc: "Ele agenda sozinho, pela IA ou pelo link. O lembrete cai no WhatsApp dele automaticamente. A agenda enche, a cadeira não fura.",
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
    q: "A IA do WhatsApp agenda de verdade?",
    a: "Sim. Quando o cliente manda mensagem, a IA entende o pedido e agenda sozinha: escolhe o serviço, o profissional e o horário disponível — igual faria no link. Ela também consulta preços, remarca e cancela. Você acompanha tudo na agenda, como qualquer outro agendamento.",
  },
  {
    q: "O cliente precisa baixar algum aplicativo?",
    a: "Não. O cliente usa o WhatsApp que ele já tem: manda mensagem e a IA responde. Se preferir, também pode agendar pelo link no navegador — sem instalar nada, sem criar conta.",
  },
  {
    q: "E se a IA errar ou o cliente quiser falar com gente?",
    a: "A IA agenda só com confirmação explícita do cliente e respeita seus serviços, horários e bloqueios. Se o assunto fugir do que ela sabe (ex.: pedido especial), ela responde na hora e chama atenção de alguém da equipe no aplicativo — você decide se assume ou segue no automático.",
  },
  {
    q: "Funciona pra barbearia pequena de bairro?",
    a: "É pra isso que existe. Você testa 14 dias grátis com tudo liberado e, se fizer sentido, começa num plano de R$ 99/mês pra até 2 profissionais — com agenda online, IA no WhatsApp, lembrete e link fixo. Se couber num barbeiro e uma tesoura, cabe na Skedoole.",
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
    name: "Faixa 1",
    tagline: "Pra quem atende sozinho ou a dois",
    monthly: 99,
    annual: 91.08,
    features: [
      "Até 2 profissionais",
      "IA que agenda no WhatsApp",
      "Agenda online 24h",
      "Lembrete e confirmação automáticos",
      "Fila digital",
      "Painel do dono",
    ],
    cta: "Testar grátis por 14 dias",
  },
  {
    name: "Faixa 2",
    tagline: "Pra equipe de 3 a 5 profissionais",
    monthly: 179,
    annual: 164.68,
    features: [
      "Até 5 profissionais",
      "Tudo da Faixa 1",
      "Comissão split automática",
      "Gestão financeira",
      "Clube de assinatura",
      "Suporte direto no WhatsApp",
    ],
    cta: "Testar grátis por 14 dias",
    featured: true,
    badge: "Mais escolhido",
  },
  {
    name: "Faixa 3",
    tagline: "Pra times de 6 a 10 profissionais",
    monthly: 299,
    annual: 275.08,
    features: [
      "Até 10 profissionais",
      "Tudo da Faixa 2",
      "Avaliações e reputação",
      "Múltiplas unidades",
      "Suporte prioritário",
    ],
    cta: "Testar grátis por 14 dias",
  },
  {
    name: "Faixa 4",
    tagline: "Pra redes de 11 a 20 profissionais",
    monthly: 499,
    annual: 459.08,
    features: [
      "Até 20 profissionais",
      "Tudo da Faixa 3",
      "Gerente de conta dedicado",
      "Onboarding assistido",
      "Configuração personalizada",
    ],
    cta: "Testar grátis por 14 dias",
  },
  {
    name: "Custom",
    tagline: "Mais de 20 profissionais ou necessidades especiais",
    monthly: null,
    annual: null,
    features: [
      "Profissionais e unidades sob medida",
      "Precificação por volume",
      "Gerente de conta dedicado",
      "Onboarding presencial",
    ],
    cta: "Falar com a gente",
    custom: true,
  },
];