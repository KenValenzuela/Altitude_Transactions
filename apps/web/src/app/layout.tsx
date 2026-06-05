import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Altitude Transactions — Broker Portal',
  description: 'Contract-to-close management for Colorado real estate brokers',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
