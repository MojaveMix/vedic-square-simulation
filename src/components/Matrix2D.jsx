import React from "react";

export default function Matrix2D({
  cells,
  activeNumber,
  complementNumber,
  showDual,
  showLines,
  primaryTheme,
  complementTheme,
  connections,
  hoveredCell,
  onHoverCell,
  onSelectCell,
}) {
  // Convert cell (r, c) in 0..8 to percentage coordinates (center of cell in 9x9 grid)
  const toCoord = (idx) => ((idx + 0.5) / 9) * 100;

  return (
    <div className="relative select-none">
      {/* Column Headers */}
      <div className="grid grid-cols-10 gap-1 mb-1 text-[11px] font-mono text-slate-400">
        <div className="flex items-center justify-center font-bold text-cyan-400">
          ×
        </div>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((col) => (
          <div
            key={col}
            className={`flex items-center justify-center py-0.5 rounded transition-colors ${
              hoveredCell?.col === col
                ? "bg-slate-800 text-white font-bold"
                : ""
            }`}
          >
            {col}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-10 gap-1 items-center">
        {/* Row Headers (left column) */}
        <div className="col-span-1 grid grid-rows-9 gap-1 text-[11px] font-mono text-slate-400 h-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((row) => (
            <div
              key={row}
              className={`flex items-center justify-center h-8 rounded transition-colors ${
                hoveredCell?.row === row
                  ? "bg-slate-800 text-white font-bold"
                  : ""
              }`}
            >
              {row}
            </div>
          ))}
        </div>

        {/* 9x9 Grid + SVG Sacred Geometry Overlay */}
        <div className="col-span-9 relative aspect-square w-full">
          <div className="grid grid-cols-9 grid-rows-9 gap-1 w-full h-full">
            {cells.map((cell) => {
              const isPrimary = cell.value === activeNumber;
              const isComplement =
                showDual &&
                complementNumber !== activeNumber &&
                cell.value === complementNumber;
              const isHovered = hoveredCell?.id === cell.id;

              return (
                <button
                  key={cell.id}
                  type="button"
                  onMouseEnter={() => onHoverCell(cell)}
                  onMouseLeave={() => onHoverCell(null)}
                  onClick={() => onSelectCell(cell)}
                  className={`relative z-10 flex items-center justify-center rounded-md text-xs font-bold transition-all duration-200 ${
                    isPrimary
                      ? "scale-105 text-white shadow-lg ring-1 ring-white/60"
                      : isComplement
                      ? "scale-100 text-white ring-1 ring-white/40"
                      : isHovered
                      ? "bg-slate-700 text-white ring-1 ring-cyan-400"
                      : "bg-slate-900/90 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                  style={{
                    backgroundColor: isPrimary
                      ? primaryTheme.color
                      : isComplement
                      ? complementTheme.color
                      : undefined,
                    boxShadow: isPrimary
                      ? `0 0 12px ${primaryTheme.color}80`
                      : isComplement
                      ? `0 0 8px ${complementTheme.color}66`
                      : undefined,
                  }}
                  title={`${cell.row} × ${cell.col} = ${cell.product} → Digital Root ${cell.value}`}
                >
                  {cell.value}
                </button>
              );
            })}
          </div>

          {/* 2D Geometric Overlay */}
          {showLines && connections.length > 0 && (
            <svg
              viewBox="0 0 100 100"
              className="pointer-events-none absolute inset-0 z-20 w-full h-full overflow-visible"
            >
              <defs>
                <filter id="glow-2d" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="0.9" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {connections.map((conn) => {
                const x1 = toCoord(conn.fromCell.c);
                const y1 = toCoord(conn.fromCell.r);
                const x2 = toCoord(conn.toCell.c);
                const y2 = toCoord(conn.toCell.r);
                return (
                  <line
                    key={conn.id}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={conn.color}
                    strokeWidth={conn.isSecondary ? "0.6" : "0.85"}
                    strokeDasharray={conn.isDashed ? "1.6 1.1" : undefined}
                    strokeOpacity={conn.isSecondary ? "0.6" : "0.85"}
                    filter="url(#glow-2d)"
                  />
                );
              })}
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
