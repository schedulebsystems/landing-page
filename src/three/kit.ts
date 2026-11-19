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

/** Renderer + ambiente de reflexo + luzes suaves de estúdio. */
export function estudio(renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
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
}

/** Chão que só recebe sombra (fundo transparente/da página aparece por trás). */
export function chaoDeSombra(size = 30, opacity = 0.16) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.ShadowMaterial({ opacity, color: COR.tinta })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  return mesh;
}

// ---------------------------------------------------------------- agenda

export const DIAS = ["ter", "qua", "qui", "sex", "sáb"];
export const HORAS = [9, 10, 11, 13, 14, 15];

export interface Slot {
  col: number;
  row: number;
  filled: boolean;
  /** Peça laqueada (invisível enquanto o horário está livre). */
  tile: THREE.Mesh;
  /** Encaixe de porcelana (alvo do toque). */
  well: THREE.Mesh;
  /** Posição de repouso da peça. */
  rest: THREE.Vector3;
}

const PASSO_X = 1.32;
const PASSO_Z = 0.98;

function rotuloTexture(text: string, font: string) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#24142e";
  g.font = font;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, 128, 66);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/**
 * Agenda da semana: base de porcelana, cabeçalho com os dias e um encaixe por horário.
 * `prefill` = índices (col*HORAS.length+row) que já começam marcados.
 */
export function agenda(opts: { prefill?: number[]; font?: string } = {}) {
  const font = opts.font ?? "600 84px 'Hanken Grotesk Variable', system-ui, sans-serif";
  const group = new THREE.Group();
  const cols = DIAS.length;
  const rows = HORAS.length;
  const w = cols * PASSO_X + 0.5;
  const d = (rows + 1) * PASSO_Z + 0.5;

  const base = new THREE.Mesh(new RoundedBoxGeometry(w, 0.42, d, 6, 0.2), louca(COR.louca));
  base.position.y = 0.21;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  const x0 = -((cols - 1) * PASSO_X) / 2;
  const z0 = -((rows - 1) * PASSO_Z) / 2 + PASSO_Z / 2;

  const wellGeo = new RoundedBoxGeometry(1.12, 0.06, 0.8, 4, 0.03);
  const tileGeo = new RoundedBoxGeometry(1.08, 0.26, 0.76, 6, 0.12);
  const wellMat = louca(0xe2dce7);
  const lacas = LACAS.map(laca);

  // cabeçalho: uma plaquinha por dia
  const tabGeo = new RoundedBoxGeometry(1.08, 0.12, 0.58, 4, 0.05);
  DIAS.forEach((dia, col) => {
    const tab = new THREE.Mesh(tabGeo, louca(0xffffff));
    tab.position.set(x0 + col * PASSO_X, 0.48, z0 - PASSO_Z * 0.95);
    tab.castShadow = true;
    group.add(tab);
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(0.9, 0.45),
      new THREE.MeshBasicMaterial({ map: rotuloTexture(dia, font), transparent: true })
    );
    label.rotation.x = -Math.PI / 2;
    label.position.set(tab.position.x, 0.545, tab.position.z);
    group.add(label);
  });

  const slots: Slot[] = [];
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const x = x0 + col * PASSO_X;
      const z = z0 + row * PASSO_Z;
      const well = new THREE.Mesh(wellGeo, wellMat);
      well.position.set(x, 0.43, z);
      well.receiveShadow = true;
      group.add(well);

      const tile = new THREE.Mesh(tileGeo, lacas[(col * 7 + row * 3) % lacas.length]);
      const rest = new THREE.Vector3(x, 0.56, z);
      tile.position.copy(rest);
      tile.castShadow = true;
      tile.receiveShadow = true;
      tile.visible = false;
      group.add(tile);

      const slot: Slot = { col, row, filled: false, tile, well, rest };
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

  return { group, slots };
}

/** Horários que já começam marcados no hero (poster e cena ao vivo usam o mesmo). */
export const PREFILL_HERO = [0, 2, 3, 7, 8, 10, 13, 15, 16, 20, 22, 25, 27];

/** Câmera da agenda: vista de cima em ângulo, levemente de lado (enquadramento quadrado). */
export function cameraAgenda(aspect = 1) {
  const cam = new THREE.PerspectiveCamera(33, aspect, 0.1, 100);
  cam.position.set(3, 13.2, 12.2);
  cam.lookAt(0.15, 0, 0.1);
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
