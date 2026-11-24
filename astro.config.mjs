// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Site canônico. Trocar em produção para https://skedoole.com.br
const SITE = process.env.SITE_URL ?? "https://skedoole.com.br";

// src ./src
export default defineConfig({
  site: SITE,
  output: "static",
  redirects: {
    "/v2": "/",
  },
  trailingSlash: "ignore",
  build: {
    inlineStylesheets: "auto",
  },
  image: {
    responsiveStyles: true,
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes("/experiencia") && !/\/v2\/?$/.test(page),
      i18n: {
        defaultLocale: "pt-br",
        locales: { "pt-br": "pt-BR" },
      },
      changefreq: "weekly",
      priority: 0.8,
      lastmod: new Date(),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
});