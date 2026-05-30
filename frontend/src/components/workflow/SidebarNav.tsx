import Link from 'next/link';
export function SidebarNav(){return <aside className="sidebar"><div className="brand-mark">AT</div><nav><Link href="/dashboard">Dashboard</Link><Link href="/upload">Upload CTME</Link><Link href="/transactions/demo">Workspace</Link></nav><p className="sidebar-note">Colorado transaction operations</p></aside>}
