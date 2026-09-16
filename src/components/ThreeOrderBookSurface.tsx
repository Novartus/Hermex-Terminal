import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrderBookL2 } from '../engine/types';

interface ThreeOrderBookSurfaceProps {
  orderBook: OrderBookL2 | null;
}

export const ThreeOrderBookSurface: React.FC<ThreeOrderBookSurfaceProps> = ({ orderBook }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const barsGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 380;
    const height = 280;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 38, 70);
    camera.lookAt(0, 4, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.maxWidth = '100%';
    renderer.domElement.style.height = 'auto';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    // Subtle ambient & directional lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
    dirLight.position.set(20, 50, 30);
    scene.add(dirLight);

    // Grid floor matching pure white slate aesthetic
    const gridHelper = new THREE.GridHelper(60, 16, 0xcbd5e1, 0xf1f5f9);
    gridHelper.position.y = -0.1;
    scene.add(gridHelper);

    // Group for 3D depth bars
    const barsGroup = new THREE.Group();
    scene.add(barsGroup);
    barsGroupRef.current = barsGroup;

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      barsGroup.rotation.y += 0.0025;
      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries[0] || !entries[0].contentRect) return;
      const { width: newWidth } = entries[0].contentRect;
      if (newWidth === 0) return;
      camera.aspect = newWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, height);
    });

    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update 3D bars whenever new L2 book updates arrive
  useEffect(() => {
    const group = barsGroupRef.current;
    if (!group) return;

    // Clear old meshes
    while (group.children.length > 0) {
      const obj = group.children[0] as THREE.Mesh;
      group.remove(obj);
      obj.geometry?.dispose();
      if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
      else obj.material?.dispose();
    }

    if (!orderBook) return;

    const bids = orderBook.bids.slice(0, 14);
    const asks = orderBook.asks.slice(0, 14);

    const barWidth = 1.4;
    const barDepth = 1.4;
    const maxQty = Math.max(
      ...bids.map((b) => b.size),
      ...asks.map((a) => a.size),
      1
    );

    // 1. Render Bids (Emerald bars on -X axis)
    bids.forEach((bid, i) => {
      const normalizedHeight = Math.max((bid.size / maxQty) * 18, 0.8);
      const geo = new THREE.BoxGeometry(barWidth, normalizedHeight, barDepth);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        roughness: 0.3,
        metalness: 0.2,
      });
      const bar = new THREE.Mesh(geo, mat);
      bar.position.set(-2 - i * 1.8, normalizedHeight / 2, 0);
      group.add(bar);
    });

    // 2. Render Asks (Rose bars on +X axis)
    asks.forEach((ask, i) => {
      const normalizedHeight = Math.max((ask.size / maxQty) * 18, 0.8);
      const geo = new THREE.BoxGeometry(barWidth, normalizedHeight, barDepth);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        roughness: 0.3,
        metalness: 0.2,
      });
      const bar = new THREE.Mesh(geo, mat);
      bar.position.set(2 + i * 1.8, normalizedHeight / 2, 0);
      group.add(bar);
    });
  }, [orderBook]);

  return (
    <div
      role="img"
      aria-label="Interactive WebGL 3D order book surface topography visualizer displaying spatial bid and ask depth queues"
      className="relative w-full max-w-full overflow-hidden h-[280px]"
    >
      <div ref={mountRef} className="w-full h-full max-w-full overflow-hidden" />
      <div className="absolute top-2 left-3 flex items-center gap-2 pointer-events-none">
        <span className="text-[11px] font-bold text-slate-800">
          WebGL 3D Order Book Topography
        </span>
        <span className="text-[10px] text-slate-400 hidden sm:inline">
          Real-time spatial bid/ask queue depth
        </span>
      </div>
      <div className="absolute bottom-2 right-3 flex items-center gap-3 text-[10px] font-semibold text-slate-500 pointer-events-none">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-xs bg-emerald-500" />
          <span>Bids</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-xs bg-rose-500" />
          <span>Asks</span>
        </div>
      </div>
    </div>
  );
};
