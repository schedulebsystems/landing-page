/**
 * Cena ao vivo do hero: a agenda laqueada que se enche sozinha (a "IA" marcando) e que a
 * visitante pode completar tocando num horário vazio. Carregada sob demanda (import dinâmico)
 * pelo Hero; o poster pré-renderizado (src/assets/3d/agenda-hero.png) fica por baixo até o
 * primeiro quadro, e continua sendo a versão sem WebGL.
 *
 * Desempenho: o mapa de sombra só é refeito quando uma peça se mexe; parada, a cena desenha a
 * ~30 fps (só a câmera respira) e para por completo fora da tela ou com a aba escondida.
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import {
  agenda, cameraAgenda, chaoDeSombra, estudio, ALVO_CAMERA, COR, DIAS, HORAS, PREFILL_HERO, type Slot,
} from "../three/kit";

export interface Marcacao {
  dia: string;
  hora: number;
  servico: string;
  cliente: string;
  /** true quando foi a "IA" (autoplay); false quando a pessoa tocou. */
  auto: boolean;
  /** Quantos horários livres restam. */
  livres: number;
}

interface Opcoes {
  container: HTMLElement;
  reduzido: boolean;
  onMarcar: (m: Marcacao) => void;
  onPronto: () => void;
}

const QUEDA_MS = 820;
const ONDA_MS = 900;
const FAISCA_MS = 900;
const INTERVALO_MS = 1900;

/** Contorno arredondado com brilho (onda que sai do encaixe quando o horário é marcado). */
function texturaOnda() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 192;
  const g = c.getContext("2d")!;
  g.shadowColor = "rgba(255,180,143,1)";
  g.shadowBlur = 18;
  g.strokeStyle = "rgba(217,69,21,0.9)";
  g.lineWidth = 7;
  g.beginPath();
  g.roundRect(26, 26, 204, 140, 24);
  g.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function texturaPonto() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.9)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

export async function montarAgenda({ container, reduzido, onMarcar, onPronto }: Opcoes) {
  await document.fonts.load("600 84px 'Fustat'").catch(() => undefined);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.className = "c-agenda-canvas";
  canvas.setAttribute("aria-hidden", "true");
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  estudio(renderer, scene, { acento: true });
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  scene.add(chaoDeSombra());
  const { group, slots } = agenda({ prefill: PREFILL_HERO });
  scene.add(group);
  const camera = cameraAgenda(1);
  const base = camera.position.clone().sub(ALVO_CAMERA);
  const baseRaio = Math.hypot(base.x, base.z);
  const baseAng = Math.atan2(base.x, base.z);

  const resize = () => {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    pedirQuadro();
  };

  // ---------------------------------------------------------------- efeitos
  const ondaTex = texturaOnda();
  const pontoTex = texturaPonto();
  const ondaGeo = new THREE.PlaneGeometry(1.5, 1.125);

  type Queda = { slot: Slot; inicio: number };
  type Onda = { mesh: THREE.Mesh; inicio: number };
  type Faisca = { pts: THREE.Points; vel: Float32Array; origem: THREE.Vector3; inicio: number };
  let quedas: Queda[] = [];
  let ondas: Onda[] = [];
  let faiscas: Faisca[] = [];

  const soltarOnda = (slot: Slot, inicio: number) => {
    const mat = new THREE.MeshBasicMaterial({ map: ondaTex, transparent: true, depthWrite: false, toneMapped: false });
    const mesh = new THREE.Mesh(ondaGeo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(slot.rest.x, slot.well.position.y + 0.04, slot.rest.z);
    mesh.visible = false;
    group.add(mesh);
    ondas.push({ mesh, inicio });
  };

  const soltarFaiscas = (slot: Slot, inicio: number) => {
    const n = 14;
    const pos = new Float32Array(n * 3);
    const vel = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.4;
      const v = 0.9 + Math.random() * 0.9;
      vel[i * 3] = Math.cos(a) * v;
      vel[i * 3 + 1] = 1.4 + Math.random() * 1.2;
      vel[i * 3 + 2] = Math.sin(a) * v * 0.75;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      map: pontoTex, color: new THREE.Color(COR.lavanda).lerp(new THREE.Color(0xffffff), 0.35),
      size: 0.16, transparent: true, depthWrite: false, toneMapped: false,
    });
    const pts = new THREE.Points(geo, mat);
    pts.visible = false;
    group.add(pts);
    faiscas.push({ pts, vel, origem: slot.rest.clone().setY(slot.rest.y + 0.1), inicio });
  };

  const descartar = (o: THREE.Mesh | THREE.Points) => {
    group.remove(o);
    (o.material as THREE.Material).dispose();
    if (o instanceof THREE.Points) o.geometry.dispose();
  };

  // peça-fantasma no horário sob o mouse
  const fantasma = new THREE.Mesh(
    new RoundedBoxGeometry(1.14, 0.24, 0.8, 4, 0.085),
    new THREE.MeshPhysicalMaterial({ color: COR.lavanda, transparent: true, opacity: 0.38, roughness: 0.3, clearcoat: 1 })
  );
  fantasma.visible = false;
  group.add(fantasma);

  // ---------------------------------------------------------------- quadro
  const alvoTilt = new THREE.Vector2();
  const tilt = new THREE.Vector2();
  let raf = 0;
  let visivel = true;
  let ultimo = 0;
  const t0 = performance.now();

  const pedirQuadro = () => {
    if (!raf) raf = requestAnimationFrame(quadro);
  };

  function quadro(agora: number) {
    raf = 0;
    let ativo = false; // algo animando de verdade (60 fps)

    if (quedas.length) renderer.shadowMap.needsUpdate = true;
    quedas = quedas.filter(({ slot, inicio }) => {
      const t = Math.min(1, Math.max(0, (agora - inicio) / QUEDA_MS));
      const tile = slot.tile;
      const CAI = 0.42;
      if (t < CAI) {
        // cai acelerando, esticada
        const u = t / CAI;
        tile.position.set(slot.rest.x, slot.rest.y + (1 - u * u) * 3.2, slot.rest.z);
        tile.scale.set(0.9, 1.25, 0.9);
        tile.rotation.z = (1 - u) * 0.18;
      } else {
        // bate e quica: amassa e volta com mola amortecida
        const u = (t - CAI) / (1 - CAI);
        const mola = Math.exp(-5.5 * u) * Math.cos(u * 15);
        tile.position.copy(slot.rest);
        tile.position.y += Math.max(0, mola) * 0.05;
        tile.scale.set(1 + 0.14 * mola, 1 - 0.32 * mola, 1 + 0.14 * mola);
        tile.rotation.z = 0;
      }
      if (t >= 1) {
        tile.position.copy(slot.rest);
        tile.scale.setScalar(1);
        tile.rotation.z = 0;
      }
      ativo = ativo || t < 1;
      return t < 1;
    });

    ondas = ondas.filter((o) => {
      const t = (agora - o.inicio) / ONDA_MS;
      if (t < 0) return (ativo = true);
      o.mesh.visible = true;
      const e = 1 - Math.pow(1 - Math.min(1, t), 3);
      o.mesh.scale.setScalar(0.85 + e * 0.6);
      (o.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - t) * 0.9;
      if (t >= 1) descartar(o.mesh);
      else ativo = true;
      return t < 1;
    });

    faiscas = faiscas.filter((f) => {
      const t = (agora - f.inicio) / FAISCA_MS;
      if (t < 0) return (ativo = true);
      f.pts.visible = true;
      const s = t * 0.9; // "segundos" de simulação
      const pos = f.pts.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        pos.setXYZ(
          i,
          f.origem.x + f.vel[i * 3] * s,
          f.origem.y + f.vel[i * 3 + 1] * s - 2.6 * s * s,
          f.origem.z + f.vel[i * 3 + 2] * s
        );
      }
      pos.needsUpdate = true;
      (f.pts.material as THREE.PointsMaterial).opacity = Math.max(0, 1 - t * t);
      if (t >= 1) descartar(f.pts);
      else ativo = true;
      return t < 1;
    });

    // câmera: respira devagar + segue o ponteiro
    if (!reduzido) {
      tilt.lerp(alvoTilt, 0.06);
      const seg = (agora - t0) / 1000;
      const ang = baseAng + Math.sin(seg * 0.35) * 0.045 + tilt.x * 0.09;
      const alt = base.y + Math.sin(seg * 0.5) * 0.18 - tilt.y * 0.7;
      camera.position.set(
        ALVO_CAMERA.x + Math.sin(ang) * baseRaio,
        ALVO_CAMERA.y + alt,
        ALVO_CAMERA.z + Math.cos(ang) * baseRaio
      );
      camera.lookAt(ALVO_CAMERA);
    }

    const continuo = !reduzido; // a respiração da câmera pede quadros sempre
    if (ativo || agora - ultimo > 32 || !continuo) {
      renderer.render(scene, camera);
      ultimo = agora;
    }
    if ((ativo || continuo) && visivel && !document.hidden) pedirQuadro();
  }

  // ---------------------------------------------------------------- marcar
  const livres = () => slots.filter((s) => !s.filled);

  const marcar = (slot: Slot, auto: boolean) => {
    if (slot.filled) return;
    slot.filled = true;
    slot.tile.visible = true;
    fantasma.visible = false;
    if (reduzido) {
      slot.tile.position.copy(slot.rest);
      slot.tile.scale.setScalar(1);
      renderer.shadowMap.needsUpdate = true;
    } else {
      const inicio = performance.now();
      quedas.push({ slot, inicio });
      const impacto = inicio + QUEDA_MS * 0.42;
      soltarOnda(slot, impacto);
      soltarFaiscas(slot, impacto);
    }
    pedirQuadro();
    onMarcar({
      dia: DIAS[slot.col], hora: HORAS[slot.row], servico: slot.servico, cliente: slot.cliente,
      auto, livres: livres().length,
    });
  };

  const recomecar = () => {
    const prefill = new Set(PREFILL_HERO);
    slots.forEach((s, i) => {
      if (prefill.has(i)) return;
      s.filled = false;
      s.tile.visible = false;
    });
    renderer.shadowMap.needsUpdate = true;
    pedirQuadro();
  };

  // ---------------------------------------------------------------- autoplay ("a IA")
  let timer = 0;
  let cheiaDesde = 0;
  const passo = () => {
    if (!visivel || document.hidden) return;
    const vagos = livres();
    if (vagos.length === 0) {
      if (!cheiaDesde) cheiaDesde = performance.now();
      else if (performance.now() - cheiaDesde > INTERVALO_MS * 2) {
        cheiaDesde = 0;
        recomecar();
      }
      return;
    }
    marcar(vagos[Math.floor(Math.random() * vagos.length)], true);
  };
  let primeiro = 0;
  if (!reduzido) {
    primeiro = window.setTimeout(passo, 700);
    timer = window.setInterval(passo, INTERVALO_MS);
  }

  // ---------------------------------------------------------------- interação
  const ray = new THREE.Raycaster();
  const ponteiro = new THREE.Vector2();
  const alvos = slots.flatMap((s) => [s.well, s.tile]);

  const slotEm = (ev: PointerEvent | MouseEvent) => {
    const r = canvas.getBoundingClientRect();
    ponteiro.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ponteiro, camera);
    const hit = ray.intersectObjects(alvos, false).find((h) => h.object.visible || h.object === (h.object.userData.slot as Slot).well);
    return hit ? (hit.object.userData.slot as Slot) : null;
  };

  canvas.addEventListener("pointermove", (ev) => {
    const r = canvas.getBoundingClientRect();
    alvoTilt.set(((ev.clientX - r.left) / r.width) * 2 - 1, ((ev.clientY - r.top) / r.height) * 2 - 1);
    const s = ev.pointerType === "mouse" ? slotEm(ev) : null;
    const vazio = !!s && !s.filled;
    canvas.style.cursor = vazio ? "pointer" : "";
    fantasma.visible = vazio;
    if (vazio) fantasma.position.copy(s!.rest);
    pedirQuadro();
  });
  canvas.addEventListener("pointerleave", () => {
    alvoTilt.set(0, 0);
    fantasma.visible = false;
    pedirQuadro();
  });
  canvas.addEventListener("click", (ev) => {
    const s = slotEm(ev);
    if (s && !s.filled) marcar(s, false);
  });

  /** Para teclado/leitores: marca o próximo horário livre (botão HTML fora do canvas). */
  const marcarProximo = () => {
    const vago = livres()[0];
    if (vago) marcar(vago, false);
  };

  new ResizeObserver(resize).observe(container);
  new IntersectionObserver(([e]) => {
    visivel = e.isIntersecting;
    if (visivel) pedirQuadro();
  }).observe(container);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) pedirQuadro();
  });

  resize();
  renderer.render(scene, camera);
  onPronto();

  return {
    marcarProximo,
    destruir: () => {
      clearTimeout(primeiro);
      clearInterval(timer);
      cancelAnimationFrame(raf);
      renderer.dispose();
      canvas.remove();
    },
  };
}
