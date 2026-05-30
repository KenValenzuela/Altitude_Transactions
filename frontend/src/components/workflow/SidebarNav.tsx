'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MountainMark = () => (
  <svg width="22" height="17" viewBox="0 0 22 17" fill="none" aria-hidden="true">
    <path d="M11 1L17.5 12.5H4.5L11 1Z" fill="white" opacity="0.95" />
    <path d="M16 4.5L21.5 12.5H10.5L16 4.5Z" fill="white" opacity="0.55" />
    <path d="M5.5 6.5L10 12.5H1L5.5 6.5Z" fill="white" opacity="0.4" />
    <line x1="3" y1="12.5" x2="19" y2="12.5" stroke="white" strokeOpacity="0.25" strokeWidth="1"/>
  </svg>
);

const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
    <path d="M9 21V12h6v9"/>
  </svg>
);

const UploadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const FolderIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
);

const primaryLinks = [
  { href: '/dashboard',           label: 'Dashboard',      icon: HomeIcon },
  { href: '/upload',              label: 'Upload CTME',    icon: UploadIcon },
  { href: '/transactions/demo',   label: 'Demo workspace', icon: FolderIcon },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <header className="sidebar">
      <Link className="skip-link" href="#main-content">
        Skip to content
      </Link>

      {/* Brand area */}
      <Link
        className="sidebar__brand"
        href="/dashboard"
        aria-label="Altitude — return to dashboard"
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <span className="brand-mark" aria-hidden="true">
          <MountainMark />
        </span>
        <span>
          <strong style={{ display: 'block', fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.01em', color: 'white' }}>
            Altitude
          </strong>
          <small style={{ fontSize: '.73rem', color: 'rgba(255,255,255,.5)', letterSpacing: '.01em' }}>
            Transaction Operations
          </small>
        </span>
      </Link>

      {/* Section label */}
      <div style={{
        padding: '1.35rem 1rem .4rem',
        fontSize: '.67rem',
        fontWeight: 700,
        letterSpacing: '.12em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,.3)',
      }}>
        Navigation
      </div>

      <nav aria-label="Primary navigation">
        <ul style={{ listStyle: 'none', margin: 0, padding: '0 .5rem', display: 'grid', gap: '.25rem' }}>
          {primaryLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={isActive ? 'sidebar-nav-link--active' : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.75rem',
                    padding: '.7rem .85rem .7rem 1rem',
                    borderRadius: '.75rem',
                    fontSize: '.9rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--alt-gold)' : 'rgba(255,255,255,.7)',
                    background: isActive ? 'rgba(214,168,79,.1)' : 'transparent',
                    textDecoration: 'none',
                    transition: 'background .15s, color .15s',
                    minHeight: '44px',
                    position: 'relative',
                  }}
                >
                  <span style={{ opacity: isActive ? 1 : 0.7, flexShrink: 0 }}>
                    <link.icon />
                  </span>
                  {link.label}
                  {isActive && (
                    <span style={{
                      marginLeft: 'auto',
                      width: 6, height: 6,
                      borderRadius: 999,
                      background: 'var(--alt-gold)',
                      flexShrink: 0,
                      boxShadow: '0 0 6px rgba(214,168,79,.7)',
                    }} aria-hidden="true" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer note */}
      <aside className="sidebar-note">
        CTME is the source of truth for executed contracts.
        Altitude is your operational workflow layer — extract, review, and track.
      </aside>
    </header>
  );
}
