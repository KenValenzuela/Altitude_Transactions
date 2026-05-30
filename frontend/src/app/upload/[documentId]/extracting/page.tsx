'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import type { ExtractionJob } from '@/types/domain';
import { AppShell } from '@/components/workflow/AppShell';
import { ErrorState } from '@/components/workflow/ErrorState';
import { ExtractionProgress } from '@/components/workflow/ExtractionProgress';
import { PageHeader } from '@/components/workflow/PageHeader';

export default function ExtractingPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const router = useRouter();
  const [job, setJob] = useState<ExtractionJob>();
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    async function pollExtraction() {
      try {
        const nextJob = await api.getExtraction(documentId);
        if (cancelled) return;
        setJob(nextJob);
        if (nextJob.status === 'complete' || nextJob.status === 'needs_review') {
          router.replace(`/review/${documentId}`);
          return;
        }
        // Partial extraction: route to review even if failed, unless truly empty
        if (nextJob.status === 'failed') {
          if (nextJob.fields.length > 0) {
            router.replace(`/review/${documentId}`);
          } else {
            setError('Extraction could not read this PDF. Try uploading a text-based or higher-quality PDF.');
          }
          return;
        }
        timeout = setTimeout(pollExtraction, 1500);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to check extraction status.');
      }
    }

    void pollExtraction();

    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [documentId, router]);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Extraction"
        title="Preparing review queue"
        description="We are checking the extraction status and will move you to human review when fields are ready."
      />
      {error ? <ErrorState message={error} /> : <ExtractionProgress job={job} />}
    </AppShell>
  );
}
