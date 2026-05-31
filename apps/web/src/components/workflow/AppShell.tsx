import type { ReactNode } from 'react';
import { MobileNav } from './MobileNav';
import { SidebarNav } from './SidebarNav';

function IcSearch() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
}
function IcBell() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
}
function IcHelp() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="ops-shell dk-app">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <SidebarNav />
      <div className="dk-main">
        <header className="dk-topbar">
          <div className="dk-search">
            <IcSearch />
            <input placeholder="Search deals, contacts, documents…" aria-label="Search" />
          </div>
          <div className="dk-topact">
            <button className="dk-iconbtn" aria-label="Notifications">
              <IcBell />
            </button>
            <button className="dk-iconbtn" aria-label="Help">
              <IcHelp />
            </button>
          </div>
        </header>
        <div className="dk-scroll">
          <main className="ops-main" id="main-content" tabIndex={-1}>
            {children}
          </main>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
