'use client';
import { useId } from 'react';

interface MonogramProps {
  size?: number;
  color?: string;
}

export function Monogram({ size = 32, color }: MonogramProps) {
  const uid = useId().replace(/:/g, '');
  const gid = `mg-${uid}`;

  if (color) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="15.5" stroke={color} strokeOpacity="0.18" />
        <path d="M5 22 L13 11 L17.5 17 L22 13 L27 22 Z" fill={color} fillOpacity="0.9"/>
        <path d="M5 22 L13 11 L17.5 17 L22 13 L27 22" stroke={color} strokeWidth="1" strokeLinejoin="round" fill="none"/>
        <path d="M7 24 H25" stroke={color} strokeWidth="0.6" strokeOpacity="0.5"/>
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="4" y1="9" x2="28" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#E7CB7E"/>
          <stop offset="0.42" stopColor="#C9A14A"/>
          <stop offset="0.78" stopColor="#9C7726"/>
          <stop offset="1" stopColor="#D8B968"/>
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="15.5" fill="#14223F"/>
      <circle cx="16" cy="16" r="15.25" stroke={`url(#${gid})`} strokeOpacity="0.55" strokeWidth="0.5"/>
      <path d="M5 22 L13 11 L17.5 17 L22 13 L27 22 Z" fill={`url(#${gid})`}/>
      <path d="M5 22 L13 11 L17.5 17 L22 13 L27 22" stroke="#E7CB7E" strokeOpacity="0.6" strokeWidth="0.75" strokeLinejoin="round" fill="none"/>
      <path d="M7 24 H25" stroke={`url(#${gid})`} strokeWidth="0.6" strokeOpacity="0.4"/>
    </svg>
  );
}
