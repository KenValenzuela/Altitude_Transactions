'use client';

import { useId, useState } from 'react';
import { Button } from './Button';

export function UploadDropzone({ onFile, busy }: { onFile: (file: File) => void; busy?: boolean }) {
  const inputId = useId();
  const [fileName, setFileName] = useState<string>();

  return (
    <section className="upload-drop" aria-labelledby="upload-title">
      <div>
        <p className="eyebrow">CTME contract intake</p>
        <h2 id="upload-title">Upload Contract to Buy and Sell Real Estate PDF</h2>
        <p>
          Creates a source document, extraction run, review queue, deadlines, tasks, contacts, document requirements, and audit history.
        </p>
      </div>
      <div className="upload-drop__control">
        <label htmlFor={inputId}>Choose a CTME PDF contract</label>
        <input
          id={inputId}
          type="file"
          accept="application/pdf"
          disabled={busy}
          aria-describedby={`${inputId}-help ${inputId}-status`}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setFileName(file.name);
            onFile(file);
          }}
        />
        <p id={`${inputId}-help`} className="muted">
          PDF only. The backend extracts fields, deadlines, and parties from your contract automatically.
        </p>
        <p id={`${inputId}-status`} role="status" aria-live="polite">
          {busy ? `Uploading ${fileName || 'contract'}…` : fileName ? `Selected ${fileName}` : 'No file selected.'}
        </p>
      </div>
      <Button disabled={busy} onClick={() => document.getElementById(inputId)?.click()}>
        {busy ? 'Uploading…' : 'Choose PDF'}
      </Button>
    </section>
  );
}
