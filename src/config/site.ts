/**
 * Configuração central do site.
 * Alterar valores de ambiente em produção via .env (PUBLIC_SITE_URL etc).
 */
export const SITE = {
  name: "Skedoole",
  legalName: "Skedoole Tecnologia",
  domain: "skedoole.com.br",
  get url() {
    return (
      import.meta.env.PUBLIC_SITE_URL ?? "https://skedoole.com.br"
    ).replace(/\/$/, "");
  },
  get appUrl() {
    return (import.meta.env.PUBLIC_APP_URL ?? "https://app.skedoole.com.br")
      .replace(/\/$/, "");
  },
  get whatsapp() {
    return (import.meta.env.PUBLIC_WHATSAPP ?? "https://wa.me/5511999999999");
  },
  locale: "pt-BR",
  lang: "pt-br",
  defaultTitle: "Skedoole — Agenda digital para barbearias e salões",
  description:
    "Agenda online, fila de atendimento, lembrete automático no WhatsApp e clube de assinatura para a sua barbearia ou salão. Comece grátis em 5 minutos.",
  ogImage: "/og.svg",
  themeColor: "#FF5A24",
  twitter: "@skedoole",
  author: "Equipe Skedoole",
  keywords: [
    "agendamento online barbearia",
    "sistema para barbearia",
    "agenda digital salão",
    "fila de atendimento",
    "clube de assinatura barbearia",
    "lembrete WhatsApp agendamento",
    "software barbearia Brasil",
  ],
} as const;

export type Site = typeof SITE;