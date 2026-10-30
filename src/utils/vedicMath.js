import * as THREE from "three";

const UP_VECTOR = new THREE.Vector3(0, 1, 0);

// Digital Root (1–9)
export const digitalRoot = (n) => (n <= 0 ? 0 : 1 + ((n - 1) % 9));

// Step-by-step breakdown of digital root calculation for educational inspector
export function getDigitalRootBreakdown(row, col) {
  const product = row * col;
  const steps = [];
  let current = product;

  while (current > 9) {
    const digits = String(current).split("").map(Number);
    const sum = digits.reduce((acc, d) => acc + d, 0);
    steps.push({
      expression: digits.join(" + "),
      result: sum,
    });
    current = sum;
  }

  return {
    row,
    col,
    product,
    root: current,
    steps,
  };
}

export const NUMBER_THEMES = [
  {
    number: 1,
    name: "Monad Unity",
    symmetryPair: "1 ↔ 8 Mirror Symmetry",
    complement: 8,
    color: "#FF5E7E",
    beamColor: "#FF2A5F",
    accent: "#FF9EB5",
    description:
      "Forms an expansive outer hyperbola and diagonal symmetry. Paired with 8 as its inverted geometric twin across the Vedic axis.",
  },
  {
    number: 2,
    name: "Dyad Polarity",
    symmetryPair: "2 ↔ 7 Mirror Symmetry",
    complement: 7,
    color: "#FFB830",
    beamColor: "#FF9F00",
    accent: "#FFE082",
    description:
      "Generates an interlocking hexagonal star weave. Its modular sequence doubles each step (2, 4, 6, 8, 1, 3, 5, 7, 9), mirroring root 7.",
  },
  {
    number: 3,
    name: "Triad Harmonic",
    symmetryPair: "3 ↔ 6 Harmonic Lattice",
    complement: 6,
    color: "#00F5A0",
    beamColor: "#00D9F5",
    accent: "#80FFDB",
    description:
      "Creates a rhythmic 3×3 sub-grid lattice along rows and columns 3 and 6. With 6 and 9, it forms the famous Tesla flux triad.",
  },
  {
    number: 4,
    name: "Tetrad Structure",
    symmetryPair: "4 ↔ 5 Mirror Symmetry",
    complement: 5,
    color: "#00C6FF",
    beamColor: "#0072FF",
    accent: "#7CE8FF",
    description:
      "Carves a diamond-octagonal enclosure around the center of the square. Geometrically reflects root 5 in reverse phase.",
  },
  {
    number: 5,
    name: "Pentad Vortex",
    symmetryPair: "5 ↔ 4 Mirror Symmetry",
    complement: 4,
    color: "#A855F7",
    beamColor: "#C084FC",
    accent: "#E9D5FF",
    description:
      "Radiates an inward-facing octagonal star pattern that interleaves perfectly with root 4, cycling through all 9 digits.",
  },
  {
    number: 6,
    name: "Hexad Resonance",
    symmetryPair: "6 ↔ 3 Harmonic Lattice",
    complement: 3,
    color: "#EC4899",
    beamColor: "#F43F5E",
    accent: "#FBCFE8",
    description:
      "Mirrors the Triad (3) at inverse harmonic nodes (6, 3, 9), anchoring the sacred hexagonal symmetry of the multiplication field.",
  },
  {
    number: 7,
    name: "Heptad Mystic",
    symmetryPair: "7 ↔ 2 Mirror Symmetry",
    complement: 2,
    color: "#06B6D4",
    beamColor: "#22D3EE",
    accent: "#A5F3FC",
    description:
      "Traces the inverted star polygon of root 2. Adding corresponding cells of row 2 and row 7 always yields digital root 9.",
  },
  {
    number: 8,
    name: "Ogdoad Infinity",
    symmetryPair: "8 ↔ 1 Mirror Symmetry",
    complement: 1,
    color: "#6366F1",
    beamColor: "#818CF8",
    accent: "#C7D2FE",
    description:
      "Forms a concentrated central cross-diagonal diamond—the exact spatial inversion of root 1's outer boundary.",
  },
  {
    number: 9,
    name: "Ennead Supreme",
    symmetryPair: "9 Self-Dual Invariant",
    complement: 9,
    color: "#F59E0B",
    beamColor: "#FBBF24",
    accent: "#FDE68A",
    description:
      "The invariant horizon of Vedic mathematics. Any number multiplied by 9 reduces to 9, dividing the square into sacred quadrants.",
  },
];

export const PATTERN_MODES = [
  {
    id: "constellation",
    label: "Constellation",
    desc: "Harmonic proximity web + outer sacred ring",
  },
  {
    id: "mandala",
    label: "Star Mandala",
    desc: "Radial spokes + symmetric mirror chords",
  },
  {
    id: "sequential",
    label: "Wave Flow",
    desc: "Sequential matrix traversal path",
  },
  {
    id: "network",
    label: "Full Graph",
    desc: "Complete all-to-all geometric network",
  },
];

export const WAVE_MODES = [
  { id: "ripple", label: "Radial Ripple" },
  { id: "harmonic", label: "Harmonic Wave" },
  { id: "spiral", label: "Vortex Spiral" },
  { id: "static", label: "Steady Pillars" },
];

// Build 9x9 Vedic Square cell objects once
export function buildVedicSquare(size = 9) {
  const cells = [];
  const table = [];
  const half = (size - 1) / 2;

  for (let r = 0; r < size; r++) {
    const rowArr = [];
    for (let c = 0; c < size; c++) {
      const row = r + 1;
      const col = c + 1;
      const product = row * col;
      const value = digitalRoot(product);
      const x = c - half;
      const z = r - half;
      const distFromCenter = Math.hypot(x, z);
      const angle = Math.atan2(z, x);

      const cellData = {
        id: `${r}-${c}`,
        r,
        c,
        row,
        col,
        product,
        value,
        x,
        z,
        distFromCenter,
        angle,
      };
      rowArr.push(value);
      cells.push(cellData);
    }
    table.push(rowArr);
  }

  return { table, cells };
}

function createSegment(pA, pB, color, index, extra = {}) {
  const start = pA.position;
  const end = pB.position;
  const length = start.distanceTo(end);
  const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const direction = new THREE.Vector3().subVectors(end, start).normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(UP_VECTOR, direction);

  return {
    id: `${pA.id}-${pB.id}-${index}`,
    start,
    end,
    fromCell: pA,
    toCell: pB,
    center,
    length,
    quaternion,
    color,
    index,
    isDashed: extra.isDashed || false,
    isCircular: extra.isCircular || false,
    isSecondary: extra.isSecondary || false,
    weight: extra.weight ?? 1,
  };
}

/**
 * Computes optimized 3D & 2D connection segments with precalculated quaternions
 * so zero matrix/lookAt recalculations are needed in useFrame.
 */
export function computeConnections(activeCells, mode = "constellation", color = "#00F5A0", isSecondary = false) {
  if (!activeCells || activeCells.length < 2) return [];

  const conns = [];
  const seenPairs = new Set();

  const addPair = (cellA, cellB, idx, extra = {}) => {
    if (cellA.id === cellB.id) return;
    const pairKey = cellA.id < cellB.id ? `${cellA.id}:${cellB.id}` : `${cellB.id}:${cellA.id}`;
    if (seenPairs.has(pairKey)) return;
    seenPairs.add(pairKey);
    conns.push(createSegment(cellA, cellB, color, idx, { ...extra, isSecondary }));
  };

  if (mode === "sequential") {
    // Connect in natural row-major and column-major wave order
    for (let i = 0; i < activeCells.length - 1; i++) {
      addPair(activeCells[i], activeCells[i + 1], i, { weight: 1.1 });
    }
    // Also connect transpose mirror (r, c) <-> (c, r) for symmetry
    const byCoord = new Map(activeCells.map((cell) => [`${cell.r}-${cell.c}`, cell]));
    activeCells.forEach((cell, idx) => {
      const mirror = byCoord.get(`${cell.c}-${cell.r}`);
      if (mirror && mirror.id !== cell.id) {
        addPair(cell, mirror, 200 + idx, { isDashed: true, weight: 0.75 });
      }
    });
    return conns;
  }

  if (mode === "mandala") {
    // Sort angularly around the center of the board
    const sorted = [...activeCells].sort((a, b) => a.angle - b.angle || a.distFromCenter - b.distFromCenter);
    for (let i = 0; i < sorted.length; i++) {
      const next = sorted[(i + 1) % sorted.length];
      addPair(sorted[i], next, i, { isCircular: true, weight: 1.15 });

      // Connect across the mandala (star chords)
      const opposite = sorted[(i + Math.floor(sorted.length / 2)) % sorted.length];
      addPair(sorted[i], opposite, 300 + i, { isDashed: true, weight: 0.85 });

      const step3 = sorted[(i + Math.max(2, Math.floor(sorted.length / 3))) % sorted.length];
      addPair(sorted[i], step3, 600 + i, { weight: 0.9 });
    }
    return conns;
  }

  if (mode === "network") {
    // Full graph with distance-based filtering when point count is very high (like n=9)
    const maxDist = activeCells.length > 12 ? 6.5 : 12;
    let idx = 0;
    for (let i = 0; i < activeCells.length; i++) {
      for (let j = i + 1; j < activeCells.length; j++) {
        const dist = activeCells[i].position.distanceTo(activeCells[j].position);
        if (dist <= maxDist) {
          addPair(activeCells[i], activeCells[j], idx++, {
            isDashed: dist > 4.5,
            weight: dist > 4.5 ? 0.65 : 1.0,
          });
        }
      }
    }
    return conns;
  }

  // Default: "constellation" (Sacred Constellation: smart distance threshold + circular hull)
  const threshold = activeCells.length > 12 ? 4.3 : 6.5;
  let idx = 0;
  for (let i = 0; i < activeCells.length; i++) {
    for (let j = i + 1; j < activeCells.length; j++) {
      const dist = activeCells[i].position.distanceTo(activeCells[j].position);
      if (dist <= threshold) {
        addPair(activeCells[i], activeCells[j], idx++, {
          isDashed: dist > 3.6,
          weight: dist > 3.6 ? 0.75 : 1.05,
        });
      }
    }
  }

  // Angular perimeter ring
  const sortedPoints = [...activeCells].sort((a, b) => a.angle - b.angle);
  for (let i = 0; i < sortedPoints.length; i++) {
    const nextIndex = (i + 1) % sortedPoints.length;
    addPair(sortedPoints[i], sortedPoints[nextIndex], 1000 + i, {
      isCircular: true,
      weight: 1.15,
    });
  }

  return conns;
}
