import Link from 'next/link';

const primaryLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/upload', label: 'Upload CTME' },
  { href: '/transactions/demo', label: 'Demo workspace' },
];

export function SidebarNav() {
  return (
    <header className="sidebar">
      <Link className="skip-link" href="#main-content">
        Skip to content
      </Link>
      <Link className="sidebar__brand" href="/dashboard" aria-label="Altitude dashboard">
        <span className="brand-mark" aria-hidden="true">
          AT
        </span>
        <span>
          <strong>Altitude</strong>
          <small>Transaction operations</small>
        </span>
      </Link>
      <nav aria-label="Primary navigation">
        <ul>
          {primaryLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <aside className="sidebar-note">Colorado contract-to-close workflow. Extraction is source-backed; demo parser is mocked.</aside>
    </header>
  );
}
