// Depoimentos reais, com autorização por escrito de quem falou.
// A seção "Quem já usa" só aparece quando esta lista tiver itens — nunca
// preencha com texto inventado (ver AGENTS.md e o playbook de Cliente
// Fundadora em hub/docs/superpowers/specs/2026-11-16-gtm-indicacoes-cliente-fundadora-design.md).
//
// Exemplo de item:
// {
//   quote: "Parei de responder WhatsApp de madrugada. As clientes marcam sozinhas.",
//   name: "Nome Sobrenome",          // como a pessoa autorizou aparecer
//   business: "Nome do estúdio",
//   city: "Cidade · UF",
//   segment: "estetica",              // aparece também na página do nicho
//   metric: "92% dos horários confirmados pelo lembrete", // opcional, número real
// }

import type { SegmentKey } from "./segments";

export interface Testimonial {
  quote: string;
  name: string;
  business: string;
  city: string;
  segment: Exclude<SegmentKey, "geral">;
  metric?: string;
}

export const TESTIMONIALS: Testimonial[] = [];

/** Na home mostra todos; na página do nicho, os do nicho primeiro. */
export function testimonialsFor(segment: SegmentKey): Testimonial[] {
  if (segment === "geral") return TESTIMONIALS;
  const doNicho = TESTIMONIALS.filter((t) => t.segment === segment);
  const outros = TESTIMONIALS.filter((t) => t.segment !== segment);
  return [...doNicho, ...outros];
}
