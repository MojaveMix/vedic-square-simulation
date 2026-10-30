import React from "react";

export default function VedicLogo({ primaryColor, secondaryColor, number }) {
  return (
    <div
      className="relative w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 select-none overflow-hidden border border-white/15 bg-slate-950/90 transition-all duration-500 group"
      style={{
        boxShadow: `0 0 28px -4px ${primaryColor}66, inset 0 0 16px ${secondaryColor}33`,
      }}
    >
      <svg
        viewBox="0 0 64 64"
        className="w-12 h-12 transition-transform duration-700 group-hover:rotate-45"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Dashed Sacred Mandala Ring */}
        <circle
          cx="32"
          cy="32"
          r="27"
          stroke={primaryColor}
          strokeWidth="1.2"
          strokeOpacity="0.5"
          strokeDasharray="3 2.5"
        />

        {/* Axis-Aligned Vedic Diamond */}
        <polygon
          points="32,7 57,32 32,57 7,32"
          stroke={primaryColor}
          strokeWidth="2"
          strokeLinejoin="round"
          fill={primaryColor}
          fillOpacity="0.1"
        />

        {/* 45-Degree Complement Square (Octagram Star) */}
        <polygon
          points="14,14 50,14 50,50 14,50"
          stroke={secondaryColor}
          strokeWidth="1.8"
          strokeLinejoin="round"
          fill={secondaryColor}
          fillOpacity="0.08"
        />

        {/* Inner Harmonic Chords */}
        <line
          x1="14"
          y1="14"
          x2="50"
          y2="50"
          stroke={primaryColor}
          strokeWidth="1"
          strokeOpacity="0.45"
        />
        <line
          x1="50"
          y1="14"
          x2="14"
          y2="50"
          stroke={secondaryColor}
          strokeWidth="1"
          strokeOpacity="0.45"
        />

        {/* 8 Sacred Vertex Nodes */}
        <circle cx="32" cy="7" r="2.3" fill={primaryColor} />
        <circle cx="57" cy="32" r="2.3" fill={primaryColor} />
        <circle cx="32" cy="57" r="2.3" fill={primaryColor} />
        <circle cx="7" cy="32" r="2.3" fill={primaryColor} />

        <circle cx="14" cy="14" r="2" fill={secondaryColor} />
        <circle cx="50" cy="14" r="2" fill={secondaryColor} />
        <circle cx="50" cy="50" r="2" fill={secondaryColor} />
        <circle cx="14" cy="50" r="2" fill={secondaryColor} />
      </svg>

      {/* Center Active Root Badge */}
      <span
        className="absolute inset-0 flex items-center justify-center font-black text-base text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.95)]"
      >
        {number}
      </span>
    </div>
  );
}
