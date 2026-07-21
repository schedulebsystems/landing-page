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