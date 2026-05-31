'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function IcDashboard() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
}
function IcFolderOpen() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 14l1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2A2 2 0 0 0 11.11 6H18a2 2 0 0 1 2 2v2"/></svg>;
}
function IcPlus() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function IcUsers() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function IcScrollText() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M15 8h-5M15 12h-5M15 16h-5"/></svg>;
}

const items = [
  { id: 'today',        href: '/dashboard',    label: 'Today',    Icon: IcDashboard,  center: false },
  { id: 'deals',        href: '/transactions', label: 'Deals',    Icon: IcFolderOpen, center: false },
  { id: 'upload',       href: '/upload',       label: '',         Icon: IcPlus,       center: true  },
  { id: 'contacts',     href: '/contacts',     label: 'Contacts', Icon: IcUsers,      center: false },
  { id: 'activity',     href: '/audit',        label: 'Activity', Icon: IcScrollText, center: false },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="ak-bottomnav" aria-label="Primary navigation">
      {items.map(({ id, href, label, Icon, center }) => {
        const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'));
        if (center) {
          return (
            <Link key={id} href={href} className="ak-navadd" aria-label="Upload contract">
              <Icon />
            </Link>
          );
        }
        return (
          <Link
            key={id}
            href={href}
            className={`ak-navitem${active ? ' on' : ''}`}
          >
            <Icon />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
