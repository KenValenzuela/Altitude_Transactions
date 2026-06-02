'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {getStoredUser} from '@/lib/api-client';

/* ── Inline SVG icons (1.75px stroke, Lucide-style) ── */
function IcDashboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
}
function IcFolder() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
function IcFolderOpen() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 14l1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2A2 2 0 0 0 11.11 6H18a2 2 0 0 1 2 2v2"/>
    </svg>
  );
}
function IcCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
      <circle cx="12" cy="16" r="1" fill="currentColor"/>
    </svg>
  );
}
function IcUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function IcShield() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}
function IcUpload() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  );
}


const navItems = [
  { href: '/dashboard',    label: 'Today',     Icon: IcDashboard  },
  { href: '/transactions', label: 'Deals',     Icon: IcFolderOpen },
  { href: '/deadlines',    label: 'Deadlines', Icon: IcCalendar   },
  { href: '/contacts',     label: 'Contacts',  Icon: IcUsers      },
  { href: '/documents',    label: 'Documents', Icon: IcFolder     },
  { href: '/audit',        label: 'Audit log', Icon: IcShield     },
];

export function SidebarNav() {
  const pathname = usePathname();
  const user = getStoredUser();
  const displayName = user?.name ?? 'Broker';
  const initials = displayName
    .split(' ').filter(Boolean).map((n) => n[0].toUpperCase()).slice(0, 2).join('');
  const brokerage = user?.brokerage ?? 'Colorado Real Estate';

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'));

  return (
    <aside className="sidebar dk-rail" aria-label="Primary navigation">
      <Link href="/dashboard" aria-label="Altitude — return to dashboard" style={{ textDecoration: 'none' }}>
        <div className="dk-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/altitude-mark.png" alt="" width={30} height={30} style={{ flexShrink: 0 }} />
          <div className="wm">
            <b>Altitude</b>
            <span>Real Estate Transactions</span>
          </div>
        </div>
      </Link>

      <div className="dk-railsec">Workspace</div>

        <nav aria-label="Main navigation">
            <ul className="dk-nav-list">
                {navItems.map(({href, label, Icon}) => {
                    const active = isActive(href);
                    return (
                        <li key={href}>
                            <Link
                                href={href}
                                className={`dk-navitem${active ? ' on' : ''}`}
                                aria-current={active ? 'page' : undefined}
                            >
                  <span className="dk-navico" style={{color: active ? 'var(--brass-400)' : 'var(--fg3-on-navy)'}}>
                    <Icon/>
                  </span>
                                {label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
      </nav>

      <div className="dk-railsec" style={{ marginTop: 8 }}>Quick action</div>
        <ul className="dk-nav-list">
            <li>
                <Link href="/upload" className={`dk-navitem${isActive('/upload') ? ' on' : ''}`}
                      aria-current={isActive('/upload') ? 'page' : undefined}>
            <span className="dk-navico"
                  style={{color: isActive('/upload') ? 'var(--brass-400)' : 'var(--fg3-on-navy)'}}>
              <IcUpload/>
            </span>
                    Upload contract
                </Link>
            </li>
        </ul>

      <div className="dk-railfoot">
        <div className="dk-avatar">{initials}</div>
        <div>
          <div className="nm">{displayName}</div>
          <div className="rl">{brokerage}</div>
        </div>
      </div>
    </aside>
  );
}
