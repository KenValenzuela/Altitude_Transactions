import type {ReactNode} from 'react';
import Link from 'next/link';
import {MobileNav} from './MobileNav';
import {SidebarNav} from './SidebarNav';

function IcSearch() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
}
function IcBell() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
}
function IcHelp() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
}

/* Social icons */
function IcLinkedIn() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
        <rect x="2" y="9" width="4" height="12"/>
        <circle cx="4" cy="4" r="2"/>
    </svg>;
}

function IcInstagram() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>;
}

function IcFacebook() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>;
}

function IcTwitter() {
    return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path
            d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>;
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="ops-shell dk-app">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <SidebarNav />
      <div className="dk-main">
        <header className="dk-topbar">
            <div className="dk-search" role="search">
            <IcSearch />
            <input placeholder="Search transactions, contacts, documents…" aria-label="Search" />
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
            <footer className="dk-footer" aria-label="Site footer">
                <p className="dk-footer-brand">
                    <strong>Altitude</strong> Real Estate Transactions<br/>
                    Colorado&apos;s trusted transaction management platform
                </p>
                <nav aria-label="Footer links">
                    <ul className="dk-footer-nav">
                        <li><Link href="/app/today">Today</Link></li>
                        <li><Link href="/app/transactions">Active Transactions</Link></li>
                        <li><Link href="/upload">Upload</Link></li>
                    </ul>
                </nav>
                <nav aria-label="Social media links">
                    <ul className="dk-footer-social">
                        <li>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                               aria-label="LinkedIn">
                                <IcLinkedIn/>
                            </a>
                        </li>
                        <li>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                               aria-label="Instagram">
                                <IcInstagram/>
                            </a>
                        </li>
                        <li>
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                               aria-label="Facebook">
                                <IcFacebook/>
                            </a>
                        </li>
                        <li>
                            <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter">
                                <IcTwitter/>
                            </a>
                        </li>
                    </ul>
                </nav>
            </footer>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
