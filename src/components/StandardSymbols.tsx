/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ComponentType } from '../types/circuit';

interface SymbolProps {
  type: ComponentType;
  width?: number;
  height?: number;
  className?: string;
  color?: string;
}

/**
 * Standard ANSI/IEEE and IEC miniature logic and electronic symbol renderer.
 * Ensures every component shows clear electronic schematic symbology.
 */
export const MiniatureStandardSymbol: React.FC<SymbolProps> = ({
  type,
  width = 28,
  height = 20,
  className = '',
  color = 'currentColor',
}) => {
  switch (type) {
    case 'AND':
      return (
        <svg width={width} height={height} viewBox="0 0 28 20" className={className} fill="none">
          <path
            d="M 4 2 L 14 2 C 20 2 24 6 24 10 C 24 14 20 18 14 18 L 4 18 Z"
            stroke={color}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'NAND':
      return (
        <svg width={width} height={height} viewBox="0 0 28 20" className={className} fill="none">
          <path
            d="M 3 2 L 12 2 C 17 2 20 6 20 10 C 20 14 17 18 12 18 L 3 18 Z"
            stroke={color}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="23" cy="10" r="2.2" stroke={color} strokeWidth="1.6" />
        </svg>
      );

    case 'OR':
      return (
        <svg width={width} height={height} viewBox="0 0 28 20" className={className} fill="none">
          <path
            d="M 3 2 C 7 7 7 13 3 18 C 11 18 20 15 25 10 C 20 5 11 2 3 2 Z"
            stroke={color}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'NOR':
      return (
        <svg width={width} height={height} viewBox="0 0 28 20" className={className} fill="none">
          <path
            d="M 2 2 C 6 7 6 13 2 18 C 9 18 17 15 21 10 C 17 5 9 2 2 2 Z"
            stroke={color}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="24" cy="10" r="2.2" stroke={color} strokeWidth="1.6" />
        </svg>
      );

    case 'XOR':
      return (
        <svg width={width} height={height} viewBox="0 0 28 20" className={className} fill="none">
          <path d="M 2 2 C 6 7 6 13 2 18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
          <path
            d="M 6 2 C 9 7 9 13 6 18 C 13 18 21 15 25 10 C 21 5 13 2 6 2 Z"
            stroke={color}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'XNOR':
      return (
        <svg width={width} height={height} viewBox="0 0 28 20" className={className} fill="none">
          <path d="M 2 2 C 5 7 5 13 2 18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
          <path
            d="M 5 2 C 8 7 8 13 5 18 C 11 18 18 15 21 10 C 18 5 11 2 5 2 Z"
            stroke={color}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="24.5" cy="10" r="2" stroke={color} strokeWidth="1.6" />
        </svg>
      );

    case 'NOT':
      return (
        <svg width={width} height={height} viewBox="0 0 28 20" className={className} fill="none">
          <polygon points="4,2 20,10 4,18" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
          <circle cx="23" cy="10" r="2.2" stroke={color} strokeWidth="1.6" />
        </svg>
      );

    case 'BUFFER':
      return (
        <svg width={width} height={height} viewBox="0 0 28 20" className={className} fill="none">
          <polygon points="5,2 23,10 5,18" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );

    case 'TRI_STATE':
      return (
        <svg width={width} height={height} viewBox="0 0 28 20" className={className} fill="none">
          <polygon points="5,2 23,10 5,18" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
          <line x1="14" y1="18" x2="14" y2="10" stroke={color} strokeWidth="1.5" strokeDasharray="1 1" />
        </svg>
      );

    case 'SWITCH':
      return (
        <svg width={width} height={height} viewBox="0 0 28 20" className={className} fill="none">
          <circle cx="5" cy="10" r="2" stroke={color} strokeWidth="1.6" />
          <circle cx="23" cy="10" r="2" stroke={color} strokeWidth="1.6" />
          <line x1="6" y1="9" x2="19" y2="4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );

    case 'BUTTON':
      return (
        <svg width={width} height={height} viewBox="0 0 28 20" className={className} fill="none">
          <line x1="4" y1="14" x2="10" y2="14" stroke={color} strokeWidth="1.6" />
          <line x1="18" y1="14" x2="24" y2="14" stroke={color} strokeWidth="1.6" />
          <line x1="8" y1="8" x2="20" y2="8" stroke={color} strokeWidth="2" />
          <line x1="14" y1="8" x2="14" y2="2" stroke={color} strokeWidth="1.6" />
        </svg>
      );

    case 'CLOCK':
      return (
        <svg width={width} height={height} viewBox="0 0 28 20" className={className} fill="none">
          <path
            d="M 3 14 L 8 14 L 8 6 L 15 6 L 15 14 L 21 14 L 21 6 L 25 6"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'VCC':
      return (
        <svg width={width} height={height} viewBox="0 0 28 20" className={className} fill="none">
          <line x1="14" y1="18" x2="14" y2="6" stroke={color} strokeWidth="2" />
          <line x1="6" y1="6" x2="22" y2="6" stroke={color} strokeWidth="2.4" />
        </svg>
      );

    case 'GND':
      return (
        <svg width={width} height={height} viewBox="0 0 28 20" className={className} fill="none">
          <line x1="14" y1="2" x2="14" y2="8" stroke={color} strokeWidth="2" />
          <line x1="6" y1="8" x2="22" y2="8" stroke={color} strokeWidth="2" />
          <line x1="9" y1="12" x2="19" y2="12" stroke={color} strokeWidth="1.8" />
          <line x1="12" y1="16" x2="16" y2="16" stroke={color} strokeWidth="1.6" />
        </svg>
      );

    case 'LED':
      return (
        <svg width={width} height={height} viewBox="0 0 28 20" className={className} fill="none">
          <polygon points="6,4 16,10 6,16" stroke={color} strokeWidth="1.6" />
          <line x1="16" y1="4" x2="16" y2="16" stroke={color} strokeWidth="2" />
          {/* Emission arrows */}
          <line x1="13" y1="4" x2="19" y2="1" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
          <line x1="17" y1="6" x2="23" y2="3" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );

    case 'DISPLAY_HEX':
    case 'DISPLAY_7SEG':
      return (
        <svg width={width} height={height} viewBox="0 0 28 20" className={className} fill="none">
          <rect x="7" y="2" width="14" height="16" rx="2" stroke={color} strokeWidth="1.5" />
          <path d="M 10 5 L 18 5 M 10 10 L 18 10 M 10 15 L 18 15" stroke={color} strokeWidth="1.5" />
        </svg>
      );

    case 'FLIPFLOP_D':
    case 'FLIPFLOP_JK':
    case 'FLIPFLOP_T':
    case 'SR_LATCH':
      return (
        <svg width={width} height={height} viewBox="0 0 28 20" className={className} fill="none">
          <rect x="4" y="2" width="20" height="16" rx="1.5" stroke={color} strokeWidth="1.6" />
          <polyline points="4,13 8,10 4,7" stroke={color} strokeWidth="1.4" fill="none" />
        </svg>
      );

    case 'FULL_ADDER':
    case 'HALF_ADDER':
      return (
        <svg width={width} height={height} viewBox="0 0 28 20" className={className} fill="none">
          <rect x="4" y="2" width="20" height="16" rx="1.5" stroke={color} strokeWidth="1.6" />
          <text
            x="14"
            y="13"
            fontSize="9"
            fontWeight="bold"
            textAnchor="middle"
            fill={color}
            fontFamily="monospace"
          >
            Σ
          </text>
        </svg>
      );

    case 'MUX_2TO1':
    case 'MUX_4TO1':
      return (
        <svg width={width} height={height} viewBox="0 0 28 20" className={className} fill="none">
          <polygon points="5,2 23,5 23,15 5,18" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );

    case 'CUSTOM_IC':
    default:
      return (
        <svg width={width} height={height} viewBox="0 0 28 20" className={className} fill="none">
          <rect x="5" y="3" width="18" height="14" rx="2" stroke={color} strokeWidth="1.6" />
          <circle cx="9" cy="6" r="1.2" fill={color} />
          <line x1="2" y1="7" x2="5" y2="7" stroke={color} strokeWidth="1.4" />
          <line x1="2" y1="13" x2="5" y2="13" stroke={color} strokeWidth="1.4" />
          <line x1="23" y1="7" x2="26" y2="7" stroke={color} strokeWidth="1.4" />
          <line x1="23" y1="13" x2="26" y2="13" stroke={color} strokeWidth="1.4" />
        </svg>
      );
  }
};
