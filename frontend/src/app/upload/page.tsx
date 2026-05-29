'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api-client';
import { useScreenNav } from '@/lib/navigation';
import { AppShell } from '@/components/ui/AppShell';
import { ScreenUpload } from '@/components/screens/ScreenUpload';

export default function UploadPage() {
  const router = useRouter();
  const go = useScreenNav();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onUpload = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const res = await api.uploadDocument(file);
      router.push(`/upload/${res.documentId}/extracting`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed. Please try a PDF.');
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <ScreenUpload go={go} onUpload={onUpload} busy={busy} error={error} />
    </AppShell>
  );
}
