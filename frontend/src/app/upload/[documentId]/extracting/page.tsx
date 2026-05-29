'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { useScreenNav } from '@/lib/navigation';
import { AppShell } from '@/components/ui/AppShell';
import { ScreenExtracting } from '@/components/screens/ScreenExtracting';
import type { ExtractionJob } from '@/types/api';

export default function ExtractingPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const router = useRouter();
  const go = useScreenNav();
  const [job, setJob] = useState<ExtractionJob | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll the extraction job until it completes (the mock completes quickly, but
  // this is a real async lifecycle the UI honestly reflects).
  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const next = await api.getExtraction(documentId);
        if (cancelled) return;
        setJob(next);
        if (next.status === 'complete' || next.status === 'failed') {
          if (timer.current) clearInterval(timer.current);
        }
      } catch {
        /* keep polling; transient errors are tolerated */
      }
    };
    poll();
    timer.current = setInterval(poll, 1200);
    return () => {
      cancelled = true;
      if (timer.current) clearInterval(timer.current);
    };
  }, [documentId]);

  const ready = job?.status === 'complete';

  return (
    <AppShell dark>
      <ScreenExtracting
        go={go}
        ready={ready}
        onComplete={() => router.push(`/review/${documentId}`)}
      />
    </AppShell>
  );
}
