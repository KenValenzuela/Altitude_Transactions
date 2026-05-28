export const Icon = {
  home: (on: boolean) => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M3 10 L11 3 L19 10 V18 A1 1 0 0 1 18 19 H14 V14 H8 V19 H4 A1 1 0 0 1 3 18 Z"
        stroke="currentColor" strokeWidth={on ? 1.8 : 1.4} strokeLinejoin="round" fill={on ? 'rgba(30,58,102,.16)' : 'none'}/>
    </svg>
  ),
  list: (on: boolean) => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="4" width="2.5" height="2.5" rx="0.5" fill="currentColor" opacity={on ? 1 : 0.7}/>
      <rect x="3" y="10" width="2.5" height="2.5" rx="0.5" fill="currentColor" opacity={on ? 1 : 0.7}/>
      <rect x="3" y="16" width="2.5" height="2.5" rx="0.5" fill="currentColor" opacity={on ? 1 : 0.7}/>
      <path d="M8 5.25 H19 M8 11.25 H19 M8 17.25 H19" stroke="currentColor" strokeWidth={on ? 1.7 : 1.3} strokeLinecap="round"/>
    </svg>
  ),
  calendar: (on: boolean) => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth={on ? 1.7 : 1.3} fill={on ? 'rgba(30,58,102,.12)' : 'none'}/>
      <path d="M3 9 H19" stroke="currentColor" strokeWidth={on ? 1.7 : 1.3}/>
      <path d="M7 3 V6 M15 3 V6" stroke="currentColor" strokeWidth={on ? 1.7 : 1.3} strokeLinecap="round"/>
      <circle cx="11" cy="14" r="1.5" fill="currentColor"/>
    </svg>
  ),
  people: (on: boolean) => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth={on ? 1.7 : 1.3} fill={on ? 'rgba(30,58,102,.12)' : 'none'}/>
      <path d="M2 18 C2 14 5 12 8 12 C11 12 14 14 14 18" stroke="currentColor" strokeWidth={on ? 1.7 : 1.3} strokeLinecap="round" fill="none"/>
      <circle cx="15" cy="9" r="2.4" stroke="currentColor" strokeWidth={on ? 1.4 : 1.1} fill="none"/>
      <path d="M14 14 C16 13.5 19 14 20 17" stroke="currentColor" strokeWidth={on ? 1.4 : 1.1} strokeLinecap="round" fill="none"/>
    </svg>
  ),
  doc: (on: boolean) => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M5 3 H13 L18 8 V18 A1 1 0 0 1 17 19 H5 A1 1 0 0 1 4 18 V4 A1 1 0 0 1 5 3 Z"
        stroke="currentColor" strokeWidth={on ? 1.7 : 1.3} fill={on ? 'rgba(30,58,102,.12)' : 'none'}/>
      <path d="M13 3 V8 H18" stroke="currentColor" strokeWidth={on ? 1.7 : 1.3} fill="none"/>
    </svg>
  ),
  back: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M12.5 4 L6 10 L12.5 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  plus: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2 V14 M2 8 H14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  upload: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 11 V2 M5 5 L8 2 L11 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 11 V13 A1 1 0 0 0 4 14 H12 A1 1 0 0 0 13 13 V11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  bell: () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M4 13 V9 A5 5 0 0 1 14 9 V13 L15 14 H3 Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
      <path d="M7.5 16 Q9 17 10.5 16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  search: () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M12 12 L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  chevR: () => (
    <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
      <path d="M2 2 L7 7 L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  alert: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1 L13 12 H1 Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
      <path d="M7 5 V8 M7 10 V10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  sparkle: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1 L8.3 5.7 L13 7 L8.3 8.3 L7 13 L5.7 8.3 L1 7 L5.7 5.7 Z" fill="currentColor"/>
    </svg>
  ),
  check: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 7.2 L6 10 L11 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};
