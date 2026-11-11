"use client";

import { useEffect, useRef } from "react";

/**
 * The 3D part of the loading screen: a gladiator's kit set down against a
 * steel door. Shield leaning on the leaf, spear propped beside it, crested
 * helmet on the floor. The lights come up and the camera pushes in for about
 * three seconds, then the CSS timeline in theme-v2.css takes over with the
 * logo. three.js is imported on demand so it never delays first paint, and
 * the scene is skipped entirely once the loader has played this visit.
 */
export function LoaderScene() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (document.documentElement.dataset.loader === "off") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let stopped = false;
    let dispose = () => {};

    (async () => {
      const THREE = await import("three");
      const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
      if (stopped) return;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      } catch {
        return; // No WebGL: the logo still plays over the dark screen.
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);

      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x17191b, 6, 15);
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environmentIntensity = 0.3;

      const camera = new THREE.PerspectiveCamera(32, w / h, 0.1, 60);
      const portrait = w / h < 0.9;
      const key = new THREE.DirectionalLight(0xfff1dd, 0);
      key.position.set(-3, 4.2, 4);
      const rim = new THREE.PointLight(0x5f86ff, 0, 12);
      rim.position.set(1.7, 1.9, -1.1);
      scene.add(key, rim);

      const std = (color: number, metalness: number, roughness: number) =>
        new THREE.MeshStandardMaterial({ color, metalness, roughness });
      const frameMat = std(0x6f7377, 0.8, 0.4);
      const leafMat = std(0x8f9396, 0.6, 0.45);
      const steel = std(0xd2d4d1, 1, 0.28);
      const bronze = std(0xa9793a, 1, 0.34);
      const wood = std(0x5a4632, 0, 0.8);
      const plume = std(0x3a66e8, 0.1, 0.6);
      const add = (geo: import("three").BufferGeometry, mat: import("three").Material, x: number, y: number, z: number, parent: import("three").Object3D = scene) => {
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        parent.add(mesh);
        return mesh;
      };

      // Floor and door.
      const floor = add(new THREE.PlaneGeometry(40, 40), std(0x1a1c1e, 0.3, 0.55), 0, 0, 0);
      floor.rotation.x = -Math.PI / 2;
      add(new THREE.BoxGeometry(0.09, 2.19, 0.14), frameMat, -0.5, 1.095, 0);
      add(new THREE.BoxGeometry(0.09, 2.19, 0.14), frameMat, 0.5, 1.095, 0);
      add(new THREE.BoxGeometry(1.09, 0.09, 0.14), frameMat, 0, 2.145, 0);
      add(new THREE.BoxGeometry(0.9, 2.1, 0.07), leafMat, 0, 1.05, 0);
      for (const y of [0.42, 0.84, 1.26, 1.68]) add(new THREE.BoxGeometry(0.9, 0.006, 0.073), std(0x3c3f42, 0.8, 0.4), 0, y, 0);
      add(new THREE.CylinderGeometry(0.013, 0.013, 0.56, 16), steel, 0.32, 1.06, 0.085);

      // Shield, leaning on the leaf.
      const shield = new THREE.Group();
      shield.position.set(-0.18, 0.415, 0.2);
      shield.rotation.set(-0.3, 0, 0.12);
      scene.add(shield);
      add(new THREE.CylinderGeometry(0.42, 0.42, 0.035, 64).rotateX(Math.PI / 2), bronze, 0, 0, 0, shield);
      add(new THREE.TorusGeometry(0.42, 0.022, 12, 64), steel, 0, 0, 0.012, shield);
      add(new THREE.TorusGeometry(0.24, 0.008, 8, 48), steel, 0, 0, 0.02, shield);
      add(new THREE.SphereGeometry(0.09, 32, 16), steel, 0, 0, 0.02, shield).scale.z = 0.5;

      // Spear, propped beside it.
      const spear = new THREE.Group();
      spear.position.set(0.52, 1.0, 0.25);
      spear.rotation.set(-0.19, 0, -0.05);
      scene.add(spear);
      add(new THREE.CylinderGeometry(0.012, 0.012, 2.05, 12), wood, 0, 0, 0, spear);
      add(new THREE.ConeGeometry(0.03, 0.18, 16), steel, 0, 1.115, 0, spear);

      // Helmet, set down on the floor.
      const helmet = new THREE.Group();
      helmet.position.set(-0.86, 0, 0.44);
      helmet.rotation.y = 0.7;
      scene.add(helmet);
      const skirt = add(new THREE.CylinderGeometry(0.14, 0.15, 0.1, 40, 1, true), bronze, 0, 0.05, 0, helmet);
      (skirt.material as import("three").MeshStandardMaterial).side = THREE.DoubleSide;
      add(new THREE.SphereGeometry(0.14, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), bronze, 0, 0.1, 0, helmet);
      add(new THREE.TorusGeometry(0.155, 0.012, 10, 48).rotateX(Math.PI / 2), steel, 0, 0.012, 0, helmet);
      const crest = add(new THREE.TorusGeometry(0.17, 0.03, 10, 32, Math.PI).rotateY(Math.PI / 2), plume, 0, 0.1, 0, helmet);
      crest.scale.x = 0.45;

      // If the 3D code arrived late, push the rest of the timeline back by the
      // same amount (at most 2.5 s) so the scene is not cut short.
      document.documentElement.style.setProperty("--t0", `${Math.round(Math.min(2500, performance.now()))}ms`);
      canvas.classList.add("is-ready");
      const look = new THREE.Vector3(0.02, portrait ? 1.05 : 1.08, 0);
      const from = new THREE.Vector3(-2.5, 1.25, portrait ? 9.4 : 7.2);
      const to = new THREE.Vector3(-0.95, 1.15, portrait ? 7.2 : 5.3);
      const start = performance.now();
      let raf = 0;
      const tick = (now: number) => {
        const t = (now - start) / 1000;
        const u = Math.min(1, t / 3.4);
        const ease = 1 - Math.pow(1 - u, 3);
        camera.position.lerpVectors(from, to, ease);
        camera.lookAt(look);
        const up = Math.min(1, t / 1.1);
        key.intensity = 1.7 * up * up;
        rim.intensity = 16 * up;
        renderer.render(scene, camera);
        if (t < 4.4 && !stopped) raf = requestAnimationFrame(tick);
        else dispose();
      };
      raf = requestAnimationFrame(tick);

      dispose = () => {
        cancelAnimationFrame(raf);
        scene.traverse((o) => {
          if (o instanceof THREE.Mesh) o.geometry.dispose();
        });
        pmrem.dispose();
        renderer.dispose();
        dispose = () => {};
      };
    })();

    return () => {
      stopped = true;
      dispose();
    };
  }, []);

  return <canvas ref={ref} className="loader__canvas" />;
}
