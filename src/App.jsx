import { useState, useMemo, useEffect, useCallback } from "react";
import * as THREE from "three";
import VedicScene from "./components/VedicScene";
import Matrix2D from "./components/Matrix2D";
import VedicLogo from "./components/VedicLogo";
import {
  NUMBER_THEMES,
  PATTERN_MODES,
  WAVE_MODES,
  buildVedicSquare,
  computeConnections,
  getDigitalRootBreakdown,
} from "./utils/vedicMath";

const SYMMETRY_PAIRS = [
  { label: "1 ↔ 8 Monad", n: 1 },
  { label: "2 ↔ 7 Star", n: 2 },
  { label: "3 ↔ 6 Triad", n: 3 },
  { label: "4 ↔ 5 Octagon", n: 4 },
  { label: "9 Supreme", n: 9 },
];

export default function App() {
  const [number, setNumber] = useState(5);
  const [patternMode, setPatternMode] = useState("constellation");
  const [waveMode, setWaveMode] = useState("ripple");
  const [showLines, setShowLines] = useState(true);
  const [showPulses, setShowPulses] = useState(true);
  const [showCrystals, setShowCrystals] = useState(true);
  const [showDual, setShowDual] = useState(false);

  const [lineThickness, setLineThickness] = useState(1.1);
  const [animationSpeed, setAnimationSpeed] = useState(1.0);
  const [elevationScale, setElevationScale] = useState(1.0);

  const [autoCycle, setAutoCycle] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [cameraPreset, setCameraPreset] = useState("isometric");
  const [presetTrigger, setPresetTrigger] = useState(0);
  const [hoveredCell, setHoveredCell] = useState(null);

  // Build 9x9 Vedic Square once
  const { cells } = useMemo(() => buildVedicSquare(9), []);

  const primaryTheme = NUMBER_THEMES[number - 1];
  const complementNumber = primaryTheme.complement;
  const complementTheme = NUMBER_THEMES[complementNumber - 1];

  // Auto-cycle through numbers 1..9 when Tour Mode is active
  useEffect(() => {
    if (!autoCycle) return undefined;
    const timer = setInterval(() => {
      setNumber((prev) => (prev % 9) + 1);
    }, 2600);
    return () => clearInterval(timer);
  }, [autoCycle]);

  // Keyboard shortcuts: 1-9 for numbers, Space for auto-cycle, D for dual mode, T for top view
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key >= "1" && e.key <= "9") {
        setNumber(Number(e.key));
      } else if (e.code === "Space") {
        e.preventDefault();
        setAutoCycle((prev) => !prev);
      } else if (e.key.toLowerCase() === "d") {
        setShowDual((prev) => !prev);
      } else if (e.key.toLowerCase() === "t") {
        setCameraPreset((prev) => (prev === "top" ? "isometric" : "top"));
        setPresetTrigger((c) => c + 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Collect active cells with elevated 3D anchor coordinates
  const activeCells = useMemo(() => {
    const beamY = 0.85 + elevationScale * 0.28;
    return cells
      .filter((cell) => cell.value === number)
      .map((cell) => ({
        ...cell,
        position: new THREE.Vector3(cell.x, beamY, cell.z),
      }));
  }, [cells, number, elevationScale]);

  // Collect complementary cells when Dual Symmetry mode is active
  const complementCells = useMemo(() => {
    if (!showDual || complementNumber === number) return [];
    const beamY = 0.72 + elevationScale * 0.22;
    return cells
      .filter((cell) => cell.value === complementNumber)
      .map((cell) => ({
        ...cell,
        position: new THREE.Vector3(cell.x, beamY, cell.z),
      }));
  }, [cells, showDual, complementNumber, number, elevationScale]);

  // Precompute 3D + 2D geometric connections
  const connections = useMemo(() => {
    if (!showLines) return [];
    const primaryConns = computeConnections(
      activeCells,
      patternMode,
      primaryTheme.beamColor,
      false
    );
    if (!showDual || complementCells.length === 0) {
      return primaryConns;
    }
    const secondaryConns = computeConnections(
      complementCells,
      patternMode,
      complementTheme.beamColor,
      true
    );
    return [...primaryConns, ...secondaryConns];
  }, [
    showLines,
    activeCells,
    complementCells,
    patternMode,
    primaryTheme,
    complementTheme,
    showDual,
  ]);

  // Formula breakdown for hovered cell or sample active cell
  const formulaBreakdown = useMemo(() => {
    if (hoveredCell) {
      return getDigitalRootBreakdown(hoveredCell.row, hoveredCell.col);
    }
    const sample = activeCells[Math.floor(activeCells.length / 2)] || {
      row: number,
      col: 1,
    };
    return getDigitalRootBreakdown(sample.row, sample.col);
  }, [hoveredCell, activeCells, number]);

  // Sequence of 9 digital roots for row = active number
  const rowSequence = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) =>
        getDigitalRootBreakdown(number, i + 1)
      ),
    [number]
  );

  const handleCameraSelect = useCallback((preset) => {
    setCameraPreset(preset);
    setPresetTrigger((c) => c + 1);
  }, []);

  const handleSelectCell = useCallback((cell) => {
    if (cell && cell.value) {
      setNumber(cell.value);
    }
  }, []);

  const colorsGradient = useMemo(
    () => NUMBER_THEMES.map((t) => t.color).join(", "),
    []
  );

  return (
    <div
      className="min-h-screen bg-[#05050a] bg-cosmic-grid text-slate-100 relative overflow-x-hidden"
      style={{ "--active-color": primaryTheme.color }}
    >
      {/* Ambient Radial Aura */}
      <div
        className="pointer-events-none fixed top-[-180px] left-1/2 -translate-x-1/2 w-[900px] h-[420px] rounded-full blur-[150px] opacity-25 transition-colors duration-700"
        style={{ backgroundColor: primaryTheme.color }}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 py-5">
        {/* Top Navigation & Telemetry Header */}
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 mb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <VedicLogo
              primaryColor={primaryTheme.color}
              secondaryColor={complementTheme.color}
              number={number}
            />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                  Vedic Square Geometry
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-white/5 border border-white/10 text-cyan-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  WebGL Instanced Engine
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Interactive 3D modular arithmetic, digital root harmonics &amp; sacred symmetry simulation
              </p>
            </div>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setAutoCycle((prev) => !prev)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                autoCycle
                  ? "bg-amber-500/20 border-amber-400/60 text-amber-200 shadow-lg shadow-amber-500/10"
                  : "bg-slate-900/80 border-white/10 text-slate-300 hover:bg-slate-800 hover:border-white/20"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  autoCycle ? "bg-amber-400 animate-ping" : "bg-slate-500"
                }`}
              />
              {autoCycle ? "Cycling 1–9 (Pause)" : "Auto-Cycle 1–9"}
            </button>

            <button
              type="button"
              onClick={() => setShowDual((prev) => !prev)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                showDual
                  ? "bg-purple-500/20 border-purple-400/60 text-purple-200 shadow-lg shadow-purple-500/10"
                  : "bg-slate-900/80 border-white/10 text-slate-300 hover:bg-slate-800 hover:border-white/20"
              }`}
            >
              <span>✦</span>
              Dual Symmetry ({number} ↔ {complementNumber})
            </button>

            <button
              type="button"
              onClick={() => setAutoRotate((prev) => !prev)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                autoRotate
                  ? "bg-cyan-500/20 border-cyan-400/60 text-cyan-200 shadow-lg shadow-cyan-500/10"
                  : "bg-slate-900/80 border-white/10 text-slate-300 hover:bg-slate-800 hover:border-white/20"
              }`}
            >
              <span>↻</span>
              {autoRotate ? "Orbiting" : "Auto-Orbit"}
            </button>
          </div>
        </header>

        {/* Main Workspace Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Control Sidebar (4 columns on xl) */}
          <div className="xl:col-span-4 space-y-5">
            {/* Card 1: Digital Root Selector */}
            <section className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Active Digital Root
                </span>
                <span
                  className="text-xs font-semibold px-2.5 py-0.5 rounded-full border"
                  style={{
                    color: primaryTheme.accent,
                    borderColor: `${primaryTheme.color}55`,
                    backgroundColor: `${primaryTheme.color}18`,
                  }}
                >
                  {primaryTheme.name}
                </span>
              </div>

              {/* Number Display & Range Slider */}
              <div className="mb-4">
                <div className="flex items-baseline justify-between mb-2">
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-4xl font-black tracking-tight"
                      style={{ color: primaryTheme.color }}
                    >
                      {number}
                    </span>
                    <span className="text-xs text-slate-400">
                      {primaryTheme.symmetryPair}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {activeCells.length} nodes
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="9"
                  value={number}
                  aria-label="Active Number"
                  onChange={(e) => setNumber( parseInt(e.target.value, 10) )}
                  className="w-full vedic-slider cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${colorsGradient})`,
                  }}
                />
              </div>

              {/* 1-9 Direct Number Buttons */}
              <div className="grid grid-cols-9 gap-1.5 mb-4">
                {NUMBER_THEMES.map((theme) => {
                  const isSelected = number === theme.number;
                  const isTwin =
                    showDual &&
                    complementNumber === theme.number &&
                    complementNumber !== number;
                  return (
                    <button
                      key={theme.number}
                      type="button"
                      onClick={() => setNumber(theme.number)}
                      className={`h-10 rounded-xl font-bold text-sm transition-all flex flex-col items-center justify-center relative ${
                        isSelected
                          ? "scale-105 text-white shadow-lg ring-2 ring-white"
                          : isTwin
                          ? "text-white ring-1 ring-dashed ring-white/70"
                          : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white"
                      }`}
                      style={{
                        backgroundColor:
                          isSelected || isTwin ? theme.color : undefined,
                        boxShadow: isSelected
                          ? `0 0 16px ${theme.color}88`
                          : undefined,
                      }}
                    >
                      {theme.number}
                    </button>
                  );
                })}
              </div>

              {/* Famous Vedic Mirror Pairs Quick-Select */}
              <div className="pt-3 border-t border-white/10">
                <div className="text-[11px] font-medium text-slate-400 mb-2">
                  Sacred Complement Pairs (9-Sum Harmonics):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SYMMETRY_PAIRS.map((pair) => {
                    const isPairActive =
                      number === pair.n ||
                      number === NUMBER_THEMES[pair.n - 1].complement;
                    return (
                      <button
                        key={pair.label}
                        type="button"
                        onClick={() => {
                          setNumber(pair.n);
                          if (pair.n !== 9) setShowDual(true);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                          isPairActive
                            ? "bg-white/15 border-white/30 text-white"
                            : "bg-slate-800/60 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                        }`}
                      >
                        {pair.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Card 2: Geometry & Animation Engine Controls */}
            <section className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                  Geometry &amp; FX Engine
                </h2>
                <span className="text-[11px] font-mono text-slate-400">
                  {connections.length} beams
                </span>
              </div>

              {/* Pattern Topology Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Connection Topology
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PATTERN_MODES.map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setPatternMode(mode.id)}
                      className={`p-2.5 rounded-xl text-left border transition-all ${
                        patternMode === mode.id
                          ? "bg-cyan-500/15 border-cyan-400/60 text-white shadow-md"
                          : "bg-slate-950/60 border-white/5 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                      }`}
                    >
                      <div className="text-xs font-bold">{mode.label}</div>
                      <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                        {mode.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3D Pillar Wave Mode */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  3D Pillar Wave Motion
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {WAVE_MODES.map((wm) => (
                    <button
                      key={wm.id}
                      type="button"
                      onClick={() => setWaveMode(wm.id)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all ${
                        waveMode === wm.id
                          ? "bg-white/15 border-white/40 text-white"
                          : "bg-slate-950/60 border-white/5 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {wm.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Effect Toggles */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowLines((v) => !v)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    showLines
                      ? "bg-emerald-500/15 border-emerald-400/50 text-emerald-200"
                      : "bg-slate-950/60 border-white/5 text-slate-400"
                  }`}
                >
                  <span>Connection Lines</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      showLines ? "bg-emerald-400" : "bg-slate-600"
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setShowPulses((v) => !v)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    showPulses && showLines
                      ? "bg-cyan-500/15 border-cyan-400/50 text-cyan-200"
                      : "bg-slate-950/60 border-white/5 text-slate-400"
                  }`}
                >
                  <span>Photon Pulses</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      showPulses && showLines ? "bg-cyan-400" : "bg-slate-600"
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setShowCrystals((v) => !v)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    showCrystals
                      ? "bg-pink-500/15 border-pink-400/50 text-pink-200"
                      : "bg-slate-950/60 border-white/5 text-slate-400"
                  }`}
                >
                  <span>Node Crystals</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      showCrystals ? "bg-pink-400" : "bg-slate-600"
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => setShowDual((v) => !v)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    showDual
                      ? "bg-purple-500/15 border-purple-400/50 text-purple-200"
                      : "bg-slate-950/60 border-white/5 text-slate-400"
                  }`}
                >
                  <span>9-Complement</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      showDual ? "bg-purple-400" : "bg-slate-600"
                    }`}
                  />
                </button>
              </div>

              {/* Precision Sliders */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Beam Thickness</span>
                    <span className="font-mono text-slate-200">
                      {lineThickness.toFixed(1)}×
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.4"
                    max="2.2"
                    step="0.1"
                    value={lineThickness}
                    onChange={(e) => setLineThickness(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Animation Speed</span>
                    <span className="font-mono text-slate-200">
                      {animationSpeed.toFixed(1)}×
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="2.5"
                    step="0.1"
                    value={animationSpeed}
                    onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">3D Pillar Elevation</span>
                    <span className="font-mono text-slate-200">
                      {elevationScale.toFixed(1)}×
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.4"
                    max="2.0"
                    step="0.1"
                    value={elevationScale}
                    onChange={(e) => setElevationScale(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
              </div>
            </section>

            {/* Card 3: Live Digital Root Formula Inspector */}
            <section className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Digital Root Inspector
                </h3>
                <span className="text-[11px] text-cyan-400 font-mono">
                  {hoveredCell ? "Live Hover" : "Active Sample"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 font-mono text-sm">
                <div className="flex items-center justify-between text-slate-300">
                  <span>
                    Row <strong className="text-white">{formulaBreakdown.row}</strong> × Col{" "}
                    <strong className="text-white">{formulaBreakdown.col}</strong>
                  </span>
                  <span className="text-slate-400">= {formulaBreakdown.product}</span>
                </div>

                {formulaBreakdown.steps.length > 0 ? (
                  <div className="mt-2 pt-2 border-t border-white/5 space-y-1 text-xs text-slate-400">
                    {formulaBreakdown.steps.map((step, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>Step {idx + 1}: {step.expression}</span>
                        <span className="text-slate-200 font-bold">= {step.result}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 pt-2 border-t border-white/5 text-xs text-slate-500">
                    Single digit product (already reduced)
                  </div>
                )}

                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Digital Root:</span>
                  <span
                    className="text-lg font-black px-2.5 py-0.5 rounded-lg"
                    style={{
                      color: NUMBER_THEMES[formulaBreakdown.root - 1].color,
                      backgroundColor: `${
                        NUMBER_THEMES[formulaBreakdown.root - 1].color
                      }20`,
                    }}
                  >
                    {formulaBreakdown.root}
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Viewport & Analytical Matrix (8 columns on xl) */}
          <div className="xl:col-span-8 space-y-6">
            {/* 3D Interactive Canvas Container */}
            <div
              className="relative w-full h-[560px] sm:h-[620px] rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#05070e]"
              style={{
                boxShadow: `0 20px 60px -15px ${primaryTheme.color}25`,
              }}
            >
              {/* Top-Left HUD Overlay */}
              <div className="pointer-events-none absolute top-4 left-4 z-20 max-w-sm bg-slate-950/75 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: primaryTheme.color,
                      boxShadow: `0 0 10px ${primaryTheme.color}`,
                    }}
                  />
                  <span className="font-bold text-sm text-white">
                    Root {number}: {primaryTheme.name}
                  </span>
                  {showDual && complementNumber !== number && (
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-md"
                      style={{
                        backgroundColor: `${complementTheme.color}30`,
                        color: complementTheme.accent,
                      }}
                    >
                      + Twin {complementNumber}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300/90 mt-1.5 leading-relaxed">
                  {primaryTheme.description}
                </p>

                {/* Live Telemetry Pills */}
                <div className="flex flex-wrap gap-2 mt-3 pt-2.5 border-t border-white/10 text-[11px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300">
                    Active Cells: <strong className="text-white">{activeCells.length}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300">
                    Connections: <strong className="text-white">{connections.length}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300">
                    Photons:{" "}
                    <strong className="text-cyan-300">
                      {showLines && showPulses ? connections.length * 2 : 0}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Top-Right Camera Preset Bar */}
              <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-slate-950/75 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
                {[
                  { id: "isometric", label: "3D Iso" },
                  { id: "top", label: "Top Mandala" },
                  { id: "front", label: "Front" },
                  { id: "side", label: "Side" },
                ].map((cam) => (
                  <button
                    key={cam.id}
                    type="button"
                    onClick={() => handleCameraSelect(cam.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      cameraPreset === cam.id
                        ? "bg-white text-slate-950 shadow"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {cam.label}
                  </button>
                ))}
              </div>

              {/* Bottom Controls Hint Bar */}
              <div className="pointer-events-none absolute bottom-3.5 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 bg-slate-950/70 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                <span>
                  Drag to rotate • Scroll to zoom • Click any 3D pillar to lock root
                </span>
                <span className="hidden sm:inline font-mono text-[11px] text-slate-400">
                  Keys: [1–9] Root • [Space] Auto-Tour • [D] Dual • [T] Top View
                </span>
              </div>

              {/* Three.js WebGL Scene */}
              <VedicScene
                cells={cells}
                activeNumber={number}
                complementNumber={complementNumber}
                showDual={showDual}
                showLines={showLines}
                showPulses={showPulses}
                showCrystals={showCrystals}
                primaryTheme={primaryTheme}
                complementTheme={complementTheme}
                connections={connections}
                lineThickness={lineThickness}
                animationSpeed={animationSpeed}
                elevationScale={elevationScale}
                waveMode={waveMode}
                cameraPreset={cameraPreset}
                presetTrigger={presetTrigger}
                autoRotate={autoRotate}
                hoveredCell={hoveredCell}
                onHoverCell={setHoveredCell}
                onSelectCell={handleSelectCell}
              />
            </div>

            {/* Bottom Analytical Row: 2D Interactive Matrix + Harmonic Sequence */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* 2D Vedic Square Map with SVG Overlay (6 cols) */}
              <div className="md:col-span-6 bg-slate-900/70 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      2D Sacred Matrix Overlay
                    </h3>
                    <p className="text-xs text-slate-400">
                      Click or hover any cell to sync with 3D space
                    </p>
                  </div>
                  <span
                    className="text-xs font-mono px-2.5 py-1 rounded-lg border"
                    style={{
                      color: primaryTheme.accent,
                      borderColor: `${primaryTheme.color}40`,
                      backgroundColor: `${primaryTheme.color}15`,
                    }}
                  >
                    9×9 Grid
                  </span>
                </div>

                <Matrix2D
                  cells={cells}
                  activeNumber={number}
                  complementNumber={complementNumber}
                  showDual={showDual}
                  showLines={showLines}
                  primaryTheme={primaryTheme}
                  complementTheme={complementTheme}
                  connections={connections}
                  hoveredCell={hoveredCell}
                  onHoverCell={setHoveredCell}
                  onSelectCell={handleSelectCell}
                />
              </div>

              {/* Digital Root Wave & Modular Cycle Analysis (6 cols) */}
              <div className="md:col-span-6 bg-slate-900/70 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Harmonic Row Sequence (×{number})
                      </h3>
                      <p className="text-xs text-slate-400">
                        Digital root oscillation across columns 1 to 9
                      </p>
                    </div>
                    <span className="text-xs font-mono text-cyan-300">
                      mod 9 cycle
                    </span>
                  </div>

                  {/* Bar chart of the 9 digital roots in row `number` */}
                  <div className="grid grid-cols-9 gap-2 items-end h-36 pt-6 pb-2 px-3 bg-slate-950/70 rounded-xl border border-white/5">
                    {rowSequence.map((item) => {
                      const heightPct = Math.round((item.root / 9) * 100);
                      const barTheme = NUMBER_THEMES[item.root - 1];
                      return (
                        <div
                          key={item.col}
                          className="flex flex-col items-center h-full justify-end group cursor-pointer"
                          onClick={() => setNumber(item.root)}
                          title={`${number} × ${item.col} = ${item.product} → Digital Root ${item.root}`}
                        >
                          <span className="text-[11px] font-bold text-white mb-1">
                            {item.root}
                          </span>
                          <div
                            className="w-full rounded-t-md transition-all duration-300 group-hover:brightness-125"
                            style={{
                              height: `${heightPct}%`,
                              backgroundColor: barTheme.color,
                              boxShadow: `0 0 10px ${barTheme.color}55`,
                            }}
                          />
                          <span className="text-[10px] font-mono text-slate-500 mt-1.5">
                            ×{item.col}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* How to Use / Guide Cards */}
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                    Interactive Guide
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                      <div className="font-semibold text-white mb-0.5">
                        1. Select Root
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        Choose digits 1–9 or click any cell to morph the 3D pillars.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                      <div className="font-semibold text-white mb-0.5">
                        2. Dual Mirror
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        Enable 9-Complement to overlay twin symmetries (e.g. 2 ↔ 7).
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                      <div className="font-semibold text-white mb-0.5">
                        3. Top Mandala
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        Switch camera to Top Mandala to inspect pure sacred geometry.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Creator Footer */}
        <footer className="mt-10 pt-6 border-t border-white/10">
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl p-5 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5">
              <VedicLogo
                primaryColor={primaryTheme.color}
                secondaryColor={complementTheme.color}
                number={number}
              />
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Created by</span>
                  <a
                    href="https://badr-moujahid.netlify.app/"
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-white/30 underline-offset-4 hover:text-cyan-300 transition-colors"
                    style={{ color: primaryTheme.accent }}
                  >
                    Badr Moujahid
                  </a>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Vedic Square 3D Sacred Geometry &amp; Digital Root Simulation
                </p>
              </div>
            </div>

            {/* Social & Contact Links */}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <a
                href="https://badr-moujahid.netlify.app/"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-white/10 hover:border-cyan-400/50 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-2 transition-all"
              >
                <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span>Portfolio</span>
              </a>

              <a
                href="https://github.com/MojaveMix"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-white/10 hover:border-white/30 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-2 transition-all"
              >
                <svg className="w-4 h-4 text-slate-200" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>GitHub</span>
              </a>

              <a
                href="https://www.linkedin.com/in/badr-moujahid-54a118286/"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-white/10 hover:border-sky-400/50 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-2 transition-all"
              >
                <svg className="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
                <span>LinkedIn</span>
              </a>

              <a
                href="mailto:badermouj@gmail.com"
                className="px-3.5 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-white/10 hover:border-pink-400/50 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-2 transition-all"
              >
                <svg className="w-4 h-4 text-pink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span>badermouj@gmail.com</span>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
