import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeGlobeVisualizerProps {
  activeSymbol: string;
  price: number;
}

export const ThreeGlobeVisualizer: React.FC<ThreeGlobeVisualizerProps> = ({
  activeSymbol,
  price,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 280;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 240;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.maxWidth = '100%';
    renderer.domElement.style.height = 'auto';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    // Group for rotation
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 1. Core wireframe sphere with subtle slate tones (matching pure white aesthetic)
    const sphereGeo = new THREE.SphereGeometry(72, 28, 28);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(sphereMesh);

    // 2. Outer particle cloud representing global order flow nodes
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 74 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      // Color nodes: 80% subtle slate/indigo, 20% vibrant emerald
      if (Math.random() > 0.8) {
        particleColors[i * 3] = 0.06;
        particleColors[i * 3 + 1] = 0.72;
        particleColors[i * 3 + 2] = 0.5;
      } else {
        particleColors[i * 3] = 0.25;
        particleColors[i * 3 + 1] = 0.35;
        particleColors[i * 3 + 2] = 0.55;
      }
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 2.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    globeGroup.add(particleSystem);

    // 3. Orbital financial route equator rings
    const ringGeo1 = new THREE.RingGeometry(82, 83.5, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 2.6;
    globeGroup.add(ring1);

    const ringGeo2 = new THREE.RingGeometry(88, 89, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 3;
    globeGroup.add(ring2);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      globeGroup.rotation.y += 0.0035;
      globeGroup.rotation.x += 0.001;
      renderer.render(scene, camera);
    };
    animate();

    // Resize Observer using ResizeObserver for container-level accuracy
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries[0] || !entries[0].contentRect) return;
      const { width: newWidth, height: newHeight } = entries[0].contentRect;
      if (newWidth === 0 || newHeight === 0) return;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    });

    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      role="img"
      aria-label={`Interactive 3D WebGL global liquidity flow visualizer for ${activeSymbol}`}
      className="relative w-full h-full max-w-full overflow-hidden flex items-center justify-center"
    >
      <div ref={mountRef} className="w-full h-full min-h-[260px] sm:min-h-[280px] max-w-full overflow-hidden" />
      {/* Floating Center Badge */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
        <div className="bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/90 shadow-sm flex items-center gap-2 max-w-[90%] truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-[11px] font-bold text-slate-900 tracking-wider truncate">
            {activeSymbol} GLOBAL LIQUIDITY
          </span>
        </div>
        <div className="text-xl font-extrabold text-slate-900 tabular-nums mt-1.5">
          ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
};
