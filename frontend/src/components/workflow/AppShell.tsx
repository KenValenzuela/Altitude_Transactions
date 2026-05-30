import type { ReactNode } from 'react';
import { MobileNav } from './MobileNav';
import { SidebarNav } from './SidebarNav';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="ops-shell">
      <SidebarNav />
      <main className="ops-main" id="main-content" tabIndex={-1}>
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
