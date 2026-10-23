export interface Professional {
  id: string;
  name: string;
  role: string;
  initials: string;
  rating: string;
  reviews: string;
  tone: number;
}

export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string;
}

export type AgendaStatus =
  | "pago"
  | "andamento"
  | "confirmado"
  | "pendente"
  | "bloqueio";

export interface AgendaItem {
  time: string;
  client: string;
  service: string;
  professional: string;
  price: number;
  status: AgendaStatus;
}

export interface QueueEntry {
  id: string;
  name: string;
  service: string;
  preference: string;
  wait: number;
  initials: string;
}

export interface Chapter {
  id: number;
  time: string;
  title: string;
  desc: string;
  icon: string;
}

export const TENANT = {
  name: "Barbearia do Jão",
  handle: "barbearia-do-jao",
  neighborhood: "Vila Madalena",
  rating: "4,9",
  reviews: "312",
  address: "Rua Aspicuelta, 420",
  hours: "Hoje, 9h às 19h",
  chairs: 3,
  cover: "/images/sandbox/barbearia.webp",
  dateLong: "Sexta-feira, 23 de outubro",
  dateShort: "Hoje, 23 out",
  monthLabel: "Outubro 2026",
} as const;

export const PROFESSIONALS: Professional[] = [
  {
    id: "jao",
    name: "Jão",
    role: "Dono · 12 anos de tesoura",
    initials: "J",
    rating: "4,9",
    reviews: "184",
    tone: 1,
  },
  {
    id: "bruno",
    name: "Bruno",
    role: "Cortes e degradê",
    initials: "B",
    rating: "4,8",
    reviews: "96",
    tone: 2,
  },
  {
    id: "diego",
    name: "Diego",
    role: "Barba e acabamento",
    initials: "D",
    rating: "4,9",
    reviews: "72",
    tone: 3,
  },
];

export const SERVICES: Service[] = [
  {
    id: "corte",
    name: "Corte",
    duration: 45,
    price: 50,
    description: "Máquina, tesoura e finalização",
  },
  {
    id: "corte-barba",
    name: "Corte + barba",
    duration: 60,
    price: 70,
    description: "O combo completo da casa",
  },
  {
    id: "barba",
    name: "Barba",
    duration: 30,
    price: 35,
    description: "Toalha quente e navalha",
  },
];

export const AVAILABLE_SLOTS = ["15:00"] as const;

export function slotsForService(service: Service): string[] {
  return service.duration <= 45 ? [...AVAILABLE_SLOTS] : [];
}

export const BASE_AGENDA: AgendaItem[] = [
  {
    time: "09:00",
    client: "João Pedro",
    service: "Corte",
    professional: "Jão",
    price: 50,
    status: "pago",
  },
  {
    time: "10:00",
    client: "Pedro Henrique",
    service: "Corte + barba",
    professional: "Bruno",
    price: 70,
    status: "pago",
  },
  {
    time: "11:00",
    client: "Lucas Moreira",
    service: "Corte",
    professional: "Diego",
    price: 50,
    status: "pago",
  },
  {
    time: "12:00",
    client: "Almoço",
    service: "Almoço",
    professional: "—",
    price: 0,
    status: "bloqueio",
  },
  {
    time: "13:00",
    client: "Rafael Souza",
    service: "Corte",
    professional: "Jão",
    price: 50,
    status: "pago",
  },
  {
    time: "14:00",
    client: "Gustavo Lima",
    service: "Barba",
    professional: "Bruno",
    price: 35,
    status: "andamento",
  },
  {
    time: "16:00",
    client: "Felipe Rocha",
    service: "Corte",
    professional: "Diego",
    price: 50,
    status: "confirmado",
  },
  {
    time: "17:00",
    client: "André Nunes",
    service: "Corte",
    professional: "Jão",
    price: 50,
    status: "confirmado",
  },
  {
    time: "18:00",
    client: "Tiago Alves",
    service: "Barba",
    professional: "Bruno",
    price: 35,
    status: "confirmado",
  },
];

export const QUEUE: QueueEntry[] = [
  {
    id: "marcos",
    name: "Marcos Vinícius",
    service: "Corte",
    preference: "Bruno",
    wait: 12,
    initials: "MV",
  },
  {
    id: "tiago",
    name: "Tiago Lopes",
    service: "Corte + barba",
    preference: "Sem preferência",
    wait: 25,
    initials: "TL",
  },
];

export const BASE_APPOINTMENTS = BASE_AGENDA.filter(
  (item) => item.status !== "bloqueio",
).length;

export const BASE_COMPLETED = BASE_AGENDA.filter(
  (item) => item.status === "pago",
).length;

export const BASE_REVENUE = BASE_AGENDA.reduce(
  (total, item) => total + item.price,
  0,
);

export const BASE_RECEIVED = BASE_AGENDA.filter(
  (item) => item.status === "pago",
).reduce((total, item) => total + item.price, 0);

export const BASE_TO_RECEIVE = BASE_AGENDA.filter(
  (item) => item.price > 0 && item.status !== "pago",
).reduce((total, item) => total + item.price, 0);

export const COMMISSION_RATE = 0.4;

export const CHAPTERS: Chapter[] = [
  {
    id: 1,
    time: "09:12",
    title: "Ela marca em 3 toques",
    desc: "Profissional, serviço e horário. Sem ligação, sem cadastro.",
    icon: "calendar-check",
  },
  {
    id: 2,
    time: "14:00",
    title: "O lembrete chega",
    desc: "No WhatsApp que ela já usa, com o horário e o profissional.",
    icon: "bell",
  },
  {
    id: 3,
    time: "14:02",
    title: "Ela responde",
    desc: "Um toque para confirmar ou liberar a vaga na hora.",
    icon: "message-circle",
  },
  {
    id: 4,
    time: "14:03",
    title: "A fila preenche",
    desc: "A brecha não fica vazia: o próximo da fila entra no lugar.",
    icon: "users",
  },
];

export const REMINDER_TEXT =
  "Oi, Mariana! Confirma seu corte hoje às 15h com o Bruno?";

export const STATUS_LABEL: Record<AgendaStatus, string> = {
  pago: "Pago",
  andamento: "Em andamento",
  confirmado: "Confirmado",
  pendente: "Pendente",
  bloqueio: "Bloqueado",
};

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function professionalById(id: string): Professional {
  return PROFESSIONALS.find((item) => item.id === id) ?? PROFESSIONALS[1];
}

export function serviceById(id: string): Service {
  return SERVICES.find((item) => item.id === id) ?? SERVICES[0];
}
