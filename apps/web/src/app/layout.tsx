import type {Metadata} from 'next';
import {Hanken_Grotesk, IBM_Plex_Mono, Spectral} from 'next/font/google';
import './globals.css';

/* Self-hosted via next/font — WOFF2, preloaded, no external DNS, font-display:swap */
const spectral = Spectral({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    style: ['normal', 'italic'],
    variable: '--font-spectral',
    display: 'swap',
    preload: true,
});

const hanken = Hanken_Grotesk({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-hanken',
    display: 'swap',
    preload: true,
});

const ibmPlex = IBM_Plex_Mono({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
    variable: '--font-ibmplex',
    display: 'swap',
    preload: false,
});

export const metadata: Metadata = {
  title: 'Altitude — Broker Portal',
  description: 'Contract-to-close management for Colorado real estate brokers',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="en" className={`${spectral.variable} ${hanken.variable} ${ibmPlex.variable}`}>
      <head>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
      </head>
      <body>{children}</body>
    </html>
  );
}
