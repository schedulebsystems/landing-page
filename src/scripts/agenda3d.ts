/**
 * Cena ao vivo do hero: a agenda laqueada que se enche sozinha (a "IA" marcando) e que a
 * visitante pode completar tocando num horário vazio. Carregada sob demanda (import dinâmico)
 * pelo Hero; o poster pré-renderizado (src/assets/3d/agenda-hero.png) fica por baixo até o
 * primeiro quadro, e continua sendo a versão sem WebGL.
 */
import * as THREE from "three";
import { agenda, cameraAgenda, chaoDeSombra, estudio, DIAS, HORAS, PREFILL_HERO, type Slot } from "../three/kit";

export interface Marcacao {
  dia: string;
  hora: number;
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

const QUEDA_MS = 650;
const INTERVALO_MS = 2800;

const easeOutBack = (t: number) => {
  const c1 = 1.5;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export async function montarAgenda({ container, reduzido, onMarcar, onPronto }: Opcoes) {
  await document.fonts.load("600 84px 'Hanken Grotesk Variable'").catch(() => undefined);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.className = "c-agenda-canvas";
  canvas.setAttribute("aria-hidden", "true");
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  estudio(renderer, scene);
  scene.add(chaoDeSombra());
  const { group, slots } = agenda({ prefill: PREFILL_HERO });
  scene.add(group);
  const camera = cameraAgenda(1);

  const resize = () => {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    pedirQuadro();
  };

  // ---------------------------------------------------------------- animação
  type Queda = { slot: Slot; inicio: number };
  let quedas: Queda[] = [];
  const alvoTilt = new THREE.Vector2();
  const tilt = new THREE.Vector2();
  let raf = 0;
  let visivel = true;

  const pedirQuadro = () => {
    if (!raf) raf = requestAnimationFrame(quadro);
  };

  function quadro(agora: number) {
    raf = 0;
    let continuar = false;

    quedas = quedas.filter(({ slot, inicio }) => {
      const t = Math.min(1, (agora - inicio) / QUEDA_MS);
      const e = easeOutBack(t);
      slot.tile.position.set(slot.rest.x, slot.rest.y + (1 - e) * 2.4, slot.rest.z);
      const s = 0.7 + 0.3 * Math.min(1, t * 1.6);
      slot.tile.scale.set(s, s, s);
      if (t < 1) continuar = true;
      return t < 1;
    });

    if (!reduzido) {
      tilt.lerp(alvoTilt, 0.08);
      group.rotation.x = tilt.y * 0.07;
      group.rotation.z = -tilt.x * 0.05;
      if (tilt.distanceTo(alvoTilt) > 0.001) continuar = true;
    }

    renderer.render(scene, camera);
    if (continuar && visivel) pedirQuadro();
  }

  // ---------------------------------------------------------------- marcar
  const livres = () => slots.filter((s) => !s.filled);

  const marcar = (slot: Slot, auto: boolean) => {
    if (slot.filled) return;
    slot.filled = true;
    slot.tile.visible = true;
    if (reduzido) {
      slot.tile.position.copy(slot.rest);
      slot.tile.scale.setScalar(1);
    } else {
      quedas.push({ slot, inicio: performance.now() });
    }
    pedirQuadro();
    onMarcar({ dia: DIAS[slot.col], hora: HORAS[slot.row], auto, livres: livres().length });
  };

  const recomecar = () => {
    const prefill = new Set(PREFILL_HERO);
    slots.forEach((s, i) => {
      if (prefill.has(i)) return;
      s.filled = false;
      s.tile.visible = false;
    });
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
  if (!reduzido) timer = window.setInterval(passo, INTERVALO_MS);

  // ---------------------------------------------------------------- interação
  const ray = new THREE.Raycaster();
  const ponteiro = new THREE.Vector2();
  const alvos = slots.flatMap((s) => [s.well, s.tile]);

  const slotEm = (ev: PointerEvent) => {
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
    canvas.style.cursor = s && !s.filled ? "pointer" : "";
    pedirQuadro();
  });
  canvas.addEventListener("pointerleave", () => {
    alvoTilt.set(0, 0);
    pedirQuadro();
  });
  canvas.addEventListener("click", (ev) => {
    const s = slotEm(ev as PointerEvent);
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

  resize();
  renderer.render(scene, camera);
  onPronto();

  return {
    marcarProximo,
    destruir: () => {
      clearInterval(timer);
      cancelAnimationFrame(raf);
      renderer.dispose();
      canvas.remove();
    },
  };
}
