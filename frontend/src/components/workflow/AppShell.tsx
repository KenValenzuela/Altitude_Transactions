import type { ReactNode } from 'react';
import { SidebarNav } from './SidebarNav';import { MobileNav } from './MobileNav';
export function AppShell({children}:{children:ReactNode}){return <div className="ops-shell"><SidebarNav/><main className="ops-main">{children}</main><MobileNav/></div>}
