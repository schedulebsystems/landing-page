# CLAUDE.md — landing Skedoole

@AGENTS.md

As regras de stack, tokens e marca estão no `AGENTS.md` acima. Este arquivo acrescenta as regras de arquitetura e de processo visual.

## Arquitetura Astro

- **Estático primeiro.** Estrutura, layout e copy em componentes `.astro` sem JS. Se dá para fazer com HTML + CSS, não vira ilha.
- **Ilhas só com interação de verdade.** `client:visible` (abaixo da dobra) ou `client:idle` (acima da dobra, não crítico). Nunca `client:load` sem justificar no PR. Cada ilha deve ter um motivo que CSS não resolve.
- **Imagens sempre via `<Image />` / `<Picture />` de `astro:assets`**, com origem em `src/assets/` (não em `public/`), `alt` descritivo e `width`/`height` definidos. Hero com `loading="eager"` e `fetchpriority="high"`; o resto lazy.
- **Movimento:** primeiro CSS (transições, `animation-timeline: view()`/`scroll()` para efeitos no scroll); JS só quando o CSS não alcança. Sempre respeitar `prefers-reduced-motion` e checar que a página funciona sem a animação.
- **Orçamento:** LCP < 2,5 s no mobile, CLS ~0, sem fonte ou asset de terceiros carregado em runtime.

## Direção visual (skill `frontend-design`)

- Toda tarefa de UI começa carregando a skill `frontend-design` e passando pelo plano curto (paleta, tipo, layout em ASCII, princípios) **antes** de escrever código, revisado contra o brief.
- Fugir da estética genérica de IA: tipografia como elemento ativo, contraste intencional, layouts assimétricos/editoriais, ousadia concentrada em **um** elemento por tela, micro-interações que respondem a ação do usuário (não fade-up em toda seção).
- Copy em PT-BR do ponto de vista do dono da barbearia/salão: verbos simples, sem "descubra/potencialize", CTA diz exatamente o que acontece.
- Auditoria de UI/a11y: skill `web-design-guidelines` sobre os arquivos alterados.

## Validação visual (obrigatória antes de concluir UI)

1. `npm run dev` (http://localhost:4321).
2. Abrir no MCP `chrome-devtools` (se o perfil estiver preso por outra sessão, puppeteer-core headless com `/usr/bin/google-chrome`): screenshot em **desktop (1440×900)** e **mobile (390×844)**, rolando a página inteira.
3. Checar console sem erros, sem scroll horizontal no mobile, foco de teclado visível e a versão com `prefers-reduced-motion: reduce`.
4. `npm run build` passando (`astro check` incluso).
5. Criticar o print contra o plano de design e cortar um "acessório" antes de dar por pronto.
