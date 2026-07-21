# AGENTS.md — landing Skedoole

Diretrizes para trabalhar na landing-page em `/home/matheus/skedoole/landing-page`.
Projeto Astro 5 estático um-pager + blog (Content Collections) + Tailwind v4.

## Stack fixa (NÃO alterar versões)

- Node 20.19.6, npm 10.8.2. Sem pnpm/bun/yarn. **Sem `npm install` sem `--legacy-peer-deps`**.
- `astro`: 5.18.2, `@astrojs/check`: 0.9.9, `@astrojs/mdx`: 4.2.6 (não subir p/ 7.x), `@astrojs/rss`: 4.0.11, `@astrojs/sitemap`: 3.2.1
- `tailwindcss`: ^4.0.0 com `@tailwindcss/vite` (não usar `@tailwindcss/cli`, não usar PostCSS)
- `typescript`: 5.7.3 (não subir p/ 7.x — quebra `@astrojs/check`)
- `@fontsource/bricolage-grotesque` (display) + `@fontsource/inter` (corpo). **Não usar Poppins**.
- `sharp`: ^0.33.5

## Comandos

```bash
npm install --legacy-peer-deps      # única forma de install suportada
npm run dev                          # dev server http://localhost:4321
npm run build                        # = astro check && astro build  → dist/
npm run preview                      # serve dist localmente
npx astro check                      # typecheck only
npx astro check --minimumSeverity error   # CI: falha só em erros
```

## Convenções do projeto

- **Design system dark-first** canon é `src/styles/tokens.css` (superfícies em camadas de cinza, laranja `#FF5A24` reservado para ação, verde `#3ECF72` para status positivo, WhatsApp verde `#25D366` só no bloco de mensagem). **Não usar cores hex soltas** — sempre variáveis `--cor-*`.
- **Regra de ouro: laranja só em ação.** O único uso de laranja preenchido é o botão CTA principal. Permitido também: a barrinha do "eyebrow" e no máximo UM acento pontual por seção (ex: badge "-8%" no pricing). **NÃO usar laranja em**: headlines inteiras, ícones de recurso, checks de lista, bordas de card comum, ou status.
- **Headlines em branco (`--cor-texto-primario`).** Se quiser destaque numa palavra, use um marca-texto laranja atrás de UMA palavra (span com fundo laranja skewed), nunca a frase inteira colorida.
- **Status usa cor de sinal, não laranja.** "Confirmado" / sucesso → badge verde (`--cor-status-ok` sobre `--cor-status-ok-bg`). "Aguardando" / neutro → cinza (`--cor-texto-secundario` sobre `--cor-cards-hover`).
- **Checks de lista (recursos, preços) em verde ou cinza**, nunca laranja.
- **Todos os cards em `--cor-cards`**, com borda `--cor-borda-geral`. Hover: borda vira `--cor-borda-hover` e/ou eleva com sombra sutil. **Nenhum card branco no site**.
- **CTA secundário sussurra.** Botão fantasma: fundo transparente, borda `--cor-borda-hover`, texto branco. Nunca com o mesmo peso do primário.
- **Fontes**: Bricolage Grotesque (display, pesos 700/800, `letter-spacing: -0.03em`, `line-height: ~1.0`) + Inter (corpo e UI, pesos 400-700).
- `src/styles/global.css` importa `tokens.css` e mapeia para Tailwind via `@theme {}`. Componentes utilitários em `@layer components` (`.btn`, `.card`, `.eyebrow`, `.container-tight`, `[data-reveal]`).
- **PT-BR, ICP dono de barbearia/salão.** Sem juridiquês, sem AI-tells ("descubra/desbloqueie/potencialize"). Prova social com nomes BR realistas.
- CTA primário → `app.skedoole.com.br/agendar` (via `SITE.appUrl`). Secundário → WhatsApp (`SITE.whatsapp`).
- Tudo self-host: zero libs de runtime para estilos/ícones/animação. Ícones Lucide são inline em `src/components/Icon.astro` (adicionar path string lá, não importar pacote).
- Animações: CSS + IntersectionObserver via `Reveal.astro`. Sem libs pesadas. Respeitar `prefers-reduced-motion`.

## Estrutura

```
src/
  config/site.ts          — SITE const (envvars PUBLIC_SITE_URL/APP_URL/WHATSAPP)
  content/config.ts       — collection `blog` schema
  content/blog/*.md       — posts (PT-BR)
  components/              — Logo, Icon, Reveal, Nav, Footer
  layouts/Base.astro      — head SEO/OG/JSON-LD/favicons, props: title/description/image/canonical/noindex/jsonLd/type
  sections/               — Hero, Features, HowItWorks, Testimonials, Pricing, FAQ, CTA
  pages/index.astro       — home
  pages/blog/             — index + [...slug]
  pages/rss.xml.ts        — RSS feed
  pages/robots.txt.ts     — robots dinâmico
public/                   — favicons, manifest.webmanifest, og.svg
```

## JSON-LD

Home já injeta `WebSite` + `Organization` + `SoftwareApplication` via `Base.astro`. Artigos do blog passam `jsonLd={false}` e injetam `BlogPosting` via slot `head`.

## Env vars (opcional em produção)

```
PUBLIC_SITE_URL=https://skedoole.com.br
PUBLIC_APP_URL=https://app.skedoole.com.br
PUBLIC_WHATSAPP=https://wa.me/5511999999999
```
