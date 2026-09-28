"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import {
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  X,
  ExternalLink,
} from "lucide-react";

interface CityDigitalTwinProps {
  assetCount?: number;
  criticalCount?: number;
  height?: string;
  onSelectNode?: (nodeId: string) => void;
}

export function CityDigitalTwin3D({
  assetCount = 165,
  criticalCount = 1,
  height = "420px",
}: CityDigitalTwinProps) {
  const router = useRouter();
  const mountRef = useRef<HTMLDivElement>(null);

  // Interactivity States
  const [activeTab, setActiveTab] = useState<"3d" | "wireframe">("3d");
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [filterAlertsOnly, setFilterAlertsOnly] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Refs for animation & THREE controls
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cityGroupRef = useRef<THREE.Group | null>(null);
  const angleRef = useRef<number>(0);
  const radiusRef = useRef<number>(36);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const h = container.clientHeight || 420;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x030712);
    scene.fog = new THREE.FogExp2(0x030712, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / h, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(
      radiusRef.current * Math.cos(angleRef.current),
      22,
      radiusRef.current * Math.sin(angleRef.current)
    );
    camera.lookAt(0, 4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x1e293b, 2.0);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x10b981, 2.5);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLightCyan = new THREE.PointLight(0x06b6d4, 3.5, 50);
    pointLightCyan.position.set(-15, 10, -15);
    scene.add(pointLightCyan);

    const pointLightRose = new THREE.PointLight(0xf43f5e, 4, 30);
    pointLightRose.position.set(5, 8, 5);
    scene.add(pointLightRose);

    // Ground Grid Helper
    const gridHelper = new THREE.GridHelper(60, 40, 0x10b981, 0x1e293b);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Radar Scanning Ring
    const radarGeo = new THREE.RingGeometry(0.1, 25, 64);
    const radarMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.15,
      wireframe: true,
    });
    const radarRing = new THREE.Mesh(radarGeo, radarMat);
    radarRing.rotation.x = Math.PI / 2;
    radarRing.position.y = 0.02;
    scene.add(radarRing);

    // City Buildings Group
    const cityGroup = new THREE.Group();
    cityGroupRef.current = cityGroup;

    // Building materials
    const glassMaterial = new THREE.MeshPhongMaterial({
      color: 0x0f172a,
      emissive: 0x0284c7,
      emissiveIntensity: 0.18,
      specular: 0x38bdf8,
      shininess: 90,
      transparent: true,
      opacity: 0.85,
    });

    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
    });

    // Asset Category Metadata Mock for 3D City Nodes
    const sampleCategories = [
      "Electrical & Energy Substation",
      "Water Main Reservoir",
      "Flyover Bridge Structure",
      "Sewage Lift Pumping Station",
      "Municipal Civic Building",
      "Traffic Signal System",
    ];

    const sampleLocalities = ["Bodakdev", "Navrangpura", "Sabarmati", "Ashram Road", "GIFT City", "Maninagar"];

    // Create 3D City Blocks with Interactive Metadata Attached
    const buildingCount = 38;
    const interactiveMeshes: THREE.Mesh[] = [];

    for (let i = 0; i < buildingCount; i++) {
      const bHeight = 2.5 + Math.random() * 8.5;
      const bWidth = 1.8 + Math.random() * 1.5;
      const bDepth = 1.8 + Math.random() * 1.5;

      const geometry = new THREE.BoxGeometry(bWidth, bHeight, bDepth);

      const isHighRisk = i === 4 || i === 18 || i === 29;
      const isMediumRisk = i % 5 === 0;

      const nodeMat =
        activeTab === "wireframe"
          ? wireMat
          : isHighRisk
          ? new THREE.MeshPhongMaterial({
              color: 0x450a0a,
              emissive: 0xf43f5e,
              emissiveIntensity: 0.5,
              specular: 0xfb7185,
              transparent: true,
              opacity: 0.9,
            })
          : glassMaterial.clone();

      const building = new THREE.Mesh(geometry, nodeMat);

      const x = (Math.random() - 0.5) * 44;
      const z = (Math.random() - 0.5) * 44;

      if (Math.hypot(x, z) < 6) continue;

      building.position.set(x, bHeight / 2, z);
      building.castShadow = true;
      building.receiveShadow = true;

      // Attach Node Telemetry to the 3D Mesh UserData
      const codeNum = String(100 + i).padStart(4, "0");
      building.userData = {
        id: `node-${i}`,
        assetCode: `INF-${codeNum}`,
        name: `${sampleCategories[i % sampleCategories.length]} #${i + 1}`,
        category: sampleCategories[i % sampleCategories.length],
        locality: sampleLocalities[i % sampleLocalities.length],
        riskScore: isHighRisk ? 82 : isMediumRisk ? 54 : 18,
        conditionScore: isHighRisk ? 28 : isMediumRisk ? 62 : 92,
        status: isHighRisk ? "CRITICAL ALERT" : isMediumRisk ? "MAINTENANCE DUE" : "OPERATIONAL",
        height: bHeight,
      };

      cityGroup.add(building);
      interactiveMeshes.push(building);

      // Roof Beacon
      const beaconGeo = new THREE.SphereGeometry(0.25, 8, 8);
      const beaconColor = isHighRisk ? 0xf43f5e : isMediumRisk ? 0xeab308 : 0x10b981;
      const beaconMat = new THREE.MeshBasicMaterial({ color: beaconColor });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(x, bHeight + 0.3, z);
      cityGroup.add(beacon);
    }

    // Central Infrastructure Tower
    const towerGeo = new THREE.CylinderGeometry(2, 2.8, 14, 8);
    const towerMat = new THREE.MeshPhongMaterial({
      color: 0x0284c7,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.4,
    });
    const centralTower = new THREE.Mesh(towerGeo, towerMat);
    centralTower.position.set(0, 7, 0);
    centralTower.userData = {
      id: "central-hub",
      assetCode: "HQ-AHM-00001",
      name: "Central Gujarat Infrastructure Command Hub",
      category: "Regional Data Operations",
      locality: "Ahmedabad Central",
      riskScore: 5,
      conditionScore: 98,
      status: "OPERATIONAL",
    };
    cityGroup.add(centralTower);
    interactiveMeshes.push(centralTower);

    // Spire Ring
    const ringGeo = new THREE.TorusGeometry(3.5, 0.15, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const spireRing = new THREE.Mesh(ringGeo, ringMat);
    spireRing.rotation.x = Math.PI / 2;
    spireRing.position.set(0, 10, 0);
    cityGroup.add(spireRing);

    // Floating Data Particles
    const particleCount = 100;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let p = 0; p < particleCount; p++) {
      particlePositions[p * 3] = (Math.random() - 0.5) * 50;
      particlePositions[p * 3 + 1] = 1 + Math.random() * 18;
      particlePositions[p * 3 + 2] = (Math.random() - 0.5) * 50;

      const isAlert = p % 10 === 0;
      particleColors[p * 3] = isAlert ? 0.95 : 0.06;
      particleColors[p * 3 + 1] = isAlert ? 0.24 : 0.72;
      particleColors[p * 3 + 2] = isAlert ? 0.36 : 0.5;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.65,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    cityGroup.add(particleSystem);

    scene.add(cityGroup);

    // Raycaster for Hover & Click Interactivity
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredMesh: THREE.Mesh | null = null;
    let originalEmissive: any = null;

    // Mouse Pointer Movement Listener
    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      mouse.x = x;
      mouse.y = y;

      setMousePos({ x: event.clientX - rect.left, y: event.clientY - rect.top });

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes);

      if (intersects.length > 0) {
        const firstHit = intersects[0].object as THREE.Mesh;
        if (hoveredMesh !== firstHit) {
          if (hoveredMesh && (hoveredMesh.material as THREE.MeshPhongMaterial).emissive) {
            (hoveredMesh.material as THREE.MeshPhongMaterial).emissive.setHex(originalEmissive || 0x0284c7);
          }
          hoveredMesh = firstHit;
          if ((firstHit.material as THREE.MeshPhongMaterial).emissive) {
            originalEmissive = (firstHit.material as THREE.MeshPhongMaterial).emissive.getHex();
            (firstHit.material as THREE.MeshPhongMaterial).emissive.setHex(0x06b6d4);
          }
          setHoveredNode(firstHit.userData);
        }
      } else {
        if (hoveredMesh && (hoveredMesh.material as THREE.MeshPhongMaterial).emissive) {
          (hoveredMesh.material as THREE.MeshPhongMaterial).emissive.setHex(originalEmissive || 0x0284c7);
        }
        hoveredMesh = null;
        setHoveredNode(null);
      }
    };

    // Canvas Pointer Click Listener
    const handleCanvasClick = () => {
      if (hoveredMesh) {
        setSelectedNode(hoveredMesh.userData);
      }
    };

    // Manual Drag Orbit Controls
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
      camera.position.x = radiusRef.current * Math.cos(angleRef.current);
      camera.position.z = radiusRef.current * Math.sin(angleRef.current);
      camera.lookAt(0, 4, 0);
    };

    // Scroll Wheel Zoom Listener
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      radiusRef.current = Math.max(15, Math.min(60, radiusRef.current + e.deltaY * 0.03));
      camera.position.x = radiusRef.current * Math.cos(angleRef.current);
      camera.position.z = radiusRef.current * Math.sin(angleRef.current);
      camera.lookAt(0, 4, 0);
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

      if (isAutoRotating && !isDragging) {
        angleRef.current += 0.003;
        camera.position.x = radiusRef.current * Math.cos(angleRef.current);
        camera.position.z = radiusRef.current * Math.sin(angleRef.current);
        camera.lookAt(0, 4, 0);
      }

      spireRing.rotation.z += 0.01;
      radarRing.scale.x = 1 + Math.sin(angleRef.current * 4) * 0.1;
      radarRing.scale.y = 1 + Math.sin(angleRef.current * 4) * 0.1;

      // Particle Animation
      const positions = particleSystem.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        positions[i] += Math.sin(angleRef.current * 2 + i) * 0.02;
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

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
  }, [activeTab, isAutoRotating]);

  // Zoom control helpers
  const handleZoom = (direction: "in" | "out") => {
    if (!cameraRef.current) return;
    radiusRef.current =
      direction === "in"
        ? Math.max(15, radiusRef.current - 6)
        : Math.min(60, radiusRef.current + 6);
    cameraRef.current.position.x = radiusRef.current * Math.cos(angleRef.current);
    cameraRef.current.position.z = radiusRef.current * Math.sin(angleRef.current);
    cameraRef.current.lookAt(0, 4, 0);
  };

  const handleResetCamera = () => {
    angleRef.current = 0;
    radiusRef.current = 36;
    if (cameraRef.current) {
      cameraRef.current.position.set(36, 22, 0);
      cameraRef.current.lookAt(0, 4, 0);
    }
  };

  return (
    <div className="relative glass-panel rounded-2xl overflow-hidden border border-slate-800 shadow-2xl select-none group">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} style={{ height }} className="w-full cursor-grab active:cursor-grabbing" />

      {/* Interactive Floating Hover Raycast Tooltip */}
      {hoveredNode && (
        <div
          style={{
            left: Math.min(mousePos.x + 15, 420),
            top: Math.max(mousePos.y - 70, 20),
          }}
          className="absolute z-30 bg-slate-950/95 backdrop-blur-xl p-3 rounded-xl border border-cyan-500/50 shadow-2xl space-y-1.5 pointer-events-none transition-all w-56 font-mono text-[11px]"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-cyan-400">{hoveredNode.assetCode}</span>
            <span
              className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                hoveredNode.status === "CRITICAL ALERT"
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}
            >
              {hoveredNode.status}
            </span>
          </div>
          <div className="font-semibold text-slate-100 text-xs truncate">{hoveredNode.name}</div>
          <div className="text-slate-400 text-[10px] truncate">{hoveredNode.category} &bull; {hoveredNode.locality}</div>
          <div className="flex justify-between pt-1 border-t border-slate-800 text-[10px]">
            <span>Condition: <strong className="text-emerald-400">{hoveredNode.conditionScore}/100</strong></span>
            <span>Risk Index: <strong className="text-rose-400">{hoveredNode.riskScore}/100</strong></span>
          </div>
        </div>
      )}

      {/* Selected Node Details Popup Modal */}
      {selectedNode && (
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-40">
          <div className="glass-panel p-5 rounded-2xl max-w-sm w-full space-y-3 border border-emerald-500/40 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedNode(null)}
              className="absolute top-3 right-3 p-1 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 radar-live" />
              <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-wider uppercase">
                3D Node Telemetry Inspector
              </span>
            </div>

            <div>
              <div className="text-xs font-mono font-bold text-emerald-400">{selectedNode.assetCode}</div>
              <h3 className="text-base font-bold text-slate-100 mt-0.5">{selectedNode.name}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {selectedNode.category} &bull; {selectedNode.locality}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-800">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Condition Score</span>
                <span className="text-lg font-bold text-emerald-400">{selectedNode.conditionScore}/100</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Calculated Risk</span>
                <span className="text-lg font-bold text-rose-400">{selectedNode.riskScore}/100</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedNode(null)}
                className="px-3 py-1.5 rounded-xl text-xs bg-slate-800 text-slate-300 font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedNode(null);
                  router.push("/assets");
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center space-x-1 shadow-lg shadow-emerald-950/50"
              >
                <span>Inspect Asset Register</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top HUD Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center space-x-2 bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-emerald-500/30 shadow-lg pointer-events-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 radar-live" />
          <span className="text-[11px] font-mono font-bold text-emerald-400 tracking-wider uppercase">
            3D Digital Twin HUD &bull; Gujarat Region
          </span>
        </div>

        {/* Interactive Action Toolbar */}
        <div className="flex items-center space-x-1.5 bg-slate-950/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 pointer-events-auto">
          <button
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
              isAutoRotating ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300"
            }`}
            title={isAutoRotating ? "Pause Auto-Orbit" : "Start Auto-Orbit"}
          >
            {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => handleZoom("in")}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-all"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleZoom("out")}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-all"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleResetCamera}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-all"
            title="Reset Camera View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-[1px] bg-slate-800" />

          <button
            onClick={() => setActiveTab(activeTab === "3d" ? "wireframe" : "3d")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "wireframe" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300"
            }`}
          >
            {activeTab === "3d" ? "3D Render" : "Wireframe"}
          </button>
        </div>
      </div>

      {/* Bottom Telemetry HUD */}
      <div className="absolute bottom-4 left-4 right-4 bg-slate-950/85 backdrop-blur-md p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-6">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Monitored 3D Nodes</span>
            <span className="text-base font-bold text-slate-100 font-mono">{assetCount} Active</span>
          </div>
          <div className="h-8 w-[1px] bg-slate-800" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Critical Sensors</span>
            <span className="text-base font-bold text-rose-400 font-mono">{criticalCount} Alert</span>
          </div>
          <div className="h-8 w-[1px] bg-slate-800" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Interactivity</span>
            <span className="text-emerald-400 font-bold font-mono">HOVER NODE &bull; CLICK TO INSPECT</span>
          </div>
        </div>

        <div className="hidden md:block text-[10px] text-slate-500 font-mono">
          DRAG TO ORBIT &bull; SCROLL TO ZOOM
        </div>
      </div>
    </div>
  );
}
