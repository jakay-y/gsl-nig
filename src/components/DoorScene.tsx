"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { LockDrawing } from "./LockDrawing";

/**
 * The hero. A steel door built from real geometry is pinned to the viewport
 * while the page scrolls underneath it. Scroll position drives everything:
 * the door turns to face you, the leaf and frame go translucent to expose the
 * lock, and the nine bolts throw in the order the mechanism throws them.
 * The pointer adds a small parallax. Nothing here runs on a timer.
 *
 * Dimensions are metres. x runs hinge side (left) to lock side (right).
 */

const W = 0.9; // leaf width
const H = 2.1; // leaf height
const T = 0.07; // leaf thickness

const CAPTIONS = [
  { from: 0.2, to: 0.4, title: "Inside the leaf.", text: "One turn of the key drives a lock case and the rods that run from it to every edge of the door." },
  { from: 0.42, to: 0.57, title: "Four front bolts.", text: "10 mm and 18 mm steel, straight into the lock-side jamb." },
  { from: 0.58, to: 0.71, title: "Three hook bolts.", text: "The Gladiator hooks swing out and catch behind the frame, so the leaf cannot be levered away from it." },
  { from: 0.72, to: 0.84, title: "Upper and rear bolts.", text: "13 mm bolts lock the top of the leaf and the hinge side." },
  { from: 0.87, to: 1.01, title: "Locked.", text: "Nine bolts in the frame, on all four sides." },
];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
/** Eased progress of p between a and b. */
const seg = (p: number, a: number, b: number) => {
  const t = clamp((p - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function DoorScene({ children }: { children: ReactNode }) {
  const wrap = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLParagraphElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const counter = useRef<HTMLParagraphElement>(null);
  const caps = useRef<(HTMLDivElement | null)[]>([]);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const section = wrap.current;
    const el = canvas.current;
    if (!section || !el) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, alpha: true });
    } catch {
      setFallback(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(-2.5, 4, 5);
    scene.add(key);

    // ---- Materials
    const dark = () => getComputedStyle(document.documentElement).colorScheme.includes("dark");
    const leafMat = new THREE.MeshPhysicalMaterial({ color: 0x2b2e31, metalness: 0.55, roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.4 });
    const grooveMat = new THREE.MeshStandardMaterial({ color: 0x9fa3a6, metalness: 0.9, roughness: 0.3 });
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x8b8f93, metalness: 0.8, roughness: 0.42 });
    const steel = new THREE.MeshStandardMaterial({ color: 0xd2d4d1, metalness: 1, roughness: 0.28 });
    const inner = new THREE.MeshStandardMaterial({ color: 0x6f7377, metalness: 0.9, roughness: 0.45 });
    const boltMat = new THREE.MeshStandardMaterial({ color: 0x2f5fe0, metalness: 0.4, roughness: 0.35, emissive: 0x1a3aa8, emissiveIntensity: 0.55 });
    const applyTheme = () => {
      // A dark leaf disappears on the dark page, so the door becomes zinc there.
      leafMat.color.set(dark() ? 0x9a9da0 : 0x2b2e31);
      grooveMat.color.set(dark() ? 0x45484b : 0x9fa3a6);
      boltMat.color.set(dark() ? 0x7f9bff : 0x2f5fe0);
    };
    applyTheme();
    const themeWatch = new MutationObserver(applyTheme);
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    scheme.addEventListener("change", applyTheme);

    // ---- Door
    const door = new THREE.Group();
    scene.add(door);
    const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = door) => {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      parent.add(mesh);
      return mesh;
    };
    const rod = (r: number, len: number, axis: "x" | "y" | "z") => {
      const g = new THREE.CylinderGeometry(r, r, len, 20);
      if (axis === "x") g.rotateZ(Math.PI / 2);
      if (axis === "z") g.rotateX(Math.PI / 2);
      return g;
    };

    // Frame: two jambs and a head.
    const J = 0.09;
    const jamb = new RoundedBoxGeometry(J, H + J, 0.14, 2, 0.006);
    add(jamb, frameMat, -(W / 2 + J / 2 + 0.004), (H + J) / 2, 0);
    add(jamb, frameMat, W / 2 + J / 2 + 0.004, (H + J) / 2, 0);
    add(new RoundedBoxGeometry(W + 2 * J + 0.008, J, 0.14, 2, 0.006), frameMat, 0, H + J / 2 + 0.002, 0);

    // Leaf, its grooves, handle, cylinder and hinges.
    add(new RoundedBoxGeometry(W, H, T, 3, 0.006), leafMat, 0, H / 2, 0);
    for (const y of [0.42, 0.84, 1.26, 1.68]) add(new THREE.BoxGeometry(W - 0.002, 0.006, T + 0.003), grooveMat, 0, y, 0);
    const hx = W / 2 - 0.13;
    add(rod(0.013, 0.56, "y"), steel, hx, 1.06, T / 2 + 0.05);
    add(rod(0.008, 0.05, "z"), steel, hx, 1.26, T / 2 + 0.025);
    add(rod(0.008, 0.05, "z"), steel, hx, 0.86, T / 2 + 0.025);
    add(rod(0.028, 0.012, "z"), steel, hx, 0.7, T / 2 + 0.006);
    add(rod(0.009, 0.014, "z"), inner, hx, 0.7, T / 2 + 0.008);
    for (const y of [0.3, 1.05, 1.8]) add(rod(0.012, 0.13, "y"), steel, -W / 2 - 0.002, y, T / 2 + 0.01);

    // What the translucent leaf reveals: lock case and the rods it drives.
    const lx = W / 2 - 0.055;
    add(new RoundedBoxGeometry(0.085, 0.3, 0.032, 2, 0.004), inner, lx, 1.02, 0);
    add(rod(0.005, H - 0.12, "y"), inner, lx, H / 2, 0);
    add(rod(0.005, W - 0.13, "x"), inner, -0.01, 1.02, 0);
    // Two fixed hooks on the hinge side never move.
    for (const y of [0.55, 1.55]) {
      add(new THREE.BoxGeometry(0.06, 0.022, 0.02), steel, -W / 2 - 0.005, y, 0);
      add(new THREE.BoxGeometry(0.018, 0.045, 0.02), steel, -W / 2 - 0.026, y - 0.02, 0);
    }

    // The nine moving bolts, each with a retracted and a thrown position.
    type Bolt = { obj: THREE.Object3D; from: [number, number, number]; to: [number, number, number]; spin?: number; at: [number, number] };
    const bolts: Bolt[] = [];
    [0.93, 0.99, 1.05, 1.11].forEach((y, i) => {
      const obj = add(rod(0.011, 0.08, "x"), boltMat, 0, 0, 0);
      bolts.push({ obj, from: [W / 2 - 0.045, y, 0], to: [W / 2 + 0.028, y, 0], at: [0.43 + i * 0.03, 0.47 + i * 0.03] });
    });
    [1.46, 1.3, 0.6].forEach((y, i) => {
      const obj = new THREE.Group();
      door.add(obj);
      add(new THREE.BoxGeometry(0.075, 0.022, 0.02), boltMat, 0.012, 0, 0, obj);
      add(new THREE.BoxGeometry(0.018, 0.045, 0.02), boltMat, 0.041, -0.02, 0, obj);
      bolts.push({ obj, from: [W / 2 - 0.06, y, 0], to: [W / 2 + 0.006, y, 0], spin: 1.1, at: [0.59 + i * 0.035, 0.635 + i * 0.035] });
    });
    bolts.push({ obj: add(rod(0.011, 0.08, "y"), boltMat, 0, 0, 0), from: [lx, H - 0.045, 0], to: [lx, H + 0.03, 0], at: [0.73, 0.775] });
    bolts.push({ obj: add(rod(0.011, 0.08, "x"), boltMat, 0, 0, 0), from: [-W / 2 + 0.045, 1.02, 0], to: [-W / 2 - 0.028, 1.02, 0], at: [0.78, 0.825] });

    // Soft contact shadow on the floor.
    const blob = document.createElement("canvas");
    blob.width = blob.height = 256;
    const ctx = blob.getContext("2d");
    if (ctx) {
      const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      grad.addColorStop(0, "rgba(0,0,0,0.42)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 256, 256);
    }
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 1.1),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(blob), transparent: true, depthWrite: false }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.001;
    door.add(shadow);

    // ---- Frame loop
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (!reduce) window.addEventListener("pointermove", onMove, { passive: true });

    let aspect = 1;
    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      aspect = w / h;
      renderer.setSize(w, h, false);
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    const target = new THREE.Vector3();
    const setOpacity = (mat: THREE.Material, o: number) => {
      const see = o < 0.995;
      mat.opacity = o;
      // Switching transparency on or off needs the shader rebuilt.
      if (mat.transparent !== see) {
        mat.transparent = see;
        mat.depthWrite = !see;
        mat.needsUpdate = true;
      }
    };

    const frame = () => {
      const rect = section.getBoundingClientRect();
      const p = clamp(-rect.top / Math.max(1, rect.height - window.innerHeight));
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;

      const wide = aspect > 1.05;
      const opening = 1 - seg(p, 0.04, 0.22); // 1 at the top of the page
      const closeUp = seg(p, 0.3, 0.42) * (1 - seg(p, 0.86, 0.96));
      const top = seg(p, 0.7, 0.75) * (1 - seg(p, 0.8, 0.86));
      const ending = seg(p, 0.86, 1);

      // The door sits beside the headline at first, then takes centre stage.
      door.position.x = (wide ? Math.min(1.75, 0.95 * aspect) : 0) * opening;
      door.rotation.y = lerp(-0.62, -0.2, 1 - opening) + ending * 0.72 + pointer.x * 0.07;

      const xray = seg(p, 0.2, 0.3) * (1 - seg(p, 0.88, 0.95));
      setOpacity(leafMat, lerp(1, 0.1, xray));
      setOpacity(grooveMat, lerp(1, 0.12, xray));
      setOpacity(frameMat, lerp(1, 0.2, xray));

      let thrown = 0;
      for (const b of bolts) {
        const t = seg(p, b.at[0], b.at[1]);
        b.obj.position.set(lerp(b.from[0], b.to[0], t), lerp(b.from[1], b.to[1], t), lerp(b.from[2], b.to[2], t));
        if (b.spin) b.obj.rotation.z = b.spin * (1 - t);
        if (t > 0.97) thrown++;
      }

      // Camera: whole door, then in to the lock, up to the top bolt, and back out.
      const fit = wide ? 1 : clamp(0.62 / aspect, 1, 1.9);
      // On a phone the headline owns the top of the screen, so the door starts
      // smaller and lower, then rises to the middle as the copy leaves.
      const low = wide ? 0 : opening;
      const dist = lerp(6.1 * (1 + 0.36 * low), wide ? 3.5 : 3.0, closeUp) * lerp(fit, Math.min(fit, 1.25), closeUp);
      // On a wide screen the door moves right to leave the caption its own space;
      // on a phone the camera centres on the lock edge instead.
      target.set(
        (wide ? -0.62 : 0.3) * closeUp,
        lerp(lerp(wide ? 1.05 : 1.25 + low * 1.3, 1.03, closeUp), 1.7, top),
        0,
      );
      camera.position.set(target.x + pointer.x * 0.22, target.y + 0.12 - pointer.y * 0.1, dist);
      camera.lookAt(target);
      renderer.render(scene, camera);

      // Overlays
      if (intro.current) {
        const o = 1 - seg(p, 0.03, 0.13);
        intro.current.style.opacity = String(o);
        intro.current.style.transform = `translate3d(0, ${-(1 - o) * 60}px, 0)`;
        intro.current.style.pointerEvents = o < 0.2 ? "none" : "";
      }
      if (hint.current) hint.current.style.opacity = String(1 - seg(p, 0.01, 0.06));
      if (counter.current) counter.current.style.opacity = String(seg(p, 0.36, 0.42));
      if (count.current && count.current.textContent !== String(thrown)) count.current.textContent = String(thrown);
      CAPTIONS.forEach((c, i) => {
        const node = caps.current[i];
        if (!node) return;
        const o = seg(p, c.from, c.from + 0.03) * (1 - seg(p, c.to - 0.03, c.to));
        node.style.opacity = String(o);
        node.style.transform = `translate3d(0, ${(1 - o) * 18}px, 0)`;
      });
    };

    let raf = 0;
    let running = false;
    const loop = () => {
      frame();
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        loop();
      } else if (!entry.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(section);
    frame();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      themeWatch.disconnect();
      scheme.removeEventListener("change", applyTheme);
      window.removeEventListener("pointermove", onMove);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) o.geometry.dispose();
      });
      pmrem.dispose();
      renderer.dispose();
    };
  }, []);

  // No WebGL: show the headline with the line drawing instead of an empty stage.
  if (fallback) {
    return (
      <section className="hero">
        <div className="wrap hero__grid">
          <div className="hero__copy">{children}</div>
          <LockDrawing />
        </div>
      </section>
    );
  }

  return (
    <section className="scene" ref={wrap} aria-label="How the Gladiator lock works">
      <div className="scene__pin">
        <canvas ref={canvas} className="scene__canvas" aria-hidden="true" />
        <div className="wrap scene__layer">
          <div className="scene__intro" ref={intro}>{children}</div>
          {CAPTIONS.map((c, i) => (
            <div key={c.title} className="scene__cap" ref={(node) => { caps.current[i] = node; }}>
              <h2 className="title">{c.title}</h2>
              <p className="lede">{c.text}</p>
            </div>
          ))}
          <p className="scene__count" ref={counter} aria-hidden="true">
            <span ref={count}>0</span>
            <small>of 9 bolts thrown</small>
          </p>
          <p className="scene__hint small" ref={hint}>Scroll to lock the door</p>
        </div>
      </div>
    </section>
  );
}
