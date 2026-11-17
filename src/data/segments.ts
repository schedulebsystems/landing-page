// Segmentos da landing: cada nicho ganha página própria (/barbearia, /salao,
// /estetica, /unhas) com headline, simulação e CTA na língua dele. A home
// ("geral") usa o salão na simulação e convida a escolher o segmento.
//
// "fillMode" decide o capítulo 4 da simulação:
// - "queue": a fila digital cobre quem cancelou (barbearia/salão têm encaixe).
// - "link":  a vaga volta para o link e outra cliente marca sozinha (estética e
//   unhas trabalham só com hora marcada; fila de espera não faz parte do dia).

export type SegmentKey = "geral" | "barbearia" | "salao" | "estetica" | "unhas";
export type FillMode = "queue" | "link";

export interface SegProfessional {
  id: string;
  name: string;
  article: "o" | "a";
  role: string;
  initials: string;
  rating: string;
  reviews: string;
  tone: number;
}

export interface SegService {
  id: string;
  name: string;
  /** Gênero do nome do serviço: "seu corte" / "sua escova". */
  gender: "m" | "f";
  duration: number;
  price: number;
  description: string;
}

export interface SegAgendaItem {
  time: string;
  client: string;
  service: string;
  professional: string;
  price: number;
  status: "pago" | "andamento" | "confirmado" | "pendente" | "bloqueio";
}

export interface SegQueueEntry {
  id: string;
  name: string;
  service: string;
  preference: string;
  wait: number;
  initials: string;
}

export interface Segment {
  key: SegmentKey;
  path: string;
  label: string;
  /** "na minha barbearia", "no meu estúdio"... usado no CTA. */
  ctaPlace: string;
  seo: { title: string; description: string };
  hero: { eyebrow: string; lead: string; highlight: string; lede: string };
  /** Lugar que fica "vazio": cadeira, maca, mesa, agenda. */
  place: { noun: string; gender: "m" | "f" };
  nowLabel: string;
  fillMode: FillMode;
  tenant: {
    name: string;
    handle: string;
    neighborhood: string;
    rating: string;
    reviews: string;
    address: string;
    hours: string;
    cover: string | null;
    coverIcon: string;
    ownerInitials: string;
    dateLong: string;
    dateShort: string;
    monthLabel: string;
  };
  professionals: SegProfessional[];
  services: SegService[];
  agenda: SegAgendaItem[];
  /** queue: fila de espera; link: quem vai marcar pelo link quando a vaga reabrir. */
  waiting: SegQueueEntry[];
  demo: { professionalId: string; serviceId: string; slot: string };
  /** Cenas da seção "O dia real" que mencionam serviço/profissional. */
  scene: { service: string; pro: string; price: number; filler: string };
}

const DATAS = {
  dateLong: "Sexta-feira, 23 de outubro",
  dateShort: "Hoje, 23 out",
  monthLabel: "Outubro 2026",
};

const BARBEARIA: Segment = {
  key: "barbearia",
  path: "/barbearia",
  label: "Barbearia",
  ctaPlace: "na minha barbearia",
  seo: {
    title: "Agenda online para barbearia",
    description:
      "Agenda online para barbearia: o cliente marca pelo link, o lembrete confirma no WhatsApp e a fila cobre quem cancela. 14 dias grátis, sem cartão.",
  },
  hero: {
    eyebrow: "Para barbearias",
    lead: "Sua cadeira não fica",
    highlight: "vazia",
    lede: "O cliente marca sozinho, o lembrete confirma e a fila cobre quem cancela. Você só atende.",
  },
  place: { noun: "cadeira", gender: "f" },
  nowLabel: "Na cadeira",
  fillMode: "queue",
  tenant: {
    name: "Barbearia do Jão",
    handle: "barbearia-do-jao",
    neighborhood: "Vila Madalena",
    rating: "4,9",
    reviews: "312",
    address: "Rua Aspicuelta, 420",
    hours: "Hoje, 9h às 19h",
    cover: "/images/sandbox/barbearia.webp",
    coverIcon: "scissors",
    ownerInitials: "J",
    ...DATAS,
  },
  professionals: [
    { id: "jao", name: "Jão", article: "o", role: "Dono · 12 anos de tesoura", initials: "J", rating: "4,9", reviews: "184", tone: 1 },
    { id: "bruno", name: "Bruno", article: "o", role: "Cortes e degradê", initials: "B", rating: "4,8", reviews: "96", tone: 2 },
    { id: "diego", name: "Diego", article: "o", role: "Barba e acabamento", initials: "D", rating: "4,9", reviews: "72", tone: 3 },
  ],
  services: [
    { id: "corte", name: "Corte", gender: "m", duration: 45, price: 50, description: "Máquina, tesoura e finalização" },
    { id: "corte-barba", name: "Corte + barba", gender: "m", duration: 60, price: 70, description: "O combo completo da casa" },
    { id: "barba", name: "Barba", gender: "f", duration: 30, price: 35, description: "Toalha quente e navalha" },
  ],
  agenda: [
    { time: "09:00", client: "João Pedro", service: "Corte", professional: "Jão", price: 50, status: "pago" },
    { time: "10:00", client: "Pedro Henrique", service: "Corte + barba", professional: "Bruno", price: 70, status: "pago" },
    { time: "11:00", client: "Lucas Moreira", service: "Corte", professional: "Diego", price: 50, status: "pago" },
    { time: "12:00", client: "Almoço", service: "Almoço", professional: "—", price: 0, status: "bloqueio" },
    { time: "13:00", client: "Rafael Souza", service: "Corte", professional: "Jão", price: 50, status: "pago" },
    { time: "14:00", client: "Gustavo Lima", service: "Barba", professional: "Bruno", price: 35, status: "andamento" },
    { time: "16:00", client: "Felipe Rocha", service: "Corte", professional: "Diego", price: 50, status: "confirmado" },
    { time: "17:00", client: "André Nunes", service: "Corte", professional: "Jão", price: 50, status: "confirmado" },
    { time: "18:00", client: "Tiago Alves", service: "Barba", professional: "Bruno", price: 35, status: "confirmado" },
  ],
  waiting: [
    { id: "marcos", name: "Marcos Vinícius", service: "Corte", preference: "Bruno", wait: 12, initials: "MV" },
    { id: "tiago", name: "Tiago Lopes", service: "Corte + barba", preference: "Sem preferência", wait: 25, initials: "TL" },
  ],
  demo: { professionalId: "bruno", serviceId: "corte", slot: "15:00" },
  scene: { service: "Corte", pro: "Bruno", price: 50, filler: "Marcos Vinícius" },
};

const SALAO: Segment = {
  key: "salao",
  path: "/salao",
  label: "Salão de beleza",
  ctaPlace: "no meu salão",
  seo: {
    title: "Agenda online para salão de beleza",
    description:
      "Agenda online para salão de beleza: a cliente marca pelo link, o lembrete confirma no WhatsApp e a fila cobre quem cancela. 14 dias grátis, sem cartão.",
  },
  hero: {
    eyebrow: "Para salões de beleza",
    lead: "Sua cadeira não fica",
    highlight: "vazia",
    lede: "A cliente marca sozinha, o lembrete confirma e a fila cobre quem cancela. Você só atende.",
  },
  place: { noun: "cadeira", gender: "f" },
  nowLabel: "Na cadeira",
  fillMode: "queue",
  tenant: {
    name: "Studio Aurora",
    handle: "studio-aurora",
    neighborhood: "Pinheiros",
    rating: "4,9",
    reviews: "268",
    address: "Rua dos Pinheiros, 870",
    hours: "Hoje, 9h às 20h",
    cover: null,
    coverIcon: "sparkles",
    ownerInitials: "C",
    ...DATAS,
  },
  professionals: [
    { id: "carla", name: "Carla", article: "a", role: "Dona · coloração e mechas", initials: "C", rating: "4,9", reviews: "151", tone: 1 },
    { id: "renata", name: "Renata", article: "a", role: "Corte e escova", initials: "R", rating: "4,9", reviews: "88", tone: 2 },
    { id: "paula", name: "Paula", article: "a", role: "Tratamentos capilares", initials: "P", rating: "4,8", reviews: "64", tone: 3 },
  ],
  services: [
    { id: "escova", name: "Escova", gender: "f", duration: 40, price: 60, description: "Lavagem, escova e finalização" },
    { id: "corte-feminino", name: "Corte feminino", gender: "m", duration: 60, price: 90, description: "Corte com finalização" },
    { id: "coloracao", name: "Coloração", gender: "f", duration: 120, price: 180, description: "Raiz ou global" },
  ],
  agenda: [
    { time: "09:00", client: "Ana Beatriz", service: "Escova", professional: "Renata", price: 60, status: "pago" },
    { time: "10:00", client: "Fernanda Lima", service: "Coloração", professional: "Carla", price: 180, status: "pago" },
    { time: "11:00", client: "Juliana Rocha", service: "Corte feminino", professional: "Renata", price: 90, status: "pago" },
    { time: "12:00", client: "Almoço", service: "Almoço", professional: "—", price: 0, status: "bloqueio" },
    { time: "13:00", client: "Patrícia Alves", service: "Escova", professional: "Paula", price: 60, status: "pago" },
    { time: "14:00", client: "Larissa Mendes", service: "Hidratação", professional: "Paula", price: 70, status: "andamento" },
    { time: "16:00", client: "Camila Duarte", service: "Corte feminino", professional: "Renata", price: 90, status: "confirmado" },
    { time: "17:00", client: "Bruna Castro", service: "Escova", professional: "Carla", price: 60, status: "confirmado" },
    { time: "18:00", client: "Letícia Ramos", service: "Escova", professional: "Renata", price: 60, status: "confirmado" },
  ],
  waiting: [
    { id: "vanessa", name: "Vanessa Prado", service: "Escova", preference: "Renata", wait: 12, initials: "VP" },
    { id: "tatiane", name: "Tatiane Melo", service: "Corte feminino", preference: "Sem preferência", wait: 25, initials: "TM" },
  ],
  demo: { professionalId: "renata", serviceId: "escova", slot: "15:00" },
  scene: { service: "Escova", pro: "Renata", price: 60, filler: "Vanessa Prado" },
};

const ESTETICA: Segment = {
  key: "estetica",
  path: "/estetica",
  label: "Estética",
  ctaPlace: "no meu estúdio",
  seo: {
    title: "Agenda online para estética e design de sobrancelha",
    description:
      "Agenda online para esteticista: a cliente marca pelo link, o lembrete confirma no WhatsApp e o horário cancelado volta para a agenda. 14 dias grátis, sem cartão.",
  },
  hero: {
    eyebrow: "Para estética, sobrancelha e cílios",
    lead: "Sua maca não fica",
    highlight: "vazia",
    lede: "A cliente marca sozinha pelo link, o lembrete confirma no WhatsApp e o horário cancelado volta para a agenda. Você só atende.",
  },
  place: { noun: "maca", gender: "f" },
  nowLabel: "Na maca",
  fillMode: "link",
  tenant: {
    name: "Studio Lumi Estética",
    handle: "studio-lumi",
    neighborhood: "Moema",
    rating: "5,0",
    reviews: "147",
    address: "Av. Ibirapuera, 1200 · sala 34",
    hours: "Hoje, 9h às 19h",
    cover: null,
    coverIcon: "gem",
    ownerInitials: "C",
    ...DATAS,
  },
  professionals: [
    { id: "camila", name: "Camila", article: "a", role: "Dona · sobrancelha e cílios", initials: "C", rating: "5,0", reviews: "147", tone: 1 },
  ],
  services: [
    { id: "sobrancelha", name: "Design de sobrancelha", gender: "m", duration: 40, price: 55, description: "Mapeamento e design com pinça" },
    { id: "limpeza", name: "Limpeza de pele", gender: "f", duration: 60, price: 140, description: "Extração, máscara e hidratação" },
    { id: "cilios", name: "Extensão de cílios", gender: "f", duration: 120, price: 190, description: "Fio a fio ou volume" },
  ],
  agenda: [
    { time: "09:00", client: "Beatriz Nunes", service: "Design de sobrancelha", professional: "Camila", price: 55, status: "pago" },
    { time: "10:00", client: "Gabriela Souza", service: "Limpeza de pele", professional: "Camila", price: 140, status: "pago" },
    { time: "11:00", client: "Isabela Martins", service: "Design com henna", professional: "Camila", price: 65, status: "pago" },
    { time: "12:00", client: "Almoço", service: "Almoço", professional: "—", price: 0, status: "bloqueio" },
    { time: "13:00", client: "Rafaela Costa", service: "Lash lifting", professional: "Camila", price: 120, status: "pago" },
    { time: "14:00", client: "Aline Ferreira", service: "Limpeza de pele", professional: "Camila", price: 140, status: "andamento" },
    { time: "16:00", client: "Natália Ribeiro", service: "Design de sobrancelha", professional: "Camila", price: 55, status: "confirmado" },
    { time: "17:00", client: "Priscila Gomes", service: "Manutenção de cílios", professional: "Camila", price: 90, status: "confirmado" },
    { time: "18:00", client: "Débora Lima", service: "Design de sobrancelha", professional: "Camila", price: 55, status: "confirmado" },
  ],
  waiting: [
    { id: "larissa", name: "Larissa Mendes", service: "Design de sobrancelha", preference: "Pelo link", wait: 0, initials: "LM" },
  ],
  demo: { professionalId: "camila", serviceId: "sobrancelha", slot: "15:00" },
  scene: { service: "Design de sobrancelha", pro: "Camila", price: 55, filler: "Larissa Mendes" },
};

const UNHAS: Segment = {
  key: "unhas",
  path: "/unhas",
  label: "Manicure e unhas",
  ctaPlace: "na minha esmalteria",
  seo: {
    title: "Agenda online para manicure e esmalteria",
    description:
      "Agenda online para manicure: a cliente marca pelo link, o lembrete confirma no WhatsApp e o horário cancelado volta para a agenda. 14 dias grátis, sem cartão.",
  },
  hero: {
    eyebrow: "Para manicures e esmalterias",
    lead: "Sua mesa não fica",
    highlight: "vazia",
    lede: "A cliente marca sozinha pelo link, o lembrete confirma no WhatsApp e o horário cancelado volta para a agenda. Você só atende.",
  },
  place: { noun: "mesa", gender: "f" },
  nowLabel: "Atendendo agora",
  fillMode: "link",
  tenant: {
    name: "Esmalteria Flor de Lis",
    handle: "flor-de-lis",
    neighborhood: "Tatuapé",
    rating: "4,9",
    reviews: "203",
    address: "Rua Tuiuti, 315",
    hours: "Hoje, 9h às 19h",
    cover: null,
    coverIcon: "palette",
    ownerInitials: "B",
    ...DATAS,
  },
  professionals: [
    { id: "bia", name: "Bia", article: "a", role: "Dona · alongamento em gel", initials: "B", rating: "4,9", reviews: "121", tone: 1 },
    { id: "tati", name: "Tati", article: "a", role: "Mão e pé", initials: "T", rating: "4,9", reviews: "82", tone: 2 },
  ],
  services: [
    { id: "manicure", name: "Manicure", gender: "f", duration: 40, price: 35, description: "Cutilagem e esmaltação" },
    { id: "pe-mao", name: "Pé e mão", gender: "m", duration: 70, price: 65, description: "Cutilagem e esmaltação completas" },
    { id: "gel", name: "Alongamento em gel", gender: "m", duration: 120, price: 160, description: "Molde, gel e acabamento" },
  ],
  agenda: [
    { time: "09:00", client: "Renata Moura", service: "Manicure", professional: "Tati", price: 35, status: "pago" },
    { time: "10:00", client: "Carolina Dias", service: "Pé e mão", professional: "Bia", price: 65, status: "pago" },
    { time: "11:00", client: "Sabrina Teixeira", service: "Manutenção do gel", professional: "Bia", price: 110, status: "pago" },
    { time: "12:00", client: "Almoço", service: "Almoço", professional: "—", price: 0, status: "bloqueio" },
    { time: "13:00", client: "Eduarda Pires", service: "Pé e mão", professional: "Tati", price: 65, status: "pago" },
    { time: "14:00", client: "Vitória Campos", service: "Manicure", professional: "Tati", price: 35, status: "andamento" },
    { time: "16:00", client: "Jéssica Araújo", service: "Pé e mão", professional: "Bia", price: 65, status: "confirmado" },
    { time: "17:00", client: "Lívia Santana", service: "Manicure", professional: "Tati", price: 35, status: "confirmado" },
    { time: "18:00", client: "Mirela Couto", service: "Esmaltação em gel", professional: "Bia", price: 60, status: "confirmado" },
  ],
  waiting: [
    { id: "amanda", name: "Amanda Freitas", service: "Manicure", preference: "Pelo link", wait: 0, initials: "AF" },
  ],
  demo: { professionalId: "tati", serviceId: "manicure", slot: "15:00" },
  scene: { service: "Manicure", pro: "Tati", price: 35, filler: "Amanda Freitas" },
};

// Home: neutra no texto, simulação de salão (público misto) e convite aos nichos.
const GERAL: Segment = {
  ...SALAO,
  key: "geral",
  path: "/",
  label: "Todos os negócios",
  ctaPlace: "no meu negócio",
  seo: {
    title: "Agenda online com lembrete no WhatsApp",
    description:
      "Agenda online para barbearia, salão, estética e manicure: o cliente marca pelo link, o lembrete confirma no WhatsApp e quem cancela não deixa buraco. 14 dias grátis.",
  },
  hero: {
    eyebrow: "Agenda online com WhatsApp",
    lead: "Sua agenda não fica",
    highlight: "vazia",
    lede: "O cliente marca sozinho pelo link, o lembrete confirma no WhatsApp e quem cancela não deixa buraco. Você só atende.",
  },
};

export const SEGMENTS: Record<SegmentKey, Segment> = {
  geral: GERAL,
  barbearia: BARBEARIA,
  salao: SALAO,
  estetica: ESTETICA,
  unhas: UNHAS,
};

/** Nichos com página própria, na ordem dos atalhos da home e do rodapé. */
export const SEGMENT_PAGES: Segment[] = [BARBEARIA, SALAO, ESTETICA, UNHAS];

export function getSegment(key: string | undefined): Segment {
  return SEGMENTS[(key as SegmentKey) || "geral"] ?? GERAL;
}

// ── Helpers de concordância ─────────────────────────────────────────────

/** "o Bruno" / "a Renata" */
export function comArtigo(pro: { name: string; article: "o" | "a" }): string {
  return `${pro.article} ${pro.name}`;
}

/** "seu corte" / "sua escova" */
export function possessivo(service: { name: string; gender: "m" | "f" }): string {
  return `${service.gender === "f" ? "sua" : "seu"} ${service.name.toLowerCase()}`;
}

/** "Cadeira garantida" / "Maca garantida" */
export function lugarGarantido(seg: Segment): string {
  const noun = seg.place.noun.charAt(0).toUpperCase() + seg.place.noun.slice(1);
  return `${noun} ${seg.place.gender === "f" ? "garantida" : "garantido"}`;
}

/** "0 cadeira vazia" */
export function lugarVazio(seg: Segment): string {
  return `${seg.place.noun} ${seg.place.gender === "f" ? "vazia" : "vazio"}`;
}
