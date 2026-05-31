'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ApiError, api } from '@/lib/api-client';
import { AppShell } from '@/components/workflow/AppShell';
import { ErrorState } from '@/components/workflow/ErrorState';
import { PageHeader } from '@/components/workflow/PageHeader';
import { UploadDropzone } from '@/components/workflow/UploadDropzone';

export default function UploadPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(file: File) {
    setBusy(true);
    setError('');
    try {
      const upload = await api.uploadDocument(file);
      router.push(`/upload/${upload.documentId}/extracting`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed. Please try again.');
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Source-backed intake"
        title="Upload CTME contract"
        description="Start with the signed contract PDF. Altitude will create a review queue before building a workspace."
      />
      {error ? <ErrorState message={error} /> : null}
      <UploadDropzone onFile={handleFile} busy={busy} />
    </AppShell>
  );
}
