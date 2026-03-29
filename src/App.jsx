import { useState, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Text, Line } from "@react-three/drei";
import * as THREE from "three";

const COLORS = [
  "#FF6B6B", // Coral Red
  "#FFD166", // Golden Yellow
  "#06D6A0", // Emerald
  "#118AB2", // Ocean Blue
  "#073B4C", // Deep Navy
  "#7209B7", // Purple
  "#F72585", // Magenta
  "#4CC9F0", // Sky Blue
  "#FF9E00", // Orange
];

const LINE_COLORS = [
  "#FF4757", // Bright Red
  "#FFA502", // Bright Orange
  "#2ED573", // Bright Green
  "#1E90FF", // Dodger Blue
  "#3742FA", // Bright Blue
  "#9B59B6", // Bright Purple
  "#FF6B81", // Bright Pink
  "#00D2D3", // Bright Cyan
  "#FF9F43", // Bright Orange
];

// Digital Root (1–9)
const digitalRoot = (n) => (n === 0 ? 0 : 1 + ((n - 1) % 9));

function ThickLine({ start, end, color, index = 0, isDashed = false }) {
  const lineRef = useRef();
  const materialRef = useRef();
  const points = useMemo(() => [start, end], [start, end]);
  
  useFrame((state) => {
    if (materialRef.current) {
      // Pulsing opacity effect
      const pulse = 0.7 + Math.sin(state.clock.elapsedTime * 3 + index) * 0.3;
      materialRef.current.opacity = pulse;
    }
  });

  return (
    <Line
      ref={lineRef}
      points={points}
      color={color}
      lineWidth={6} // Much thicker lines
      dashed={isDashed}
      dashSize={0.3}
      gapSize={0.15}
      transparent
      opacity={0.9}
      ref={materialRef}
    />
  );
}

function ConnectionCylinder({ start, end, color, index = 0 }) {
  const meshRef = useRef();
  const length = useMemo(() => start.distanceTo(end), [start, end]);
  const center = useMemo(() => 
    new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5),
    [start, end]
  );
  const direction = useMemo(() => 
    new THREE.Vector3().subVectors(end, start).normalize(),
    [start, end]
  );

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle pulsing effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.1;
      meshRef.current.scale.y = scale;
      
      // Rotate cylinder to align with direction
      meshRef.current.lookAt(end);
      meshRef.current.rotateX(Math.PI / 2);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={center}
      rotation={[0, 0, 0]}
    >
      <cylinderGeometry args={[0.08, 0.08, length, 8]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.8}
        toneMapped={false}
      />
    </mesh>
  );
}

function GlowingSphere({ position, color, size = 0.3 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position.y + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      
      // Gentle rotation
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef} position={[position.x, position.y, position.z]}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.9}
        toneMapped={false}
      />
      {/* Glow effect */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[size * 1.5, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          side={THREE.BackSide}
          toneMapped={false}
        />
      </mesh>
    </mesh>
  );
}

export default function App() {
  const [number, setNumber] = useState(5);
  const [showLines, setShowLines] = useState(true);
  const [lineThickness, setLineThickness] = useState(1);

  // Build 9×9 Vedic square
  const table = useMemo(() => 
    Array.from({ length: 9 }, (_, row) =>
      Array.from({ length: 9 }, (_, col) =>
        digitalRoot((row + 1) * (col + 1))
      )
    ), []
  );

  // Collect positions of selected number
  const activePoints = useMemo(() => {
    const points = [];
    table.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell === number) {
          points.push(new THREE.Vector3(
            c - 4, // X position
            0.8,   // Y position (above grid)
            r - 4  // Z position
          ));
        }
      });
    });
    return points;
  }, [table, number]);

  // Create all possible connections between active points
  const connections = useMemo(() => {
    if (!showLines || activePoints.length < 2) return [];
    
    const conns = [];
    const lineColor = LINE_COLORS[number - 1];
    
    // Connect each point to every other point (creates a complete graph)
    for (let i = 0; i < activePoints.length; i++) {
      for (let j = i + 1; j < activePoints.length; j++) {
        // Only connect points that are relatively close to avoid clutter
        const distance = activePoints[i].distanceTo(activePoints[j]);
        if (distance < 8) { // Adjust this threshold as needed
          conns.push({
            start: activePoints[i],
            end: activePoints[j],
            color: lineColor,
            index: i * activePoints.length + j,
            isDashed: distance > 4 // Dashed lines for longer connections
          });
        }
      }
    }
    
    // Also create a circular connection pattern
    const sortedPoints = [...activePoints].sort((a, b) => {
      const angleA = Math.atan2(a.z, a.x);
      const angleB = Math.atan2(b.z, b.x);
      return angleA - angleB;
    });
    
    // Connect points in circular order
    for (let i = 0; i < sortedPoints.length; i++) {
      const nextIndex = (i + 1) % sortedPoints.length;
      conns.push({
        start: sortedPoints[i],
        end: sortedPoints[nextIndex],
        color: lineColor,
        index: 1000 + i,
        isDashed: false,
        isCircular: true
      });
    }
    
    return conns;
  }, [activePoints, number, showLines]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
            Vedic Square Geometry
          </h1>
          <p className="text-gray-400 text-lg">
            Visualizing digital root patterns in 3D
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Controls */}
          <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-cyan-300">Controls</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Active Number: <span className="text-2xl font-bold ml-2" style={{ color: COLORS[number - 1] }}>{number}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="9"
                  value={number}
                  onChange={(e) => setNumber(parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-800 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, ${COLORS.join(', ')})`
                  }}
                />
                <div className="flex justify-between mt-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                    <button
                      key={n}
                      onClick={() => setNumber(n)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        number === n 
                          ? 'scale-110 shadow-lg' 
                          : 'hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: number === n ? COLORS[n - 1] : '#4a5568',
                        color: number === n ? 'white' : '#a0aec0'
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">
                    Show Connection Lines
                  </label>
                  <button
                    onClick={() => setShowLines(!showLines)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      showLines ? 'bg-green-500' : 'bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        showLines ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-sm text-gray-400">Active Cells</div>
                    <div className="text-2xl font-bold">{activePoints.length}</div>
                  </div>
                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-sm text-gray-400">Connections</div>
                    <div className="text-2xl font-bold">{connections.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3D Canvas */}
          <div className="lg:col-span-2">
            <div className="relative w-full h-[600px] rounded-2xl overflow-hidden border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
              <Canvas
                camera={{ position: [15, 12, 15], fov: 50 }}
                shadows
              >
                <color attach="background" args={["#0a0a0f"]} />
                
                {/* Lighting */}
                <ambientLight intensity={0.4} />
                <pointLight position={[10, 10, 10]} intensity={1} color={COLORS[number - 1]} />
                <pointLight position={[-10, 5, -10]} intensity={0.5} color="#4CC9F0" />
                <hemisphereLight
                  skyColor="#0a0a1a"
                  groundColor="#1a0a0a"
                  intensity={0.3}
                />
                
                {/* Stars */}
                <Stars radius={100} depth={50} count={2000} factor={4} fade />
                
                {/* Grid */}
                {table.map((row, r) =>
                  row.map((cell, c) => {
                    const isActive = cell === number;
                    const x = c - 4;
                    const z = r - 4;
                    
                    return (
                      <group key={`${r}-${c}`}>
                        {/* Grid cell */}
                        <mesh
                          position={[x, 0, z]}
                          castShadow
                          receiveShadow
                        >
                          <boxGeometry args={[0.9, isActive ? 1.2 : 0.8, 0.9]} />
                          <meshStandardMaterial
                            color={isActive ? COLORS[number - 1] : "#2d3748"}
                            emissive={isActive ? COLORS[number - 1] : "#000000"}
                            emissiveIntensity={isActive ? 0.3 : 0}
                            roughness={0.5}
                            metalness={0.2}
                          />
                        </mesh>
                        
                        {/* Number */}
                        <Text
                          position={[x, isActive ? 0.8 : 0.5, z]}
                          fontSize={0.25}
                          color="white"
                          anchorX="center"
                          anchorY="middle"
                          outlineWidth={0.05}
                          outlineColor="#000000"
                        >
                          {cell}
                        </Text>
                      </group>
                    );
                  })
                )}
                
                {/* Glowing spheres at active points */}
                {activePoints.map((point, index) => (
                  <GlowingSphere
                    key={index}
                    position={point}
                    color={COLORS[number - 1]}
                    size={0.4}
                  />
                ))}
                
                {/* CONNECTION LINES - Now clearly visible */}
                {showLines && connections.map((conn, index) => (
                  <group key={index}>
                    {/* Use both methods for maximum visibility */}
                    <ThickLine
                      start={conn.start}
                      end={conn.end}
                      color={conn.color}
                      index={index}
                      isDashed={conn.isDashed}
                    />
                    <ConnectionCylinder
                      start={conn.start}
                      end={conn.end}
                      color={conn.color}
                      index={index}
                    />
                  </group>
                ))}
                
                {/* Interactive Controls */}
                <OrbitControls
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  minDistance={5}
                  maxDistance={30}
                  autoRotate={false}
                />
              </Canvas>
            </div>
            
            <div className="mt-4 text-sm text-gray-400 text-center">
              <p>Drag to rotate • Scroll to zoom • {activePoints.length} active cells • {connections.length} connections</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-cyan-300">How to Use</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-800/40 rounded-lg">
              <div className="font-medium mb-2">1. Select Number</div>
              <p className="text-sm text-gray-400">Use the slider or number buttons to choose a digit (1-9)</p>
            </div>
            <div className="p-4 bg-gray-800/40 rounded-lg">
              <div className="font-medium mb-2">2. View Pattern</div>
              <p className="text-sm text-gray-400">Observe the geometric pattern formed by that number's digital roots</p>
            </div>
            <div className="p-4 bg-gray-800/40 rounded-lg">
              <div className="font-medium mb-2">3. Toggle Lines</div>
              <p className="text-sm text-gray-400">Show/hide connection lines between active cells</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: ${COLORS[number - 1]};
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 0 10px ${COLORS[number - 1]};
        }
        
        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: ${COLORS[number - 1]};
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 0 10px ${COLORS[number - 1]};
        }
      `}</style>
    </div>
  );
}