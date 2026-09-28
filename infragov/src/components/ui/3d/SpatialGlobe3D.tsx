"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import { MapPin, Globe, ExternalLink, X, ZoomIn, ZoomOut, Play, Pause } from "lucide-react";

interface SpatialGlobe3DProps {
  assetCount?: number;
  height?: string;
}

export function SpatialGlobe3D({ assetCount = 165, height = "600px" }: SpatialGlobe3DProps) {
  const router = useRouter();
  const mountRef = useRef<HTMLDivElement>(null);

  const [activeLayer, setActiveLayer] = useState<"terrain" | "risk">("risk");
  const [isRotating, setIsRotating] = useState(true);
  const [hoveredPin, setHoveredPin] = useState<any>(null);
  const [selectedPin, setSelectedPin] = useState<any>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const radiusRef = useRef<number>(12);
  const angleRef = useRef<number>(0);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const h = container.clientHeight || 600;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);

    const camera = new THREE.PerspectiveCamera(45, width / h, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(0, 5, radiusRef.current);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x0284c7, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x10b981, 2.5);
    dirLight.position.set(15, 20, 15);
    scene.add(dirLight);

    // 3D Regional Sphere Globe Grid
    const sphereGeo = new THREE.SphereGeometry(4, 48, 48);
    const sphereMat = new THREE.MeshPhongMaterial({
      color: 0x091e3a,
      emissive: 0x0369a1,
      emissiveIntensity: 0.2,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const globe = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(globe);

    // Regional Pulse Atmosphere Ring
    const ringGeo = new THREE.RingGeometry(4.1, 4.3, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    // 3D Pins / Nodes Cluster
    const pinGroup = new THREE.Group();
    const pinCount = Math.min(assetCount, 80);
    const interactivePins: THREE.Mesh[] = [];

    const sampleCategories = [
      "Water Supply Main",
      "Substation Transformer",
      "Flyover Bridge Pier",
      "Pumping Station Valve",
      "Smart Streetlight Node",
    ];

    const sampleLocations = ["Ahmedabad Central", "Gandhinagar Zone 2", "GIFT City Sub-Grid", "Sabarmati Riverfront", "Bodakdev Sector"];

    for (let i = 0; i < pinCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / pinCount);
      const theta = Math.sqrt(pinCount * Math.PI) * phi;

      const x = 4.15 * Math.cos(theta) * Math.sin(phi);
      const y = 4.15 * Math.sin(theta) * Math.sin(phi);
      const z = 4.15 * Math.cos(phi);

      const isHighRisk = i % 14 === 0;
      const isDegraded = i % 5 === 0;
      const color = isHighRisk ? 0xf43f5e : isDegraded ? 0xeab308 : 0x10b981;

      const pinGeo = new THREE.SphereGeometry(0.14, 12, 12);
      const pinMat = new THREE.MeshBasicMaterial({ color });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.set(x, y, z);

      const codeNum = String(200 + i).padStart(4, "0");
      pin.userData = {
        id: `pin-${i}`,
        assetCode: `GIS-${codeNum}`,
        name: `${sampleCategories[i % sampleCategories.length]} Pin #${i + 1}`,
        category: sampleCategories[i % sampleCategories.length],
        locality: sampleLocations[i % sampleLocations.length],
        riskScore: isHighRisk ? 86 : isDegraded ? 52 : 14,
        conditionScore: isHighRisk ? 24 : isDegraded ? 64 : 95,
        status: isHighRisk ? "CRITICAL RISK" : isDegraded ? "MONITORING" : "STABLE",
      };

      pinGroup.add(pin);
      interactivePins.push(pin);

      // Connecting Beam
      const beamGeo = new THREE.BoxGeometry(0.02, 0.02, 0.4);
      const beamMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7 });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(x * 1.04, y * 1.04, z * 1.04);
      beam.lookAt(0, 0, 0);
      pinGroup.add(beam);
    }

    scene.add(pinGroup);

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      setMousePos({ x: event.clientX - rect.left, y: event.clientY - rect.top });

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactivePins);

      if (intersects.length > 0) {
        setHoveredPin(intersects[0].object.userData);
      } else {
        setHoveredPin(null);
      }
    };

    const handleCanvasClick = () => {
      if (hoveredPin) {
        setSelectedPin(hoveredPin);
      }
    };

    // Orbit & Zoom
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

      angleRef.current -= deltaX * 0.005;
      globe.rotation.y = angleRef.current;
      pinGroup.rotation.y = angleRef.current;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      radiusRef.current = Math.max(7, Math.min(24, radiusRef.current + e.deltaY * 0.02));
      camera.position.z = radiusRef.current;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("click", handleCanvasClick);
    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseDrag);
    container.addEventListener("wheel", handleWheel, { passive: false });

    // Animation Loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (isRotating && !isDragging) {
        angleRef.current += 0.004;
        globe.rotation.y = angleRef.current;
        pinGroup.rotation.y = angleRef.current;
      }

      ring.rotation.z += 0.002;

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
      container.removeEventListener("click", handleCanvasClick);
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseDrag);
      container.removeEventListener("wheel", handleWheel);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [assetCount, activeLayer, isRotating]);

  return (
    <div className="relative glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-2xl select-none">
      <div ref={mountRef} style={{ height }} className="w-full cursor-grab active:cursor-grabbing" />

      {/* Hover Pin Tooltip */}
      {hoveredPin && (
        <div
          style={{
            left: Math.min(mousePos.x + 15, 550),
            top: Math.max(mousePos.y - 70, 20),
          }}
          className="absolute z-30 bg-slate-950/95 backdrop-blur-xl p-3 rounded-xl border border-cyan-500/50 shadow-2xl space-y-1.5 pointer-events-none w-56 text-[11px] font-mono"
        >
          <div className="flex justify-between items-center">
            <span className="font-bold text-cyan-400">{hoveredPin.assetCode}</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                hoveredPin.status === "CRITICAL RISK"
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}
            >
              {hoveredPin.status}
            </span>
          </div>
          <div className="font-semibold text-slate-100">{hoveredPin.name}</div>
          <div className="text-slate-400 text-[10px] truncate">{hoveredPin.locality}</div>
          <div className="flex justify-between text-[10px] pt-1 border-t border-slate-800">
            <span>Condition: <strong className="text-emerald-400">{hoveredPin.conditionScore}/100</strong></span>
            <span>Risk Index: <strong className="text-rose-400">{hoveredPin.riskScore}/100</strong></span>
          </div>
        </div>
      )}

      {/* Selected Pin Popup Card */}
      {selectedPin && (
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-40">
          <div className="glass-panel p-5 rounded-2xl max-w-sm w-full space-y-3 border border-emerald-500/40 shadow-2xl relative">
            <button
              onClick={() => setSelectedPin(null)}
              className="absolute top-3 right-3 p-1 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 radar-live" />
              <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-wider uppercase">
                GIS Spatial Node Inspector
              </span>
            </div>

            <div>
              <div className="text-xs font-mono font-bold text-emerald-400">{selectedPin.assetCode}</div>
              <h3 className="text-base font-bold text-slate-100 mt-0.5">{selectedPin.name}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedPin.locality}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-800">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Condition Index</span>
                <span className="text-lg font-bold text-emerald-400">{selectedPin.conditionScore}/100</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Calculated Risk</span>
                <span className="text-lg font-bold text-rose-400">{selectedPin.riskScore}/100</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedPin(null)}
                className="px-3 py-1.5 rounded-xl text-xs bg-slate-800 text-slate-300 font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedPin(null);
                  router.push("/assets");
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center space-x-1"
              >
                <span>View Asset Record</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-2 bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-emerald-500/30 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 radar-live" />
          <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider uppercase">
            3D Regional Geo-Spatial Mesh &bull; Gujarat Infrastructure
          </span>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950/85 backdrop-blur-md p-1 rounded-xl border border-slate-800 pointer-events-auto">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
              isRotating ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300"
            }`}
            title={isRotating ? "Pause Orbit" : "Play Orbit"}
          >
            {isRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setActiveLayer(activeLayer === "risk" ? "terrain" : "risk")}
            className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-all"
          >
            {activeLayer === "risk" ? "Risk Heatmap" : "Topology"}
          </button>
        </div>
      </div>

      {/* Bottom Telemetry HUD */}
      <div className="absolute bottom-4 left-4 right-4 bg-slate-950/85 backdrop-blur-md p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-6">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Indexed Coordinates</span>
            <span className="text-base font-bold text-slate-100 font-mono">23.0225° N, 72.5714° E</span>
          </div>
          <div className="h-8 w-[1px] bg-slate-800" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Active GIS Telemetry</span>
            <span className="text-emerald-400 font-bold font-mono">{assetCount} Spatial Pins</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 font-mono">HOVER PIN TO INSPECT &bull; DRAG TO ORBIT</div>
      </div>
    </div>
  );
}
