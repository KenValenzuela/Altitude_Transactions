'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { GoFn } from '@/types';

/**
 * Navigation adapter.
 *
 * The prototype screens navigate via a `go(screenId)` callback. Rather than
 * rewrite every internal call site, we map those screen ids onto real App Router
 * paths. Transaction sub-screens need the current transaction id, so it is closed
 * over here. This keeps screen components portable and decoupled from routing.
 */
export function useScreenNav(txId?: string): GoFn {
  const router = useRouter();
  return useMemo<GoFn>(() => {
    const routes: Record<string, string> = {
      login: '/login',
      dashboard: '/dashboard',
      upload: '/upload',
      overview: txId ? `/transactions/${txId}` : '/dashboard',
      checklist: txId ? `/transactions/${txId}/checklist` : '/dashboard',
      deadlines: txId ? `/transactions/${txId}/deadlines` : '/dashboard',
      parties: txId ? `/transactions/${txId}/parties` : '/dashboard',
      documents: txId ? `/transactions/${txId}/documents` : '/dashboard',
      summary: txId ? `/transactions/${txId}/summary` : '/dashboard',
      postclose: txId ? `/transactions/${txId}/postclose` : '/dashboard',
    };
    return (id: string) => {
      const dest = routes[id];
      if (dest) router.push(dest);
    };
  }, [router, txId]);
}
