import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Altitude — Broker Portal',
  description: 'Contract-to-close management for Colorado real estate brokers',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" data-density="regular">
      <body>{children}</body>
    </html>
  );
}
