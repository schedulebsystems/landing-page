// Captura as telas reais do app (scheduler_web) para o tour da landing.
//
// Pré-requisitos: banco do tour populado (scripts/tour/seed_demo.rb), API e web do tour rodando,
// e um token da dona em JSON (access-token, client, uid, expiry, user_id, conversa, cliente, pros).
//
//   TOUR_TOKEN=/caminho/tour-token.json TOUR_WEB=http://localhost:6925 TOUR_API=http://127.0.0.1:3100 \
//   PUPPETEER=/caminho/puppeteer-core node scripts/tour/capturar.cjs
//
// Saída: src/assets/tour/<tela>.png (+ -topo.png / -barra.png dos elementos fixos) e src/data/tour.json.
// Nenhuma requisição sai da máquina (o index do app chama api.skedoole.com.br: é bloqueado aqui).
const { writeFileSync, mkdirSync } = require('node:fs');
const { resolve } = require('node:path');

const puppeteer = require(process.env.PUPPETEER || 'puppeteer-core');
const tok = require(resolve(process.env.TOUR_TOKEN));
const WEB = process.env.TOUR_WEB || 'http://localhost:6925';
const API = process.env.TOUR_API || 'http://127.0.0.1:3100';
const SUB = 'studio-camila';
const ROOT = resolve(__dirname, '../..');
const OUT = resolve(ROOT, 'src/assets/tour');
const W = 390, H = 844, DPR = 3, MAX_H = 3000;

// Destinos comuns: barra de baixo e topo.
const GLOBAIS = [
  ['Meu dia', 'meudia'], ['Clientes', 'clientes'], ['Caixa', 'caixa'], ['Mais', 'mais'], ['WhatsApp:', 'whatsapp'],
];
const TELAS = [
  { id: 'meudia', rota: '/home', links: [['Semana', 'semana']] },
  { id: 'semana', rota: '/home?view=semana', links: [['Dia', 'meudia']] },
  { id: 'whatsapp', rota: '/whatsapp', links: [['Joana Ribeiro', 'chat'], ['Voltar', 'meudia']] },
  { id: 'chat', rota: `/whatsapp?conversa=${tok.conversa}`, links: [['Voltar', 'whatsapp']] },
  { id: 'clientes', rota: '/clientes', links: [['Marina Alves\n', 'ficha']] },
  { id: 'ficha', rota: `/clientes/${tok.cliente}`, links: [['Voltar', 'clientes']] },
  { id: 'caixa', rota: '/financeiro', links: [] },
  { id: 'comissoes', rota: '/comissoes', links: [['Voltar', 'mais']] },
  { id: 'mais', rota: '/mais', links: [['Link da vitrine', 'vitrine'], ['Comissões\n', 'comissoes']] },
  { id: 'vitrine', rota: `/vitrine?sub=${SUB}`, links: [], publica: true },
];
const FIXOS = ['.mobile-topbar-fixed', '.mobile-nav'];

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

/** Abre a rota e confere que não caiu no limite de requisições (rack-attack); se cair, espera e tenta de novo. */
async function abrir(page, rota) {
  for (let tentativa = 1; tentativa <= 4; tentativa++) {
    await page.goto(WEB + rota, { waitUntil: 'networkidle2' });
    await espera(3000);
    const limitado = await page.evaluate(() => document.body.innerText.includes('Muitas requisições'));
    if (!limitado) return;
    console.warn(`  limite de requisições em ${rota}; esperando 75s (tentativa ${tentativa})`);
    await espera(75000);
  }
  throw new Error(`limite de requisições persistente em ${rota}`);
}

async function novaPagina(browser, altura = H) {
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: altura, deviceScaleFactor: DPR, isMobile: true, hasTouch: true });
  await page.setRequestInterception(true);
  page.on('request', (r) => {
    const u = r.url();
    if (u.startsWith('http://127.0.0.1:3000')) return r.continue({ url: u.replace('http://127.0.0.1:3000', API) });
    if (/^https?:\/\/(127\.0\.0\.1|localhost|fonts\.googleapis\.com|fonts\.gstatic\.com)/.test(u) || /^(data|blob|ws)/.test(u)) return r.continue();
    return r.abort();
  });
  page.on('pageerror', (e) => console.warn('  pageerror:', e.message.slice(0, 120)));
  return page;
}

/** Rótulo e caixa de tudo que é clicável (a, button, role=button, cursor:pointer). */
const CLICAVEIS = () => {
  const out = [];
  for (const el of document.querySelectorAll('a, button, [role="button"], li, div')) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const clicavel = el.matches('a, button, [role="button"]') || getComputedStyle(el).cursor === 'pointer';
    if (!clicavel) continue;
    const t = (el.getAttribute('aria-label') || el.innerText || el.title || '').trim();
    out.push({ t, x: r.x, y: r.y, w: r.width, h: r.height });
  }
  return out;
};

/** Prefixo terminado em ':' ou '\n' casa pelo começo; o resto casa a 1ª linha inteira ("Mais" ≠ "Mais ações"). */
function achar(clicaveis, prefixo) {
  const casa = (t) => (/[:\n]$/.test(prefixo) ? t.startsWith(prefixo) : t.split('\n')[0].trim() === prefixo);
  return clicaveis.filter((c) => casa(c.t)).sort((a, b) => a.w * a.h - b.w * b.h)[0];
}

(async () => {
  mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox'],
  });

  // login (token local, sem senha) + preferências que tiram avisos de onboarding
  const login = await novaPagina(browser);
  const q = new URLSearchParams({ 'access-token': tok['access-token'], client: tok.client, uid: tok.uid, expiry: tok.expiry, subdomain: SUB });
  await login.goto(`${WEB}/oauth/callback?${q}`, { waitUntil: 'networkidle2' });
  await login.waitForFunction(() => location.pathname === '/home', { timeout: 30000 });
  await login.evaluate((uid, sub, prof) => {
    localStorage.setItem(`primeiros_passos_link_${uid}`, '1');
    localStorage.setItem(`tutorial_seen_${sub}_${uid}_FinanceiroCentral`, 'true');
    localStorage.setItem('meuDia.professionalId', String(prof));
  }, tok.user_id, SUB, tok.pros['Camila Duarte']);
  await login.close();

  const manifesto = [];
  for (const tela of TELAS) {
    await espera(4000); // rack-attack: 600 req / 5 min por IP
    // 1) viewport normal: mede o scroll interno, os fixos e os hotspots dos fixos
    const page = await novaPagina(browser);
    await abrir(page, tela.rota);
    const medida = await page.evaluate((fixos) => {
      let extra = Math.max(0, document.scrollingElement.scrollHeight - innerHeight);
      for (const el of document.querySelectorAll('body *')) {
        const cs = getComputedStyle(el);
        if (/(auto|scroll)/.test(cs.overflowY) && el.clientHeight > innerHeight * 0.6) extra = Math.max(extra, el.scrollHeight - el.clientHeight);
      }
      const fx = fixos.map((s) => { const el = document.querySelector(s); if (!el) return null; const r = el.getBoundingClientRect(); return { s, x: r.x, y: r.y, w: r.width, h: r.height }; }).filter(Boolean);
      return { extra, fixos: fx };
    }, FIXOS);
    const clicNormal = await page.evaluate(CLICAVEIS);
    const camadas = [];
    for (const f of medida.fixos) {
      const nome = f.s === '.mobile-nav' ? 'barra' : 'topo';
      // inclui a margem até a borda (a barra flutua 12px acima do fundo)
      const clip = nome === 'barra' ? { x: 0, y: f.y - 8, width: W, height: H - (f.y - 8) } : { x: 0, y: 0, width: W, height: f.y + f.h };
      await page.screenshot({ path: resolve(OUT, `${tela.id}-${nome}.png`), clip, omitBackground: false });
      const links = [...GLOBAIS, ...tela.links]
        .map(([p, para]) => ({ c: achar(clicNormal, p), para }))
        .filter(({ c, para }) => c && para !== tela.id && c.y >= clip.y && c.y + c.h <= clip.y + clip.height)
        .map(({ c, para }) => ({ para, rotulo: c.t.split('\n')[0].slice(0, 40), x: c.x / W, y: (c.y - clip.y) / clip.height, w: c.w / W, h: c.h / clip.height }));
      camadas.push({ nome, altura: clip.height, links });
    }
    await page.close();

    // 2) viewport alto: tela inteira sem rolagem, com os fixos escondidos
    const alto = Math.min(MAX_H, H + Math.round(medida.extra));
    const full = await novaPagina(browser, alto);
    await abrir(full, tela.rota);
    await full.evaluate((fixos) => fixos.forEach((s) => document.querySelectorAll(s).forEach((el) => { el.style.visibility = 'hidden'; })), FIXOS);
    const clicAlto = await full.evaluate(CLICAVEIS);
    await full.screenshot({ path: resolve(OUT, `${tela.id}.png`) });
    const ocupado = camadas.map((c) => c.nome);
    const links = [...GLOBAIS, ...tela.links]
      .map(([p, para]) => ({ c: achar(clicAlto, p), para }))
      .filter(({ c, para }) => c && para !== tela.id && c.w < W * 0.98)
      // o que está na barra/topo já foi mapeado na camada fixa
      .filter(({ c }) => !(ocupado.includes('barra') && c.y > alto - 80) && !(ocupado.includes('topo') && c.y < 60))
      .map(({ c, para }) => ({ para, rotulo: c.t.split('\n')[0].slice(0, 40), x: c.x / W, y: c.y / alto, w: c.w / W, h: c.h / alto }));
    await full.close();

    manifesto.push({ id: tela.id, altura: alto, links, camadas });
    console.log(tela.id, 'altura', alto, 'links', links.map((l) => l.para).join(','), 'fixos', camadas.map((c) => `${c.nome}:${c.links.map((l) => l.para)}`).join(' '));
  }

  writeFileSync(resolve(ROOT, 'src/data/tour.json'), JSON.stringify({ largura: W, altura: H, telas: manifesto }, null, 2));
  await browser.close();
})();
