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
  { from: "client", text: "Oi! Quero agendar um horário hoje à tarde se tiver vaga.", time: "13:04" },
  { from: "bot", text: "Opa, tudo bem? 👋 Hoje temos horário com o Bruno às 15h e às 16h30. Qual prefere?", time: "13:04" },
  { from: "client", text: "15h com o Bruno.", time: "13:05" },
  { from: "bot", text: "Anotado! O serviço é R$ 45,00 e dura 1h. Confirma?", time: "13:05" },
  { from: "client", text: "Pode ser.", time: "13:05" },
  { from: "bot", text: "Prontinho! ✔️ Agendado pra hoje às 15h com o Bruno. Qualquer coisa é só chamar.", time: "13:06" },
];

export const AI_CHAT_MSGS: ChatMsg[] = [
  { from: "client", text: "Oi! Preciso remarcar minha sobrancelha de amanhã 😅", time: "23:41" },
  { from: "bot", text: "Sem problema! Vi que você tá agendado amanhã às 10h com a Camila. Amanhã ainda temos 14h e 17h30 com ela. Qual fica melhor?", time: "23:41" },
  { from: "client", text: "14h é melhor pra mim.", time: "23:42" },
  { from: "bot", text: "Beleza! Fica assim: amanhã às 14h com a Camila. O horário antigo das 10h foi liberado. Confirma?", time: "23:42" },
  { from: "client", text: "Confirmo.", time: "23:42" },
  { from: "bot", text: "Remarcado! ✔️ Amanhã às 14h com a Camila. Até lá!", time: "23:43" },
];

export const NAV_LINKS: NavLink[] = [
  { label: "Funcionalidades", href: "#recursos" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Preços", href: "#precos" },
  { label: "Blog", href: "/blog" },
];

export const NAV_LINKS_EXPERIENCIA: NavLink[] = [
  { label: "Problemas", href: "#problemas" },
  { label: "Simulador", href: "#experiencia" },
  { label: "Preços", href: "#precos" },
  { label: "Dúvidas", href: "#faq" },
];

export const FOOTER_LINKS_HOME: NavLink[] = [
  { label: "Funcionalidades", href: "#recursos" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Preços", href: "#precos" },
  { label: "Blog", href: "/blog" },
];

export const FOOTER_LINKS_EXPERIENCIA: NavLink[] = [
  { label: "Problemas", href: "#problemas" },
  { label: "Simulador", href: "#experiencia" },
  { label: "Preços", href: "#precos" },
  { label: "Dúvidas", href: "#faq" },
  { label: "Blog", href: "/blog" },
];

export const STATS: Stat[] = [
  { value: "1 toque", label: "para confirmar o horário", caption: "o lembrete cai no WhatsApp e a fila cobre quem cancelar" },
  { value: "24/7", label: "atendendo no WhatsApp", caption: "a IA responde e agenda mesmo de madrugada" },
  { value: "5 min", label: "do zero ao ar", caption: "sem instalar, sem treinar, sem migrar nada" },
  { value: "LGPD", label: "seus dados, sempre seus", caption: "sem venda de lista, sem letra miúda" },
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
      "O cliente remarca sozinho se precisar — você só fica sabendo",
    ],
    highlight: true,
  },
  {
    icon: "message-circle",
    title: "Sua agenda para de ficar vazia de bobeira",
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
    title: "Fim do no-show com sinal via Pix",
    desc: "Ative o sinal Pix na reserva: o cliente garante o horário pagando uma parte adiantada. Menos horários vagos, mais previsibilidade.",
    bullets: [
      "Sinal Pix automático na confirmação",
      "Horário só é seu de verdade quando o pagamento cai",
    ],
  },
  {
    icon: "users",
    title: "Fila de espera 100% digital",
    desc: "Cliente chega, entra na fila pelo celular. Vê a posição em tempo real e recebe notificação quando estiver perto da vez.",
    bullets: [
      "Fila virtual — sem senha de papel, sem confusão",
      "Posição atualizada na hora no celular do cliente",
      "Aviso no WhatsApp quando um horário liberar",
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
      "Cada profissional vê o próprio extrato no celular",
    ],
  },
  {
    icon: "globe",
    title: "Sua marca, seu endereço, seu link",
    desc: "Você ganha um endereço próprio com seu nome, sua logo e suas cores. O cliente vê o seu negócio, não um sistema genérico.",
    bullets: [
      "Endereço com o nome do seu negócio",
      "Logo, favicon e cores da sua marca",
      "Permissões pra cada profissional da equipe",
    ],
  },
  {
    icon: "repeat",
    title: "Caixa previsível todo mês",
    desc: "Cliente vira assinante, paga mensalidade no cartão e tem atendimento garantido. Você sabe quanto vai entrar antes do mês começar.",
    bullets: [
      "Cobrança automática todo mês, sem cobrar na mão",
      "Cliente assinante não falta — ele já pagou",
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
      "Exporta tudo quando quiser, sem pedir pro suporte",
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
    desc: "Instagram, WhatsApp, porta do seu negócio. Um link só, fixo. E a IA passa a atender quem manda mensagem — o cliente não baixa app, não faz login, só marca.",
  },
  {
    n: 4,
    title: "O cliente marca. Você só atende.",
    desc: "Ele agenda sozinho, pela IA ou pelo link. O lembrete cai no WhatsApp dele automaticamente. A agenda enche, a agenda não fura.",
  },
];

export interface ComparisonRow {
  label: string;
  manual: string;
  skedoole: string;
}

export const COMPARISON: ComparisonRow[] = [
  {
    label: "Confirmar horário",
    manual: "Liga pra cada cliente e ainda fica no vácuo",
    skedoole: "A IA confirma e lembra no WhatsApp sozinha",
  },
  {
    label: "Faltas e no-shows",
    manual: "Horário vago de graça quando ninguém aparece",
    skedoole: "Lembrete, confirmação e fila cobrem a vaga",
  },
  {
    label: "Atender no celular",
    manual: "Caderno em casa, agenda perdida no balcão",
    skedoole: "Agenda no bolso, em qualquer lugar, na hora",
  },
  {
    label: "Fila de espera",
    manual: "Cliente esperando sem saber quando é a vez",
    skedoole: "Fila digital com posição atualizada na hora",
  },
  {
    label: "Receber por Pix",
    manual: "Conta manual, cobrança que some do papel",
    skedoole: "Pix e cartão com cobrança automática",
  },
  {
    label: "Fechar o dia",
    manual: "Somar tudo à mão, no escuro",
    skedoole: "Relatórios prontos no fechar do caixa",
  },
];

export const FAQS: Faq[] = [
  {
    q: "Vou ter trabalho para configurar?",
    a: "Não. São três campos de cadastro, seus profissionais e o link. Em poucos minutos seu negócio está no ar — sem instalar nada e sem migrar planilha.",
  },
  {
    q: "Meu cliente vai usar?",
    a: "Ele não baixa app nem cria conta. Abre o seu link no navegador ou manda mensagem no WhatsApp que já usa. Se sabe mandar mensagem, sabe agendar.",
  },
  {
    q: "E se o cliente cancelar?",
    a: "O lembrete chega antes, ele confirma com um toque e, se cancelar, a vaga volta para a fila na hora. O próximo da fila pode ocupar o horário.",
  },
  {
    q: "Quanto custa?",
    a: "Começa em R$ 49,90/mês para o primeiro profissional e cai por assento conforme sua equipe cresce. Tudo incluso: agenda, lembretes e a IA no WhatsApp — sem add-on e sem taxa extra por IA. Você testa 14 dias grátis, sem cartão.",
  },
  {
    q: "Meus dados e os dos meus clientes ficam seguros?",
    a: "Seguimos a LGPD. Os dados são seus: não vendemos lista, não usamos seus clientes em campanha e você exporta tudo quando quiser.",
  },
];
