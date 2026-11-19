/**
 * Página de render dos assets 3D estáticos. Empacotada com esbuild por render.mjs e aberta
 * num Chrome headless; expõe window.__render(nome) → dataURL PNG com fundo transparente.
 */
import * as THREE from "three";
import {
  COR, estudio, chaoDeSombra, agenda, cameraAgenda, PREFILL_HERO,
  esmalte, pente, pinca, toalhas, escova,
} from "../../src/three/kit";

type Cena = { obj: THREE.Object3D; cam: THREE.PerspectiveCamera; size: [number, number] };

/** Apoia o objeto no chão e afasta a câmera (na direção `dir`) até ele caber com folga. */
function objeto(o: THREE.Object3D, rot: [number, number, number], dir: [number, number, number], fov = 26): Cena {
  o.rotation.set(...rot);
  let box = new THREE.Box3().setFromObject(o);
  o.position.y -= box.min.y;
  box = new THREE.Box3().setFromObject(o);
  const sphere = box.getBoundingSphere(new THREE.Sphere());
  const dist = (sphere.radius / Math.sin(THREE.MathUtils.degToRad(fov / 2))) * 0.92;
  const cam = new THREE.PerspectiveCamera(fov, 1, 0.1, 100);
  cam.position.copy(sphere.center).add(new THREE.Vector3(...dir).normalize().multiplyScalar(dist));
  cam.lookAt(sphere.center);
  return { obj: o, cam, size: [1200, 1200] };
}

const CENAS: Record<string, () => Cena> = {
  "agenda-hero": () => ({ obj: agenda({ prefill: PREFILL_HERO }).group, cam: cameraAgenda(1), size: [1600, 1600] }),
  "agenda-cheia": () => ({ obj: agenda({ prefill: Array.from({ length: 30 }, (_, i) => i) }).group, cam: cameraAgenda(1), size: [1600, 1600] }),
  esmalte: () => objeto(esmalte(COR.amora), [0, 0.4, 0], [3, 3.4, 7]),
  pente: () => objeto(pente(COR.tinta), [0, -0.5, 0], [2, 3.6, 7]),
  pinca: () => objeto(pinca(COR.lavanda), [0, 0.3, -0.28], [2.4, 3.2, 7]),
  toalhas: () => objeto(toalhas(), [0, 0.45, 0], [3, 3.6, 7]),
  escova: () => objeto(escova(COR.amora), [0, 0, 0.45], [2.6, 3.2, 7]),
};

(window as any).__render = async (nome: string) => {
  await document.fonts.load("600 64px 'Hanken Grotesk Variable'");
  const cena = CENAS[nome]();
  const [w, h] = cena.size;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(w, h);
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  estudio(renderer, scene);
  scene.add(chaoDeSombra());
  scene.add(cena.obj);
  cena.cam.aspect = w / h;
  cena.cam.updateProjectionMatrix();
  renderer.render(scene, cena.cam);
  const url = renderer.domElement.toDataURL("image/png");
  renderer.dispose();
  return url;
};
(window as any).__ready = true;
