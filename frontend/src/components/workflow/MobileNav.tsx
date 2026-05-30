import Link from 'next/link';
export function MobileNav(){return <nav className="mobile-nav" aria-label="Primary"><Link href="/dashboard">Dashboard</Link><Link href="/upload">Upload</Link><Link href="/transactions/demo">Workspace</Link></nav>}
