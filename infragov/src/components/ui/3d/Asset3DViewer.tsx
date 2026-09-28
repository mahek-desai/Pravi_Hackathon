"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Layers, Flame, Move, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

interface Asset3DViewerProps {
  categoryCode?: string;
  assetName: string;
  conditionScore?: number;
  riskScore?: number;
  height?: string;
}

export function Asset3DViewer({
  categoryCode = "TRF",
  assetName,
  conditionScore = 85,
  riskScore = 20,
  height = "380px",
}: Asset3DViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  // Controls
  const [isRotating, setIsRotating] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [isExploded, setIsExploded] = useState(false);
  const [isThermalMode, setIsThermalMode] = useState(false);
  const [hoveredPart, setHoveredPart] = useState<any>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const radiusRef = useRef<number>(11);
  const angleRef = useRef<number>(0);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const h = container.clientHeight || 380;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);

    const camera = new THREE.PerspectiveCamera(45, width / h, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(0, 4, radiusRef.current);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x10b981, 2.5);
    mainLight.position.set(10, 20, 10);
    scene.add(mainLight);

    const fillLight = new THREE.PointLight(0x06b6d4, 2.5, 20);
    fillLight.position.set(-10, -5, -10);
    scene.add(fillLight);

    // Pedestal Grid
    const grid = new THREE.GridHelper(12, 16, 0x10b981, 0x1e293b);
    grid.position.y = -2;
    scene.add(grid);

    // Dynamic 3D Asset Parts Group
    const assetGroup = new THREE.Group();
    const subParts: THREE.Mesh[] = [];

    const statusColor =
      conditionScore > 70 ? 0x10b981 : conditionScore > 40 ? 0xeab308 : 0xf43f5e;

    // Standard vs Thermal Material
    const baseMaterial = new THREE.MeshPhongMaterial({
      color: isThermalMode ? 0xd97706 : 0x0f172a,
      emissive: isThermalMode ? 0xef4444 : statusColor,
      emissiveIntensity: isThermalMode ? 0.45 : 0.2,
      specular: 0x38bdf8,
      shininess: 90,
      wireframe,
    });

    const highlightMat = new THREE.MeshPhongMaterial({
      color: isThermalMode ? 0xf59e0b : statusColor,
      emissive: isThermalMode ? 0xfbbf24 : statusColor,
      emissiveIntensity: 0.3,
      wireframe,
    });

    const codeUpper = (categoryCode || "").toUpperCase();

    if (
      codeUpper.includes("TRF") ||
      codeUpper.includes("ELEC") ||
      assetName.toLowerCase().includes("transformer")
    ) {
      // 1. Core Transformer Tank Body
      const bodyGeo = new THREE.BoxGeometry(3.5, 3, 2.5);
      const body = new THREE.Mesh(bodyGeo, baseMaterial.clone());
      body.userData = {
        name: "Main Oil Tank & Core Assembly",
        status: "Normal Pressure",
        temperature: "44°C (Safe)",
        subScore: "96%",
        basePos: new THREE.Vector3(0, 0, 0),
        explodedPos: new THREE.Vector3(0, -0.5, 0),
      };
      assetGroup.add(body);
      subParts.push(body);

      // 2. Cooling Fins (Left & Right)
      let finIdx = 0;
      for (let f = -1.2; f <= 1.2; f += 0.6) {
        finIdx++;
        const finGeo = new THREE.BoxGeometry(0.12, 2.8, 3.2);
        const finMat = highlightMat.clone();
        const fin = new THREE.Mesh(finGeo, finMat);
        const baseP = new THREE.Vector3(f, 0, 0);
        fin.position.copy(baseP);
        fin.userData = {
          name: `Cooling Radiator Fin #${finIdx}`,
          status: "Fluid Flow Normal",
          temperature: "41°C",
          subScore: "94%",
          basePos: baseP,
          explodedPos: new THREE.Vector3(f * 2.2, 0, 0),
        };
        assetGroup.add(fin);
        subParts.push(fin);
      }

      // 3. High Voltage Ceramic Bushings (Top)
      let bushIdx = 0;
      for (let b = -1; b <= 1; b += 1) {
        bushIdx++;
        const bushGeo = new THREE.CylinderGeometry(0.2, 0.3, 1.4, 12);
        const bush = new THREE.Mesh(bushGeo, highlightMat.clone());
        const baseP = new THREE.Vector3(b, 2.2, 0);
        bush.position.copy(baseP);
        bush.userData = {
          name: `High-Voltage Bushing Terminal #${bushIdx}`,
          status: "Insulation Intact",
          temperature: "39°C",
          subScore: "98%",
          basePos: baseP,
          explodedPos: new THREE.Vector3(b * 1.5, 3.8, 0),
        };
        assetGroup.add(bush);
        subParts.push(bush);
      }
    } else {
      // General Structural Block
      const mainGeo = new THREE.BoxGeometry(3.2, 3.2, 3.2);
      const mainBlock = new THREE.Mesh(mainGeo, baseMaterial.clone());
      mainBlock.userData = {
        name: "Main Structural Frame",
        status: "Operational",
        temperature: "36°C",
        subScore: "92%",
        basePos: new THREE.Vector3(0, 0, 0),
        explodedPos: new THREE.Vector3(0, 0, 0),
      };
      assetGroup.add(mainBlock);
      subParts.push(mainBlock);

      const ringGeo = new THREE.TorusGeometry(2.4, 0.15, 16, 32);
      const ring = new THREE.Mesh(ringGeo, highlightMat.clone());
      ring.rotation.x = Math.PI / 2;
      const baseP = new THREE.Vector3(0, 0, 0);
      ring.userData = {
        name: "Telemetry Collar Sensor",
        status: "Connected",
        temperature: "32°C",
        subScore: "99%",
        basePos: baseP,
        explodedPos: new THREE.Vector3(0, 2.5, 0),
      };
      assetGroup.add(ring);
      subParts.push(ring);
    }

    scene.add(assetGroup);

    // Raycaster for Sub-Component Diagnostics
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      setMousePos({ x: event.clientX - rect.left, y: event.clientY - rect.top });

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(subParts);

      if (intersects.length > 0) {
        setHoveredPart(intersects[0].object.userData);
      } else {
        setHoveredPart(null);
      }
    };

    // Manual Drag Orbiting Controls
    let isDragging = false;
    let previousMouseX = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMouseX = e.clientX;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleMouseDrag = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMouseX;
      previousMouseX = e.clientX;
      angleRef.current -= deltaX * 0.008;
      camera.position.x = radiusRef.current * Math.sin(angleRef.current);
      camera.position.z = radiusRef.current * Math.cos(angleRef.current);
      camera.lookAt(0, 0, 0);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      radiusRef.current = Math.max(6, Math.min(22, radiusRef.current + e.deltaY * 0.02));
      camera.position.x = radiusRef.current * Math.sin(angleRef.current);
      camera.position.z = radiusRef.current * Math.cos(angleRef.current);
      camera.lookAt(0, 0, 0);
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseDrag);
    container.addEventListener("wheel", handleWheel, { passive: false });

    // Animation loop with Exploded View Interpolation
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (isRotating && !isDragging) {
        angleRef.current += 0.008;
        camera.position.x = radiusRef.current * Math.sin(angleRef.current);
        camera.position.z = radiusRef.current * Math.cos(angleRef.current);
        camera.lookAt(0, 0, 0);
      }

      // Smooth Lerp between basePos and explodedPos
      subParts.forEach((part) => {
        const target = isExploded ? part.userData.explodedPos : part.userData.basePos;
        if (target) {
          part.position.lerp(target, 0.08);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const heightVal = container.clientHeight;
      camera.aspect = w / heightVal;
      camera.updateProjectionMatrix();
      renderer.setSize(w, heightVal);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseDrag);
      container.removeEventListener("wheel", handleWheel);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [categoryCode, assetName, conditionScore, isRotating, wireframe, isExploded, isThermalMode]);

  return (
    <div className="relative glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-2xl select-none">
      <div ref={mountRef} style={{ height }} className="w-full cursor-grab active:cursor-grabbing" />

      {/* Hover Diagnostics Tooltip */}
      {hoveredPart && (
        <div
          style={{
            left: Math.min(mousePos.x + 15, 380),
            top: Math.max(mousePos.y - 60, 20),
          }}
          className="absolute z-30 bg-slate-950/95 backdrop-blur-xl p-3 rounded-xl border border-emerald-500/50 shadow-2xl space-y-1 pointer-events-none w-52 text-[11px] font-mono"
        >
          <div className="font-bold text-emerald-400">{hoveredPart.name}</div>
          <div className="text-slate-200">Status: {hoveredPart.status}</div>
          <div className="text-amber-400">Thermal Signature: {hoveredPart.temperature}</div>
          <div className="text-cyan-400">Health Index: {hoveredPart.subScore}</div>
        </div>
      )}

      {/* Interactive Toolbar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-2 bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-xl border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400 radar-live" />
          <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-wider uppercase">
            3D Structural Model &bull; Diagnostic HUD
          </span>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-950/85 backdrop-blur-md p-1 rounded-xl border border-slate-800 pointer-events-auto">
          <button
            onClick={() => setIsExploded(!isExploded)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
              isExploded ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/50" : "bg-slate-800 text-slate-300"
            }`}
          >
            {isExploded ? "Assembled" : "Exploded View"}
          </button>

          <button
            onClick={() => setIsThermalMode(!isThermalMode)}
            className={`p-1 rounded-lg text-[10px] font-semibold transition-all ${
              isThermalMode ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-300"
            }`}
            title="Toggle Thermal Infrared Map"
          >
            <Flame className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
              isRotating ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300"
            }`}
          >
            {isRotating ? "Orbiting" : "Paused"}
          </button>

          <button
            onClick={() => setWireframe(!wireframe)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
              wireframe ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300"
            }`}
          >
            Wireframe
          </button>
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="absolute bottom-3 left-3 right-3 bg-slate-950/85 backdrop-blur-md p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
        <span className="text-slate-300 font-bold truncate max-w-[200px]">{assetName}</span>
        <span className="text-emerald-400 font-bold">Health: {conditionScore}/100</span>
      </div>
    </div>
  );
}
