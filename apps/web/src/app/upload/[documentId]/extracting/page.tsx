'use client';

import {useParams, useRouter} from 'next/navigation';
import {useEffect, useRef, useState} from 'react';
import {api} from '@/lib/api-client';
import type {ExtractionJob} from '@/types/domain';
import {AppShell} from '@/components/workflow/AppShell';
import {ErrorState} from '@/components/workflow/ErrorState';
import {ExtractionProgress} from '@/components/workflow/ExtractionProgress';

const MIN_DISPLAY_MS = 3000;
const STEP_INTERVAL_MS = 480;

export default function ExtractingPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const router = useRouter();
  const [job, setJob] = useState<ExtractionJob>();
  const [error, setError] = useState('');
    const [simulatedStep, setSimulatedStep] = useState(0);
    const [minElapsed, setMinElapsed] = useState(false);
    const jobReady = useRef(false);

    // Cinematic step-by-step reveal over 3 seconds
    useEffect(() => {
        const timers: ReturnType<typeof setTimeout>[] = [];
        for (let i = 1; i <= 6; i++) {
            timers.push(setTimeout(() => setSimulatedStep(i), i * STEP_INTERVAL_MS));
        }
        timers.push(setTimeout(() => setMinElapsed(true), MIN_DISPLAY_MS));
        return () => timers.forEach(clearTimeout);
    }, []);

    // Poll actual extraction status
  useEffect(() => {
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;

      async function poll() {
      try {
        const nextJob = await api.getExtraction(documentId);
        if (cancelled) return;
        setJob(nextJob);
          const ready = nextJob.status === 'complete' || nextJob.status === 'needs_review';
          const failed = nextJob.status === 'failed';
          if (ready) {
              jobReady.current = true;
              return;
          }
          if (failed) {
              if (nextJob.fields.length > 0) {
                  jobReady.current = true;
                  return;
              }
              setError('Extraction could not read this PDF. Try uploading a text-based or higher-quality PDF.');
          return;
        }
          timeout = setTimeout(poll, 1500);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to check extraction status.');
      }
    }

      void poll();
      return () => {
          cancelled = true;
          if (timeout) clearTimeout(timeout);
      };
  }, [documentId]);

    // Redirect only when BOTH the animation has finished AND the job is ready
    useEffect(() => {
        if (minElapsed && jobReady.current) {
            router.replace(`/review/${documentId}`);
        }
    }, [minElapsed, documentId, router]);

    // Edge case: job was already ready before minElapsed fired
    useEffect(() => {
        if (minElapsed && job && (job.status === 'needs_review' || job.status === 'complete' || (job.status === 'failed' && job.fields.length > 0))) {
            router.replace(`/review/${documentId}`);
        }
    }, [minElapsed, job, documentId, router]);

  return (
    <AppShell>
        {error ? <ErrorState message={error}/> :
            <ExtractionProgress job={job} simulatedStep={simulatedStep} minElapsed={minElapsed}/>}
    </AppShell>
  );
}
