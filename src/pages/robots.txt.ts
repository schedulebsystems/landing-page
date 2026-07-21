import type { APIContext } from "astro";
import { SITE } from "@config/site";

export function GET(_context: APIContext) {
  const sitemapURL = new URL("/sitemap-index.xml", SITE.url).href;
  const appURL = SITE.appUrl;
  const body = `User-agent: *
Allow: /
Disallow: /api/

# Permitir indexação do blog, bloquear endpoints futuros
Allow: /blog/

# Imagens
Allow: /favicon.png
Allow: /favicon-48.png
Allow: /favicon-512.png
Allow: /og.svg

Sitemap: ${sitemapURL}

# Informa rastreadores leitores da app pública (apenas home do app indexável)
# O restante do app já controla seus próprios headers.
Host: ${SITE.url.replace(/^https?:\/\//, "")}
`;
  const headerAppURL = `# App pública de agendamento: ${appURL}`;
  return new Response(`${headerAppURL}\n${body}`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}