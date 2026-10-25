/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Realistic SVG Japanese Soroban Digital Abacus
 * Features biconical beveled beads, physical wooden textures, reckoning bar with unit dots,
 * touch/drag/click/keyboard controls, tactile sound effects, and lesson highlight glow.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  AbacusState,
  getRodValue,
  toggleUpperBead,
  setLowerBeads,
  setRodDigit,
  getShortPlaceLabel,
} from '../../engine/abacusEngine';
import { sounds } from '../../engine/soundEngine';
import { BeadColorPalette, AppTheme } from '../../context/AppContext';

interface AbacusProps {
  state: AbacusState;
  onChange: (newState: AbacusState) => void;
  palette?: BeadColorPalette;
  theme?: AppTheme;
  showValues?: boolean;
  interactive?: boolean;
  highlightRodIndex?: number;
  highlightUpper?: boolean;
  highlightLowerIndices?: number[];
  className?: string;
  maxHeight?: number;
}

export const Abacus: React.FC<AbacusProps> = ({
  state,
  onChange,
  palette = 'amber-wood',
  theme = 'classic-wood',
  showValues = true,
  interactive = true,
  highlightRodIndex,
  highlightUpper,
  highlightLowerIndices,
  className = '',
  maxHeight = 360,
}) => {
  const [focusedRod, setFocusedRod] = useState<number>(state.unitRodIndex);
  const containerRef = useRef<HTMLDivElement>(null);

  // SVG dimensions
  const rodCount = state.rods.length;
  const rodSpacing = 72; // width per rod
  const marginX = 48; // side frame width
  const svgWidth = marginX * 2 + rodCount * rodSpacing;
  const svgHeight = 320;

  // Deck geometry
  const upperDeckHeight = 85;
  const beamY = 105;
  const beamThickness = 16;
  const lowerDeckStartY = beamY + beamThickness; // 121
  const lowerDeckHeight = 185;

  // Bead dimensions (biconical diamond profile)
  const beadWidth = 56;
  const beadHeight = 26;
  
  // Upper bead movement:
  // At rest (unengaged): top of deck -> y = 22
  // Engaged: touching reckoning beam -> y = beamY - beadHeight = 105 - 26 = 79
  const upperRestY = 22;
  const upperEngagedY = beamY - beadHeight;

  // Lower bead movement:
  // There are 4 beads on lower deck.
  // Lower deck total vertical travel available = ~180px.
  // In Soroban, beads pushed towards the beam touch each other near the beam.
  // Beads resting at the bottom touch each other near the lower frame.
  // Engaged: stacked from beam downwards. Bead k (0..lower-1) sits at beamY + beamThickness + k * (beadHeight + 1)
  // Unengaged: stacked from bottom upwards.
  const lowerBottomBaseY = svgHeight - 20;

  // Keyboard accessibility
  useEffect(() => {
    if (!interactive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is typing in an input field, do not hijack
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setFocusedRod(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setFocusedRod(prev => Math.min(rodCount - 1, prev + 1));
      } else if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        const digit = parseInt(e.key, 10);
        const newState = setRodDigit(state, focusedRod, digit);
        onChange(newState);
        sounds.playBeadClick(digit >= 5, true);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const current = getRodValue(state.rods[focusedRod]);
        if (current < 9) {
          onChange(setRodDigit(state, focusedRod, current + 1));
          sounds.playBeadClick(current + 1 >= 5, true);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const current = getRodValue(state.rods[focusedRod]);
        if (current > 0) {
          onChange(setRodDigit(state, focusedRod, current - 1));
          sounds.playBeadClick(current - 1 >= 5, false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [interactive, state, focusedRod, rodCount, onChange]);

  // Handle Upper Bead Click
  const handleUpperClick = (rodIndex: number) => {
    if (!interactive) return;
    const isNowEngaged = !state.rods[rodIndex].upper;
    sounds.playBeadClick(true, isNowEngaged);
    onChange(toggleUpperBead(state, rodIndex));
    setFocusedRod(rodIndex);
  };

  // Handle Lower Bead Click:
  // In physical soroban, clicking on lower bead i (0..3):
  // If bead i is currently engaged, clicking it and any below it pushes them DOWN (disengaging).
  // If bead i is currently at rest, clicking it pushes it and any above it UP (engaging).
  const handleLowerClick = (rodIndex: number, beadIndex: number) => {
    if (!interactive) return;
    const currentEngaged = state.rods[rodIndex].lower;
    // Lower beads are 0, 1, 2, 3 where 0 is closest to beam.
    let nextEngaged = currentEngaged;

    if (beadIndex < currentEngaged) {
      // It is currently engaged. Clicking it sets engaged count to beadIndex
      nextEngaged = beadIndex;
      sounds.playBeadClick(false, false);
    } else {
      // It is currently unengaged. Clicking it pushes up to include beadIndex (so beadIndex + 1 are engaged)
      nextEngaged = beadIndex + 1;
      sounds.playBeadClick(false, true);
    }

    onChange(setLowerBeads(state, rodIndex, nextEngaged));
    setFocusedRod(rodIndex);
  };

  // Bead colors
  const getBeadFill = (rodIndex: number, isUpper: boolean) => {
    if (palette === 'ruby-sapphire') {
      return isUpper ? 'url(#beadRubyGrad)' : 'url(#beadSapphireGrad)';
    }
    if (palette === 'emerald-jade') {
      return 'url(#beadJadeGrad)';
    }
    if (palette === 'rainbow-place') {
      const colors = ['#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#6366f1', '#a855f7'];
      const c = colors[rodIndex % colors.length];
      return c;
    }
    if (palette === 'high-contrast') {
      return isUpper ? '#fde047' : '#ffffff';
    }
    // Classic Amber Wood
    return isUpper ? 'url(#beadAmberDarkGrad)' : 'url(#beadAmberGrad)';
  };

  // Frame colors
  const frameBorder = theme === 'ebony-gold' ? '#334155' : theme === 'modern-slate' ? '#475569' : '#572608';
  const beamFill = theme === 'ebony-gold' ? '#1e293b' : theme === 'modern-slate' ? '#334155' : 'url(#beamWoodGrad)';
  const rodFill = theme === 'ebony-gold' ? '#e2e8f0' : 'url(#rodBrassGrad)';

  return (
    <div
      ref={containerRef}
      className={`relative select-none flex flex-col items-center justify-center p-1 sm:p-2 rounded-2xl overflow-x-auto touch-pan-x ${className}`}
      style={{ maxHeight }}
      tabIndex={interactive ? 0 : -1}
      aria-label="Interactive Soroban Abacus"
    >
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto drop-shadow-2xl transition-all duration-300"
        style={{ minWidth: Math.min(svgWidth, 330), maxWidth: Math.min(svgWidth, 920), touchAction: 'manipulation' }}
      >
        <defs>
          {/* Wooden Frame Gradients */}
          <linearGradient id="frameWoodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="50%" stopColor="#451a03" />
            <stop offset="100%" stopColor="#290e02" />
          </linearGradient>

          <linearGradient id="beamWoodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#b45309" />
            <stop offset="40%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>

          {/* Brass Rods */}
          <linearGradient id="rodBrassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="35%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>

          {/* Classic Amber Beads */}
          <linearGradient id="beadAmberGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="30%" stopColor="#fb923c" />
            <stop offset="70%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#9a3412" />
          </linearGradient>

          <linearGradient id="beadAmberDarkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="25%" stopColor="#f97316" />
            <stop offset="75%" stopColor="#c2410c" />
            <stop offset="100%" stopColor="#7c2d12" />
          </linearGradient>

          {/* Sapphire Grad */}
          <linearGradient id="beadSapphireGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="40%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          {/* Ruby Grad */}
          <linearGradient id="beadRubyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fecdd3" />
            <stop offset="40%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#9f1239" />
          </linearGradient>

          {/* Jade Grad */}
          <linearGradient id="beadJadeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a7f3d0" />
            <stop offset="40%" stopColor="#059669" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>

          {/* Drop Shadows */}
          <filter id="beadShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodOpacity="0.4" />
          </filter>

          <filter id="glowGold" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#facc15" floodOpacity="0.9" />
          </filter>
        </defs>

        {/* Outer Wooden Frame */}
        <rect
          x="4"
          y="4"
          width={svgWidth - 8}
          height={svgHeight - 8}
          rx="12"
          fill={theme === 'ebony-gold' ? '#0f172a' : 'url(#frameWoodGrad)'}
          stroke={frameBorder}
          strokeWidth="6"
        />

        {/* Inner Cutout (felt backing / recessed deck) */}
        <rect
          x={marginX - 8}
          y="18"
          width={rodCount * rodSpacing + 16}
          height={svgHeight - 36}
          rx="4"
          fill={theme === 'ebony-gold' ? '#020617' : theme === 'modern-slate' ? '#0f172a' : '#1e1b18'}
          stroke="#000000"
          strokeWidth="3"
        />

        {/* Vertical Rods */}
        {state.rods.map((_, i) => {
          const rx = marginX + i * rodSpacing + rodSpacing / 2;
          const isFocused = i === focusedRod;
          const isHighlighted = highlightRodIndex === i;

          return (
            <g key={`rod-${i}`}>
              {/* Rod selection / highlight back light */}
              {(isFocused || isHighlighted) && (
                <rect
                  x={rx - 24}
                  y="20"
                  width="48"
                  height={svgHeight - 40}
                  fill={isHighlighted ? 'rgba(250, 204, 21, 0.15)' : 'rgba(56, 189, 248, 0.08)'}
                  rx="6"
                />
              )}

              {/* The physical rod bar */}
              <rect
                x={rx - 3}
                y="20"
                width="6"
                height={svgHeight - 40}
                rx="3"
                fill={rodFill}
                stroke="#334155"
                strokeWidth="0.5"
              />
            </g>
          );
        })}

        {/* Horizontal Reckoning Beam (Bar) */}
        <g id="reckoning-beam">
          <rect
            x={marginX - 10}
            y={beamY}
            width={rodCount * rodSpacing + 20}
            height={beamThickness}
            fill={beamFill}
            stroke="#1c1917"
            strokeWidth="1.5"
            filter="url(#beadShadow)"
          />

          {/* Reckoning Unit Dots (White / Brass Dots) */}
          {state.rods.map((_, i) => {
            const rx = marginX + i * rodSpacing + rodSpacing / 2;
            const power = state.unitRodIndex - i;
            // Place dot on unit rod (10^0), thousands (10^3), millions (10^6), etc.
            const hasDot = power === 0 || (power > 0 && power % 3 === 0);

            if (!hasDot) return null;
            return (
              <circle
                key={`unit-dot-${i}`}
                cx={rx}
                cy={beamY + beamThickness / 2}
                r="3.5"
                fill="#ffffff"
                stroke="#1e293b"
                strokeWidth="1"
              />
            );
          })}
        </g>

        {/* Beads for each rod */}
        {state.rods.map((rod, i) => {
          const rx = marginX + i * rodSpacing + rodSpacing / 2;
          const isRodHighlighted = highlightRodIndex === i;

          // Upper bead
          const upperY = rod.upper ? upperEngagedY : upperRestY;
          const isUpperHighlighted = isRodHighlighted && highlightUpper;

          // Lower beads: 4 beads total.
          // In Soroban, bead k (0..3):
          // Engaged beads (k < rod.lower) are positioned just below reckoning beam.
          // Unengaged beads (k >= rod.lower) are pushed down to bottom rail.
          const lowerBeadPositions: number[] = [];
          for (let k = 0; k < 4; k++) {
            if (k < rod.lower) {
              // Engaged: sit right below beam
              lowerBeadPositions.push(lowerDeckStartY + k * (beadHeight + 1.5));
            } else {
              // Unengaged: stack from bottom of deck
              // bottom bead (k=3) is at lowerBottomBaseY - beadHeight
              // bead k sits at:
              const unengagedRank = 3 - k; // 0 for k=3 (bottom), 1 for k=2, etc.
              lowerBeadPositions.push(lowerBottomBaseY - beadHeight - unengagedRank * (beadHeight + 1.5));
            }
          }

          return (
            <g key={`beads-rod-${i}`}>
              {/* UPPER BEAD */}
              <g
                className={interactive ? 'cursor-pointer hover:opacity-95 active:scale-95 transition-transform' : ''}
                onClick={() => handleUpperClick(i)}
                filter={isUpperHighlighted ? 'url(#glowGold)' : 'url(#beadShadow)'}
              >
                {/* Biconical bead shape */}
                <polygon
                  points={`
                    ${rx - beadWidth / 2},${upperY + beadHeight / 2}
                    ${rx - beadWidth / 4},${upperY}
                    ${rx + beadWidth / 4},${upperY}
                    ${rx + beadWidth / 2},${upperY + beadHeight / 2}
                    ${rx + beadWidth / 4},${upperY + beadHeight}
                    ${rx - beadWidth / 4},${upperY + beadHeight}
                  `}
                  fill={getBeadFill(i, true)}
                  stroke={isUpperHighlighted ? '#fde047' : '#78350f'}
                  strokeWidth={isUpperHighlighted ? 2.5 : 1}
                  className="transition-all duration-150 ease-out"
                />
                {/* Highlight ridge reflection line */}
                <line
                  x1={rx - beadWidth / 2 + 4}
                  y1={upperY + beadHeight / 2}
                  x2={rx + beadWidth / 2 - 4}
                  y2={upperY + beadHeight / 2}
                  stroke="rgba(255, 255, 255, 0.45)"
                  strokeWidth="1.2"
                />
              </g>

              {/* LOWER BEADS (4 BEADS) */}
              {lowerBeadPositions.map((by, k) => {
                const isEngaged = k < rod.lower;
                const isLowerHighlighted = isRodHighlighted && highlightLowerIndices?.includes(k);

                return (
                  <g
                    key={`lower-bead-${i}-${k}`}
                    className={interactive ? 'cursor-pointer hover:opacity-95 active:scale-95 transition-transform' : ''}
                    onClick={() => handleLowerClick(i, k)}
                    filter={isLowerHighlighted ? 'url(#glowGold)' : 'url(#beadShadow)'}
                  >
                    <polygon
                      points={`
                        ${rx - beadWidth / 2},${by + beadHeight / 2}
                        ${rx - beadWidth / 4},${by}
                        ${rx + beadWidth / 4},${by}
                        ${rx + beadWidth / 2},${by + beadHeight / 2}
                        ${rx + beadWidth / 4},${by + beadHeight}
                        ${rx - beadWidth / 4},${by + beadHeight}
                      `}
                      fill={getBeadFill(i, false)}
                      stroke={isLowerHighlighted ? '#fde047' : '#78350f'}
                      strokeWidth={isLowerHighlighted ? 2.5 : 1}
                      className="transition-all duration-150 ease-out"
                    />
                    {/* Reflection line */}
                    <line
                      x1={rx - beadWidth / 2 + 4}
                      y1={by + beadHeight / 2}
                      x2={rx + beadWidth / 2 - 4}
                      y2={by + beadHeight / 2}
                      stroke="rgba(255, 255, 255, 0.45)"
                      strokeWidth="1.2"
                    />
                  </g>
                );
              })}

              {/* Place Value Label (Top) */}
              <text
                x={rx}
                y="15"
                textAnchor="middle"
                fontSize="10"
                fontWeight="700"
                fill={i === state.unitRodIndex ? '#38bdf8' : '#94a3b8'}
                fontFamily="sans-serif"
              >
                {getShortPlaceLabel(i, state.unitRodIndex)}
              </text>

              {/* Rod Digit Value (Bottom) */}
              {showValues && (
                <g>
                  <circle
                    cx={rx}
                    cy={svgHeight - 11}
                    r="8.5"
                    fill={getRodValue(rod) > 0 ? '#0284c7' : '#334155'}
                  />
                  <text
                    x={rx}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="800"
                    fill="#ffffff"
                    fontFamily="monospace"
                  >
                    {getRodValue(rod)}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Decorative Brass Corner Plates */}
        <path d="M 6,6 L 24,6 L 6,24 Z" fill="#d97706" opacity="0.8" />
        <path d={`M ${svgWidth - 6},6 L ${svgWidth - 24},6 L ${svgWidth - 6},24 Z`} fill="#d97706" opacity="0.8" />
        <path d={`M 6,${svgHeight - 6} L 24,${svgHeight - 6} L 6,${svgHeight - 24} Z`} fill="#d97706" opacity="0.8" />
        <path d={`M ${svgWidth - 6},${svgHeight - 6} L ${svgWidth - 24},${svgHeight - 6} L ${svgWidth - 6},${svgHeight - 24} Z`} fill="#d97706" opacity="0.8" />
      </svg>
    </div>
  );
};
