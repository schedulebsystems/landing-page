export interface Professional {
  id: string;
  name: string;
  article: "o" | "a";
  role: string;
  initials: string;
  rating: string;
  reviews: string;
  tone: number;
}

export interface Service {
  id: string;
  name: string;
  gender: "m" | "f";
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

import {
  getSegment,
  type Segment,
  type SegmentKey,
} from "./segments";

// Dados da simulação do segmento ativo. São `export let` de propósito: o
// `useSegment()` troca o segmento e quem importou (store/ui no navegador,
// componentes Astro no build) passa a ler os valores novos (live bindings).
export let SEGMENT: Segment = getSegment("barbearia");
export let TENANT: Segment["tenant"] = SEGMENT.tenant;
export let PROFESSIONALS: Professional[] = SEGMENT.professionals;
export let SERVICES: Service[] = SEGMENT.services;
export let BASE_AGENDA: AgendaItem[] = SEGMENT.agenda;
export let QUEUE: QueueEntry[] = SEGMENT.waiting;
export let CHAPTERS: Chapter[] = chaptersFor(SEGMENT);
export let REMINDER_TEXT = "";
export let BASE_APPOINTMENTS = 0;
export let BASE_COMPLETED = 0;
export let BASE_REVENUE = 0;
export let BASE_RECEIVED = 0;
export let BASE_TO_RECEIVE = 0;

export const AVAILABLE_SLOTS = ["15:00"] as const;

export function slotsForService(service: Service): string[] {
  return service.duration <= 45 ? [...AVAILABLE_SLOTS] : [];
}

export const COMMISSION_RATE = 0.4;

function chaptersFor(seg: Segment): Chapter[] {
  const fila = seg.fillMode === "queue";
  return [
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
    fila
      ? {
          id: 4,
          time: "14:03",
          title: "A fila preenche",
          desc: "A brecha não fica vazia: o próximo da fila entra no lugar.",
          icon: "users",
        }
      : {
          id: 4,
          time: "14:03",
          title: "A vaga volta para o link",
          desc: "O horário cancelado reabre no seu link e outra cliente marca.",
          icon: "link",
        },
  ];
}

export function useSegment(key: SegmentKey | string | undefined): Segment {
  SEGMENT = getSegment(key);
  TENANT = SEGMENT.tenant;
  PROFESSIONALS = SEGMENT.professionals;
  SERVICES = SEGMENT.services;
  BASE_AGENDA = SEGMENT.agenda;
  QUEUE = SEGMENT.waiting;
  CHAPTERS = chaptersFor(SEGMENT);

  const demoPro = PROFESSIONALS.find((p) => p.id === SEGMENT.demo.professionalId) ?? PROFESSIONALS[0];
  const demoService = SERVICES.find((s) => s.id === SEGMENT.demo.serviceId) ?? SERVICES[0];
  REMINDER_TEXT = `Oi, Mariana! Confirma ${demoService.gender === "f" ? "sua" : "seu"} ${demoService.name.toLowerCase()} hoje às 15h com ${demoPro.article} ${demoPro.name}?`;

  BASE_APPOINTMENTS = BASE_AGENDA.filter((item) => item.status !== "bloqueio").length;
  BASE_COMPLETED = BASE_AGENDA.filter((item) => item.status === "pago").length;
  BASE_REVENUE = BASE_AGENDA.reduce((total, item) => total + item.price, 0);
  BASE_RECEIVED = BASE_AGENDA.filter((item) => item.status === "pago").reduce(
    (total, item) => total + item.price,
    0,
  );
  BASE_TO_RECEIVE = BASE_AGENDA.filter(
    (item) => item.price > 0 && item.status !== "pago",
  ).reduce((total, item) => total + item.price, 0);
  return SEGMENT;
}

useSegment("barbearia");

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
  return (
    PROFESSIONALS.find((item) => item.id === id) ??
    PROFESSIONALS.find((item) => item.id === SEGMENT.demo.professionalId) ??
    PROFESSIONALS[0]
  );
}

export function serviceById(id: string): Service {
  return (
    SERVICES.find((item) => item.id === id) ??
    SERVICES.find((item) => item.id === SEGMENT.demo.serviceId) ??
    SERVICES[0]
  );
}
