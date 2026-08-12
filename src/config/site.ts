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
  defaultTitle: "Skedoole | Agenda com IA no WhatsApp pra Barbearia e Salão",
  description:
    "Agenda online, lembrete automático e uma IA que atende e agenda pelo WhatsApp — sozinha, 24h. Menos no-show, mais horário ocupado, sem planilha. Teste grátis por 14 dias.",
  ogImage: "/og.svg",
  /**
   * TODO: placeholder até a 4Asset/Skedoole informar o CNPJ real.
   * Não inventar um número — substituir antes de publicar em produção.
   */
  cnpj: "00.000.000/0001-00",
  themeColor: "#FF5A24",
  twitter: "@skedoole",
  /**
   * Perfis sociais usados no sameAs do JSON-LD.
   * TODO: confirmar as URLs reais antes de publicar em produção.
   */
  socials: [
    "https://www.instagram.com/skedoole",
    "https://www.youtube.com/@skedoole",
    "https://www.linkedin.com/company/skedoole",
    "https://twitter.com/skedoole",
  ],
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