import { describe, it, expect } from "vitest";
import * as THREE from "three";
import {
  digitalRoot,
  getDigitalRootBreakdown,
  buildVedicSquare,
  computeConnections,
  NUMBER_THEMES,
} from "./utils/vedicMath";

describe("Vedic Square Mathematical Engine", () => {
  it("computes digital roots accurately for 1..81", () => {
    expect(digitalRoot(0)).toBe(0);
    expect(digitalRoot(5)).toBe(5);
    expect(digitalRoot(9)).toBe(9);
    expect(digitalRoot(38)).toBe(2); // 3 + 8 = 11 -> 1 + 1 = 2
    expect(digitalRoot(81)).toBe(9); // 8 + 1 = 9
    expect(digitalRoot(64)).toBe(1); // 6 + 4 = 10 -> 1 + 0 = 1
  });

  it("provides step-by-step digital root breakdown", () => {
    const breakdown = getDigitalRootBreakdown(7, 8);
    expect(breakdown.product).toBe(56);
    expect(breakdown.root).toBe(2);
    expect(breakdown.steps.length).toBe(2);
    expect(breakdown.steps[0].result).toBe(11);
    expect(breakdown.steps[1].result).toBe(2);
  });

  it("builds a complete 9x9 Vedic Square with 81 cells", () => {
    const { table, cells } = buildVedicSquare(9);
    expect(table.length).toBe(9);
    expect(cells.length).toBe(81);
    // Row 9 (9) + Col 9 (8) + {3,6}x{3,6} (4) = 21 cells with digital root 9
    const nines = cells.filter((c) => c.value === 9);
    expect(nines.length).toBe(21);
  });

  it("computes 3D connections with precalculated quaternions across all pattern modes", () => {
    const { cells } = buildVedicSquare(9);
    const active = cells
      .filter((c) => c.value === 5)
      .map((c) => ({ ...c, position: new THREE.Vector3(c.x, 1, c.z) }));

    for (const mode of ["constellation", "mandala", "sequential", "network"]) {
      const conns = computeConnections(active, mode, NUMBER_THEMES[4].beamColor);
      expect(conns.length).toBeGreaterThan(0);
      expect(conns[0].quaternion).toBeInstanceOf(THREE.Quaternion);
      expect(conns[0].length).toBeGreaterThan(0);
    }
  });
});
