# Direção visual — landing 2026-11 ("Cartela")

Decidido com o dono do produto em 2026-11-19: identidade **nova**, conversão = **criar conta grátis**,
momento **3D interativo** + ilustrações 3D pré-renderizadas. Ele delegou a direção (proposta abaixo é decisão do design).

## Brief

- **Quem:** dona/dono de barbearia, salão, manicure e nail designer, lash e sobrancelha, spa dos pés e podologia.
  Clínica fica fora (não há anamnese/prontuário no produto).
- **Trabalho da página:** fazer a pessoa criar a conta grátis (14 dias, IA do WhatsApp ligada, sem cartão).
- **Ideia central:** quem vive de horário marcado sonha com a agenda cheia. A página mostra a agenda se
  enchendo sozinha enquanto a IA conversa no WhatsApp.

## Conceito: a agenda como cartela de esmaltes

Cada horário marcado é uma peça laqueada, como uma amostra de esmalte. Horário vazio é porcelana crua.
O mundo do salão (esmalte, laca, porcelana, pinça, pente) entra pela matéria, não por ícone.

## Paleta

| Nome | Hex | Papel |
|------|-----|-------|
| Porcelana | `#ECE7EF` | fundo da página (lilás acinzentado, não creme) |
| Louça | `#F8F6FA` | superfícies claras, slots vazios |
| Tinta | `#24142E` | texto e seções escuras (berinjela, não preto neutro) |
| Laranja Skedoole | `#FF5A24` | **só** CTA e logo (continuidade com o app) |
| Amora | `#8E1B4A` | laca 1 |
| Nude | `#E4AE98` | laca 2 |
| Lavanda | `#A99AF0` | laca 3 |

As lacas só aparecem nas peças 3D e ilustrações; a interface em si é Porcelana + Tinta + Laranja.

## Tipo

- **Fraunces** (variável, eixo `SOFT` no máximo, `opsz` alto) para títulos: serifa macia, quase uma gota de esmalte.
  Usada grande e em caixa normal; o próprio título é o elemento visual.
- **Hanken Grotesk** (variável) para texto e interface.
- Sem rótulos em caixa alta, sem "eyebrow", sem palavra destacada em cor dentro do título, sem `→` em botão.

## Layout

```
HERO (desktop)                                   HERO (mobile)
┌───────────────────────────────┬──────────┐     ┌──────────────┐
│ Enquanto você atende,         │  ▦▦▦▦▦   │     │ Enquanto você│
│ a IA marca a próxima.         │ ▦▦░▦▦  ← │     │ atende, a IA │
│ (Fraunces enorme, à esquerda) │ ▦░░▦░  3D│     │ marca...     │
│ texto curto + [Criar conta]   │ (vaza p/ │     │ [Criar conta]│
│                               │  a borda)│     │ ▦▦▦ 3D ▦▦▦   │
└───────────────────────────────┴──────────┘     └──────────────┘
PRA QUEM: objetos 3D em fileira desencontrada (pente, esmalte, pinça, pedra/toalha, escova)
O DIA: celular fixo + 4 momentos do dia trocando conforme o scroll (23:41, 08:00, 14:10, 19:00)
TUDO JUNTO: lista tipográfica em 2 colunas, sem cards
PREÇO: painel Tinta com a calculadora per-seat atual
DÚVIDAS: <details>
FIM: render da agenda cheia + CTA
```

Alinhamento à esquerda em todo lugar; o único elemento centralizado é nenhum.

## Princípios

1. A ousadia mora em um lugar: a agenda 3D do hero. Todo o resto é calmo.
2. Um só momento orquestrado (a agenda enchendo). Nada de fade-up em cada seção.
3. Movimento só responde a ação: toque no horário vazio, scroll da história do dia.
4. Página funciona sem WebGL e com `prefers-reduced-motion`: o 3D cai para a imagem pré-renderizada.

## Técnico

- three.js `0.187.0` só na ilha do hero (`import()` dinâmico ao ficar ocioso/visível) e no script de render.
- `src/three/kit.ts`: geometria e materiais compartilhados entre a cena ao vivo e os renders.
- Renders pré-gerados em `src/assets/3d/*.png` por `scripts/render-3d/` (puppeteer + página estática), usados via `<Image />`.
- Estilo da home isolado em `src/styles/cartela.css` sob `.cartela`; blog e `/experiencia` continuam no visual antigo até migrarem.

## Tour do sistema e demo da IA (2026-11-19, pedido do dono)

Decidido: **tour clicável com as telas reais do app** (opção A; conta demo de verdade fica pra depois).

- Seção `#tour` logo após o hero: celular com as telas reais, em mobile, de um salão de exemplo ("Studio Camila":
  4 profissionais, 10 serviços, 40 clientes, 4 meses de histórico). Navega pelos próprios botões do app
  (hotspots medidos na captura) ou pela lista de telas ao lado. Telas: Meu dia, Semana, Secretária no WhatsApp
  (+ conversa), Clientes (Chamar hoje), Ficha da cliente, Caixa, Comissões, Mais, Vitrine.
- Seção `#ia`: conversa **real** da Secretária 24h (Gemini) com uma cliente do salão de exemplo, reproduzida
  com "digitando…"; no fim mostra o agendamento que a IA criou.
- A história do dia (celular fixo no scroll) saiu: ficou redundante com o tour e a demo; lembrete e
  "cancelou, a vaga volta" foram para a lista "Vem junto".

### Como regerar (quando o app mudar)

Tudo local e isolado; nada sai da máquina.

1. Worktrees destacados de `origin/main` do scheduler_api e do scheduler_web; banco `scheduler_tour` novo;
   Redis num db vazio; **nenhum Sidekiq**.
2. `bin/rails db:schema:load db:seed skedoole:plans` + `bin/rails runner scripts/tour/seed_demo.rb`
   (precisa de `TOUR_IMG_DIR` com logo/capa/fotos dos serviços — geradas a partir dos renders 3D).
3. API do tour com `EVOLUTION_API_URL` apontando para um stub local (status `open`); o envio de mensagens
   (`WhatsApp::EvolutionService`) lê as credentials direto, por isso os scripts neutralizam esse serviço em processo.
4. Web do tour com `.env.dev.local` apontando para a API do tour, aberto em `localhost` (o app lê o subdomínio do host).
5. Token da dona via `rails runner` (`create_new_auth_token`) → `node scripts/tour/capturar.cjs`.
6. `GEMINI_API_KEY=... bin/rails runner scripts/tour/conversa_ia.rb` → **ler a transcrição** antes de publicar.
