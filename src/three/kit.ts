/**
 * Kit 3D da landing ("Cartela"): materiais, estúdio de luz, a agenda laqueada e os objetos
 * das ilustrações. Compartilhado entre a cena ao vivo do hero (src/scripts/agenda3d.ts) e o
 * script que gera os renders estáticos (scripts/render-3d/).
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export const COR = {
  porcelana: 0xece7ef,
  louca: 0xf8f6fa,
  tinta: 0x24142e,
  laranja: 0xff5a24,
  amora: 0x7a1240,
  nude: 0xe4ae98,
  lavanda: 0xa99af0,
} as const;

/** Cores das peças laqueadas (horários marcados). */
export const LACAS = [COR.amora, COR.nude, COR.lavanda, COR.amora, COR.nude, COR.tinta];

export function laca(color: number) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.22,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    sheen: 0.2,
  });
}

export function louca(color: number = COR.louca) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.55,
    metalness: 0,
    clearcoat: 0.35,
    clearcoatRoughness: 0.4,
  });
}

export function cromo() {
  return new THREE.MeshPhysicalMaterial({ color: 0xd9d6de, roughness: 0.18, metalness: 1 });
}

/**
 * Renderer + ambiente de reflexo + luzes suaves de estúdio.
 * `acento`: luzes de recorte coloridas (lavanda/nude) usadas na cena da agenda.
 */
export function estudio(renderer: THREE.WebGLRenderer, scene: THREE.Scene, opts: { acento?: boolean } = {}) {
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.035).texture;
  pmrem.dispose();

  const hemi = new THREE.HemisphereLight(0xffffff, COR.porcelana, 0.9);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(-4, 9, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.radius = 6;
  key.shadow.bias = -0.0004;
  const s = key.shadow.camera as THREE.OrthographicCamera;
  s.left = -7; s.right = 7; s.top = 7; s.bottom = -7; s.near = 1; s.far = 30;
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xffe2d6, 0.6);
  rim.position.set(6, 3, -5);
  scene.add(rim);

  if (opts.acento) {
    const lav = new THREE.DirectionalLight(COR.lavanda, 0.9);
    lav.position.set(-8, 2.5, -4);
    scene.add(lav);
    const nude = new THREE.DirectionalLight(0xffc9b3, 0.45);
    nude.position.set(7, 2, 6);
    scene.add(nude);
  }
}

/** Chão que só recebe sombra (fundo transparente/da página aparece por trás). */
export function chaoDeSombra(size = 30, opacity = 0.16) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.ShadowMaterial({ opacity, color: COR.tinta, depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  return mesh;
}

// ---------------------------------------------------------------- agenda

export const DIAS = ["ter", "qua", "qui", "sex", "sáb"];
/** Números do dia no cabeçalho (uma semana genérica de terça a sábado). */
export const DATAS = [24, 25, 26, 27, 28];
/** Coluna de "hoje" (plaquinha escura + linha do agora). */
export const HOJE = 1;
export const HORAS = [9, 10, 11, 13, 14, 15];

/** Serviços que aparecem nas peças: nome curto + cor da laca (uma cor por família). */
export const SERVICOS = [
  { nome: "Pé e mão", cor: COR.amora },
  { nome: "Corte", cor: COR.tinta },
  { nome: "Lash lift", cor: COR.lavanda },
  { nome: "Sobrancelha", cor: COR.nude },
  { nome: "Spa dos pés", cor: COR.nude },
  { nome: "Escova", cor: COR.amora },
  { nome: "Barba", cor: COR.tinta },
  { nome: "Alongamento", cor: COR.lavanda },
  { nome: "Podologia", cor: COR.nude },
  { nome: "Esmaltação", cor: COR.amora },
] as const;
export const CLIENTES = [
  "Ana", "Rafa", "Bia", "Júlia", "Carla", "Duda", "Léo", "Mari", "Paula", "Gabi",
  "Nina", "Lu", "Bruno", "Thaís", "Vivi", "Sofia", "Caio", "Lia", "Fê", "Rita",
  "Jô", "Tati", "Malu", "Dani", "Iara", "Bel", "Clara", "Hugo", "Lara", "Zeca",
];

export interface Slot {
  col: number;
  row: number;
  filled: boolean;
  /** Peça laqueada (invisível enquanto o horário está livre); tem a etiqueta como filha. */
  tile: THREE.Mesh;
  /** Encaixe de porcelana (alvo do toque). */
  well: THREE.Mesh;
  /** Posição de repouso da peça. */
  rest: THREE.Vector3;
  servico: string;
  cliente: string;
}

const PASSO_X = 1.32;
const PASSO_Z = 0.98;
const COL_HORA = 0.95;
const TILE = { w: 1.14, h: 0.24, d: 0.8, r: 0.085 };

const FONTE = "'Hanken Grotesk Variable', system-ui, sans-serif";

function canvasTex(c: HTMLCanvasElement) {
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function rr(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
}

/** Retângulo arredondado como Shape (para extrudar a bandeja). */
function formaArredondada(w: number, d: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -d / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + d - r);
  s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  s.lineTo(x + r, y + d);
  s.quadraticCurveTo(x, y + d, x, y + d - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function extrudar(shape: THREE.Shape, altura: number, bisel: number) {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: altura - bisel * 2,
    bevelEnabled: true,
    bevelThickness: bisel,
    bevelSize: bisel,
    bevelSegments: 5,
    curveSegments: 24,
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, bisel, 0);
  return geo;
}

/** Halo radial (textura) para brilho e sombra de contato. */
export function halo(cor: string, borda = "rgba(0,0,0,0)") {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, cor);
  grad.addColorStop(1, borda);
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  return canvasTex(c);
}

/**
 * Agenda da semana: bandeja de porcelana com borda, coluna de horas, cabeçalho com os dias,
 * linha do "agora" e um encaixe por horário. Cada peça marcada leva o serviço e a cliente.
 * `prefill` = índices (col*HORAS.length+row) que já começam marcados.
 */
export function agenda(opts: { prefill?: number[] } = {}) {
  const group = new THREE.Group();
  const cols = DIAS.length;
  const rows = HORAS.length;
  const gradeW = cols * PASSO_X;
  const w = gradeW + COL_HORA + 0.55;
  const d = (rows + 1) * PASSO_Z + 0.6;
  // centro da grade deslocado para a direita (coluna de horas à esquerda)
  const gx = COL_HORA / 2;
  const x0 = gx - ((cols - 1) * PASSO_X) / 2;
  const z0 = -((rows - 1) * PASSO_Z) / 2 + PASSO_Z / 2;
  const ALT = 0.42;

  // ---- bandeja: base com bisel + borda elevada (lábio)
  const base = new THREE.Mesh(extrudar(formaArredondada(w, d, 0.42), ALT, 0.05), louca(0xeee9f2));
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  const borda = 0.16;
  const labio = formaArredondada(w, d, 0.42);
  labio.holes.push(formaArredondada(w - borda * 2, d - borda * 2, 0.3) as unknown as THREE.Path);
  const lip = new THREE.Mesh(extrudar(labio, 0.11, 0.035), louca(0xfdfcfe));
  lip.position.y = ALT - 0.01;
  lip.castShadow = true;
  lip.receiveShadow = true;
  group.add(lip);

  // ---- piso pintado: horas, linhas gravadas
  const iw = w - borda * 2;
  const id = d - borda * 2;
  const PX = 2048;
  const PZ = Math.round((PX * id) / iw);
  const pc = document.createElement("canvas");
  pc.width = PX;
  pc.height = PZ;
  const pg = pc.getContext("2d")!;
  const px = (x: number) => ((x + iw / 2) / iw) * PX;
  const pz = (z: number) => ((z + id / 2) / id) * PZ;
  const k = PX / iw; // px por unidade
  pg.clearRect(0, 0, PX, PZ);
  // linhas entre as horas (gravadas: escura + clara logo abaixo)
  const xi = px(x0 - PASSO_X / 2 + 0.02);
  const xf = px(x0 + (cols - 0.5) * PASSO_X - 0.02);
  for (let r = 0; r <= rows; r++) {
    const y = pz(z0 + (r - 0.5) * PASSO_Z);
    pg.fillStyle = "rgba(36,20,46,0.10)";
    pg.fillRect(xi, y - 1.5, xf - xi, 2.5);
    pg.fillStyle = "rgba(255,255,255,0.8)";
    pg.fillRect(xi, y + 1, xf - xi, 2);
  }
  // colunas: fio vertical bem leve
  for (let c = 1; c < cols; c++) {
    const x = px(x0 + (c - 0.5) * PASSO_X);
    pg.fillStyle = "rgba(36,20,46,0.06)";
    pg.fillRect(x - 1, pz(z0 - PASSO_Z / 2), 2.5, pz(z0 + (rows - 0.5) * PASSO_Z) - pz(z0 - PASSO_Z / 2));
  }
  // horas
  pg.fillStyle = "#6d607a";
  pg.textAlign = "right";
  pg.textBaseline = "middle";
  pg.font = `600 ${Math.round(0.27 * k)}px ${FONTE}`;
  HORAS.forEach((h, r) => {
    pg.fillText(`${String(h).padStart(2, "0")}h`, px(x0 - PASSO_X / 2 - 0.1), pz(z0 + r * PASSO_Z));
  });
  const piso = new THREE.Mesh(
    new THREE.PlaneGeometry(iw, id),
    new THREE.MeshBasicMaterial({ map: canvasTex(pc), transparent: true, toneMapped: false, depthWrite: false })
  );
  piso.rotation.x = -Math.PI / 2;
  piso.position.y = ALT + 0.002;
  piso.renderOrder = 1;
  group.add(piso);

  // ---- cabeçalho: plaquinha por dia com "ter 24"
  const tabGeo = new RoundedBoxGeometry(1.16, 0.12, 0.6, 4, 0.05);
  DIAS.forEach((dia, col) => {
    const hoje = col === HOJE;
    const tab = new THREE.Mesh(tabGeo, hoje ? laca(COR.tinta) : louca(0xffffff));
    tab.position.set(x0 + col * PASSO_X, ALT + 0.06, z0 - PASSO_Z * 0.97);
    tab.castShadow = true;
    tab.receiveShadow = true;
    group.add(tab);
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 256;
    const g = c.getContext("2d")!;
    g.textBaseline = "alphabetic";
    g.font = `500 88px ${FONTE}`;
    const largDia = g.measureText(dia + " ").width;
    g.font = `750 120px ${FONTE}`;
    const largNum = g.measureText(String(DATAS[col])).width;
    let x = 256 - (largDia + largNum) / 2;
    g.font = `500 88px ${FONTE}`;
    g.fillStyle = hoje ? "rgba(248,246,250,0.72)" : "#6d607a";
    g.fillText(dia, x, 168);
    x += largDia;
    g.font = `750 120px ${FONTE}`;
    g.fillStyle = hoje ? "#f8f6fa" : "#24142e";
    g.fillText(String(DATAS[col]), x, 170);
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(1.0, 0.5),
      new THREE.MeshBasicMaterial({ map: canvasTex(c), transparent: true, toneMapped: false })
    );
    label.rotation.x = -Math.PI / 2;
    label.position.set(tab.position.x, ALT + 0.125, tab.position.z);
    group.add(label);
  });

  // ---- linha do agora (só na coluna de hoje, entre 11h e 13h)
  const zAgora = z0 + 2.5 * PASSO_Z + 0.02;
  const agoraMat = new THREE.MeshPhysicalMaterial({ color: COR.amora, roughness: 0.3, clearcoat: 1 });
  const linha = new THREE.Mesh(new RoundedBoxGeometry(PASSO_X - 0.06, 0.04, 0.06, 2, 0.018), agoraMat);
  linha.position.set(x0 + HOJE * PASSO_X, ALT + 0.03, zAgora);
  group.add(linha);
  const ponto = new THREE.Mesh(new THREE.SphereGeometry(0.1, 24, 16), agoraMat);
  ponto.position.set(x0 + HOJE * PASSO_X - PASSO_X / 2 + 0.04, ALT + 0.05, zAgora);
  ponto.castShadow = true;
  group.add(ponto);

  // ---- etiquetas das peças: um atlas só
  const n = cols * rows;
  const AC = 6;
  const CW = 340;
  const CH = Math.round(CW * (TILE.d - TILE.r * 2) / (TILE.w - TILE.r * 2));
  const atlas = document.createElement("canvas");
  atlas.width = AC * CW;
  atlas.height = Math.ceil(n / AC) * CH;
  const ag = atlas.getContext("2d")!;
  const info: { servico: string; cliente: string; cor: number }[] = [];
  for (let i = 0; i < n; i++) {
    const col = Math.floor(i / rows);
    const row = i % rows;
    const sv = SERVICOS[(col * 7 + row * 3) % SERVICOS.length];
    const cliente = CLIENTES[(i * 11) % CLIENTES.length];
    info.push({ servico: sv.nome, cliente, cor: sv.cor });
    const claro = sv.cor === COR.nude || sv.cor === COR.lavanda;
    const cx = (i % AC) * CW;
    const cy = Math.floor(i / AC) * CH;
    const tinta = claro ? "rgba(36,20,46," : "rgba(248,246,250,";
    // fio de destaque à esquerda
    ag.fillStyle = tinta + "0.55)";
    rr(ag, cx + 18, cy + 26, 9, CH - 52, 5);
    ag.fill();
    ag.textAlign = "left";
    ag.textBaseline = "alphabetic";
    ag.fillStyle = tinta + "0.96)";
    let tam = 76;
    ag.font = `720 ${tam}px ${FONTE}`;
    while (ag.measureText(sv.nome).width > CW - 58 && tam > 44) ag.font = `720 ${--tam}px ${FONTE}`;
    ag.fillText(sv.nome, cx + 42, cy + CH * 0.49);
    ag.font = `600 58px ${FONTE}`;
    ag.fillStyle = tinta + "0.82)";
    ag.fillText(`${cliente} · ${HORAS[row]}h`, cx + 42, cy + CH * 0.85);
  }
  const atlasTex = canvasTex(atlas);
  const etiquetaMat = new THREE.MeshBasicMaterial({ map: atlasTex, transparent: true, toneMapped: false });

  // ---- encaixes e peças
  const wellGeo = new RoundedBoxGeometry(TILE.w + 0.04, 0.05, TILE.d + 0.04, 4, 0.025);
  const tileGeo = new RoundedBoxGeometry(TILE.w, TILE.h, TILE.d, 6, TILE.r);
  const wellMat = louca(0xfbfafc);
  const lacaPorCor = new Map<number, THREE.Material>();
  const lacaDe = (c: number) => {
    if (!lacaPorCor.has(c)) lacaPorCor.set(c, laca(c));
    return lacaPorCor.get(c)!;
  };
  const ew = TILE.w - TILE.r * 2;
  const ed = TILE.d - TILE.r * 2;

  const slots: Slot[] = [];
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const i = col * rows + row;
      const x = x0 + col * PASSO_X;
      const z = z0 + row * PASSO_Z;
      const well = new THREE.Mesh(wellGeo, wellMat);
      well.position.set(x, ALT + 0.0, z);
      well.receiveShadow = true;
      group.add(well);

      const tile = new THREE.Mesh(tileGeo, lacaDe(info[i].cor));
      const rest = new THREE.Vector3(x, ALT + 0.025 + TILE.h / 2, z);
      tile.position.copy(rest);
      tile.castShadow = true;
      tile.receiveShadow = true;
      tile.visible = false;

      // etiqueta no topo, com UV apontando para a célula do atlas
      const eg = new THREE.PlaneGeometry(ew, ed);
      const u0 = (i % AC) / AC;
      const v1 = 1 - Math.floor(i / AC) / Math.ceil(n / AC);
      const v0 = v1 - 1 / Math.ceil(n / AC);
      const uv = eg.attributes.uv as THREE.BufferAttribute;
      for (let j = 0; j < uv.count; j++) {
        uv.setXY(j, uv.getX(j) ? u0 + 1 / AC : u0, uv.getY(j) ? v1 : v0);
      }
      const etiqueta = new THREE.Mesh(eg, etiquetaMat);
      etiqueta.rotation.x = -Math.PI / 2;
      etiqueta.position.y = TILE.h / 2 + 0.003;
      tile.add(etiqueta);
      group.add(tile);

      const slot: Slot = { col, row, filled: false, tile, well, rest, servico: info[i].servico, cliente: info[i].cliente };
      well.userData.slot = slot;
      tile.userData.slot = slot;
      slots.push(slot);
    }
  }

  for (const i of opts.prefill ?? []) {
    const s = slots[i];
    if (!s) continue;
    s.filled = true;
    s.tile.visible = true;
  }

  // ---- sombra de contato (o brilho colorido de fundo fica no CSS do hero, que não tem borda de canvas)
  const contato = new THREE.Mesh(
    new THREE.PlaneGeometry(w * 1.25, d * 1.3),
    new THREE.MeshBasicMaterial({ map: halo("rgba(36,20,46,0.38)"), transparent: true, depthWrite: false, toneMapped: false })
  );
  contato.rotation.x = -Math.PI / 2;
  contato.position.y = 0.01;
  contato.renderOrder = -1;
  group.add(contato);

  return { group, slots, tamanho: { w, d } };
}

/** Horários que já começam marcados no hero (poster e cena ao vivo usam o mesmo). */
export const PREFILL_HERO = [0, 2, 3, 7, 8, 10, 13, 15, 16, 20, 22, 25, 27];

/** Câmera da agenda: vista de cima em ângulo, levemente de lado (enquadramento quadrado). */
export const ALVO_CAMERA = new THREE.Vector3(0.2, 0, 0.3);
export function cameraAgenda(aspect = 1) {
  const cam = new THREE.PerspectiveCamera(33, aspect, 0.1, 100);
  cam.position.set(0.75, 12.6, 11.4);
  cam.lookAt(ALVO_CAMERA);
  return cam;
}

// ---------------------------------------------------------------- objetos

/** Vidro de esmalte: corpo laqueado (perfil torneado) + tampa alta. */
export function esmalte(color: number = COR.amora) {
  const g = new THREE.Group();
  const perfil = [
    [0, 0], [0.62, 0], [0.7, 0.06], [0.72, 0.5], [0.7, 0.9], [0.6, 1.02], [0.3, 1.1], [0.26, 1.2], [0, 1.2],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const corpo = new THREE.Mesh(new THREE.LatheGeometry(perfil, 64), laca(color));
  corpo.castShadow = true;
  g.add(corpo);
  const tampa = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 1.35, 48), laca(COR.tinta));
  tampa.position.y = 1.2 + 0.675;
  tampa.castShadow = true;
  g.add(tampa);
  return g;
}

/** Pente de barbeiro: lâmina + dentes. */
export function pente(color: number = COR.tinta) {
  const g = new THREE.Group();
  const mat = laca(color);
  const costas = new THREE.Mesh(new RoundedBoxGeometry(3.2, 0.42, 0.16, 4, 0.07), mat);
  costas.position.y = 0.21;
  costas.castShadow = true;
  g.add(costas);
  const dente = new RoundedBoxGeometry(0.07, 0.62, 0.12, 2, 0.03);
  for (let i = 0; i < 30; i++) {
    const t = new THREE.Mesh(dente, mat);
    const fino = i > 11;
    t.scale.x = fino ? 0.75 : 1.1;
    t.position.set(-1.5 + i * 0.104, -0.3, 0);
    t.castShadow = true;
    g.add(t);
  }
  return g;
}

/** Pinça de sobrancelha: duas hastes cromadas com ponta laqueada. */
export function pinca(color: number = COR.lavanda) {
  const g = new THREE.Group();
  const haste = new RoundedBoxGeometry(0.22, 3, 0.06, 3, 0.02);
  for (const lado of [-1, 1]) {
    const h = new THREE.Mesh(haste, cromo());
    h.position.set(lado * 0.16, 1.5, 0);
    h.rotation.z = lado * -0.06;
    h.castShadow = true;
    g.add(h);
  }
  const cabo = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.9, 0.12, 4, 0.05), laca(color));
  cabo.position.y = 2.6;
  cabo.castShadow = true;
  g.add(cabo);
  return g;
}

function espiralTexture(fundo: string, linha: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d")!;
  g.fillStyle = fundo;
  g.fillRect(0, 0, 512, 512);
  g.strokeStyle = linha;
  g.lineWidth = 7;
  g.beginPath();
  for (let t = 0; t < Math.PI * 2 * 5.2; t += 0.05) {
    const r = 18 + t * 7.2;
    const x = 256 + Math.cos(t) * r;
    const y = 256 + Math.sin(t) * r;
    t === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
  }
  g.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Toalhas enroladas de spa (pés/podologia): dois rolinhos empilhados. */
export function toalhas(cores: [number, number] = [COR.nude, COR.lavanda]) {
  const g = new THREE.Group();
  const geo = new THREE.CylinderGeometry(0.62, 0.62, 2.4, 64, 1);
  const rolos: [number, number, number][] = [[-0.66, 0.62, 0], [0.66, 0.62, 0], [0, 1.68, 0.05]];
  rolos.forEach(([x, y, z], i) => {
    const cor = new THREE.Color(cores[i === 2 ? 1 : 0]);
    const tecido = new THREE.MeshPhysicalMaterial({ color: cor, roughness: 0.95, sheen: 1, sheenRoughness: 0.6, sheenColor: 0xffffff });
    const ponta = new THREE.MeshPhysicalMaterial({
      map: espiralTexture("#" + cor.getHexString(), "rgba(36,20,46,0.28)"),
      roughness: 0.95, sheen: 1, sheenRoughness: 0.6, sheenColor: 0xffffff,
    });
    const m = new THREE.Mesh(geo, [tecido, ponta, ponta]);
    m.rotation.x = Math.PI / 2;
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    g.add(m);
  });
  return g;
}

/** Escova redonda de escova progressiva/escova: cabo + cilindro com cerdas. */
export function escova(color: number = COR.amora) {
  const g = new THREE.Group();
  const cabo = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 2.2, 32), laca(color));
  cabo.position.y = -1.1;
  cabo.castShadow = true;
  g.add(cabo);
  const tambor = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 2.2, 32), cromo());
  tambor.position.y = 1.1;
  tambor.castShadow = true;
  g.add(tambor);
  const cerda = new THREE.CylinderGeometry(0.025, 0.025, 0.42, 6);
  const cerdas = new THREE.InstancedMesh(cerda, laca(COR.tinta), 12 * 14);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  let k = 0;
  for (let a = 0; a < 12; a++) {
    for (let y = 0; y < 14; y++) {
      const ang = (a / 12) * Math.PI * 2 + (y % 2) * 0.26;
      const dir = new THREE.Vector3(Math.cos(ang), 0, Math.sin(ang));
      q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      m.compose(
        dir.clone().multiplyScalar(0.5).add(new THREE.Vector3(0, 0.15 + y * 0.14, 0)),
        q,
        new THREE.Vector3(1, 1, 1)
      );
      cerdas.setMatrixAt(k++, m);
    }
  }
  cerdas.castShadow = true;
  g.add(cerdas);
  return g;
}
