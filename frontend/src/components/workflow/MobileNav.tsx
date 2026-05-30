'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
    <path d="M9 21V12h6v9"/>
  </svg>
);

const UploadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const FolderIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
);

const links = [
  { href: '/dashboard',         label: 'Dashboard', Icon: HomeIcon },
  { href: '/upload',            label: 'Upload',    Icon: UploadIcon },
  { href: '/transactions/demo', label: 'Workspace', Icon: FolderIcon },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav" aria-label="Primary navigation">
      <ul>
        {links.map(({ href, label, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <li key={href} style={{ position: 'relative' }}>
              {isActive && (
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: 6,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 4,
                    height: 4,
                    borderRadius: 999,
                    background: 'var(--alt-gold)',
                    boxShadow: '0 0 6px rgba(214,168,79,.8)',
                  }}
                />
              )}
              <Link
                href={href}
                style={{
                  color: isActive ? 'var(--alt-gold)' : 'rgba(255,255,255,.55)',
                }}
              >
                <Icon />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
