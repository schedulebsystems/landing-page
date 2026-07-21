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
    "Agenda digital pra barbearia que quer cliente marcando sozinho, cadeira que não fura e caixa previsível. Lembrete WhatsApp, fila digital e clube de assinatura. Comece grátis.",
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