import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Sparkles, Text, Line } from "@react-three/drei";
import * as THREE from "three";

// Shared geometries created once at module level for maximum WebGL performance
const PILLAR_GEOMETRY = new THREE.BoxGeometry(0.88, 1, 0.88);
const PILLAR_CAP_GEOMETRY = new THREE.BoxGeometry(0.91, 0.06, 0.91);
const CRYSTAL_GEOMETRY = new THREE.OctahedronGeometry(0.24, 0);
const CORE_SPHERE_GEOMETRY = new THREE.SphereGeometry(0.16, 16, 16);
const HALO_SPHERE_GEOMETRY = new THREE.SphereGeometry(0.36, 16, 16);
const NODE_RING_GEOMETRY = new THREE.RingGeometry(0.28, 0.36, 24);
const BEAM_CYLINDER_GEOMETRY = new THREE.CylinderGeometry(1, 1, 1, 10, 1, false);
const PHOTON_GEOMETRY = new THREE.SphereGeometry(0.09, 10, 10);
const FLOOR_RING_OUTER = new THREE.RingGeometry(6.8, 6.92, 64);
const FLOOR_RING_INNER = new THREE.RingGeometry(5.6, 5.66, 48);

const CAMERA_PRESETS = {
  isometric: { pos: new THREE.Vector3(11.5, 10.5, 11.5), target: new THREE.Vector3(0, 0.3, 0) },
  top: { pos: new THREE.Vector3(0, 16.5, 0.01), target: new THREE.Vector3(0, 0, 0) },
  front: { pos: new THREE.Vector3(0, 6.5, 14.5), target: new THREE.Vector3(0, 0.4, 0) },
  side: { pos: new THREE.Vector3(14.5, 6.0, 0), target: new THREE.Vector3(0, 0.4, 0) },
};

function CameraController({ cameraPreset, autoRotate, presetTrigger }) {
  const controlsRef = useRef(null);
  const isTransitioning = useRef(false);
  const transitionStart = useRef(0);
  const desiredPos = useRef(new THREE.Vector3(11.5, 10.5, 11.5));
  const desiredTarget = useRef(new THREE.Vector3(0, 0.3, 0));

  useEffect(() => {
    const preset = CAMERA_PRESETS[cameraPreset] || CAMERA_PRESETS.isometric;
    desiredPos.current.copy(preset.pos);
    desiredTarget.current.copy(preset.target);
    isTransitioning.current = true;
    transitionStart.current = performance.now();
  }, [cameraPreset, presetTrigger]);

  useFrame((state, delta) => {
    if (!controlsRef.current) return;

    if (isTransitioning.current) {
      const elapsed = (performance.now() - transitionStart.current) / 1000;
      const damp = Math.min(1, delta * 5.5);
      state.camera.position.lerp(desiredPos.current, damp);
      controlsRef.current.target.lerp(desiredTarget.current, damp);
      controlsRef.current.update();

      if (
        elapsed > 1.1 ||
        state.camera.position.distanceTo(desiredPos.current) < 0.08
      ) {
        isTransitioning.current = false;
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      enableDamping={true}
      dampingFactor={0.06}
      minDistance={5}
      maxDistance={28}
      autoRotate={autoRotate}
      autoRotateSpeed={1.4}
      onStart={() => {
        isTransitioning.current = false;
      }}
    />
  );
}

function SacredMandalaFloor({ primaryColor, secondaryColor }) {
  const outerRingRef = useRef(null);
  const innerRingRef = useRef(null);

  useFrame((_, delta) => {
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += delta * 0.12;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z -= delta * 0.18;
    }
  });

  const indices = useMemo(() => [1, 2, 3, 4, 5, 6, 7, 8, 9], []);

  return (
    <group position={[0, -0.42, 0]}>
      {/* Dark glass base platform */}
      <mesh position={[0, -0.08, 0]} receiveShadow>
        <boxGeometry args={[9.8, 0.12, 9.8]} />
        <meshStandardMaterial
          color="#090d16"
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Subtle glowing border frame */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[6.4, 6.48, 4]} />
        <meshBasicMaterial
          color={primaryColor}
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Rotating Sacred Rings */}
      <mesh
        ref={outerRingRef}
        geometry={FLOOR_RING_OUTER}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.05, 0]}
      >
        <meshBasicMaterial
          color={primaryColor}
          transparent
          opacity={0.28}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh
        ref={innerRingRef}
        geometry={FLOOR_RING_INNER}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.04, 0]}
      >
        <meshBasicMaterial
          color={secondaryColor}
          transparent
          opacity={0.22}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Row & Column Axis Labels (1-9) */}
      {indices.map((idx) => {
        const offset = idx - 5;
        return (
          <group key={idx}>
            {/* Top Column Header */}
            <Text
              position={[offset, 0.06, -5.05]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.24}
              color="#64748b"
              anchorX="center"
              anchorY="middle"
            >
              {`×${idx}`}
            </Text>
            {/* Left Row Header */}
            <Text
              position={[-5.05, 0.06, offset]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.24}
              color="#64748b"
              anchorX="center"
              anchorY="middle"
            >
              {`${idx}×`}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

/**
 * High-performance unified Vedic Grid + Active Node Crystals.
 * Animates all 81 pillars, caps, labels, and floating crystals in ONE useFrame callback.
 */
function VedicGridAndNodes({
  cells,
  activeNumber,
  complementNumber,
  showDual,
  showCrystals,
  primaryTheme,
  complementTheme,
  waveMode,
  animationSpeed,
  elevationScale,
  hoveredCell,
  onHoverCell,
  onSelectCell,
}) {
  const pillarRefs = useRef([]);
  const capRefs = useRef([]);
  const labelGroupRefs = useRef([]);
  const nodeGroupRefs = useRef([]);
  const crystalRefs = useRef([]);
  const ringRefs = useRef([]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime * animationSpeed;
    const lerpFactor = Math.min(1, delta * 9);

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const isPrimary = cell.value === activeNumber;
      const isComplement =
        showDual &&
        complementNumber !== activeNumber &&
        cell.value === complementNumber;
      const isActive = isPrimary || isComplement;
      const isHovered = hoveredCell?.id === cell.id;

      // Calculate dynamic wave offset based on waveMode
      let waveOffset = 0;
      if (waveMode === "ripple") {
        waveOffset = Math.sin(t * 2.6 - cell.distFromCenter * 0.85) * 0.14;
      } else if (waveMode === "harmonic") {
        waveOffset =
          Math.sin(t * 2.2 + cell.x * 0.65) *
          Math.cos(t * 2.2 + cell.z * 0.65) *
          0.16;
      } else if (waveMode === "spiral") {
        waveOffset =
          Math.sin(t * 2.8 + cell.angle * 2 - cell.distFromCenter * 0.6) * 0.15;
      }

      const baseHeight = isPrimary
        ? 0.95 + elevationScale * 0.55
        : isComplement
        ? 0.8 + elevationScale * 0.4
        : 0.44;
      const hoverBoost = isHovered ? 0.25 : 0;
      const targetHeight = Math.max(
        0.25,
        baseHeight + (isActive ? waveOffset * elevationScale : waveOffset * 0.25) + hoverBoost
      );

      const pillar = pillarRefs.current[i];
      if (pillar) {
        const nextScaleY = THREE.MathUtils.lerp(pillar.scale.y, targetHeight, lerpFactor);
        pillar.scale.y = nextScaleY;
        pillar.position.y = (nextScaleY - 0.8) * 0.5;
      }

      const cap = capRefs.current[i];
      if (cap && pillar) {
        cap.position.y = pillar.position.y + pillar.scale.y * 0.5 + 0.03;
      }

      const labelGrp = labelGroupRefs.current[i];
      if (labelGrp && pillar) {
        labelGrp.position.y = pillar.position.y + pillar.scale.y * 0.5 + 0.14;
      }

      const nodeGrp = nodeGroupRefs.current[i];
      if (nodeGrp && pillar) {
        const floatY = Math.sin(t * 2.4 + i * 0.35) * 0.09;
        nodeGrp.position.y = pillar.position.y + pillar.scale.y * 0.5 + 0.58 + floatY;
      }

      const crystal = crystalRefs.current[i];
      if (crystal && isActive) {
        crystal.rotation.y += delta * 1.6 * animationSpeed;
        crystal.rotation.x = Math.sin(t * 1.5 + i) * 0.35;
      }

      const ring = ringRefs.current[i];
      if (ring && isActive) {
        const pulseScale = 1 + Math.sin(t * 3 + i * 0.5) * 0.16;
        ring.scale.setScalar(pulseScale);
        ring.rotation.z -= delta * 1.2;
      }
    }
  });

  return (
    <group>
      {cells.map((cell, i) => {
        const isPrimary = cell.value === activeNumber;
        const isComplement =
          showDual &&
          complementNumber !== activeNumber &&
          cell.value === complementNumber;
        const isActive = isPrimary || isComplement;
        const isHovered = hoveredCell?.id === cell.id;
        const isRowOrColHovered =
          hoveredCell &&
          (hoveredCell.row === cell.row || hoveredCell.col === cell.col);

        const activeColor = isPrimary
          ? primaryTheme.color
          : isComplement
          ? complementTheme.color
          : isHovered
          ? "#38bdf8"
          : isRowOrColHovered
          ? "#1e293b"
          : "#131b2e";

        const capColor = isPrimary
          ? primaryTheme.accent
          : isComplement
          ? complementTheme.accent
          : isHovered
          ? "#7dd3fc"
          : "#1e293b";

        return (
          <group key={cell.id} position={[cell.x, 0, cell.z]}>
            {/* Pillar Mesh */}
            <mesh
              ref={(el) => {
                pillarRefs.current[i] = el;
              }}
              geometry={PILLAR_GEOMETRY}
              position={[0, 0, 0]}
              onPointerOver={(e) => {
                e.stopPropagation();
                onHoverCell(cell);
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                onHoverCell(null);
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectCell(cell);
              }}
            >
              <meshStandardMaterial
                color={activeColor}
                emissive={isActive ? activeColor : isHovered ? "#0284c7" : "#000000"}
                emissiveIntensity={isPrimary ? 0.52 : isComplement ? 0.38 : isHovered ? 0.3 : 0}
                roughness={isActive ? 0.22 : 0.65}
                metalness={isActive ? 0.35 : 0.2}
              />
            </mesh>

            {/* Top Bevel Cap */}
            <mesh
              ref={(el) => {
                capRefs.current[i] = el;
              }}
              geometry={PILLAR_CAP_GEOMETRY}
              position={[0, 0.43, 0]}
            >
              <meshBasicMaterial
                color={capColor}
                transparent
                opacity={isActive ? 0.92 : isHovered ? 0.75 : 0.35}
              />
            </mesh>

            {/* Cell Digital Root Number */}
            <group
              ref={(el) => {
                labelGroupRefs.current[i] = el;
              }}
              position={[0, 0.52, 0]}
            >
              <Text
                fontSize={isActive ? 0.31 : 0.23}
                color={isActive || isHovered ? "#ffffff" : "#94a3b8"}
                anchorX="center"
                anchorY="middle"
                outlineWidth={isActive ? 0.04 : 0.025}
                outlineColor="#020617"
              >
                {cell.value}
              </Text>
            </group>

            {/* Floating Sacred Node Crystal & Halo for Active Cells */}
            <group
              ref={(el) => {
                nodeGroupRefs.current[i] = el;
              }}
              position={[0, 1.05, 0]}
              visible={isActive && showCrystals}
            >
              {isActive && showCrystals && (
                <>
                  {/* Inner Octahedron Crystal */}
                  <mesh
                    ref={(el) => {
                      crystalRefs.current[i] = el;
                    }}
                    geometry={CRYSTAL_GEOMETRY}
                  >
                    <meshBasicMaterial
                      color="#ffffff"
                      toneMapped={false}
                    />
                  </mesh>

                  {/* Colored Core Sphere */}
                  <mesh geometry={CORE_SPHERE_GEOMETRY}>
                    <meshBasicMaterial
                      color={activeColor}
                      transparent
                      opacity={0.95}
                      toneMapped={false}
                    />
                  </mesh>

                  {/* Outer BackSide Halo */}
                  <mesh geometry={HALO_SPHERE_GEOMETRY}>
                    <meshBasicMaterial
                      color={activeColor}
                      transparent
                      opacity={0.32}
                      side={THREE.BackSide}
                      toneMapped={false}
                    />
                  </mesh>

                  {/* Horizontal Sacred Ring */}
                  <mesh
                    ref={(el) => {
                      ringRefs.current[i] = el;
                    }}
                    geometry={NODE_RING_GEOMETRY}
                    rotation={[-Math.PI / 2, 0, 0]}
                  >
                    <meshBasicMaterial
                      color={activeColor}
                      transparent
                      opacity={0.75}
                      side={THREE.DoubleSide}
                      toneMapped={false}
                    />
                  </mesh>
                </>
              )}
            </group>
          </group>
        );
      })}
    </group>
  );
}

/**
 * High-performance Connection Beams.
 * Uses precalculated quaternions and a SINGLE shared CylinderGeometry + single useFrame loop.
 */
function ConnectionBeams({
  connections,
  lineThickness,
  animationSpeed,
}) {
  const beamRefs = useRef([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime * animationSpeed;
    const baseRadius = 0.032 * lineThickness;

    for (let i = 0; i < connections.length; i++) {
      const mesh = beamRefs.current[i];
      const conn = connections[i];
      if (!mesh || !conn) continue;

      const pulse = 0.85 + Math.sin(t * 3.2 + i * 0.4) * 0.22;
      const r = baseRadius * (conn.weight || 1) * (conn.isSecondary ? 0.78 : 1) * pulse;
      mesh.scale.set(r, conn.length, r);
    }
  });

  return (
    <group>
      {connections.map((conn, i) => (
        <group key={conn.id}>
          {/* 3D Laser Cylinder with precomputed Quaternion */}
          <mesh
            ref={(el) => {
              beamRefs.current[i] = el;
            }}
            geometry={BEAM_CYLINDER_GEOMETRY}
            position={conn.center}
            quaternion={conn.quaternion}
            scale={[0.04 * lineThickness, conn.length, 0.04 * lineThickness]}
          >
            <meshBasicMaterial
              color={conn.color}
              transparent
              opacity={conn.isSecondary ? 0.45 : conn.isDashed ? 0.55 : 0.82}
              toneMapped={false}
            />
          </mesh>

          {/* Crisp Core Line */}
          <Line
            points={[conn.start, conn.end]}
            color={conn.isSecondary ? conn.color : "#ffffff"}
            lineWidth={Math.max(1.5, lineThickness * (conn.isSecondary ? 1.8 : 2.6))}
            dashed={conn.isDashed}
            dashSize={0.28}
            gapSize={0.14}
            transparent
            opacity={conn.isSecondary ? 0.65 : 0.9}
          />
        </group>
      ))}
    </group>
  );
}

/**
 * Instanced Traveling Energy Photons along connection beams.
 * Renders up to 400 glowing particles in a SINGLE WebGL draw call!
 */
const MAX_PHOTONS = 400;

function EnergyPhotons({ connections, showPulses, animationSpeed, lineThickness }) {
  const instancedRef = useRef(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tempPos = useMemo(() => new THREE.Vector3(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    const mesh = instancedRef.current;
    if (!mesh) return;

    if (!showPulses || connections.length === 0) {
      mesh.count = 0;
      return;
    }

    const t = state.clock.elapsedTime * animationSpeed;
    const totalInstances = Math.min(MAX_PHOTONS, connections.length * 2);
    mesh.count = totalInstances;

    const scaleBase = Math.max(0.65, lineThickness * 0.95);

    for (let i = 0; i < totalInstances; i++) {
      const connIndex = Math.floor(i / 2);
      const isSecondPacket = i % 2 === 1;
      const conn = connections[connIndex];
      if (!conn) continue;

      const speed = 0.45 + (connIndex % 5) * 0.08;
      const phaseOffset = isSecondPacket ? 0.5 : 0;
      const progress = (t * speed + connIndex * 0.13 + phaseOffset) % 1;

      tempPos.lerpVectors(conn.start, conn.end, progress);
      dummy.position.copy(tempPos);

      // Smooth fade at endpoints
      const edgeScale = Math.sin(progress * Math.PI);
      dummy.scale.setScalar(scaleBase * (0.5 + edgeScale * 0.85));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      tempColor.set(isSecondPacket ? "#ffffff" : conn.color);
      mesh.setColorAt(i, tempColor);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={instancedRef}
      args={[PHOTON_GEOMETRY, null, MAX_PHOTONS]}
      frustumCulled={false}
    >
      <meshBasicMaterial toneMapped={false} transparent opacity={0.95} />
    </instancedMesh>
  );
}

export default function VedicScene({
  cells,
  activeNumber,
  complementNumber,
  showDual,
  showLines,
  showPulses,
  showCrystals,
  primaryTheme,
  complementTheme,
  connections,
  lineThickness,
  animationSpeed,
  elevationScale,
  waveMode,
  cameraPreset,
  presetTrigger,
  autoRotate,
  hoveredCell,
  onHoverCell,
  onSelectCell,
}) {
  return (
    <Canvas
      camera={{ position: [11.5, 10.5, 11.5], fov: 46 }}
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#05070e"]} />
      <fog attach="fog" args={["#05070e", 18, 36]} />

      {/* Dynamic Scene Lighting */}
      <ambientLight intensity={0.55} />
      <directionalLight position={[8, 16, 10]} intensity={0.9} color="#f8fafc" />
      <pointLight
        position={[8, 8, 8]}
        intensity={1.6}
        distance={25}
        color={primaryTheme.color}
      />
      <pointLight
        position={[-8, 6, -8]}
        intensity={1.1}
        distance={25}
        color={showDual ? complementTheme.color : "#38bdf8"}
      />
      <hemisphereLight
        skyColor="#0f172a"
        groundColor="#020617"
        intensity={0.4}
      />

      {/* Deep Space Stars & Quantum Sparkles */}
      <Stars
        radius={85}
        depth={45}
        count={1600}
        factor={3.5}
        saturation={0.5}
        fade
        speed={0.8}
      />
      <Sparkles
        count={70}
        scale={[11, 5, 11]}
        position={[0, 1.8, 0]}
        size={2.2}
        speed={0.4 * animationSpeed}
        opacity={0.55}
        color={primaryTheme.accent}
      />

      {/* Sacred Geometry Floor & Coordinate Indices */}
      <SacredMandalaFloor
        primaryColor={primaryTheme.color}
        secondaryColor={complementTheme.color}
      />

      {/* 81-Cell Vedic Square Pillars & Active Floating Nodes */}
      <VedicGridAndNodes
        cells={cells}
        activeNumber={activeNumber}
        complementNumber={complementNumber}
        showDual={showDual}
        showCrystals={showCrystals}
        primaryTheme={primaryTheme}
        complementTheme={complementTheme}
        waveMode={waveMode}
        animationSpeed={animationSpeed}
        elevationScale={elevationScale}
        hoveredCell={hoveredCell}
        onHoverCell={onHoverCell}
        onSelectCell={onSelectCell}
      />

      {/* 3D Connection Beams */}
      {showLines && connections.length > 0 && (
        <ConnectionBeams
          connections={connections}
          lineThickness={lineThickness}
          animationSpeed={animationSpeed}
        />
      )}

      {/* Instanced Traveling Energy Photons */}
      <EnergyPhotons
        connections={connections}
        showPulses={showLines && showPulses}
        animationSpeed={animationSpeed}
        lineThickness={lineThickness}
      />

      {/* Camera Controller with Smooth Presets */}
      <CameraController
        cameraPreset={cameraPreset}
        presetTrigger={presetTrigger}
        autoRotate={autoRotate}
      />
    </Canvas>
  );
}
