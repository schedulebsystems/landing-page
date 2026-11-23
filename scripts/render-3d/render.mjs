// Gera os PNGs 3D estáticos em src/assets/3d/.
// Uso: node scripts/render-3d/render.mjs [nome...]   (CHROME=/caminho/do/chrome opcional)
import { build } from "esbuild";
import { createServer } from "node:http";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(import.meta.url);
const puppeteer = require(process.env.PUPPETEER ?? "puppeteer-core");
const nomes = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["agenda-hero", "agenda-cheia", "esmalte", "pente", "pinca", "toalhas", "escova"];

const out = await build({
  entryPoints: [resolve(root, "scripts/render-3d/entry.ts")],
  bundle: true, format: "esm", write: false, target: "es2022",
});
const js = out.outputFiles[0].text;
// Mesma fonte do app (Fustat), servida do próprio repositório.
const fontFile = resolve(root, "src/assets/fontes/Fustat-latin.woff2");
const fontCss = `@font-face{font-family:"Fustat";font-weight:300 800;src:url(/files/fustat.woff2) format("woff2")}`;

const server = createServer((req, res) => {
  if (req.url === "/") {
    res.setHeader("content-type", "text/html");
    return res.end(`<!doctype html><link rel="stylesheet" href="/font.css"><body style="margin:0"><script type="module" src="/app.js"></script>`);
  }
  if (req.url === "/app.js") { res.setHeader("content-type", "text/javascript"); return res.end(js); }
  if (req.url === "/font.css") { res.setHeader("content-type", "text/css"); return res.end(fontCss); }
  if (req.url.startsWith("/files/")) { res.setHeader("content-type", "font/woff2"); return res.end(readFileSync(fontFile)); }
  res.statusCode = 404; res.end();
}).listen(0, "127.0.0.1");
await new Promise((r) => server.once("listening", r));
const { port } = server.address();

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME ?? "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage();
page.on("pageerror", (e) => console.error("pageerror:", e.message));
await page.goto(`http://127.0.0.1:${port}/`);
await page.waitForFunction("window.__ready === true");
mkdirSync(resolve(root, "src/assets/3d"), { recursive: true });
for (const nome of nomes) {
  const url = await page.evaluate((n) => window.__render(n), nome);
  const file = resolve(root, `src/assets/3d/${nome}.png`);
  writeFileSync(file, Buffer.from(url.split(",")[1], "base64"));
  console.log("ok", nome);
}
await browser.close();
server.close();
