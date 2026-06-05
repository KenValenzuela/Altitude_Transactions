import type {ReactNode} from 'react';
import {ProductAppShell} from '@/components/product/ProductComponents';

export default function AuthenticatedAppLayout({children}: {children: ReactNode}) {
  return <ProductAppShell>{children}</ProductAppShell>;
}
