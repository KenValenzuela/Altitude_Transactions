import type { ReactNode } from 'react';

interface PhoneShellProps {
  children: ReactNode;
  width?: number;
  height?: number;
  dark?: boolean;
  label?: string;
}

export function PhoneShell({ children, width = 390, height = 844, dark = false, label }: PhoneShellProps) {
  return (
    <div data-screen-label={label} style={{
      width, height, borderRadius: 52, overflow: 'hidden',
      position: 'relative',
      background: dark ? '#0A1320' : 'var(--bone)',
      boxShadow: 'var(--sh-3)',
      fontFamily: 'var(--f-sans)',
      WebkitFontSmoothing: 'antialiased',
    }}>
      {/* dynamic island */}
      <div style={{
        position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
        width: 122, height: 36, borderRadius: 24, background: '#0A0C0A', zIndex: 80,
      }} />
      {/* status bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50,
        height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 30px', paddingTop: 18,
      }}>
        <span style={{
          fontFamily: '-apple-system, "SF Pro", system-ui',
          fontSize: 16, fontWeight: 600,
          color: dark ? '#fff' : 'var(--ink)',
        }}>9:41</span>
        <div style={{ width: 80 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6,
          color: dark ? '#fff' : 'var(--ink)' }}>
          <svg width="17" height="11" viewBox="0 0 17 11">
            <rect x="0" y="7" width="3" height="4" rx="0.7" fill="currentColor"/>
            <rect x="4.5" y="5" width="3" height="6" rx="0.7" fill="currentColor"/>
            <rect x="9" y="2.5" width="3" height="8.5" rx="0.7" fill="currentColor"/>
            <rect x="13.5" y="0" width="3" height="11" rx="0.7" fill="currentColor"/>
          </svg>
          <svg width="24" height="12" viewBox="0 0 25 12">
            <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="currentColor" strokeOpacity="0.4" fill="none"/>
            <rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor"/>
            <path d="M23 4 V8 C23.7 7.7 24.2 6.9 24.2 6 C24.2 5.1 23.7 4.3 23 4 Z" fill="currentColor" opacity="0.5"/>
          </svg>
        </div>
      </div>
      {/* content */}
      <div className="alt-screen" style={{ width: '100%', height: '100%' }}>
        {children}
      </div>
      {/* home indicator */}
      <div style={{
        position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
        width: 134, height: 5, borderRadius: 100,
        background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.32)',
        zIndex: 90,
      }} />
    </div>
  );
}
